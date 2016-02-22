var React = require("react");
var FixedDataTable = require('fixed-data-table');
var Update = require("react-addons-update");
var CancelablePromise = require('../utils/cancelable-promise.js');
var Request = require('../utils/request.js');
var HandleStyles = require('../utils/handle-styles.js');

var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;
var Cell = FixedDataTable.Cell;

var DataTable = React.createClass({
  
  displayName: "DataTable",

  propTypes: {
    columnWidth: React.PropTypes.number,
    descriptionURL: React.PropTypes.string.isRequired,
    fetchURL: React.PropTypes.string.isRequired,
    headerHeight: React.PropTypes.number,
    isResizable: React.PropTypes.bool,
    isSelectable: React.PropTypes.bool,
    onRowClick: React.PropTypes.func,
    onSort: React.PropTypes.func,
    params: React.PropTypes.objectOf(React.PropTypes.string),
    radius: React.PropTypes.number,
    requestThreshold: React.PropTypes.number,
    rowHeight: React.PropTypes.number,
    tableHeight: React.PropTypes.number,
    tableWidth: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      tableWidth: 1000,
      tableHeight: 700,
      headerHeight: 50,
      columnWidth: 120,
      rowHeight: 50,
      radius: 200,
      requestThreshold: 50,
      isSelectable: true,
      isResizable: false,
      params: {
        start: '_start',
        end: '_end',
        sort: '_sort',
        order: '_order'
      }
    };
  },

  getInitialState: function () {
    return {
      columns: {},
      data: [],
      initialRowIndex: 0,
      rowsCount: 0,
      selectedRows: {},
      sortInfo: {columnKey: '', asc: false},
      tableHeight: this.props.tableHeight,
      tableWidth: this.props.tableWidth
    };
  },

  componentWillMount: function () {
    this._windowWidth = window.innerWidth;
    this._windowHeight = window.innerHeight;
    this._promises = [];
  },

  componentDidMount: function () {
    if (this.props.isResizable) {
      window.addEventListener('resize', this._handleResize);
    }

    this._loadInitialData();
  },

  componentWillUnmount: function () {
    if (this.props.isResizable) {
      window.removeEventListener('resize', this._handleResize);
    }

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
    var newColumns = {};

    var descPromise = this._cancelablePromise(
      Request.getContent(this.props.descriptionURL)
    );

    descPromise
      .promise
      .then(function (description) {
        component.setState(function () {
          description.columns.forEach(function (column) {
            if (column !== null && typeof column === 'object') {
              newColumns[column.key] = {};
              newColumns[column.key].label = column.label || column.key;
              newColumns[column.key].width = column.width || component.props.columnWidth;
              newColumns[column.key].type = column.type;
              newColumns[column.key].isResizable = column.isResizable;
              newColumns[column.key].isSortable = column.isSortable;
            }
            else {
              throw new Error('The column description needs to be an object.');
            }
          });

          return {
            rowsCount: description.rowsCount,
            columns: newColumns
          };
        }, component._getMoreData.bind(component, 0));
      });
  },

  _getMoreData: function (index) {
    var component = this;
    var start = Math.max(0, index - this.props.radius);
    var end = Math.min(this.state.rowsCount, index + this.props.radius);
    var requestURL;

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
      requestURL = this.props.fetchURL +
        '?' + this.props.params.start + '=' + start +
        '&' + this.props.params.end + '=' + end;

      if (this.state.sortInfo.columnKey) {
        requestURL += '&' + this.props.params.sort + '=' + this.state.sortInfo.columnKey;
        requestURL += '&' + this.props.params.order + '=' + (this.state.sortInfo.asc ? 'ASC' : 'DESC');
      }

      dataPromise = this._cancelablePromise(
        Request.getContent(requestURL)
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

  _changeSort: function (columnKey) {
    this._rowIndex = 0;
    this.setState({
      data: [],
      sortInfo: {
        columnKey: columnKey,
        asc: this.state.sortInfo.columnKey === columnKey
          ? (this.state.sortInfo.asc ? false : true) : true
      }
    }, function () {
      this._rowIndex = undefined;
      this._getMoreData.call(this, 0);
      if (this.props.onSort) this.props.onSort(this.state.sortInfo);
    });
  },

  _getHeader: function (column, props) {
    var header;
    var arrowDownward;
    var arrowUpward;

    if (this.state.columns[props.columnKey].isSortable) {
      arrowDownward = (
        React.createElement("svg", {viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg"}, 
          React.createElement("path", {d: "M0 0h24v24H0V0z", fill: "none"}), 
          React.createElement("path", {d: "M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"})
        )
      );

      arrowUpward = (
        React.createElement("svg", {viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg"}, 
          React.createElement("path", {d: "M0 0h24v24H0V0z", fill: "none"}), 
          React.createElement("path", {d: "M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"})
        )
      );

      header = (
        React.createElement(Cell, null, 
          React.createElement("a", {className: "clickableHeader", onClick: this._changeSort.bind(this, props.columnKey)}, 
            React.createElement("span", {className: "sortIcon"}, 
              (this.state.sortInfo.columnKey === props.columnKey
                ? (!this.state.sortInfo.asc
                    ? arrowDownward
                    : arrowUpward)
                : '')
            ), 
            column.label
          )
        )
      );
    }
    else {
      header = React.createElement(Cell, null, column.label)
    }

    return header;
  },

  _stopPropagation: function (e) {
    e.stopPropagation();
  },

  _createImageCell: function (content) {
    var styles = {
      img: {
        backgroundImage: 'url(' + content + ')'
      }
    };

    return (
      React.createElement("div", {className: "image-container"}, 
        React.createElement("div", {className: "image", style: styles.img}, ' ')
      )
    );
  },

  _createBoldCell: function (content) {
    return (
      React.createElement(Cell, null, 
        React.createElement("span", {className: "bold"}, 
          content
        )
      )
    );
  },

  _createTextCell: function (content) {
    return (
      React.createElement(Cell, null, 
        content
      )
    );
  },

  _createLinkCell: function (content) {
    return (
      React.createElement(Cell, null, 
        React.createElement("a", {href: content, onClick: this._stopPropagation}, 
          content
        )
      )
    );
  },

  _createEmailCell: function (content) {
    return (
      React.createElement(Cell, null, 
        React.createElement("a", {
          className: "email", 
          href: 'mailto:' + content, 
          onClick: this._stopPropagation
        }, 
          content
        )
      )
    );
  },

  _createLoadingCell: function () {
    return (
      React.createElement(Cell, null, 
        'Loading'
      )
    );
  },

  _getCell: function (columnKey, props) {
    var cell;
    var content;

    if (this.state.data[props.rowIndex]) {
      content = this.state.data[props.rowIndex][columnKey];

      switch(this.state.columns[columnKey].type) {
        case 'email':
          cell = this._createEmailCell(content);
          break;
        case 'link':
          cell = this._createLinkCell(content);
          break;
        case 'bold':
          cell = this._createBoldCell(content);
          break;
        case 'image':
          cell = this._createImageCell(content);
          break;
        default:
          cell = this._createTextCell(content);
          break;
      }
    }
    else {
      cell = this._createLoadingCell();
    }

    return cell;
  },

  _getSelectionCell: function (props) {
    return (
      React.createElement(Cell, null, 
        React.createElement("div", {className: "checkbox-group"}, 
          React.createElement("input", {type: "checkbox", checked: this.state.selectedRows[props.rowIndex]}), 
          React.createElement("label", {className: "general-label"}, 
            React.createElement("span", {className: "check"}), 
            React.createElement("span", {className: "box"})
          )
        )
      )
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

  _handleColumnResizeEnd: function (newColumnWidth, columnKey) {
    this.setState(function (previousState) {
      var newObj = {};
      var newColumns = Update(previousState.columns, {$merge: {}});
      newColumns[columnKey].width = newColumnWidth;
      
      return {
        columnWidths: newColumns
      };
    });
  },

  render: function () {
    var columns = [];

    if (this.props.isSelectable) {
      columns.push(
        React.createElement(Column, {
          key: -1, 
          width: 80, 
          cell: this._getSelectionCell, 
          fixed: true}
        )
      );
    }

    Object.keys(this.state.columns).forEach(function (columnKey) {
      columns.push(
        React.createElement(Column, {
          key: columnKey, 
          columnKey: columnKey, 
          header: this._getHeader.bind(this, this.state.columns[columnKey]), 
          cell: this._getCell.bind(this, columnKey), 
          width: this.state.columns[columnKey].width, 
          isResizable: this.state.columns[columnKey].isResizable}
        )
      );
    }, this);

    return (
      React.createElement(Table, {
        width: this.state.tableWidth, 
        height: this.state.tableHeight, 
        rowsCount: this.state.rowsCount, 
        rowHeight: this.props.rowHeight, 
        headerHeight: this.props.headerHeight, 
        onColumnResizeEndCallback: this._handleColumnResizeEnd, 
        isColumnResizing: false, 
        onScrollEnd: this._handleScrollEnd, 
        onRowClick: this._handleRowClick, 
        rowClassNameGetter: this._getRowClassName, 
        scrollToRow: this._rowIndex
      }, 
        columns
      )
    );
  }

});

module.exports = DataTable;