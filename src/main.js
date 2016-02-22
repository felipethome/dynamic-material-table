var React = require('react');
var ReactDOM = require('react-dom');
var DataTable = require('./components/data-table/data-table.js');

var handleRowClick = function (e, data) {
  console.log(data);
};

var handleSort = function (data) {
  console.log(data);
};

ReactDOM.render(
  <DataTable
    descriptionURL='http://104.131.164.190:3000/description'
    fetchURL='http://104.131.164.190:3000/data'
    tableWidth={window.innerWidth}
    tableHeight={window.innerHeight - 56}
    isResizable
    isSelectable
    onClick={handleRowClick}
    onSort={handleSort}
  />,
  document.getElementById('table')
);