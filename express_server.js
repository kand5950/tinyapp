const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')



//generate random 6 char string
function generateRandomString() {
  const value = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {

    result += value.charAt(Math.floor(Math.random() * value.length));
  }

  return result;
	
}

//unique name


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const users = {
  
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function findEmailDatabase(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;

}



app.post("/urls", (req, res) => {
  let randomShortURL = generateRandomString();
  urlDatabase[randomShortURL] = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${randomShortURL}`); 
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  console.log(req.body)
  res.redirect(`/urls`);

})

app.post("/register", (req, res) => {
  const usersId = generateRandomString();
  users[usersId] = {
    usersId,
    email: req.body.email,
    password: req.body.password

  }
  res.cookie("user_id", usersId)
  res.redirect('/urls');
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect(`/urls`);
})

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username)
  res.redirect(`/urls`);
})


//deletes url from /urls
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
})

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']]};
  res.render("urls_register", templateVars);
})

//shows urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']]};
  res.render("urls_index", templateVars);
});

//renders a new url html page
app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };

  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
})

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});
