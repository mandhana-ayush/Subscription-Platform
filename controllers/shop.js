const Product = require('../models/product');
const Order = require('../models/order');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',

      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = async (req, res, next) => {
  
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      let totalAmount=0;

      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId } };
      });

      products.forEach(item=>{
        totalAmount = totalAmount + parseInt(item.product._doc.price);
      });

      let order = new Order({
        userId: req.user._id,
        products,
        address: {
          phone_no: req.body.phoneNo,
          address: req.body.address
        },
      })
      
      order.save()
       .then((result=>{
         if(req.body.paymentType == 'card'){
        
          stripe.charges.create({
            amount: totalAmount*100, 
            currency: 'inr',
            source: req.body.id,
            description: `${order.id}`
          })
            .then(result=>{
              console.log(result);

              order.paymentStatus = true;
              order.paymentType = 'card';

              order.save()
                .then(result=>{
                  console.log(result);
                })
                .catch(err=>{
                  console.log(err);
                })
            })
            .catch(err=>{
              console.log(err);
            }) 
         }
       }))
       .catch(err=>{
         console.log(err);
       })
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));  
};

exports.getOrders = (req, res, next) => {
  Order.find({'userId': req.user._id})
    .then(orders=>{
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      })
    })
    .catch(err=>{
      console.log(err);
    })
  // Order.find({ 'user.userId': req.user._id })
  //   .then(orders => {
  //     console.log(orders);
  //     res.render('shop/orders', {
  //       path: '/orders',
  //       pageTitle: 'Your Orders',
  //       orders: orders,
  //     });
  //   })
  //   .catch(err => console.log(err));
};
