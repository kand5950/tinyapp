const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');



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
app.use(cookieParser());

const users = {
  
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



const findUserEmailDatabase = (email, database) => {
  for (const user in database) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;

};

// const sessionID = function (req.cookies) {

// };

//GETS

app.get("/register", (req, res) => {
  let currentCookie = req.cookies.user_id;
  const templateVars = { user: users[req.cookies.user_id]};
  if (currentCookie) {
    res.redirect("/urls");
  } else {
  
    res.render("urls_register", templateVars);
  }
});

app.get("/login", (req, res) => {
  let currentCookie = req.cookies.user_id;
  const templateVars = { user: users[req.cookies.user_id]};
  if (currentCookie) {
    res.redirect("/urls");
  } else {
  
    res.render("urls_login", templateVars);
  }
});

//shows urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']]};
  res.render("urls_index", templateVars);
});

//renders a new url html page
app.get("/urls/new", (req, res) => {
  let currentCookie = req.cookies.user_id;
  if (!currentCookie) {
    res.redirect("/login");
  } else {
    const templateVars = { user: users[req.cookies['user_id']] };

    res.render("urls_new", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// page for short and long versions
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies['user_id']]};
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

app.post("/urls", (req, res) => {
  let randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${randomShortURL}`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  console.log(req.body);
  res.redirect(`/urls`);

});

app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (!findUserEmailDatabase(req.body.email, users)) {
      const usersId = generateRandomString();
      users[usersId] = {
        usersId,
        email: req.body.email,
        password: req.body.password

      };
      res.cookie("user_id", usersId);
      res.redirect('/urls');
    } else {
      res.statusCode = 400;
      res.send('<h3>ERROR 400</h3><br><h4>EMAIL ALREADY IN DATABASE</h4>');
  
    }
  }
  res.statusCode = 400;
  res.send('<h3>ERROR 400</h3><p>PLEASE FILL EMAIL AND PASSWORD FIELDS</p>');
});

app.post("/login", (req, res) => {

  let user = findUserEmailDatabase(req.body.email, users);
  if (user) {
    if (req.body.password === user.password) {
      res.cookie("user_id", user.usersId);
      res.redirect('/urls');
    } else {
      res.statusCode = 403;
      res.send('<h3>ERROR 403</h3><br><h4>Incorrect Password.</h4>');
    }
  }

  res.statusCode = 400;
  res.send('<h3>ERROR 403</h3><p>Email is not registered.</p>');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});


//deletes url from /urls
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});
