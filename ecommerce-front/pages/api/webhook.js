import {mongooseConnect} from "@/lib/mongoose";
const stripe = require('stripe')(process.env.STRIPE_SK);
import {buffer} from 'micro';
import {Order} from "@/models/Order";

const endpointSecret = "whsec_fd37d2d1d95451c86fa136c8dbe51ae13f894dc4119226cd7b74076222ab5b0b";
//whsec_ZJXbyisMHgChYVXvQ4GeCr3XHCNrLK6t

export default async function handler(req,res) {
  await mongooseConnect();
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    console.log("trying webhook")
    const rawBody = (await buffer(req)).toString();
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log("event:", event)
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
 if (event.type === 'checkout.session.completed') {
    console.log("checkout.session.completed")
    const data = event.data.object;
    const orderId = data.metadata?.orderId;
    const paid = data.payment_status === 'paid';
    if (orderId && paid) {
      console.log("yes1")
      await Order.findByIdAndUpdate(orderId,{
        paid:true,
      });
    };

    if (data.payment_intent) {  
      console.log("yes2")
      const paymentIntent = await stripe.paymentIntents.retrieve(data.payment_intent, {
        expand: ['payment_method'],
      });
      console.log("paymentIntent:", paymentIntent)
      if (!paymentIntent) return;
      await Order.findByIdAndUpdate(orderId,{
        paymentBrand:paymentIntent.payment_method.card.brand,
        paymentLast4:paymentIntent.payment_method.card.last4,
      })
    }
  } else console.log(`Unhandled event type ${event.type}`);

  res.status(200).send('ok');
}

export const config = {
  api: {bodyParser:false,}
};

// jolly-dazzle-revel-fiery
// acct_1NrQexCoFsKIpl1i
//shine-excite-clever-liking
//acct_1NrQexCoFsKIpl1i