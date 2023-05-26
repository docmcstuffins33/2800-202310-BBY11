# SpiceOfLife
Our team, BBY-11, is developing a meal generating app to help people who don’t know what to cook with our large dataset of dishes with defined and searchable properties.

TECHNOLOGIES AND PACKAGES USED:
- MongoDB
- Nodejs
- Express
- EdenAI
- Bootstrap
- EJS
- ChatGPT

FILE CONTENTS:

├───.gitignore
├───databaseConnection.js
├───index.js
├───package.json
├───Procfile
├───README.md
├───utils.js
├───public
│   ├───css
│   │       style.css
│   │
│   ├───images
│   │       cat_staring.gif
│   │       logo.jpg
│   │       logo.png
│   │       logoCat.png
│   │
│   └───sounds
│           holy.wav
│           meow.mp3
│
└───views
    │   errorMessage.ejs
    │   favourites.ejs
    │   index.ejs
    │   login.ejs
    │   login_error.ejs
    │   logPage.ejs
    │   profile.ejs
    │   profile_unauthenticated.ejs
    │   readMorePage.ejs
    │   reset.ejs
    │   search.ejs
    │   signup.ejs
    │   signup_missing.ejs
    │
    └───templates
            footer.ejs
            header.ejs
            logCard.ejs
            popUp.ejs
            svg.ejs

INSTALLATION GUIDE:
1. Install Visual Studio or any IDE of your choice that can deal with Javascript, HTML, and CSS.
2. Install needed packages ("npm init", "npm i <package>"):
- bcrypt
- body-parser
- connect-mongo
- connect-mongodb-session
- cors
- dotenv
- ejs
- express
- express-session
- joi
- mongodb
- node
3. Fill out APIKEY for EdenAI, connect to main database in ENV file.
Testing log: https://docs.google.com/spreadsheets/d/1QxnRK28eSZOp6qoyCB-oJZckTSBAM-TpqKlWQK2MBMo/edit?usp=sharing 


FEATURES:
- Search
  - Users are able to search dishes either randomly or within a filtered environment, with filters ranging from complexity (calculated from list of steps and ingredients), time to cook and specific ingredients. Our app is then able to pull a dish from the database to match user needs to the best of its capabilities. Each dish is presented in a card witha short description which can be further expanded by a read more button, revealing information such as number of favorites, time to cook, ingredients and steps.
- History
  - Users can easily access a list of dishes they have generated so far either within the session or within their account (should the user be logged in), should they want to access those recipes again.
- Profile
  - Users can sign up or login and have access to their favourite recipes saved while retaining all the basic features given. Once signed in a user can see all their personal information. We also allow users to put their dietary restrictions (e.g. vegetarian, vegan, dairy-free) to narrow down the results our website can generate. Users can also access a reset password page to change their current password and log out of their account. 
- Favorites
  - Users that are logged in are able to favorite all recipes that they plan to follow, which can then be accessed in the profile page. 

CREDITS, REFERENCES, AND LICENSES
- Members: Olivia Li, Jackson Hu, Davin Leong, Mylo Yu
- EdenAI/OpenAI
- ChatGPT
- Special thanks to Chris, Carly and Hoda for being wonderful instructors~

AI USAGE:
a. We used AI to create images in real time so we did not have to switch off the dataset we were currently using. In addition, AI helped throughout the project with coding menial tasks like parsing data or explaining client/server interactions for certain features when we did not understand them.
b. We used AI to help recommend ways to parse/organize the dataset we took from kaggle to fit into the database.
c. Our app uses EdenAI to generate images for each dish based off of dish descriptions.
d. When trying to troubleshoot session saving, ChatGPT was unable to provide us with the help we needed.

CONTACT INFORMATION:
yli514@my.bcit.ca
jhu94@my.bcit.ca
dleong18@my.bcit.ca
myu122@my.bcit.ca