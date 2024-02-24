import { getImageAspectRatio} from "@/lib/utils";
import Image from "next/image";
import {useState,useEffect} from "react";

export default function ProductImages({images}) {
  const [activeImage,setActiveImage] = useState('');
  const [activeWidth,setActiveWidth] = useState(0);

  const [imageSizes,setImageSizes] = useState([]);

  useEffect(() => {
    handleImageClick(images?.[0]);
  }, [images]);

  async function handleImageClick(image) {
    if (image === activeImage || !image) return;
    let w = 0;
    if (imageSizes.some((img) => img[image])) {
      w = imageSizes.find((img) => img[image])[image];
    } else {
      const aspectRatio = await getImageAspectRatio(image);
      w = Math.floor(aspectRatio * 530);
      if (w > 530) w = 530;
      setImageSizes((prev) => [...prev, { [image]: w }]);
    }
    setActiveWidth(w);
    setActiveImage(image);
  };
  return (
    <>
      <div className="relative min-h-[200px] min-w-[200px] mb-2.5">
        {activeImage && <Image className='productImage' width={activeWidth} height={530} quality={100} src={activeImage} alt='Active image'/>}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2.5">
          {images.map((image,index) => (
            <div className={`relative h-fit w-10 rounded-md cursor-pointer border-2 border-solid ${image === activeImage ? 'border-[#ccc]' : 'border-transparent'}`}
              key={image}
              onClick={() => handleImageClick(image)}
            >
              {image && <Image className='scrollProductImage' quality={50} fill={true} src={image} alt={`image_${index+1}`}/>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}