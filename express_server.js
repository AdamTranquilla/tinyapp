const express = require("express");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail, usersURLs, verifyLoggedIn } = require('./helper.js');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24hr
}));


const urlDb = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "testId",
    totalVisits: 0,
    uniqueVisits: []
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "testId",
    totalVisits: 0,
    uniqueVisits: []
  }
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

  if (verifyLoggedIn(userId)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");/// error?
  };
});

app.get("/register", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];

  const templateVars = { user };

  if (verifyLoggedIn(userId)) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  };
});

app.get("/login", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];

  const templateVars = { user };

  if (verifyLoggedIn(userId)) {
    res.redirect("/urls");
  } else {
    res.render('urls_login', templateVars);
  };
});

app.get("/urls", (req, res) => {
  const userId = req.session.userId;

  const user = users[userId];
  const urls = usersURLs(userId, urlDb);

  const templateVars = { urls, user };

  if (verifyLoggedIn(userId)) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");/// error?
  }
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;

  const user = users[userId];

  const templateVars = { user };

  if (verifyLoggedIn(userId)) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login"); /// error?
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.userId;

  const shortURL = req.params.shortURL;
  const matchResult = urlDb[shortURL];

  if (!matchResult) {
    return res.status(404).send("No Url Found");
  }

  const user = users[userId];

  if (matchResult.userId === userId) {
    const longURL = urlDb[shortURL].longURL;
    const visitsData = urlDb[shortURL];

    const templateVars = { user, shortURL, longURL, visitsData };

    return res.render("urls_show", templateVars);
  }
  res.status(403).send("You do not have permission to do this"); //turn into template
});

app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const longURL = urlDb[shortURL].longURL;
  urlDb[shortURL].totalVisits++;

  const userId = req.session.userId;

  if (users[userId] && !(urlDb[shortURL].uniqueVisits.includes(userId))) {

    urlDb[shortURL].uniqueVisits.push(userId);
  } else if (!(req.session) && !(urlDb[shortURL].uniqueVisits.includes(userId))) { // add a new guest cookie to session and sore in unique
    const guestId = generateRandomString();
    req.session.guestId = guestId;
    urlDb[shortURL].uniqueVisits.push(guestId);

  } else if (!(urlDb[shortURL].uniqueVisits.includes(req.session.guestId)) && !(urlDb[shortURL].uniqueVisits.includes(userId))) {
    urlDb[shortURL].uniqueVisits.push(req.session.guestId);
  }
  res.redirect(`${longURL}`);
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
  const totalVisits = 0;
  const uniqueVisits = [];

  urlDb[shortURL] = { longURL, userId, totalVisits, uniqueVisits }; // stretch total visits

  res.redirect(`/urls`);
});

app.put("/urls/:shortURL", (req, res) => { // method-override post to put
  const longURL = req.body.longURL;

  urlDb[req.params.shortURL].longURL = longURL;

  res.redirect("/urls");
});

app.delete("/urls/:shortURL", (req, res) => { // method-override post to delete
  delete urlDb[req.params.shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});