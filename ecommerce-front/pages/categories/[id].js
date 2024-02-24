import {Category} from "@/models/Category";
import {Product} from "@/models/Product";
import ProductsGrid from "@/components/Products/ProductsGrid";
import {useEffect, useState} from "react";
import axios from "axios";
import Spinner from "@/components/Globals/Spinner";
import Layout from "@/components/Globals/Layout";
import BackButton from "@/components/Globals/BackButton";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export default function CategoryPage({ isEmbedded=false,category,subCategories,originalProducts }) {
  const tSingleCategory = useTranslations('Categories.SingleCategory');

  const defaultSorting = '_id-desc';
  const defaultFilterValues = category.selectProperties.map(p => ({name:p.name,value:'all'}));  
  let subCategoryProps = [];
  if (subCategories) {
    subCategories.forEach(sub => {
      sub.selectProperties.forEach(prop => {
        if (!subCategoryProps.find(p => p.name === prop.name)) subCategoryProps.push(prop);
        if (!defaultFilterValues.find(f => f.name === prop.name)) defaultFilterValues.push({name:prop.name,value:'all'});
      });
    });
  };

  const [products,setProducts] = useState(originalProducts);
  const [filtersValues,setFiltersValues] = useState(defaultFilterValues);
  const [sort,setSort] = useState(defaultSorting);
  const [loadingProducts,setLoadingProducts] = useState(false);
  const [filtersChanged,setFiltersChanged] = useState(false);

  function handleFilterChange(filterName, filterValue) {
    setFiltersValues(prev => {
      return prev.map(p => ({
        name:p.name,
        value: p.name === filterName ? filterValue : p.value,
      }));
    });
    setFiltersChanged(true);
  };
  useEffect(() => {
    if (!filtersChanged) return;
    setLoadingProducts(true);
    const catIds = [category._id, ...(subCategories?.map(c => c._id) || [])];
    const params = new URLSearchParams;
    params.set('categories', catIds.join(','));
    params.set('sort', sort);
    filtersValues.forEach(f => {
      if (f.value !== 'all') { params.set(f.name, f.value); };
    });
    const url = `/api/products?` + params.toString();
    axios.get(url).then(res => {
      setProducts(res.data);
      setLoadingProducts(false);
    })
  }, [filtersValues, sort, filtersChanged]);
  return (<>
    <Layout isEmbedded={isEmbedded}>
      {!isEmbedded && <BackButton />}
      <div className="flex items-center justify-between my-6">
        <h1 className="text-2xl">{category.name}</h1>
        <div className="flex gap-4 items-end justify-end ml-auto">
          {category.selectProperties.map(prop => (
            <div key={`cat${prop.name}`} className='flex flex-col gap-0.5 text-sm'>
              <span>{prop.name}:</span>
              <Select onValueChange={(ev) => handleFilterChange(prop.name, ev)} value={filtersValues.find(f => f.name === prop.name).value}>
                <SelectTrigger className='min-w-[100px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key='all' value='all'>{tSingleCategory('all')}</SelectItem>
                  {prop.values.map(val => (
                    <SelectItem key={val} value={val}>
                      <div>{val}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          {subCategoryProps.map(prop => (
            <div key={`subCat${prop.name}`} className='flex flex-col gap-0.5 text-sm'>
              <span>{prop.name}:</span>
              <Select onValueChange={(ev) => handleFilterChange(prop.name, ev)} value={filtersValues.find(f => f.name === prop.name).value}>
                <SelectTrigger className='min-w-[100px]'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key='all' value='all'>{tSingleCategory('all')}</SelectItem>
                  {prop.values.map(val => (
                    <SelectItem key={val} value={val}>
                      <div>{val}</div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
            <Select onValueChange={ev => { setSort(ev); setFiltersChanged(true); }} value={sort}>
            <SelectTrigger className='max-w-[200px] min-w-[150px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">{tSingleCategory('lowest_first')}</SelectItem>
              <SelectItem value="price-desc">{tSingleCategory('highest_first')}</SelectItem>
              <SelectItem value="_id-desc">{tSingleCategory('newest_first')}</SelectItem>
              <SelectItem value="_id-asc">{tSingleCategory('oldest_first')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {loadingProducts && (
        <Spinner fullwidth />
      )}
      {!loadingProducts && (
        <div>
          {products.length > 0 && (
            <ProductsGrid products={products} />
          )}
          {products.length === 0 && (
            <div>{tSingleCategory('no_products_found')}</div>
          )}
        </div>
      )}
    </Layout>  
  </>);
}

export async function getServerSideProps(context) {
  const category = await Category.findById(context.query.id);
  const subCategories = await Category.find({parent:category._id});
  const catIds = [category._id, ...subCategories.map(c => c._id)];
  const products = await Product.find({category:catIds});
  return {
    props:{
      messages: (await import(`@/locales/${context.locale}.json`)).default,
      category: JSON.parse(JSON.stringify(category)),
      subCategories: JSON.parse(JSON.stringify(subCategories)),
      originalProducts: JSON.parse(JSON.stringify(products)),
    }
  };
}