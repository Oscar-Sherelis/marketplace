const express = require("express");
const db = require('./db/db'); // db.todos == array (Schema) required
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

// super global value example, what can be access in functions without new keyword***
const person = mongoose.model('person');

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

// return mongoDB data
app.get('/data', (req, res) => {

  // mongoDB command takes all data from DB
  person.find((err, docs) => {
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
  person.findByIdAndRemove({_id: req.params.id})
  .then(deletedPerson => {
    res.send(deletedPerson)
  });
});

app.post('/data', (req, res) => {
    updateRecord(req, res);
})

app.post('/register', (req, res) => {
  const pers = new person();

  pers.name = req.body.name,
  pers.age = req.body.age,
  pers.email = req.body.email,
  pers.password = req.body.password

  if(personValidation(pers, res)) {
    pers.password = saltHashPassword(req.body.password);

  // one line bellow is enought to save data into mongoDB database***
  pers.save((err, doc) => {
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
                pers
              })
       } 
  });
} else {
  console.log('validation error')
}
})

function insertRecord(req, res) {
  
  const pers = new person();

  pers.name = req.body.name,
  pers.age = req.body.age,
  pers.email = req.body.email,
  pers.password = req.body.password

  if(personValidation(pers)) {
    pers.password = saltHashPassword(req.body.password);
  // one line bellow is enought to save data into mongoDB database***
  
  pers.save((err, doc) => {
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
                pers
              })
       } 
  });
} else {
  console.log('validation error')
}
}

// new: true if something goes wrong row data will be not changed
function updateRecord(req, res) { 
  person.findOneAndUpdate({ _id: req.body._id}, req.body, {new: true}, (err, doc) => {
              // handleValidationError(err, req.body);
              res.status(201).send({
                  viewTitle: 'Update person',
                  person: req.body
              });
  });
}

// get title by id
// app.get('/data/:id', (req, res) => {
//     try {
//         res.send(res.status(200).json(db.todos.find(obj => obj.id === parseInt(req.params.id)).title))
//     } catch (e) {
//         res.status(500).json({ error: 'invalid parameter, id is required' })
//     }
// })

// delete by id
// app.delete("/data/:id", (req, res) => {
//   try{
//     db.todos.splice(db.todos.findIndex(obj => obj.id == parseInt(req.params.id)), 1)
//     console.log(req.params.id);
//     res.send({ id: parseInt(req.params.id) })
//   } catch(error) {
//     console.log(error)
//   }
// })

// need to add MongoDB functions like save***
// think about password encryption/encoding 
// https://nodejs.org/docs/latest/api/crypto.html
// open other projects to compare: cleanx, mongoStart, mongovuex, todo
// app.post('/data', (req, res) => {
//     if(!req.body.name || !req.body.age || !req.body.email || !req.body.password) {
//       return res.status(400).send({
//         success: 'false',
//         message: 'title is required'
//       });
//     }
//    let newPerson = {
//      name: req.body.name,
//      age: req.body.age,// was added body.title  title - must be input name
//      email: req.body.email,
//      password: req.body.password
//    }
//    db.list.push(newPerson);
//    return res.status(201).send({
//      success: 'true',
//      message: 'Person added successfully',
//      newPerson
//    })
//   });

function personValidation(pers, response) {
  // ^ from start take only letters
  const numbers = new RegExp('^[0-9]');
  const letters = new RegExp('^[a-zA-Z]{1,255}$');
  const emailValid = /[ !#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]/;
  const passwordValid = new RegExp('[^]{6,255}$');

  if(!numbers.test(pers.age)) {
    console.log('Error number is required')
    response.status(400).send({
      success: 'Error numbers is required',
    });
    return false;

  } else {
    if(pers.age > 200) {
      console.log('age cannot be more than 200');
      response.status(400).send({
        success: 'Error age cannot be more than 200',
      });
      return false
    }
  }
  if(!letters.test(pers.name)) {
    console.log('Name can only contain letters');
    // to access in front we need res.data.success
    response.status(400).send({
      success: 'Error Name can only contain letters',
    });
    return false;
  }

  if(emailValid.test(pers.email)) {
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
  // eggregate can find in many controllers
  // use findOne
    person.findOne([{email: pers.email}])
    .then(result => {
      if(result) {
        response.status(400).send({
          success: 'Error Email already exists',
        });
        console.log(result)
        return false;
      }
    })

  
  if(!passwordValid.test(pers.password)) {
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

////////////////////////////////////////

// Set up the express app
// const app = express();


// Parse incoming requests data
// app.use(bodyParser());
//app.use(bodyParser.urlencoded({ extended: true }));



// res.send() is used to send back a response to the client,
// the resource passed into the send 
// as a parameter is what gets sent back to the client. 
// in this case, we send back an object which contains some information


// What body parser does is that it parses this JSON data
// and makes it available under the req.body as a property.
// remember req is the first property we provide for our callback
// when we make an API request, and remember I said req contains information
// about the request that is coming from the client, so body parser makes
// the data coming from the form or any JSON data coming from the client available as a property under the req.body,
// so we can access the JSON data from req.body as.