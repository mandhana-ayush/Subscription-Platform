const stripe = require('stripe');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const Stripe = stripe(STRIPE_SECRET_KEY);
const User = require('../models/user');

const getHomePage = (req, res)=>{

  res.render('home/index', {
    path: "/",
    pageTitle: 'index',
  })
}

const getTrainings =  (req, res)=>{
  res.render('home/training', {
    path:'/trainings',
    pageTitle: 'training'
  })
}

const addNewCustomer = async(email)=>{
  const customer = await Stripe.customers.create({
    email,
  })

  return customer;
}

const getCustomerById = async (id)=>{
  const customer = await Stripe.customer.retrieve(id);
  return customer;
}

const productToPriceMap = {
  fearlessHabits: "price_1KMAmaSJQASQhGgAn0zqogVS",
} 

const createCheckoutSession = async (customer, price) => {
  const session = await Stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer,
    line_items: [
      {
        price,
        quantity: 1
      }
    ],
    success_url: `http://localhost:4000/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:4000/failed`
  })

  return session;
}


const checkout = async (req, res)=>{
  const {email} = req.session.user.email;
  const customer = await addNewCustomer(email);
    const session = await createCheckoutSession(customer.id, productToPriceMap.fearlessHabits);
    res.send({sessionId:session.id, });
}

const success = async (req, res)=>{
  const session = await Stripe.checkout.sessions.retrieve(req.query.session_id);
  console.log(session);

  const Product = await User.updateOne({_id: req.session.user._id} , {
    $set: {
      subsId:session.subscription,
      ispaid: true,
      custId: session.customer
    }
  })
  console.log(Product);
  req.session.subscription_details = session;
  req.session.ispaid = true;
  res.redirect('/');
}

const subspage = (req, res)=>{
  res.render('home/subspage', {
    path:'/mysubspage',
    pageTitle: 'subspage'
  })
}

const failure = (req, res)=>{
  res.send({
    "message": "Your transaction has failed",
  })
}

module.exports = {
  getHomePage,
  getTrainings,
  checkout, 
  success,
  failure,
  subspage
}