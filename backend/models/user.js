const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        validate: {
            validator: function (password) {
              // Use a regular expression to check if the password contains at least one digit and one uppercase letter
              return /\d/.test(password) && /[A-Z]/.test(password);
            },
            message: 'Password must contain at least one number and one uppercase letter',
          },
    },
    confirmPassword: {
        type: String,
        required: true,
        minlength: 8,
    },
    mobileNo: {
        type: Number,
    },
    dateOfBirth: {
        type: Date,
    },
    token: {
        type: String
    },
    refreshToken: {
        type: String
    }
})

module.exports = mongoose.model('User', userSchema);