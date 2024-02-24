import CartProduct from "../CartProduct";

export default function SelectedProductsSection({ cartProducts, products }) {
  return (
    <div className='flex flex-col gap-6 pl-2.5 pt-2'>
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
            />
          ))}
    </div>
  );
};