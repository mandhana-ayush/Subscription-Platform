const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true }
    }
  ], 
  address: {
    phone_no:{
      type:Number,
      required: true 
    }, 
    address: {
      type: String,
      required: true
    }
  },
  paymentType:{
    type: String,
    default:'cod',
    required: true
  },
  paymentStatus: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model('Order', orderSchema);
