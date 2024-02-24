import { FaCartShopping, FaRegPenToSquare, FaRegTrashCan } from "react-icons/fa6";
import { Button, Image } from "@nextui-org/react";
import parse from 'html-react-parser';
import { useEffect, useState } from "react";
import { getImageAspectRatio } from "@/lib/handlers";
import { useTranslations } from "next-intl";

export default function FrontFeatured({featured, bgImage, featuredDescription, onEdit, onDelete, isDialog, locale}) {
  const tFeatured = useTranslations('Featured');
  
  const [activeWidth,setActiveWidth] = useState(0);
  const [imageSizes,setImageSizes] = useState([]);

  useEffect(() => {
    handleFeaturedImageChange(featured.images?.[0]);
  }, [featured]);

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
  return (<>
    <div className={`relative ${!featured && `min-h-[400px]`} w-full bg-default-100 rounded-lg border-2 border-solid border-transparent ${!isDialog && 'hover:border-primary'}`} style={{backgroundImage: `url(${bgImage})`}}>
      {!isDialog && (
        <div className="absolute top-[20px] left-[20px] flex gap-2 rounded-lg p-1 bg-default-300">
          <Button onClick={() => onEdit(featured)} isIconOnly size="sm" color="primary" className="text-base opacity-80 hover:opacity-100">
            <FaRegPenToSquare />
          </Button>
          <Button onClick={() => onDelete(featured)} isIconOnly size="sm" color="danger" className="text-base opacity-80 hover:opacity-100">
            <FaRegTrashCan />
          </Button>
        </div>
      )}
      <div className={`py-12 px-0 ${!isDialog && 'cursor-move'}`}>
        <div className="max-w-[800px] my-0 mx-auto py-0 px-5">
          <div className="flex items-center justify-center gap-5">
            <div className="flex flex-col gap-3">
              <div className="text-2xl text-right leading-6 sm:text-4xl ml-auto">
                {featured.title || tFeatured('featured_title')}
              </div>
              <div className="text-[#aaa] text-sm text-right">
                {(featuredDescription || featuredDescription?.[locale] || featuredDescription?.['en']) 
                  ? (parse(featuredDescription?.[locale] || featuredDescription?.['en'])) 
                  : parse(featured.description?.[locale] || featured.description?.['en'] || tFeatured('mock_description'))
                }
              </div>
              <div className="flex gap-4 items-center ml-auto">
                <div className="cursor-pointer">{tFeatured('read_more')}</div>
                <button type="button" className='inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3 felx gap-2'>
                  <FaCartShopping />
                  {tFeatured('add_to_cart')}
                </button>
              </div>
            </div>
            <div className={`relative min-h-[200px] min-w-[${activeWidth}px] mx-0 my-auto`}>
              {featured.images?.[0] ? (
                <Image className='productImage' width={activeWidth} height={350} quality={100} alt='Active image' src={featured.images?.[0]}/>
              ) : (
                <div className="flex items-center min-h-[200px] min-w-[150px] text-textSecondary justify-center border border-solid border-primary rounded-lg">{tFeatured('no_image_here')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>)
};