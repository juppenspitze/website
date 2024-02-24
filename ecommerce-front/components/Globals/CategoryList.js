import { useState } from 'react';
import CategoryPage from '@/pages/categories/[id]';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';
import axios from 'axios';
import Spinner from './Spinner';

export default function CategoryList({categories}) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const tCategoryList = useTranslations('Categories.CategoryList');

  const [category, setCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function loadCategory(id) {
    if (!id) return;
    setIsLoading(true);
    setCategory(null);
    setSubCategories([]);
    setOriginalProducts([]);

    const res = await axios.get(`/api/categories?_id=${id}`);

    setCategory(res.data.category);
    setSubCategories(res.data.subCategories);
    setOriginalProducts(res.data.products);
    setSelectedCategory(id);
    setIsLoading(false);
  };

  return (<>
    <div className="flex flex-wrap justify-center">
      {categories.length === 0 && <div className="mt-2 text-xl text-muted-foreground">{tCategoryList('no_categories')}</div>}
      {categories.length > 0 && categories.map((category) => (
        <Button
          key={`${category._id}+explore`} 
          onClick={() => loadCategory(category._id)} 
          className={`m-2 px-3 py-2 rounded-md ${category._id === selectedCategory ? 'bg-primary text-white' : 'bg-white text-primary hover:text-white'}`}
        >
          {category.name}
        </Button>
      ))}
    </div>
    {isLoading 
      ? <Spinner />
      : (selectedCategory && <CategoryPage isEmbedded={true} category={category} subCategories={subCategories} originalProducts={originalProducts} />)
    }
  </>);
};