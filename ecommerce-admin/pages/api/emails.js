import { sendMail } from "@/lib/mailService";
import { isAdminRequest } from "./auth/[...nextauth]";

const handler = async (req, res) => {
  try {
    const { method } = req;
    await isAdminRequest(req,res);
    console.log("body:", req.body)

    switch (method) {
      case "POST": {
        const {recipient, theme, html, attachments, orderId} = req.body;
        await sendMail( recipient, theme, html, attachments, orderId );
        res.status(200).send("Success");
        break;
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