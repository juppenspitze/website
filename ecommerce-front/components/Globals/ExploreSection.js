import { useState } from "react";
import Center from "./Center";
import ProductsGrid from "../Products/ProductsGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import axios from "axios";
import CategoryList from "./CategoryList";
import { useTranslations } from "next-intl";

export default function ExploreSection({products, wishedProducts}) {
  const tExploreSection = useTranslations('ExploreSection');
  const [categories,setCategories] = useState([]);

  async function getCategories(ev) {
    if (ev !== "categories") return;
    axios.get("/api/categories").then((res) => { setCategories(res.data); });
  };
  return (<>
    <Center>
      <div className="text-3xl leading-6 mt-7 mb-5 my-0">{tExploreSection('explore_some_more')}</div>
      <Tabs defaultValue="products" onValueChange={(ev) => getCategories(ev)} className="min-h-[600px]">
        <TabsList className="w-full [&>*]:w-full">
          <TabsTrigger value="products">{tExploreSection('products')}</TabsTrigger>
          <TabsTrigger value="categories">{tExploreSection('categories')}</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductsGrid products={products} wishedProducts={wishedProducts} />
        </TabsContent>
        <TabsContent value="categories">
          <CategoryList categories={categories} />
        </TabsContent>
      </Tabs>
    </Center>
  </>)
};