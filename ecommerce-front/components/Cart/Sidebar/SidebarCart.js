import { currencyForm } from "@/lib/handlers";
import axios from "axios";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../../CartContext";
import CartProduct from "../CartProduct";
import { Button } from "../../ui/button";
import { useTranslations } from "next-intl";

export default function SidebarCart() {
  const tSidebarCart = useTranslations('Cart.Sidebar');
  const tSidebarCartButtons = useTranslations('Buttons');
  const { cartProducts, setIsSideOpen } = useContext(CartContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (cartProducts.length > 0) {
      axios.post("/api/cart", { ids: cartProducts }).then((response) => {
        setProducts(response.data?.allProducts);
        console.log(response.data);
      });
    } else setProducts([]);
  }, [cartProducts]);

  let productsTotal = 0;
  let vatTotal = 0;
  for (const productId of cartProducts) {
    const price = products.find((p) => p._id === productId || p.electronicId === productId)?.price || 0;
    productsTotal += price;

    const percentage = products.find((p) => p._id === productId || p.electronicId === productId)?.vatPercentage;
    let vatPrice;
    if (!percentage) vatTotal = null
    else vatPrice = (percentage / 100) * price;
    vatTotal += vatPrice;
  };

  return (
    <div className="flex flex-col justify-between w-full h-[calc(100%-40px)]">
      {cartProducts.length <= 0 && (
        <div className="mb-auto text-center text-xl text-slate-500">
          {tSidebarCart('nothing_here')}
        </div>
      )}

      <div className="flex flex-col gap-10 h-full overflow-y-auto overflow-x-visible pl-4 pb-4 pt-4">
        {products &&
          products.map((prod, index) => (
            <CartProduct
              key={`${index}${prod._id}`}
              id={prod.eVersion ? (
                prod.electronicId
              ) : (
                prod._id
              )}
              title={prod.title}
              price={prod.price}
              image={prod.images[0]}
              quantity={prod.eVersion ? (
                cartProducts.filter((id) => id === prod.electronicId).length
              ) : (
                cartProducts.filter((id) => id === prod._id).length
              )}
              isEProduct={prod.eVersion}
              index={index + 1}
            ></CartProduct>
          ))}
      </div>

      {cartProducts.length > 0 && (
        <div className="flex flex-col pt-4 mt-auto border-t-2 border-solid border-t-slate-400">
          <div className="flex flex-col gap-2 mb-4">
            <div className="text-sm text-slate-400">
              {vatTotal ? tSidebarCart('shipping_not_included') : tSidebarCart('shipping_taxes_not_included')}
              
            </div>
            {!!vatTotal && <div>Vat total: {currencyForm(vatTotal)}</div>}
            <div className="text-xl">
              {tSidebarCart('subtotal')} {currencyForm(productsTotal)}
            </div>
          </div>
          <Link
            className="w-full mb-2.5"
            href="/cart"
            onClick={() => setIsSideOpen((prev) => !prev)}
          >
            <Button className="w-full">{tSidebarCartButtons('to_checkout')}</Button>
          </Link>
          <Button variant="outline" className="w-full text-destructive border-destructive hover:text-foreground hover:bg-destructive">{tSidebarCartButtons('clear_cart')}</Button>
        </div>
      )}
    </div>
  );
}
