import {mongooseConnect} from "@/lib/mongoose";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";
import {Invoice} from "@/models/Invoice";

export default async function handle(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (req.method === 'POST') {
    const {invoiceNo} = req.body;
    res.json(await Invoice.create({invoiceNo}));
  };

  if (req.method === 'PUT') {
    const {invoiceNo,_id} = req.body;
    res.json(await Invoice.updateOne({_id}, {invoiceNo}));
  };

  if (req.method === 'GET') {
    res.json(await Invoice.find());
  };
};