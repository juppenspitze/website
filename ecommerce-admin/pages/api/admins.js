import {mongooseConnect} from "@/lib/mongoose";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";
import {Admin} from "@/models/Admin";
import bcrypt from "bcryptjs";

export default async function handle(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);
  const method = req.method;

  if (method === 'POST') {
    const {email,password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (await Admin.findOne({email})) {
      res.status(400).json({message:'admin already exists!'});
    } else {
      res.json(await Admin.create({email,password:hashedPassword,normalPassword:password}));
    }
  };

  if (method === 'PUT') {
    const {email,password,_id} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.updateOne({_id}, {email,password:hashedPassword,normalPassword:password});
    res.json(true);
  }

  if (method === 'DELETE') {
    const {_id} = req.query;
    await Admin.findByIdAndDelete(_id);
    res.json(true);
  }

  if (method === 'GET') {
    const admins = await Admin.find();
    admins.map((admin) => {
      admin.password = undefined;
    });
    res.json( admins );
  }
}