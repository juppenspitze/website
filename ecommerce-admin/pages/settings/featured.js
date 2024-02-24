import axios from "axios";
import Layout from "@/components/Layout";
import {useEffect, useState} from "react";
import Spinner from "@/components/Spinner";
import { Select, SelectItem,useDisclosure } from "@nextui-org/react";
import FrontFeatured from "@/components/FrontFeatured";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import BackButton from "@/components/BackButton";
import Editor from "@/components/Editor";
import DragAndDrop from "@/components/DragAndDrop";
import { handleApiCall } from "@/lib/handlers";
import AddNewButton from "@/components/AddNewButton";
import CustomModal from "@/components/CustomModal";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { CustomTab, CustomTabs } from "@/components/CustomTabs";

export default function SettingsPage() {
  const tFeaturedModal = useTranslations('Modal');
  const tFeatured = useTranslations('Featured');
  const tLocaleFeatured = useTranslations('LocaleSwitcher');

  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [featIds, setFeatIds] = useState([]);
  const [product, setProduct] = useState({});
  const [featuredDescription,setFeaturedDescription] = useState('');
  const [isMaxLengthExceeded, setIsMaxLengthExceeded] = useState(false);
  const [currentLength, setCurrentLength] = useState(0);
  const [bgImage, setBgImage] = useState('');
  const [featured, setFeatured] = useState([]);
  const [fullFeatured, setFullFeatured] = useState([]);
  const [featuredToEdit, setFeaturedToEdit] = useState(false);
  const [featuredToDelete, setFeaturedToDelete] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState('');

  const {locale} = useRouter();
  useEffect(() => {
    setSelectedLocale(locale);
  }, [locale]);
  let {locales} = useRouter();
  locales = locales.filter(loc => loc !== 'default');

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  async function fetchProducts() {
    const res = await handleApiCall(axios.get('/api/products'), 'fetching products', false);
    fetchFeatured(res.data)
  };
  async function fetchFeatured(prods) {
    const res = await handleApiCall(axios.get('/api/featured'), 'fetching featured', false);
    setFeatured(res.data);
    let fullFeatured = [];
    res.data.forEach(feat => {
      let prod = prods.find(prod => prod._id === feat.existingId);
      if (prod) {
        prod.bgImage = feat.bgImage;
        prod.featId = feat._id;
        prod.orderIndex = feat.orderIndex;
        prod.featuredDescription = feat.featuredDescription;
        fullFeatured.push(prod);
      };
    });
    fullFeatured = fullFeatured.sort((a,b) => a.orderIndex - b.orderIndex);
    setProducts(prods);
    let featIds = fullFeatured.map(feat => feat._id);
    setFeatIds(featIds);
    setFullFeatured(fullFeatured);
    setIsLoading(false);
  };

  function onHtmlChange(newHtml) {
    if (currentLength === 0) setFeaturedDescription(product.description);
    else setFeaturedDescription(newHtml);
  };

  function handleDescriptionChange(locale, html) {
    if (!locale) locale = 'en';
    if (html === '<p class="editor-paragraph"><br></p>') html = '';
    setFeaturedDescription(prev => {
      const newDescription = {...prev};
      newDescription[locale] = html;
      return newDescription;
    });
  };

  useEffect(() => {
    setIsLoading(true);
    fetchProducts();
  }, []);

  function setImage(file) {
    if (!file[0]) {
      setBgImage('');
      return;
    };
    setBgImage(file[0].link);
  };

  async function saveFeatured() {
    const data = {
      existingId:product._id,bgImage,featuredDescription
    };
    if (featuredToEdit) {
      let _id = product.featId;
      await handleApiCall(axios.put('/api/featured', {...data, _id}), 'updating featured product');
    } else {
      let orderIndex = fullFeatured.length;
      data.orderIndex = orderIndex;
      await handleApiCall(axios.post('/api/featured', data), 'creating featured product');
    }
    fetchProducts();
    clearFeatured();
  };

  function pickProduct(product) {
    if (!product) return;
    let prod = products.find(prod => prod._id === product);
    setProduct(prod);
  };

  function onDelete(featured) {
    if (!featured) return;
    setFeaturedToDelete(true);
    setProduct(featured);
    onOpen();
  };
  async function deleteFeatured() {
    if (!featuredToDelete && !product) return;
    await handleApiCall(axios.delete('/api/featured?id='+product.featId), 'deleting featured product');
    setFeaturedToDelete(false);
    setProduct({});
    fetchProducts();
    onOpenChange();
  };
  function onEdit(featured) {
    if (!featured) return;
    setFeaturedToEdit(true);
    setProduct(featured);
    setBgImage(featured.bgImage);
    setFeaturedDescription(featured.featuredDescription);
    onOpen();
  };
  function clearFeatured() {
    setFeaturedToEdit(false);
    setFeaturedToDelete(false);
    setFeaturedDescription('');
    setIsMaxLengthExceeded(false);
    setProduct({});
    setBgImage('');
    onOpenChange();
  };

  async function handleOnDragEnd(result) {
    if (!result.destination) return;

    const items = Array.from(fullFeatured);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    for (let i = 0; i < items.length; i++) {
      if (items[i].orderIndex !== i) {
        items[i].orderIndex = i;
        await handleApiCall(axios.put('/api/featured', {_id:items[i].featId, orderIndex:i}), 'updating featured product order', false);
      };
    };

    setFullFeatured(items);
  };

  const providedBody = (<>
    {featuredToDelete ? (
      tFeaturedModal('delete_description', {name: 'featured'})
    ) : (<>
      <FrontFeatured featured={product} bgImage={bgImage} featuredDescription={featuredDescription} locale={selectedLocale} isDialog={true}/>

      <div className="flex flex-col gap-2 mt-3">
        <div>{tFeatured('select_product')}</div>
        {featIds.length === products.length ? (
          <div className="text-textSecondary">{tFeatured('all_products_already_featured')}</div>
        ) : (
          <Select defaultSelectedKeys={[product._id]} disabledKeys={featIds} onChange={(ev) => pickProduct(ev.target.value)} size='sm' isRequired label="product">
            {products.length > 0 && products.map(prod => (
              <SelectItem key={prod._id} value={prod._id}>{prod.title}</SelectItem>
            ))}
          </Select>
        )}
      </div>

      {product._id && (<>
        <div className="flex flex-col gap-1.5 mt-3">
          <div>{tFeaturedModal('description', {name: 'featured'})}</div>

          <CustomTabs setSelectedLocale={setSelectedLocale}>
            {locales.map((loc) => (
              <CustomTab key={loc} localeCode={loc} title={tLocaleFeatured('switchLocale', {locale: loc})}>
                <Editor onHtmlChange={handleDescriptionChange} locale={loc} initialHtml={featuredDescription?.[loc] || product?.description?.[loc] || ''} setIsMaxLengthExceeded={setIsMaxLengthExceeded} setCurrentLength={setCurrentLength} />
                {isMaxLengthExceeded && (
                  <div className="text-danger text-xs">{tFeatured('character_limit_reached')}</div>
                )}
              </CustomTab>
            ))}
          </CustomTabs>
        </div>
        <div className="flex flex-col gap-2 mb-3">
          <div>{tFeatured('add_background_image')}</div>
          <DragAndDrop existingFiles={bgImage} maxFiles={1} onFilesChange={setImage} />
        </div>
      </>)}
      
    </>)}
  </>);

  return (<>
    <Layout>
      {isLoading && (
        <Spinner />
      )}
      {!isLoading && (<>
        <div className="flex items-center mb-4 ml-4 text-default-600">
          <BackButton />
          <AddNewButton onOpen={onOpen} name="featured" direction="rtl" />
        </div>
        {featured.length > 0 ? (
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="featuredProductsList">
              {(provided) => (
                <div className="flex flex-col gap-5" {...provided.droppableProps} ref={provided.innerRef}>
                  {fullFeatured && fullFeatured.map((featured, index) => {
                    return (
                      <Draggable key={featured._id} draggableId={featured._id} index={index}>
                        {(provided) => (
                          <div className="flex gap-3" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <div className="text-2xl">{index+1}</div>
                            <FrontFeatured featured={featured} bgImage={featured.bgImage} featuredDescription={featured.featuredDescription} locale={locale} onEdit={onEdit} onDelete={onDelete} isDialog={false}/>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-textSecondary">
            <div className="text-xl">{tFeatured('no_featured_yet')}</div>
          </div>
        )}
      </>)}
    </Layout>

    <CustomModal
      isOpen={isOpen} onOpenChange={onOpenChange} 
      toDelete={featuredToDelete} toEdit={featuredToEdit} entity='featured' title={product?.title}
      clearFunc={clearFeatured} deleteFunc={deleteFeatured} saveFunc={saveFeatured} 
      disableCondition={!product} providedBody={providedBody} 
    />
  </>);
}

export async function getServerSideProps(context) {
  return {
    props:{
      messages: (await import(`@/locales/${context.locale}.json`)).default,
    }
  };
};