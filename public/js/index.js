let paymentType = document.getElementById('paymentType');
const payment = document.getElementById('payment');
let paymentForm = document.getElementById('order_form');

const {loadStripe} = require('@stripe/stripe-js');
const axios = require('axios');

const initStripe = async ()=>{
  const stripe = await loadStripe('pk_test_51K87orSJQASQhGgArEnZNEvLJlPjjQelT81gAtkaVJbaF9OQtWSyaI15Q8FJJC3NVTR7a5clEMSuKUml9DU9tXgb00Sr2D0fcG');
  let card = null;
  
  if(paymentType){
     paymentType.addEventListener('change', (e)=>{
      if(e.target.value === 'card'){
        
        let elements = stripe.elements();
        card = elements.create('card', {hidePostalCode: true});

        card.mount(payment);
      }
      else{
        card.unmount();
      }
    })
  }

  if(paymentForm){
    paymentForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      
      const phoneNo = paymentForm.elements[1].value;
      const address = paymentForm.elements[2].value;
      
      const data = {
        phoneNo,
        address
      }
      
      //verify card
      if(card){
        console.log(card);
      }

      else{
        axios.post('/create-order', data)
          .then(result=>{
            console.log(result);
          })
          .catch(err=>{
            console.log(err);
          })
      }
    })
  }
}

initStripe();