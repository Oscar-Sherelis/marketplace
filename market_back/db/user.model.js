// Creating Schema
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required'
    },
    age: {
        type: Number,
        required: 'This field is required'
    },
    email: {
        type: String,
        required: 'This field is required'
    },
    password: {
        type: String,
        required: 'This field is required'
    },
    team: {
        type: Array
    },
    status: {
        type: String,
    },
    position: {
        type: String
    }
});

mongoose.model('users', userSchema);
