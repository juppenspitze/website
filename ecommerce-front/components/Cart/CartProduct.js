import { useContext } from "react";
import { CartContext } from "../CartContext";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { currencyForm } from "@/lib/handlers";

export default function CartProduct({ id,title,price,quantity,isEProduct,image,index }) {
  const { removeProduct, removeAllProduct, addProduct } = useContext(CartContext);

  return (
    <div className="relative flex gap-4 items-center">
      <div className="absolute left-[-10px] top-[-15px] text-3xl text-foreground z-50">
        {index < 10 ? `0${index}` : { index }}
      </div>
      <div className="relative h-28 w-28 ">
        {image && <Image fill={true} src={image} alt={image} />}
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-xl whitespace-pre-line pr-6">{title} <span className='text-slate-400'>{isEProduct && '(file)'}</span></div>
        <div className="flex gap-3 items-center w-fit h-9 max-sm:h-10 px-4 py-3 rounded-full border border-solid">
          <button size="sm" className='p-2' onClick={() => removeProduct(id, title)}>
            <Minus className="w-4 h-4"/>
          </button>
          <div className="flex items-center justify-center text-slate-400">
            {quantity} x {currencyForm(price)}
          </div>
          <button size="sm" className='p-2' onClick={() => addProduct(id, title)}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <button
        onClick={() => removeAllProduct(id, title)}
        className="absolute top-0 right-0 hover:scale-110"
      >
        <X />
      </button>
    </div>
  );
}
