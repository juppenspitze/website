import Link from "next/link";
import { useEffect, useState} from "react";
import AddProdButton from "@/components/Globals/AddProdButton";
import HeartOutlineIcon from "@/components/icons/HeartOutlineIcon";
import HeartSolidIcon from "@/components/icons/HeartSolidIcon";
import axios from "axios";
import {useSession} from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Image from "next/image";
import { currencyForm } from "@/lib/handlers";
import { useTranslations } from "next-intl";

export default function ProductBox({
  _id,electronicId,eFile,title,description,price,images,isOnlyElectronic,wished=false,
  onRemoveFromWishlist=()=>{},
}) {
  const tProductBoxButtons = useTranslations('Buttons');
  const tProductBoxToasts = useTranslations('Toasts');

  const {data:session} = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWished,setIsWished] = useState(wished);
  const {toast} = useToast();
  const url = '/products/'+_id;

  useEffect(() => {
    if (session === null) return; 
    setIsLoggedIn(true);
  }, []);

  function toastSettings(state) {
    return {
      title: `${state ? tProductBoxToasts('added_to', {what: 'Product', where: 'wishlist'}) : tProductBoxToasts('removed_from', {what: 'Product', where: 'wishlist'})}`,
      description: `${state ? tProductBoxToasts('added_to_description', {what: title, where: 'your wishlist'}) : tProductBoxToasts('removed_from_description', {what: title, where: 'your wishlist'})}`,
      duration: 3000,
      isClosable: true,
      action: <ToastAction onClick={addToWishlist} altText={tProductBoxButtons('undo')}>{tProductBoxButtons('undo')}</ToastAction>,
    };
  };

  async function addToWishlist(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const nextValue = !isWished;
    if (nextValue === false && onRemoveFromWishlist) {
      onRemoveFromWishlist(_id);
    };
    await axios.post('/api/wishlist', {product: _id});
    setIsWished(nextValue);
    toast(toastSettings(nextValue));
  }
  return (
    <div className="flex flex-col justify-between w-[224px] h-[306px] px-3 py-2">
      <Link className="flex items-center justify-center relative rounded-lg bg-white p-5 text-center" href={url}>
        <div className='relative min-w-[200px] min-h-[180px]'>
          {isLoggedIn && (
            <button className={`absolute top-0 right-0 w-10 h-10 p-2.5 bg-transparent cursor-pointer [&>svg]:w-4 ${isWished ? 'text-red-500' : 'text-black'}`} 
              onClick={addToWishlist}
            >
              {isWished ? <HeartSolidIcon /> : <HeartOutlineIcon />}
            </button>
          )}
          {images?.[0] && <Image className='productImg' fill={true} src={images?.[0]} alt={title}/>}
        </div>
      </Link>
      <div className="mt-1.5">
        <Link href={url}>{title}</Link>
        <div className="block sm:flex sm:gap-1.5 items-center justify-between mt-1">
          <div className="text-right sm:font-semibold sm:text-left">
            {currencyForm(price)}
          </div>
          <AddProdButton _id={isOnlyElectronic && electronicId ? electronicId : _id} title={title} src={images?.[0]}>
            {(isOnlyElectronic && electronicId) 
              ? tProductBoxButtons('add_to_cart_ext', {extension: eFile[0].split('.').pop()}) 
              : tProductBoxButtons('add_to_cart')}
          </AddProdButton>
        </div>
      </div>
    </div>
  );
}