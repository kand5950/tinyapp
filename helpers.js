// finding a user by email
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;

};

//generate random 6 char string
const generateRandomString = () => {
  const value = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {

    result += value.charAt(Math.floor(Math.random() * value.length));
  }

  return result;
	
};

const urlsForUser = (id, database) => {

  let userUrl = {};
  //find which current user is on via req.cookies.user_id which will be id
  //iterate through data base
  for (const ids in database) {
    if (database[ids].userId === id) {
      userUrl[ids] = database[ids];
    }
  }
  return userUrl;
  //returns users object from database

};


module.exports = { getUserByEmail, generateRandomString, urlsForUser };