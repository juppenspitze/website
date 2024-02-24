import {mongooseConnect} from "@/lib/mongoose";
import {Order} from "@/models/Order";
import {getServerSession} from "next-auth";
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import { ShipmentMethod } from "@/models/ShipmentMethod";
const stripe = require('stripe')(process.env.STRIPE_SK);

export default async function handler(req,res) {
  if (req.method !== 'POST') {
    res.json('should be a POST request');
    return;
  };
  const {
    name,email,shipmentMethodId,profileId,
    city,postalCode,streetAddress,countryId,
    billCity,billPostalCode,billStreetAddress,billCountry,
    isBillAddress,cartProducts,products,vatFee
  } = req.body;
  await mongooseConnect();

  let line_items = [];
  for (const product of products) {
    let quantity = 0;
    let name = product.title;
    let id = '';
    let price = 0;
    let isElectronic = false;
    if (product.eVersion) {
      quantity = cartProducts.filter(id => id === product.electronicId).length;
      name += ' (electronic version)';
      id = product.electronicId;
      isElectronic = true;
      if (product.electronicPrice) price = product.electronicPrice;
      else price = product.price;
    } else {
      quantity = cartProducts.filter(id => id === product._id.toString()).length;
      id = product._id;
      price = product.price;
    };

    line_items.push({
      quantity:quantity,
      price_data: {
        currency: 'USD',
        product_data: {
          name,
          metadata: {_id:id, isElectronic, vatPercentage:product?.vatPercentage || null}
        },
        unit_amount: product.price * 100,
      },
    });
  };

  const session = await getServerSession(req,res,authOptions);

  const shippingMethod = await ShipmentMethod.findOne({_id:shipmentMethodId});
  let profileFee = shippingMethod.profiles.find(p => p.profileId.toString() === profileId)?.profileFee;
  let countryFee = shippingMethod.countries.find(c => c.countryId.toString() === countryId)?.baseFee;
  if (!profileFee) profileFee = 0;
  if (!countryFee) countryFee = 0;
  const shippingFee = countryFee + profileFee;
  const shippingFeeCents = (shippingFee || 0) * 100;

  const totlAmountOfOrders = await Order.find().countDocuments();
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
  const year = String(date.getFullYear()).slice(-2);
  const orderNo = `R${String(totlAmountOfOrders).padStart(3, '0')}-${day}${month}${year}`;

  const orderDoc = await Order.create({
    line_items,name,email,shipmentMethodId,profileId,vatFee,
    city,postalCode,streetAddress,countryId,
    billCity,billPostalCode,billStreetAddress,billCountry,
    isBillAddress,shipmentFee:shippingFeeCents,paid:false,state:'pending',
    userEmail: session?.user?.email,orderNo
  });

  let orderIdString = orderDoc._id.toString();

  const stripeSession = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    customer_email: email,
    success_url: process.env.PUBLIC_URL + '/cart?success=' + orderIdString,
    cancel_url: process.env.PUBLIC_URL + '/cart?canceled=' + orderIdString,
    metadata: {orderId:orderIdString},
    allow_promotion_codes: true,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: 'shipping fee',
          type: 'fixed_amount',
          fixed_amount: {amount: shippingFeeCents, currency: 'USD'},
        },
      }
    ],
  });

  res.json({
    orderId:stripeSession.metadata.orderId,
    url:stripeSession.url,
  });

}