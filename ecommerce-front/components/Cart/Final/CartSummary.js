import { useContext, useEffect, useState } from "react";
import { CartContext } from "@/components/CartContext";
import axios from "axios";
import Table from "@/components/Globals/Table";
import { currencyForm } from "@/lib/handlers";
import { useTranslations } from "next-intl";

export default function CartSummary() {
  const tCart = useTranslations("Cart.Final");

  const { cartProducts } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [shippingFee, setShippingFee] = useState(null);

  useEffect(() => {
    axios.get("/api/settings?name=shippingFee").then((res) => {
      setShippingFee(res.data.value);
    });
  }, []);

  let productsTotal = 0;
  for (const productId of cartProducts) {
    const price = products.find((p) => p._id === productId)?.price || 0;
    productsTotal += price;
  }
  let productsTotalSh = 0;
  if (shippingFee) {
    productsTotalSh += productsTotal + parseFloat(shippingFee);
  }

  return (
    <div>
      <Table>
        <tbody>
          <tr className="subtotal">
            <td colSpan={2}>{tCart('products')}</td>
            <td>{currencyForm(productsTotal)}</td>
          </tr>
          <tr className="subtotal">
            <td colSpan={2}>{tCart('shipping')}</td>
            <td>{currencyForm(shippingFee)}</td>
          </tr>
          <tr className="subtotal total">
            <td colSpan={2}>{tCart('total')}</td>
            <td>{currencyForm(productsTotalSh)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}
