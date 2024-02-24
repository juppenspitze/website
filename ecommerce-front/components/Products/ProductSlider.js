import Featured from "./Featured";
import ProductBox from "./ProductBox";
import Carousel from "react-multi-carousel";
import { useEffect } from "react";

export default function ProductSlider({products,wishedProducts=[],isFeatured=false}) {
  let isAuto = false;
  useEffect(() => {
    if (isFeatured) isAuto = true;
    if (products.length >= 2) isAuto = true;
  }, [products,isFeatured])

  let responsive = {};
  if (isFeatured) {
    responsive = {
      desktop: {
        breakpoint: { max: 3000, min: 780 },
        items: 1,
      },
      tablet: {
        breakpoint: { max: 780, min: 545 },
        items: 1,
      },
      mobile: {
        breakpoint: { max: 545, min: 0 },
        items: 1,
      }
    };
  } else {
    responsive = {
      desktop: {
        breakpoint: { max: 3000, min: 780 },
        items: 3,
      },
      tablet: {
        breakpoint: { max: 780, min: 545 },
        items: 2,
      },
      mobile: {
        breakpoint: { max: 545, min: 0 },
        items: 1,
      }
    };
  };
  
  return (<>
    <Carousel
      swipeable={true}
      draggable={false}
      responsive={responsive}
      infinite={true}
      keyBoardControl={true}
      showDots={isFeatured && products.length > 1}
      autoPlay={isAuto}
      autoPlaySpeed={6000}
      removeArrowOnDeviceType={["mobile"]}
      className={`${isFeatured && 'featuredSlider'}`}
    >
      {!isFeatured && products && products.map((product) => (
        <ProductBox key={`${product._id}+slider`} {...product} wished={wishedProducts.includes(product._id)}/>
      ))}
      {isFeatured && products && products.map((product) => (
        <Featured key={`${product._id}+slider`} product={product} />
      ))}
    </Carousel>
  </>)
};