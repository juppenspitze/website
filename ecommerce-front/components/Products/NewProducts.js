import Center from "@/components/Globals/Center";
import ProductsGrid from "@/components/Products/ProductsGrid";
import { useTranslations } from "next-intl";

export default function NewProducts({products,wishedProducts}) {
  const tNewProducts = useTranslations('Products');
  return (
    <Center>
      <h2 className="text-3xl leading-6 my-0">{tNewProducts('new_arrivals')}</h2>
      <ProductsGrid products={products} wishedProducts={wishedProducts} />
    </Center>
  );
}