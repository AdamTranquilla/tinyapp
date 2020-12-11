const { assert } = require('chai');
const { getUserByEmail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email testUsers', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.deepEqual(user.id, expectedOutput);
  });
/*   it('should return a user with valid email testUsers', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "user2RandomID";
    assert.deepEqual(user.id, expectedOutput);
  }); */
  it('bad email', function() {
    const user = getUserByEmail("userasdas@example.com", testUsers)
    const expectedOutput = undefined;
    assert.deepEqual(user, expectedOutput);
  });
});