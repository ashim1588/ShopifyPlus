const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const fs = require('fs');
const  PDFDocument  = require('pdfkit');
const path = require('path');
const rootPath = require('../utils/appPath');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        products, pageTitle: 'All Products',
        path: '/products', isLoggedIn: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const pid = req.params.pid;
  Product.findById(pid)
    .then((product) => {
      res.render('shop/product-detail', {
        product, pageTitle: product.title,
        path: '/products', isLoggedIn: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        products, pageTitle: 'Shop', path: '/',
        isLoggedIn: req.session.isLoggedIn,
        csrfToken: req.csrfToken()
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user.populate('cart.items.productId')
    .then(user => {
      console.log(user.cart.items);
      res.render('shop/cart', {
        path: '/cart', pageTitle: 'Your Cart',
        products: user.cart.items,
        isLoggedIn: req.session.isLoggedIn
      })
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
    .then(orders => res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Your Orders',
      orders, isLoggedIn: req.session.isLoggedIn
    }))
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const pid = req.body.pid;
  Product.findById(pid)
    .then(product => req.user.addToCart(product))
    .then(result => {
      console.log(result);
      res.redirect('/cart')
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const pid = req.body.pid;
  req.user.deleteFromCart(pid)
    .then(result => res.redirect('/cart'))
    .catch(err => console.log(err));
};

exports.postCreateOrder = (req, res, next) => {
  req.user.populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(item => {
        return {
          quantity: item.quantity, product: {...item.productId._doc}
        }
      });
      const order =  new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products
      });
      return order.save();
    })
    .then(result => req.user.clearCart())
    .then(() => res.redirect('/orders'))
    .catch(err => console.log(err));
};

exports.getInvoice = (req,res,next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if(!order) {
        return next(new Error('No order found.'));
      }
      if(order.user.userId.toString() !== req.user._id.toString()){
        return next(new Error('Unauthorized'));
      }
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join(
        rootPath, 'invoices', invoiceName
          );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition',
        'inline; filename="' + orderId + '_' + invoiceName + '"'
            );
      const pdfDoc = new PDFDocument();
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(20).text('Invoice', {underline: true});
      let totalPrice = 0;
      order.products.forEach(p  => {
        totalPrice += p.quantity * p.product.price;
        pdfDoc.fontSize(14).text(
          p.product.title + ' - ' + p.quantity + ' x ' + p.product.price
        );
      });
      pdfDoc.text('');
      pdfDoc.text('------------------');
      pdfDoc.fontSize(18).text('Total Price '+ totalPrice);
      pdfDoc.end();
    })
    .catch(err => console.log(err));
}