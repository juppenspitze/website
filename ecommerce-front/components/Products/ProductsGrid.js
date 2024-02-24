import ProductBox from "@/components/Products/ProductBox";
import {RevealWrapper} from 'next-reveal';

export default function ProductsGrid({products,wishedProducts=[]}) {
  return (
    <div className="flex items-center flex-wrap gap-5" interval={100}>
      {products?.length > 0 && products.map((product,index) => (
        <RevealWrapper key={product._id} delay={index*50}>
          <ProductBox {...product}
                      wished={wishedProducts.includes(product._id)} />
        </RevealWrapper>
      ))}
    </div>
  );
}