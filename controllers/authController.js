const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const validationResult = require('express-validator').validationResult;

exports.getLogin = (req, res, next) => {
  let errMsg = req.flash('error');
  if(errMsg.length > 0) { errMsg = errMsg[0]; }
  else { errMsg = null; }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMsg: errMsg,
    prevLoginInput: { email: '', password: ''},
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422)
            .render('auth/login', {
              path: '/login',
              pageTitle: 'Login',
              errorMsg: errors.array()[0].msg,
              prevLoginInput: { email, password},
              validationErrors: []
            });
  }
  User.findOne({email: email})
    .then(user => {
        if(!user) {
          req.flash('error', 'Invalid email or password!');
            return res.status(422)
            .render('auth/login', {
              path: '/login',
              pageTitle: 'Login',
              errorMsg: 'Invalid Login or Password',
              prevLoginInput: { email, password},
              validationErrors: []
            });
        }
        bcrypt.compare(password, user.password)
            .then(didMatch => {
                if(didMatch){
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err =>
                        res.redirect('/')
                        );
                }
                return res.status(422)
                .render('auth/login', {
                  path: '/login',
                  pageTitle: 'Login',
                  errorMsg: 'Invalid Login or Password',
                  prevLoginInput: { email, password},
                  validationErrors: []
                });
            })
            .catch(err => {
                console.log(err);
                res.redirect('/login');
            })
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => res.redirect('/'));
};

exports.getSignup = (req, res, next) => {
  let errMsg = req.flash('error');
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    isLoggedIn: false,
    prevSignupInput: {
      email: '', password: '', confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422)
            .render('auth/signup', {
              path: '/signup',
              pageTitle: 'Signup',
              errorMsg: errors.array()[0].msg,
              prevSignupInput: {
                email, password, confirmPassword
              },
              validationErrors: []
            });
  }
  User.findOne({email: email})
    .then(user => {
        if(user) {
            return res.redirect('/');
        }
    bcrypt.hash(password, 12)
        .then(hashedPassword => new User({
            email, password: hashedPassword, cart: {items: []}
        }).save())
        .then(result=> res.redirect('/login'));    
    })
    .catch(err => console.log(err));
};
