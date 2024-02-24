import {createContext, useEffect, useState} from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

export const CartContext = createContext({});

export function CartContextProvider({children}) {
  const ls = typeof window !== "undefined" ? window.localStorage : null;
  const [cartProducts,setCartProducts] = useState([]);
  const [isSideOpen,setIsSideOpen] = useState(false);

  const {toast} = useToast();

  useEffect(() => {
    if (cartProducts?.length > 0) {
      ls?.setItem('cart', JSON.stringify(cartProducts));
    }
  }, [cartProducts]);
  useEffect(() => {
    if (ls && ls.getItem('cart')) {
      setCartProducts(JSON.parse(ls.getItem('cart')));
    }
  }, []);

  function addProduct(productId,title) {
    setCartProducts(prev => [...prev,productId]);
    toast(toastSettings(true,productId,title));
  };

  function removeProduct(productId,title) {
    setCartProducts(prev => {
      const pos = prev.indexOf(productId);
      if (pos !== -1) {
        return prev.filter((value,index) => index !== pos);
      };
      return prev;
    });
    toast(toastSettings(false,productId,title));
  };
  function removeAllProduct(productId,title) {
    setCartProducts(prev => {
      return prev.filter((prod) => prod !== productId);
    });
    toast(toastSettings(false,productId,title));
  };
  function clearCart() {
    const backup = [...cartProducts];
    setCartProducts([]);
    ls.clear();
    toast({
      title: "Cart cleared",
      description: "Your cart has been cleared.",
      status: "success",
      duration: 3000,
      isClosable: true,
      action: <ToastAction onClick={() => setCartProducts(backup)} altText="Undo">Undo</ToastAction>,
    });
  };

  function toastSettings(state,prodId,title) {
    return {
      title: `Product ${state ? 'added to' : 'removed from'} cart`,
      description: `You've ${state ? 'added' : 'removed'} ${title} to cart.`,
      status: "success",
      duration: 3000,
      isClosable: true,
      action: <ToastAction onClick={() => {(state) ? removeProduct(prodId,title) : addProduct(prodId,title)}} altText="Undo">Undo</ToastAction>,
    };
  };

  return (
    <CartContext.Provider value={{cartProducts,setCartProducts,addProduct,removeProduct,removeAllProduct,clearCart,isSideOpen,setIsSideOpen}}>
      {children}
    </CartContext.Provider>
  );
}