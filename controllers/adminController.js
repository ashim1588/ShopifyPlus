const Product = require('../models/productModel')
const deleteFile = require('../utils/helpers')

exports.getAddProduct = (req, res, next) => {
  if(!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  res.render('admin/add-edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editMode: false, isLoggedIn: req.session.isLoggedIn
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if(!image) {
    return res.redirect('/admin/add-product');
  }
  const imageUrl = image.path;
  const product = new Product({
    title, price, description, imageUrl,
    userId: req.user
  });
  product.save()
    .then(result => {
      console.log('product created');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    // .select('title price')
    // .populate('userId', 'name email -_id')
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        products, pageTitle: 'Admin Products',
        path: '/admin/products', isLoggedIn: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const pid = req.params.pid;
  Product.findById(pid)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/add-edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editMode, product, isLoggedIn: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const pid = req.body.pid;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDescription = req.body.description;
  Product.findById(pid)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      if(image) {
        deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.save()
      .then(result => res.redirect('/admin/products'))
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const pid = req.body.pid;
  Product.findById(pid)
    .then(product => {
      if(!product) {
        return next(new Error('Product not found. '));
      }
      deleteFile(product.imageUrl);
      return Product.deleteOne({_id: pid, userId: req.user._id})
    })
    .then(() => req.user.deleteFromCart(pid))
    .then(() => res.redirect('/admin/products'))
    .catch(err => console.log(err));
};
