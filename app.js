const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose =  require('mongoose');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const rootPath = require('./utils/appPath');
const User = require('./models/userModel');
const adminRoutes = require('./routes/adminRoutes');
const shopRoutes = require('./routes/shopRoutes');
const authRoutes = require('./routes/authRoutes');
const pageNotFoundController = require('./controllers/404Controller');

const MONGODBURI = 'mongodb+srv://fullstack2022:fullstack123@cluster0.kptwk4x.mongodb.net/shopapp?retryWrites=true&w=majority';

const app = express();

const store = new MongoDBStore({
  uri: MONGODBURI, collection: 'sessions'
});

const fileStorage = multer.diskStorage({
  destination: (res, file, cb) => {
    cb(null, 'uploadedDocs');
  },
  filename: (res, file, cb) => {
    cb(null, Math.round(Math.random() * 1E9) + '' + file.originalname);
  }
});

const fileFilter = (res,file,cb) => {
  let isImage = false;
  if (file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg') {
        isImage = true;
      }
    cb(null, isImage);
}

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter}).single('image'));
app.use(express.static(path.join(rootPath, 'public')));
app.use('/uploadedDocs',
  express.static(path.join(rootPath, 'uploadedDocs')));
app.use(session({
  secret: 'some secret value here', resave: false,
  saveUninitialized: false, store: store
}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req,res,next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(pageNotFoundController.get404);

mongoose.connect(MONGODBURI)
  .then(result => {
    console.log('Connected');
    app.listen(3500);
  })
  .catch(err => console.log(err));