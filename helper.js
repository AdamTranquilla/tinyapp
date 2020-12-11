function getUserByEmail(email, userDb) {
  for (const user in userDb) {
    if (userDb[user].email === email) return userDb[user];
  }
}

exports.getUserByEmail = getUserByEmail;