const express = require("express");
const  { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  secret: 'hi-my-name-is-slim-shady',
}));

const users = {};
const urlDatabase = {};

//GET REGISTER
//Register page, if a user is logged in user will not be able to access register page
app.get("/register", (req, res) => {
  let userId = req.session.user_id;
  
  if (userId) {
    res.redirect("/urls");
    return;
  } else {
    const templateVars = { user: users[req.session.user_id]};
    res.render("urls_register", templateVars);
  }
});

//GET LOGIN
//login a user, if a user is logged in user will not be able to access log in page
app.get("/login", (req, res) => {
  let userId = req.session.user_id;
  const templateVars = { user: users[req.session.user_id]};
  if (userId) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[req.session.user_id]};
    res.render("urls_login", templateVars);
  }
});

//shows urls
//user: for ejs file
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id]};
  let userId = req.session.user_id;
  res.render("urls_index", templateVars);
});

//renders a new url html page
//Users not logged in will be directed to /login
app.get("/urls/new", (req, res) => {
  let userId = req.session.user_id;
  if (!userId) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.session.user_id] };

    res.render("urls_new", templateVars);
  }
});

//to access longurl website with shorturl in domain
//if shortUrl doesnt exist returns error
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.statusCode = 404;
    res.send('<h3>ERROR 404</h3><p>TINY URL DOESNT EXIST</p>');
    return;
  }
  let longUrl = urlDatabase[req.params.id].longUrl;
  res.redirect(longUrl);
});

//page for short and long versions and editing long url
//if user puts short url in domain, returns error
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.statusCode = 404;
    res.send('<h3>ERROR 404</h3><p>TINY URL DOESNT EXIST</p>');
    return;
  }
  const templateVars = { id: req.params.id, longUrl: urlDatabase[req.params.id].longUrl, user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

app.get("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.statusCode = 400;
    res.send('<h3>ERROR 400</h3><p>TINY URL DOESNT EXIST / NOT OWNED BY USER</p>');
    return;
  }
  const templateVars = { id: req.params.id, longUrl: urlDatabase[req.params.id].longUrl, user: users[req.session.user_id]};
  res.render("urls_show", templateVars);
});

//home tag goes to urls, if not logged in redirects to login
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  res.redirect("/login");
});

// POST
//displays current users shorlUrl id and long Url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let userId = req.session.user_id;
  if (!userId) {
    res.send("Please login or Register to view URLs");
    return;
  }
  urlDatabase[shortURL] = {
    userId: req.session.user_id,
    longUrl: req.body.longUrl
  };
  res.redirect(`/urls/${shortURL}`);
    
});

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id && (req.session.user_id === urlDatabase[req.params.id].userId)) {
    urlDatabase[req.params.id].longUrl = req.body.longURL;
    res.redirect(`/urls`);
    return;
  }
  res.statusCode = 401;
  res.send('<h3>ERROR 401</h3><p>UNAUTHORIZED, NOT OWNER</p>');

});

app.post("/register", (req, res) => {
  if (!/\s/.test(req.body.password)) {
    if (req.body.email && req.body.password) {
      if (!getUserByEmail(req.body.email, users)) {
        const usersId = generateRandomString();
        users[usersId] = {
          usersId,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, 10)

        };
        req.session.user_id = usersId;
        res.redirect('/urls');
        return;
      }
      res.statusCode = 400;
      res.send('<h3>ERROR 400</h3><br><h4>EMAIL ALREADY IN DATABASE</h4>');
      return;
    }
    res.statusCode = 400;
    res.send('<h3>ERROR 400</h3><p>PLEASE FILL EMAIL AND PASSWORD FIELDS</p>');
    return;
  }
  res.statusCode = 400;
  res.send('<h3>ERROR 400</h3><p>NO SPACES ALOUD IN PASSWORD!</p>');

});

app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.usersId;
      res.redirect('/urls');
      return;
    }
    res.statusCode = 401;
    res.send('<h3>ERROR 401</h3><br><h4>Incorrect Password.</h4>');
    return;
  }

  res.statusCode = 401;
  res.send('<h3>ERROR 401</h3><p>Email is not registered.</p>');
});

app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect(`/urls`);
});


//deletes url from /urls
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id && (req.session.user_id === urlDatabase[req.params.id].userId)) {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls`);
  }
  res.statusCode = 401;
  res.send('<h3>ERROR 401</h3><p>UNAUTHORIZED, NOT OWNER</p>');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});
