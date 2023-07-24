const express = require('express');
const authController = require('../controllers/authController');
const User = require('../models/userModel');
const { check, body } = require('express-validator')

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',
[
    body('email').isEmail()
        .withMessage('Enter a valid email')
        .normalizeEmail().trim(),
    body('password', 'Password must be to 5 to 10 characters long.')
        .isLength({min: 5, max: 10})
], authController.postLogin);

router.post('/signup',
[
check('email').isEmail().withMessage('Enter a valid email')
.custom((value, {}) => {
    return User.findOne({email: value})
            .then(user => {
                if(user) {
                    return Promise.reject('Email already exists');
                }
            });
    })
    .normalizeEmail().trim(),
    body('password', 'Password must be 5 to 10 characters long')
        .isLength({min: 5, max: 10}),
    body('confirmPassword').custom((value, {req}) => {
        if(value !== req.body.password) {
            throw new Error('Confirm Password don\'t match');
        }
        return true;
    })
],
authController.postSignup);

router.post('/logout', authController.postLogout);

module.exports = router;