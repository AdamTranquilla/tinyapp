const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
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

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

function emailLookup(email) {
  for (const user in users) {
    if (users[user].email === email) return user;
  }
}

app.get("/", (req, res) => {
  const userId = req.cookies["userId"];
  const urls = urlDatabase;
  const templateVars = { urls, userId };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["userId"];
  const urls = urlDatabase;
  const templateVars = { urls, userId }; // must be an object. this is so it can be accessed by key
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = { userId };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.cookies["userId"];
  const templateVars = { userId };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies["userId"];
  const urls = urlDatabase;
  const templateVars = { urls, userId };
  res.render('urls_login', templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (emailLookup(email)) {
    res.status(400).send('User already exists');
  }
  if (email === '' || password === '') {
    res.status(400).send('One or more fields are empty');
  }
  const user = { id, email, password };
  users[id] = user;
  console.log(users)
  res.cookie("userId", id);
  res.redirect('/');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = emailLookup(email)

  if (!user) {
    res.status(403).send('A user with that e-mail cannot be found');
  }
  console.log(users[user].password)
  if (password === users[user].password) {
    res.status(400).send('Incorrect password');
  }

  //res.cookie("userId", user); //user?
  res.redirect('/');
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];

  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => { // whatever is returned will be shortURL now
  //console.log(req.params, " before shortUrl");
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL; // for post the body will be the data from the form _shows
  //console.log(urlDatabase)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});