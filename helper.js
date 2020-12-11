function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

function getUserByEmail(email, userDb) {
  for (const user in userDb) {
    if (userDb[user].email === email) {
      return userDb[user];
    }
  }
}

function usersURLs(id, urlDb) {
  let filteredURLs = {};
  for (const url in urlDb) {
    if (urlDb[url].userId === id) {
      filteredURLs[url] = urlDb[url];
    }
  }
  return filteredURLs;
}

function verifyLoggedIn(userId, res) {
  if (!userId) {
    res.redirect('/login');
    return;
  }
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  usersURLs,
  verifyLoggedIn
};