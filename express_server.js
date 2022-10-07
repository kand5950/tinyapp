const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");



//generate random 6 char string
const generateRandomString = () => {
  const value = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {

    result += value.charAt(Math.floor(Math.random() * value.length));
  }

  return result;
	
};


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  secret: 'hi-my-name-is-slim-shady',
}));

const users = {
  
  
};

const urlDatabase = {
  //[shortURL] : { userId: req.cookies['user_id'],longUrl: req.body.longUrl }
};


// finding email of a user in a database
const findUserEmailDatabase = (email, database) => {
  for (const user in database) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;

};

const urlsForUser = (id) => {

  let userUrl = {};
  //find which current user is on via req.cookies.user_id which will be id
  //iterate through data base
  for (const ids in urlDatabase) {
    if (urlDatabase[ids].userId === id) {
      userUrl[ids] = urlDatabase[ids];
    }
  }
  return userUrl;
  //returns users object from database

};



//GET REGISTER
//Register page, if a user is logged in user will not be able to access register page
app.get("/register", (req, res) => {
  let currentCookie = req.session.user_id;
  const templateVars = { user: users[req.session.user_id]};
  if (currentCookie) {
    res.redirect("/urls");
  } else {
  
    res.render("urls_register", templateVars);
  }
});

//GET LOGIN
//login a user, if a user is logged in user will not be able to access log in page
app.get("/login", (req, res) => {
  let currentCookie = req.session.user_id;
  const templateVars = { user: users[req.session.user_id]};
  if (currentCookie) {
    res.redirect("/urls");
  } else {
  
    res.render("urls_login", templateVars);
  }
});

//shows urls
//user: for ejs file
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.session['user_id']), user: users[req.session.user_id]};
  res.render("urls_index", templateVars);
});

//renders a new url html page
//Users not logged in will be directed to /login
app.get("/urls/new", (req, res) => {
  let currentCookie = req.session.user_id;
  if (!currentCookie) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.session['user_id']] };

    res.render("urls_new", templateVars);
  }
});

//to access longurl website with shorturl in domain
//if shortUrl doesnt exist returns error
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.statusCode = 400;
    res.send('<h3>ERROR 400</h3><p>TINY URL DOESNT EXIST</p>');
    return;
  }
  let longUrl = urlDatabase[req.params.id].longUrl;
  res.redirect(longUrl);
});

//page for short and long versions and editing long url
//if user puts short url in domain, returns error
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.statusCode = 400;
    res.send('<h3>ERROR 400</h3><p>TINY URL DOESNT EXIST / NOT OWNED BY USER</p>');
    return;
  }
  const templateVars = { id: req.params.id, longUrl: urlDatabase[req.params.id].longUrl, user: users[req.session['user_id']]};
  res.render("urls_show", templateVars);
});

app.get("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.statusCode = 400;
    res.send('<h3>ERROR 400</h3><p>TINY URL DOESNT EXIST / NOT OWNED BY USER</p>');
    return;
  }
  const templateVars = { id: req.params.id, longUrl: urlDatabase[req.params.id].longUrl, user: users[req.session['user_id']]};
  res.render("urls_show", templateVars);
});

app.get("/set", (req, res) => {
  const a = 1; //test to see if accessoble for /fetch *no it's not accessible anywhere other than in function
  res.send(`a = ${a}`);
});
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// POST
//displays current users shorlUrl id and long Url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let currentCookie = req.session.user_id;
  if (!currentCookie) {
    res.send("Please login or Register to view URLs");
    return;
  }
  urlDatabase[shortURL] = {
    userId: req.session['user_id'],
    longUrl: req.body.longUrl
  };
  res.redirect(`/urls/${shortURL}`);
    
});

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userId) {
    urlDatabase[req.params.id] = req.body.longURL;
  
    return;
  }
  res.redirect(`/urls`);

});

app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (!findUserEmailDatabase(req.body.email, users)) {
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
});

app.post("/login", (req, res) => {
  let user = findUserEmailDatabase(req.body.email, users);
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session = user_id , user.usersId;
      res.redirect('/urls');
      return;
    } 
      res.statusCode = 403;
      res.send('<h3>ERROR 403</h3><br><h4>Incorrect Password.</h4>');
  
  }

  res.statusCode = 400;
  res.send('<h3>ERROR 403</h3><p>Email is not registered.</p>');
});

app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect(`/urls`);
});


//deletes url from /urls
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userId) {
    delete urlDatabase[req.params.id];

  }
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});
