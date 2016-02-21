var Faker = require('faker');

module.exports = function() {
  var rowsCount = 1000;
  var columns = [
    {key: 'Avatar', type: 'image', width: 110},
    {key: 'First Name', isResizable: true, isSortable: true},
    {key: 'Last Name', type: 'bold', isResizable: true, isSortable: true},
    {key: 'City', width: 160, isResizable: true, isSortable: true},
    {key: 'Street', width: 200, isResizable: true, isSortable: true},
    {key: 'Email', type: 'email', width: 250, isSortable: true}
  ];
  var data = [];
  
  for (var i = 0; i < rowsCount; i++) {
    data.push({
      "id": i,
      "Avatar": Faker.image.avatar(),
      "First Name": Faker.name.firstName(),
      "Last Name": Faker.name.lastName(),
      "City": Faker.address.city(),
      "Street": Faker.address.streetAddress(),
      "Email": Faker.internet.email()
    });
  }

  return {
    description: {
      rowsCount: rowsCount,
      columns: columns
    },
    data: data
  };
};