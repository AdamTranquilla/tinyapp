const express = require("express");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail, usersURLs, verifyLoggedIn } = require('./helper.js');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24hr
}));


const urlDb = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userId: "testId" },
  i3BoGr: { longURL: "https://www.google.ca", userId: "testId" }
};

const users = {
  "testId": {
    id: "testId",
    email: "test@1.com",
    password: "$2b$10$EEhq6myBA8G9SVhSnZacveiGg/1DON3317mcSb91C2O2.0TqkD4/G" // its abc ;)
  }
};

app.get("/", (req, res) => {
  const userId = req.session.userId;
  verifyLoggedIn(userId, res);

  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  verifyLoggedIn(userId, res);

  const user = users[userId];
  const urls = usersURLs(userId, urlDb);

  const templateVars = { urls, user };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  verifyLoggedIn(userId, res);

  const user = users[userId];

  const templateVars = { user };

  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = urlDb[shortURL].longURL;

  res.redirect(`${longURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.userId;
  verifyLoggedIn(userId, res);

  const shortURL = req.params.shortURL;
  const matchResult = urlDb[shortURL];

  if (!matchResult) {
    return res.status(404).send("No Url Found");
  }

  const user = users[userId];

  if (matchResult.userId === userId) {
    const longURL = urlDb[shortURL].longURL;
    const templateVars = { user, shortURL, longURL };
    return res.render("urls_show", templateVars);
  }
  res.status(403).send("You do not have permission to do this"); //turn into template
});

app.get("/register", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];

  const templateVars = { user };

  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];

  const templateVars = { user };

  res.render('urls_login', templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (getUserByEmail(email, users)) {
    return res.status(400).send('User already exists');

  }
  if (email === '' || password === '') {
    return res.status(400).send('One or more fields are empty');
  }
  const userId = generateRandomString();

  const user = {
    id: userId,
    email: req.body.email,
    password: bcrypt.hashSync(password, 10)
  };

  users[userId] = user; //Adds new user to DB

  req.session.userId = userId;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send('A user with that e-mail cannot be found');

  }

  const userId = user.id;

  const password = req.body.password;
  const hash = user.password;

  if (!bcrypt.compareSync(password, hash)) {
    return res.status(400).send('Incorrect password');

  }

  req.session.userId = userId;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login'); // sends user back to login page
});

app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDb[shortURL] = { longURL, userId };

  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  const longURL = req.body.longURL;

  urlDb[req.params.shortURL].longURL = longURL;

  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => { // deleting short url from URL Database
  delete urlDb[req.params.shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});