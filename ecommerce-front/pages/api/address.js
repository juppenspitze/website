import {mongooseConnect} from "@/lib/mongoose";
import {getServerSession} from "next-auth";
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import {Address} from "@/models/Address";

export default async function handle(req, res) {
  await mongooseConnect();
  const data = await getServerSession(req, res, authOptions);
  if (!data?.user) return res.json(null);
  const user = data.user;

  if (req.method === 'PUT') {
    const address = await Address.findOne({userEmail:user.email});
    if (address) {
      res.json(await Address.findByIdAndUpdate(address._id, req.body));
    } else {
      res.json(await Address.create({userEmail:user.email, ...req.body}));
    }
  }
  if (req.method === 'GET') {
    if (req.query?.country) res.json(await Address.findOne({userEmail:user.email}).select('country'));
    else res.json(await Address.findOne({userEmail:user.email}));
  }
}