import Center from "@/components/Globals/Center";
import AddProdButton from "@/components/Globals/AddProdButton";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import { getImageAspectRatio } from "@/lib/utils";
import { useState,useEffect } from "react";
import parse from 'html-react-parser';
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";

export default function Featured({product}) {
  const tFeaturedButtons = useTranslations('Buttons');

  const [activeWidth,setActiveWidth] = useState(0);
  const [imageSizes,setImageSizes] = useState([]);

  const {locale} = useRouter();

  useEffect(() => {
    handleFeaturedImageChange(product.images?.[0]);
  }, [product]);

  async function handleFeaturedImageChange(image) {
    if (!image) return;
    let w = 0;
    if (imageSizes.some((img) => img[image])) {
      w = imageSizes.find((img) => img[image])[image];
    } else {
      const aspectRatio = await getImageAspectRatio(image);
      w = Math.floor(aspectRatio * 350);
      if (w > 350) w = 350;
      setImageSizes((prev) => [...prev, { [image]: w }]);
    }
    setActiveWidth(w);
  };
  
  let description = product.featuredDescription ? (product.featuredDescription?.[locale] || product.featuredDescription?.['en']) : (product.description?.[locale] || product.description?.['en']);
  return (
    <Link href={'/products/'+product._id} className="flex items-center justify-center min-w-[100vw] w-[100vw] min-h-[400px] py-12 px-0 text-white bg-[#222]" style={{backgroundImage: `url(${product.bgImage})`}}>
      <Center>
        <div className="flex items-center justify-center gap-5 max-w-[800px] mx-auto">
          <div className="flex flex-col gap-3">
            <div className="text-2xl leading-6 sm:text-4xl text-right">
              {product.title}
            </div>
            <div className="text-[#aaa] text-sm text-right">
              {parse(description || 'nothing here')}
            </div>
            <div className="flex gap-4 items-center ml-auto">
              <Link href={'/products/'+product._id} outline={1} white={1}>{tFeaturedButtons('read_more')}</Link>
              <AddProdButton className='flex gap-2' white={1} _id={product._id}>
                <ShoppingCart />
                {tFeaturedButtons('add_to_cart')}
              </AddProdButton>
            </div>
          </div>
          <div className={`relative min-h-[200px] min-w-[${activeWidth}px] mx-0 my-auto`}>
            {product.images[0] && <Image className='productImage' width={activeWidth} height={350} quality={100} alt='Active image' src={product.images[0]}/>}
          </div>
        </div>
      </Center>
    </Link>
  );
}