const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);

// const ObjectId = require('mongodb').ObjectId;
// const getDb = require('../utils/database').getDb;

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new ObjectId(id) : null;
//     this.userId = userId;
//   }
//   save() {
//     const db = getDb();
//     let addUpdateDb;
//     if (this._id) {
//       addUpdateDb = db.collection('products')
//         .updateOne({_id: this._id}, {$set: this});
//     } else {
//       addUpdateDb = db.collection('products').insertOne(this);
//     }
//     return addUpdateDb
//       .then(result => console.log(result))
//       .catch(err => console.log(err));
//   }
//   static fetchAll() {
//     return getDb().collection('products')
//       .find().toArray()                                 // returns a cursor
//       .then(products => {
//         // console.log(products);
//         return products;
//       })
//       .catch(err => console.log(err));
//   }
//   static findById(id) {
//     return getDb().collection('products')
//       .find({ _id: new ObjectId(id) }).next()
//       .then(product => {
//         // console.log('find by id', product);
//         return product;
//       })
//       .catch(err => console.log(err));
//   }
//   static deleteById(id) {
//     return getDb().collection('products')
//       .deleteOne({ _id: new ObjectId(id) })
//       .then(result => console.log('Deleted!'))
//       .catch(err => console.log(err));
//   }
// }

// module.exports = Product;


