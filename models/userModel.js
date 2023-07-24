const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true},
  cart: {
    items: [{
      productId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      }, 
      quantity: { type: Number, required: true }
    }]
  }
});

userSchema.methods.addToCart = function(product) {
  const cartItemIndex = this.cart.items.findIndex(cartItem =>
    cartItem.productId.toString() === product._id.toString()
  );
  const updatedCartItems = [...this.cart.items];
  if (cartItemIndex >= 0) {
    updatedCartItems[cartItemIndex].quantity++;
  } else {
    updatedCartItems.push({
      productId: product._id , quantity: 1
    });
  }
  const updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteFromCart = function (pid) {
  const updatedCartItems = this.cart.items.filter(item =>
    item.productId.toString() !== pid.toString()
  );
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);

