var Faker = require('faker');

module.exports = function() {
  var rowsCount = 1000;
  var columns = [
    {key: 'First Name'},
    {key: 'Last Name'},
    {key: 'City'},
    {key: 'Street'},
    {key: 'Email'}
  ];
  var data = [];
  
  for (var i = 0; i < rowsCount; i++) {
    data.push({
      "id": i,
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