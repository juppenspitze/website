import {mongooseConnect} from "@/lib/mongoose";
import {getServerSession} from "next-auth";
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import {Order} from "@/models/Order";

export default async function handle(req, res) {
  await mongooseConnect();

  if (req.method === 'DELETE') {
    const {_id} = req.query;
    await Order.findByIdAndDelete(_id);
    res.json(true);
  }

  if (req.method === 'GET') {
    const {user} = await getServerSession(req, res, authOptions);
    res.json( await Order.find({userEmail:user.email}) );
  };

  if (req.method === 'PUT') {
    const {state,_id} = req.body;
    await Order.updateOne({_id}, {state});
    res.json(true);
  }
};
