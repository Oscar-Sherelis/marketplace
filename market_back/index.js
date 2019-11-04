const express = require("express");
const db = require('./db/db'); // db.todos == array (Schema) required
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

// super global value example, what can be access in functions without new keyword***
// users - database
const users = mongoose.model('users');

const app = express();

// important to handle with errors
const cors = require('cors');
app.use(cors());

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


const crypto = require('crypto');
// add here password hashing***
const passwordHashing = require('./passwordHash');


// return mongoDB data
app.get('/data', (req, res) => {

  // mongoDB command takes all data from DB
  users.find((err, docs) => {
    if(err) {
      console.log('Error in find: ' + err)
    } else {
      res.status(200).send({
        success: 'true',
        message: 'todos retrieved successfully',
        list: docs
      });
    }
  });
});


app.delete('/delete/:id', (req, res) => {
  // in front-end dispatch('action_name', {_id: 'id_from_for_loop'})
  users.findByIdAndRemove({_id: req.params.id})
  .then(deletedPerson => {
    res.send(deletedPerson)
  });
});

app.post('/data', (req, res) => {
    updateRecord(req, res);
})

app.post('/register', (req, res) => {
// do I need here user? Can I use users without new...
   const user = new users();

   user.name = req.body.name,
   user.age = req.body.age,
   user.email = req.body.email,
   user.password = req.body.password

  if(personValidation(user, res)) {
    user.password = saltHashPassword(req.body.password);

    user.save((err, doc) => {
      if(err) {
            //handleValidationError(err, req.body);
            return res.status(400).send({
              success: 'Error user not inserted',
              list: req.body
            });
      } else {
        return res.status(201).send({
                success: 'User created successfully',
                message: 'Person added successfully',
                user
              })
       } 
  });
} else {
  console.log('validation error')
}
})

// new: true if something goes wrong row data will be not changed
// here I am using users not user***
function updateRecord(req, res) { 
  users.findOneAndUpdate({ _id: req.body._id}, req.body, {new: true}, (err, doc) => {
    // handleValidationError(err, req.body);
    res.status(201).send({
    viewTitle: 'Update person',
    users: req.body
    });
  });
}

function personValidation(user, response) {
  // ^ from start take only letters
  const numbers = new RegExp('^[0-9]');
  const letters = new RegExp('^[a-zA-Z]{1,255}$');
  const emailValid = /[ !#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]/;
  const passwordValid = new RegExp('[^]{6,255}$');

  if(!numbers.test(user.age)) {
    console.log('Error number is required')
    response.status(400).send({
      success: 'Error numbers is required',
    });
    return false;

  } else {
    if(user.age > 200) {
      console.log('age cannot be more than 200');
      response.status(400).send({
        success: 'Error age cannot be more than 200',
      });
      return false
    }
  }
  if(!letters.test(user.name)) {
    console.log('Name can only contain letters');
    // to access in front we need res.data.success
    response.status(400).send({
      success: 'Error Name can only contain letters',
    });
    return false;
  }

  if(emailValid.test(user.email)) {
    console.log('Not valid email');
    response.status(400).send({
      success: 'Error Email cannot use special characters',
    });
    return false;
  }
// tasks for app!*
// authentification

  // 'person' is database 'pers' is schema
  // only with db can make find and aggregate
    users.findOne([{email: user.email}])
    .then(result => {
      if(result) {
        response.status(400).send({
          success: 'Error Email already exists',
        });
        console.log(result)
        return false;
      }
    });
  
  if(!passwordValid.test(user.password)) {
    console.log('Password cannot be less 6 chars ');
    response.status(400).send({
      success: 'Password cannot be less 6 chars ',
    });
    return false;
  }
  console.log('works valid')
  return true;
}

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});