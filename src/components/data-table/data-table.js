var React = require("react");
var FixedDataTable = require('fixed-data-table');
var Update = require("react-addons-update");
var CancelablePromise = require('../utils/cancelable-promise.js');
var Request = require('../utils/request.js');
var HandleStyles = require('../styles/handle-styles.js');

var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;
var Cell = FixedDataTable.Cell;

var DataTable = React.createClass({
  
  displayName: "DataTable",

  propTypes: {
    descriptionURL: React.PropTypes.string.isRequired,
    fetchURL: React.PropTypes.string.isRequired,
    tableWidth: React.PropTypes.number,
    tableHeight: React.PropTypes.number,
    headerHeight: React.PropTypes.number,
    rowHeight: React.PropTypes.number,
    columnWidth: React.PropTypes.number,
    radius: React.PropTypes.number,
    requestThreshold: React.PropTypes.number,
    onRowClick: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      tableWidth: 800,
      tableHeight: 500,
      headerHeight: 50,
      columnWidth: 100,
      rowHeight: 50,
      radius: 100,
      requestThreshold: 50
    };
  },

  getInitialState: function () {
    return {
      tableWidth: this.props.tableWidth,
      tableHeight: this.props.tableHeight,
      rowsCount: 0,
      columnWidths: {},
      selectedRows: {},
      data: []
    };
  },

  componentWillMount: function () {
    this._windowWidth = window.innerWidth;
    this._windowHeight = window.innerHeight;
    this._promises = [];
  },

  componentDidMount: function () {
    window.addEventListener('resize', this._handleResize);

    this._loadInitialData();
  },

  componentWillUnmount: function () {
    window.removeEventListener('resize', this._handleResize);

    this._promises.forEach(function (promise) {
      promise.cancel();
    });
  },

  _handleResize: function (e) {
    this.setState(function (previousState, currentProps) {
      var diffWidth = window.innerWidth - this._windowWidth;
      var diffHeight = window.innerHeight - this._windowHeight;

      this._windowWidth = window.innerWidth;
      this._windowHeight = window.innerHeight;

      return {
        tableWidth: previousState.tableWidth + diffWidth,
        tableHeight: previousState.tableHeight + diffHeight
      };
    });
  },

  _cancelablePromise: function (promise) {
    var newPromise = CancelablePromise(promise);
    this._promises.push(newPromise);

    return newPromise;
  },

  _loadInitialData: function () {
    var component = this;
    var newColumnWidths = {};

    var descPromise = this._cancelablePromise(
      Request.getContent(this.props.descriptionURL)
    );

    descPromise
      .promise
      .then(function (description) {
        component.setState(function (previousState, currentProps) {
          description.columns.forEach(function (field) {
            newColumnWidths[field] = component.props.columnWidth;
          });

          return {
            rowsCount: description.rowsCount,
            columnWidths: newColumnWidths
          };
        }, component._getMoreData.bind(component, 0));
      });
  },

  _getMoreData: function (index) {
    var component = this;
    var start = Math.max(0, index - this.props.radius);
    var end = Math.min(this.state.rowsCount, index + this.props.radius);
    var originalStart = start;
    var originalEnd = end;

    // Try to shrink the interval before doing the request
    while ((this.state.data[start] || this.state.data[end]) && start !== end) {
      if (this.state.data[start]) {
        start++;
      }

      if (this.state.data[end]) {
        end--;
      }
    }
    
    if (this._shouldRequestBeMade(start, end)) {
      dataPromise = this._cancelablePromise(
        Request.getContent(this.props.fetchURL + '?_start=' + start + '&_end=' + (end + 1))
      );

      dataPromise
        .promise
        .then(function (data) {
          component.setState(function (previousState, currentProps) {
            var newData = previousState.data.slice();

            for (var i = 0; i < data.length; i++) {
              newData[i + start] = data[i];
            }

            return {
              data: newData
            };
          });
        });
    }
  },

  _shouldRequestBeMade: function (start, end) {
    var thereAreUndefined = !this.state.data[start] || !this.state.data[end];

    var intervalIsNotSmall = end - start >= this.props.requestThreshold;

    var thereAreNeighbors = (start - 1 < 0 || this.state.data[start - 1])
      && (end + 1 >= this.state.rowsCount || this.state.data[end + 1]);

    if (thereAreUndefined && (intervalIsNotSmall || thereAreNeighbors)) {
      return true;
    }
    else {
      return false;
    }
  },

  _handleScrollEnd: function (h, v) {
    var index = Math.floor(v / this.props.rowHeight);
    this._getMoreData(index);
  },

  _getCell: function (col, props) {
    return (
      <Cell>
        {
          this.state.data[props.rowIndex]
          ? this.state.data[props.rowIndex][col]
          : 'Loading'
        }
      </Cell>
    );
  },

  _getSelectionCell: function (props) {
    return (
      <Cell>
        <div className="checkbox-group">
          <input type="checkbox" checked={this.state.selectedRows[props.rowIndex]}/>
          <label className="general-label">
            <span className="check"></span>
            <span className="box"></span>
          </label>
        </div>
      </Cell>
    );
  },

  _getRowClassName: function (rowIndex) {
    return this.state.selectedRows[rowIndex] ? 'row-selected' : '';
  },

  _handleRowClick: function (e, rowIndex) {
    var selectedRow = {};
    var newSelectedRows;

    if (this.state.selectedRows[rowIndex]) {
      selectedRow[rowIndex] = false;
      newSelectedRows = Update(this.state.selectedRows, {$merge: selectedRow});
    }
    else {
      selectedRow[rowIndex] = true;
      newSelectedRows = Update(this.state.selectedRows, {$merge: selectedRow});
    }
    
    this.setState({
      selectedRows: newSelectedRows
    });

    if (this.props.onRowClick) {
      this.props.onRowClick(e, this.state.data[rowIndex]);
    }
  },

  _handleColumnResizeEnd(newColumnWidth, columnKey) {
    this.setState(function (previousState, currentProps) {
      var newObj = {};
      newObj[columnKey] = newColumnWidth;
      var newColumnWidths = Update(previousState.columnWidths, {$merge: newObj});
      
      return {
        columnWidths: newColumnWidths
      };
    });
  },

  render: function () {
    var columns = [];

    columns.push(
      <Column
        key={-1}
        width={80}
        cell={this._getSelectionCell}
        fixed
      />
    );

    Object.keys(this.state.columnWidths).forEach(function (column, i) {
      columns.push(
        <Column
          key={i}
          columnKey={column}
          header={<Cell>{column}</Cell>}
          width={this.state.columnWidths[column]}
          cell={this._getCell.bind(this, column)}
          isResizable
        />
      );
    }, this);

    return (
      <Table
        width={this.state.tableWidth}
        height={this.state.tableHeight}
        rowsCount={this.state.rowsCount}
        rowHeight={this.props.rowHeight}
        headerHeight={this.props.headerHeight}
        onColumnResizeEndCallback={this._handleColumnResizeEnd}
        isColumnResizing={false}
        onScrollEnd={this._handleScrollEnd}
        onRowClick={this._handleRowClick}
        rowClassNameGetter={this._getRowClassName}>
        {columns}
      </Table>
    );
  }

});

module.exports = DataTable;