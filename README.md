# Dynamic Material Table
Reusable component of a dynamic data table with Material Design styles. This component uses [React](https://facebook.github.io/react/) and [Fixed Data Table](https://facebook.github.io/fixed-data-table/).  
  
This is an effort to supply a good component that relies on [Fixed Data Table](https://facebook.github.io/fixed-data-table/) to fetch big amounts of data dynamically (using Ajax).

## What dynamic means
It means the data your table consumes will be fetched on demand. The component will try to make things smooth, so you will not notice the data is being fetched.

## How to install
Clone this repo:
    
    https://github.com/felipethome/dynamic-material-table

Install the dependencies:
    
    npm install

For a production version run:
    
    npm run deploy

To mock data and build a developer version with a live reload server:
    
    npm run dev

Check localhost:8889

## How to use
You can render the component using *ReactDOM* or inside any other *React* component.
Here are the properties you can set (in bold are the ones you definetely should notice):

1. columnWidth: optional. Default width for all columns.
2. **descriptionURL:** required. This URL needs to return a JSON containing all the column descriptions and rows count. More on that below.
3. **fetchURL:** required. This URL needs to be the base of a REST service able to return your data in pieces. More on that below.
4. headerHeight: optional. As the name suggests, it is the header height.
5. **onRowClick:** optional. Callback that will be called every time the user clicks on a row. It will be called with the click event and all the data of that particular row.
6. **onSort:** optional. A callback that if defined means the columns can be sorted. Understand that the data is being fetched on demand which means is not possible to sort the rows in the client side. So, basically, the only the component does is indicate to the user the column will be sorted and pass to the callback the column the user is asking to sort and if it should be sorted ascending or desceding order.
7. tableHeight: optional. As the name suggests, it is the table height.
8. tableWidth: optional. As the name suggests, it is the table width.
9. isSelectable: bool. If true, creates a column to indicate that the row is selected.
10. isResizable: bool. If true, the table will resize if the user resizes the window.

Advanced:

1. radius: optional. It defines how much data should be fetched before and after the first row being shown in the screen. So if the current row index is 25 and the radius is 10, the component will fetch data from the rows 15 to 35.
2. requestThreshold: optional. It defines how many rows the component needs to see as undefined before making a request. So, if your radius is 10, requestThreshold is 5 and currently the first row in the screen is the 1st, it means the component already fetched the data until the row 10th (because of the radius). When you start to scroll and you arrive at the 5th row, the threshold is reached and the component will make a request.

### descriptionURL and how it makes your component incredible dynamic
The descriptionURL needs to return a JSON with two properties:

1. rowsCount: integer. The maximum number of rows your table can have. This is a requirement of [Fixed Data Table](https://facebook.github.io/fixed-data-table/).
2. columns: array. This is an array with the description of the columns your table can have. It can be an array of strings that will be the column names, or it can be an array of objects where each one looks like:
    
        {
          key: 'col1', // Is required and it needs to be unique for each column
          label: 'Example 1', // This is a string with a friendly name to show to the user
          type: 'email', // It can be bold, link, email or image. If undefined it is just common text
          width: 200, // The column width,
          isResizable: true, // If true the column is resizable
          isSortable: true // If true the column is sortable
        }
**Obs:** your columns array doesn't need to describe all the columns returned by the fetchURL, but it needs to describe the ones you want to show. In other words, just put in this array the columns you want to display to the user.

### fetchURL and how it is used to fecth your data in pieces
This needs to be a base URL that is able to return slices of your data. So lets suppose your fetchURL is example.com/data. The component will on demand make requests using this base as follows:
    
    example.com/data?_start=0&_end=101
So the base URL needs to be prepared to receive requests with that format to retrieve the data.

## Customize styles
All the styles are within the file *material-table.css*. More documentation soon.