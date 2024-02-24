import axios from "axios";
import Layout from "@/components/Layout";
import Spinner from "@/components/Spinner";
import { useEffect, useState } from "react";
import { Input, Select, SelectItem, useDisclosure, RadioGroup, Accordion, AccordionItem, Avatar, Tabs, Tab } from "@nextui-org/react";
import CustomTable from "@/components/Table";
import DragAndDrop from "@/components/DragAndDrop";
import { CustomRadio } from "@/components/CustomRadio";
import ShipmentProfileCardData from "@/components/shipment/ShipmentProfileCardData";
import { AlertTriangle, BookText, Save, Tags, Truck } from "lucide-react";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "./api/auth/[...nextauth]";
import { ShipmentProfile } from "@/models/ShipmentProfile";
import TagInput from "@/components/TagInput";
import Editor from "@/components/Editor";
import { handleApiCall } from "@/lib/handlers";
import { v4 as uuidv4 } from 'uuid';
import AddNewButton from "@/components/AddNewButton";
import CustomModal from "@/components/CustomModal";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { CustomTabs, CustomTab } from "@/components/CustomTabs";

export default function Products({shipProfiles}) {
  const tModalProducts = useTranslations('Modal');
  const tLocaleProducts = useTranslations('LocaleSwitcher');

  const [title,setTitle] = useState('');
  const [description,setDescription] = useState({});

  const [category,setCategory] = useState('');
  const [deprecatedCategories,setDeprecatedCategories] = useState([]);
  const [productSelectProperties,setProductSelectProperties] = useState({});
  const [productInputProperties,setProductInputProperties] = useState({});

  const [price,setPrice] = useState('');
  const [productTags,setProductTags] = useState([]);

  const [images,setFiles] = useState([]);
  const [eFile,setEFile] = useState([]);
  const [eTestFile,setETestFile] = useState([]);
  const [isOnlyElectronic,setIsOnlyElectronic] = useState(false);
  const [disableElectronicSelector,setDisableElectronicSelector] = useState(true);
  const [electronicId,setElectronicId] = useState('');

  const [stock,setStock] = useState('');
  const [authorId,setAuthorId] = useState('');
  const [authors,setAuthors] = useState([]);
  const [deprecatedAuthors,setDeprecatedAuthors] = useState([]);
  const [categories,setCategories] = useState([]);
  const [products,setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productToEdit, setProductToEdit] = useState('');
  const [productToDelete, setProductToDelete] = useState('');

  const [shipmentProfiles, setShipmentProfiles] = useState(shipProfiles.sort((a,b) => a.sizeIndex - b.sizeIndex));
  const [profileId, setProfileId] = useState('');

  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  let {locales} = useRouter();
  locales = locales.filter(loc => loc !== 'default');

  async function fetchProducts() {
    const prodRes = await handleApiCall(axios.get('/api/products'), "fetching products", false);
    const authorRes = await handleApiCall(axios.get('/api/authors'), "fetching authors", false);
    let products;
    setAuthors(authorRes.data);
    products = prodRes.data.map(p => {
      let author = authorRes.data.find(a => a._id === p.authorId);
      return {...p, authorImage: author?.image, authorName: author?.authorName};
    });
    setProducts(products);
    setDeprecatedAuthors(authorRes.data.filter(a => a.isDeprecated).map(a => a._id));

    setIsLoading(false);
  };

  async function fetchShipmentProfiles() {
    const res = await handleApiCall(axios.get('/api/shipment-profiles'), "fetching shipment profiles", false);
    setShipmentProfiles(res.data.sort((a,b) => a.sizeIndex - b.sizeIndex));
  };

  function fileSorter(files) {
    let properFiles = [];
    files.map(file => {
      if (typeof file === 'string') {
        properFiles.push(file);
      } else {
        properFiles.push(file.link);
      };
    });
    return properFiles;
  };
  function sortTestFile(files) {
    setETestFile(fileSorter(files));
  };
  function sortEFiles(files) {
    setEFile(fileSorter(files));
  };
  function sortImages(files) {
    if (files == images) return;
    setFiles(fileSorter(files));
  };

  useEffect(() => {
    setIsLoading(true);
    fetchProducts();
    fetchShipmentProfiles();
  }, []);
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await handleApiCall(axios.get('/api/categories'), "fetching categories", false);
      setCategories(res.data);
      setDeprecatedCategories(res.data.filter(c => c.isDeprecated).map(c => c._id));
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    if (eFile.length === 0) {
      setElectronicId('');
      setIsOnlyElectronic(false);
      setDisableElectronicSelector(true);
      return;
    };
    setElectronicId(uuidv4());
    setDisableElectronicSelector(false);
  }, [eFile]);

  async function saveProduct() {
    const data = {
      title,description,price,tags:productTags,images,category,stock,eFile,eTestFile,isOnlyElectronic,authorId,profileId,
      electronicId,selectProperties:productSelectProperties,inputProperties:productInputProperties
    };
    if (productToEdit) {
      let _id = productToEdit._id;
      await handleApiCall((axios.put('/api/products', {...data, _id})), "saving product");
    } else {
      data.amountSold = 0;
      await handleApiCall((axios.post('/api/products', data)), "creating product");
    };
    fetchProducts();
    clearProduct();
  };

  function setProductSProp(propName,value) {
    setProductSelectProperties(prev => {
      const newProductProps = {...prev};
      newProductProps[propName] = value;
      return newProductProps;
    });
  };
  function setProductIProp(propName,value) {
    setProductInputProperties(prev => {
      const newProductProps = {...prev};
      newProductProps[propName] = value;
      return newProductProps;
    });
  };
  function onDelete(product) {
    if (!product) return;
    setProductToDelete(product);
    onOpen();
  };
  async function deleteProduct() {
    if (!productToDelete) return;
    const isFeatured = await handleApiCall((axios.get('/api/featured?existingId='+productToDelete._id)), "checking if product is featured");
    if (isFeatured.data.length > 0) await handleApiCall((axios.delete('/api/featured?id='+isFeatured.data[0]._id)), "deleting featured product");
    await handleApiCall((axios.delete('/api/products?id='+productToDelete._id)), "deleting product");
    setProductToDelete('');
    fetchProducts();
    onOpenChange();
  };
  async function onEdit(product) {
    if (!product) return;
    console.log(product);
    setProductToEdit(product);
    setTitle(product.title);
    setDescription(product.description);
    setCategory(product.category);
    setPrice(product.price);
    setProductTags(product.tags);
    setFiles(product.images);
    setEFile(product.eFile);
    setETestFile(product.eTestFile);
    setIsOnlyElectronic(product.isOnlyElectronic);
    setStock(product.stock);
    setAuthorId(product.authorId);
    setProfileId(product.profileId);
    if (product.selectProperties[0]) setProductSelectProperties(product.selectProperties[0])
    if (product.inputProperties[0]) setProductInputProperties(product.inputProperties[0])
    onOpen();
  };
  function clearProduct() {
    setProductToEdit('');
    setProductToDelete('');
    setTitle('');
    setDescription({});
    setCategory('');
    setPrice('');
    setProductTags([]);
    setFiles([]);
    setEFile([]);
    setETestFile([]);
    setStock('');
    setAuthorId('');
    setProfileId('');
    setProductSelectProperties({});
    setProductInputProperties({});
    onOpenChange();
  };

  function handleDescriptionChange(locale, html) {
    if (!locale) locale = 'en';
    if (html === '<p class="editor-paragraph"><br></p>') html = '';
    setDescription(prev => {
      const newDescription = {...prev};
      newDescription[locale] = html;
      return newDescription;
    });
  };

  const selectPropertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(c => c._id === category);
    selectPropertiesToFill.push(...catInfo.selectProperties);
    while(catInfo?.parent?._id) {
      const parentCat = categories.find(({_id}) => _id === catInfo?.parent?._id);
      selectPropertiesToFill.push(...parentCat.selectProperties);
      catInfo = parentCat;
    };
  };
  const inputPropertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(c => c._id === category);
    inputPropertiesToFill.push(...catInfo.inputProperties);
    while(catInfo?.parent?._id) {
      const parentCat = categories.find(({_id}) => _id === catInfo?.parent?._id);
      inputPropertiesToFill.push(...parentCat.inputProperties);
      catInfo = parentCat;
    };
  };

  const columns = [
    {name: "name", uid: "pName"},
    {name: "price", uid: "price"},
    {name: "stock", uid: "stock"},
    {name: "size", uid: "profiles"},
    {name: "author", uid: "authorImage"},
    {name: "actions", uid: "actions"},
  ];

  const providedBody = (<>
    {productToDelete ? (
      <div>{tModalProducts('delete_description', {name: 'product'})}</div>
      ) : (<>
        <div className="flex flex-col gap-1 mb-3">
          <div className="text-textSecondary capitalize">{tModalProducts('name', {name: 'product'})}</div>
          <Input size='md' value={title} onChange={ev => setTitle(ev.target.value)} type="text" isRequired placeholder="Product name" />
        </div>

        <div className="flex flex-col">
          <div className="text-textSecondary capitalize mb-2">{tModalProducts('description', {name: 'product'})}</div>
          <CustomTabs>
            {locales.map((loc) => (
              <CustomTab key={loc} title={tLocaleProducts('switchLocale', {locale: loc})}>
                <Editor onHtmlChange={handleDescriptionChange} locale={loc} initialHtml={description?.[loc] || ''} />
              </CustomTab>
            ))}
          </CustomTabs>
        </div>

        <Accordion selectionMode="multiple">
          <AccordionItem key="1" aria-label="Generics" 
            title={<div className="flex items-center justify-between w-full">
              <div>{tModalProducts('generics')}</div>
              {deprecatedAuthors.includes(authorId) && (
                <span className="flex items-center gap-2 text-warning text-sm">
                  <AlertTriangle className="text-warning w-5 h-5" /> 
                  {tModalProducts('author_deprecated')}
                </span>
              )}
            </div>}
            startContent={<BookText className="w-6 h-6"/>
          }>
            <div className="flex flex-col gap-1 mb-3 mt-[-8px]">
              <div className="text-textSecondary capitalize">{tModalProducts('price', {name: 'product'})}</div>
              <Input size='md' value={price} onChange={ev => setPrice(ev.target.value)} type="number" isRequired placeholder="Product price" />
            </div>

            <div className="flex flex-col gap-1 mb-3">
              <div className="text-textSecondary capitalize">{tModalProducts('stock', {name: 'product'})}</div>
              <Input size='md' value={stock} onChange={ev => setStock(ev.target.value)} type="number" isRequired placeholder="Product price" />
            </div>

            <div className="flex flex-col gap-1 mb-3">
              <span className="text-textSecondary capitalize">{tModalProducts('author', {name: 'product'})}</span>  
              <Select selectedKeys={[authorId]} disabledKeys={deprecatedAuthors} onChange={ev => setAuthorId(ev.target.value)} size='md' isRequired placeholder="Select the product author">
                <SelectItem key='emptyAuthor' value={''}>Not selected</SelectItem>
                {authors.length > 0 && authors.map(auth => (
                  <SelectItem key={auth._id} value={auth._id} textValue={auth.authorName}>
                    <div className="flex gap-2 items-center">
                      <Avatar alt={auth.authorName} className="flex-shrink-0" size="sm" src={auth.image} />
                      <span className="text-small">{auth.authorName}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1 mb-3">
              <div className="text-textSecondary capitalize">{tModalProducts('tags', {name: 'product'})}</div>
              <TagInput productTags={productTags} setProductTags={setProductTags}/>
            </div>
          </AccordionItem>
          <AccordionItem key='2' aria-label="Categories" 
            title={<div className="flex items-center justify-between w-full">
              <div>{tModalProducts('category')}</div>
              {deprecatedCategories.includes(category) && (
                <span className="flex items-center gap-2 text-warning text-sm">
                  <AlertTriangle className="text-warning w-5 h-5" /> 
                  {tModalProducts('category_deprecated')}
                </span>
              )}
            </div>} 
            startContent={<Tags className="w-6 h-6"/>
          }>
            <div className="mb-3 mt-[-5px]">
              <div className="flex flex-col gap-1 mb-3">
                <Select defaultSelectedKeys={[category]} disabledKeys={deprecatedCategories} onChange={ev => setCategory(ev.target.value)} size='sm' isRequired placeholder="Select a category" className="">
                  {categories.length > 0 && categories.map(c => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </Select>
              </div>

              {selectPropertiesToFill.length > 0 && (<>
                <div className="text-textSecondary text-sm">{tModalProducts('select_properties')}</div>
                <div className="mt-1">
                  {selectPropertiesToFill.map((p, index) => (
                    <div key={p.name} className="relative flex flex-col gap-1 pb-2 pl-7">
                      <div className={"absolute bg-foreground w-[2px] left-[10px] " + (index === (selectPropertiesToFill.length - 1) ? "rounded-b h-[52%] " : "h-full") + (index === 0 ? " rounded-t" : "")}></div>
                      <div className="absolute bg-foreground h-[2px] w-[10px] rounded top-[50%] left-[10px]"></div>
                      <Select defaultSelectedKeys={[productSelectProperties ? productSelectProperties[p.name] : '']} onChange={ev => setProductSProp(p.name, ev.target.value)} size='sm' label={p.name} placeholder="Select a property spec" className="max-w-sm">
                        <SelectItem key='nothing' value=''>Nothing from this property</SelectItem>
                          {p.values.map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </Select>
                    </div>
                    ))}
                </div>
              </>)}

              {inputPropertiesToFill.length > 0 && (<>
                <div className="text-textSecondary text-sm">{tModalProducts('input_properties')}</div>
                <div className="mt-1">
                  {inputPropertiesToFill.map((p, index) => (
                    <div key={p.name} className="relative flex flex-col gap-1 pb-2 pl-7">
                      <div className={"absolute bg-foreground w-[2px] left-[10px] " + (index === (inputPropertiesToFill.length - 1) ? "rounded-b h-[52%] " : "h-full") + (index === 0 ? " rounded-t" : "")}></div>
                      <div className="absolute bg-foreground h-[2px] w-[10px] rounded top-[50%] left-[10px]"></div>
                      <Input className="max-w-sm" size='sm' onChange={ev => setProductIProp(p.name, ev.target.value)} value={productInputProperties ? productInputProperties[p.name] : ''} type={p.type} label={p.name} placeholder={p.name} />
                    </div>
                    ))}
                </div>
              </>)}
            </div>
          </AccordionItem>
          <AccordionItem key='3' aria-label="E-Item" title='E-Item' startContent={<Save className="w-6 h-6"/>}>
            <div className="mb-3 mt-[-5px] flex flex-col gap-1">
              <div className='text-textSecondary'>{tModalProducts('tester')}</div>
              <DragAndDrop existingFiles={eTestFile} onFilesChange={sortTestFile} acceptedFileTypes='.pdf,.epub' maxFiles={1} />

              <div className='mt-2 text-textSecondary'>{tModalProducts('e_version')}</div>
              <DragAndDrop existingFiles={eFile} onFilesChange={sortEFiles} acceptedFileTypes='.pdf,.epub' maxFiles={1} />

              {!disableElectronicSelector && (<>
                <div className="mt-2 text-textSecondary">{tModalProducts('is_electronic')}</div>
                <RadioGroup className="[&>div]:flex-row " value={isOnlyElectronic} onValueChange={setIsOnlyElectronic}>
                  <CustomRadio description={tModalProducts('electronic_product_description')} value={true}>{tModalProducts('yes')}</CustomRadio>
                  <CustomRadio description={tModalProducts('not_electronic_product_description')} value={false}>{tModalProducts('no')}</CustomRadio>
                </RadioGroup>
              </>)}
              
            </div>
          </AccordionItem>
          <AccordionItem key='4' aria-label="Shipment" title={<div>{tModalProducts('shipment_profile')} <span className="text-sm text-textSecondary">{tModalProducts('dimentions')}</span></div>} startContent={<Truck className="w-6 h-6"/>}>
            <div className="flex flex-col gap-1 mt-[-5px]">
              <RadioGroup className="[&>div]:flex-row" value={profileId} onValueChange={setProfileId}>
                {shipmentProfiles.length > 0 && shipmentProfiles.map(profile => (
                  <CustomRadio className="sm:flex-none w-fit" key={profile._id} value={profile._id}>
                    <div className="text-xl mb-2 mt-[-4px]">{profile.profileName}</div>
                    <ShipmentProfileCardData profile={profile} />
                  </CustomRadio>
                ))}
              </RadioGroup>
            </div>
          </AccordionItem>
        </Accordion>

        <div className="flex flex-col gap-1 mt-[-10px]">
          <div className="text-textSecondary capitalize">{tModalProducts('file', {amount: '2'})}</div>
          <DragAndDrop existingFiles={images} onFilesChange={sortImages} />
        </div>

    </>)}
  </>);

  return (<>
    <Layout>
      {isLoading ? (
        <Spinner />
      ) : (<>
        <div className="flex items-center mb-4 ml-4 text-default-600">
          <AddNewButton onOpen={onOpen} name="product" />
        </div>
        <CustomTable items={products} columns={columns} editFunc={onEdit} deleteFunc={onDelete} shipmentProfiles={shipmentProfiles}></CustomTable>
      </>)}
    </Layout>

    <CustomModal
      isOpen={isOpen} onOpenChange={onOpenChange} 
      toDelete={productToDelete} toEdit={productToEdit} entity='product' title={productToEdit?.title || productToDelete?.title}
      clearFunc={clearProduct} deleteFunc={deleteProduct} saveFunc={saveProduct}
      disableCondition={!title || !price || !stock || !category || !profileId || !authorId} providedBody={providedBody} 
    />
  </>);
};

export async function getServerSideProps(context) {
  await mongooseConnect();
  await isAdminRequest(context.req,context.res);

  const shipProfiles = await ShipmentProfile.find();
  return {
    props:{
      messages: (await import(`@/locales/${context.locale}.json`)).default,
      shipProfiles: JSON.parse(JSON.stringify(shipProfiles)),
    }
  };
};