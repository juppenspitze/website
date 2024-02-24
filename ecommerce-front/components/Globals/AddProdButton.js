import {CartContext} from "@/components/CartContext";
import {useContext} from "react";
import { Button } from "../ui/button";

export default function AddProdButton(props) {
  const {addProduct} = useContext(CartContext);

  return (
    <Button size='sm' onClick={(e) => {
      e.preventDefault();
      addProduct(props._id,props.title)
    }} {...props} />
  );
}
