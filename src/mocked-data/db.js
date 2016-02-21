var Faker = require('faker');

module.exports = function() {
  var rowsCount = 1000;
  var columns = [
    {key: 'Avatar', type: 'image', width: 110},
    {key: 'First Name'},
    {key: 'Last Name', type: 'bold'},
    {key: 'City', width: 160},
    {key: 'Street', width: 200},
    {key: 'Email', type: 'email', width: 250}
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