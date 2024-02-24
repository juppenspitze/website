import { returnSafePdfStream } from "@/lib/handlers";
import { sendMail } from "@/lib/mailService";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import axios from "axios";
import { Readable } from 'stream';

const handler = async (req, res) => {
  try {
    const { method } = req;

    switch (method) {
      case "POST": {
        if (req.query?.orderId) {

          let order = await Order.findById(req.query.orderId);
          order = order.toObject();

          const recipient = order.email;
          const theme = 'Order confirmation';
          const html = `
            <div>
              <div>Thank you for your order!</div>
              <div>Order number: ${order._id}</div>
              <div>Order date: ${order.createdAt}</div>
            </div>
          `;

          let electronicIds = [];
          order.line_items.forEach(item => {
            if (item.price_data.product_data.metadata.isElectronic) electronicIds.push(item.price_data.product_data.metadata._id);
          });

          const electronicProductLinks = await Product.find(
            { electronicId: { $in: electronicIds } },
            { eFile: 1, _id: 0 }
          );

          let attachments = [];
          for (let product of electronicProductLinks) {
            for (let url of product.eFile) {
              const response = await axios.get(url, { responseType: 'arraybuffer' });
              const buffer = Buffer.from(response.data, 'binary');

              const fileExtension = url.split('.').pop();

              let stream;
              if (fileExtension === 'pdf') {
                stream = await returnSafePdfStream(buffer, order);
              } else {
                stream = new Readable();
                stream.push(buffer);
                stream.push(null);
              }
              
              const urlParts = url.split('/');
              const fileName = urlParts[urlParts.length - 1];
              
              if (!stream) return;
              attachments.push({ filename: fileName, content: stream });
            };
          };

          await sendMail( recipient, theme, html, attachments );
          res.json('Email sent');
          break;
        } else {
          const {recipient, theme, html, attachments} = req.body;
          if (!recipient || !theme || !html) {
            res.status(400).send("Missing data");
            break;
          }
          await sendMail( recipient, theme, html, attachments );
          res.status(200).send("Success");
          break;
        };
      }
      case "GET": {
        res.status(200).send(req.auth_data);
        break;
      }
      default:
        res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (err) {
    res.status(400).json({
      error_code: "api_one",
      message: err.message,
    });
  }
};

export default handler;