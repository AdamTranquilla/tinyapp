const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userId: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userId: "userRandomID" }
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

function usersURLs(userId) {
  const filteredURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userId === userId) {
      filteredURLs[url] = urlDatabase[url];
    }
  }
  return filteredURLs;
}
//update this to homepage
app.get("/", (req, res) => {
  const userId = req.cookies["userId"];
  const urls = urlDatabase;
  const templateVars = { urls, userId };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  if (!req.cookies["userId"]) res.redirect("/login");

  const templateVars = {
    urls: usersURLs(req.cookies["userId"]),
    userId: req.cookies["userId"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["userId"]) res.redirect("/login");

  const templateVars = {
    userId: req.cookies["userId"]
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies["userId"]) res.redirect("/login");

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userId: req.cookies["userId"]
  };
  res.render("urls_show", templateVars);
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
  const email = req.body.email;
  const password = req.body.password;

  if (emailLookup(email)) {
    res.status(400).send('User already exists');
  }
  if (email === '' || password === '') {
    res.status(400).send('One or more fields are empty');
  }

  const id = generateRandomString();
  const user = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password,
  };
  users[id] = user;
  //console.log(users)
  res.cookie("userId", id);
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookup(email);

  if (!user) {
    res.status(403).send('A user with that e-mail cannot be found');
  }
  if (password !== users[user].password) {
    res.status(400).send('Incorrect password');
  }

  res.cookie("userId", users[user]);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.cookies["userId"]
  };

  res.redirect(`/urls/${shortURL}`);
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