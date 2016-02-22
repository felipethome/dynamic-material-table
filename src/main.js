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
    descriptionURL='http://localhost:3000/description'
    fetchURL='http://localhost:3000/data'
    tableWidth={1100}
    isSelectable
    onClick={handleRowClick}
    onSort={handleSort}
  />,
  document.getElementById('table')
);