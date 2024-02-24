import Layout from "@/components/Layout";
import React from "react";
import {useEffect, useState} from "react";
import axios from "axios";
import {Accordion, AccordionItem, Checkbox, Select, SelectItem} from "@nextui-org/react";
import {Input} from "@nextui-org/react";
import { Tooltip, Button, useDisclosure } from "@nextui-org/react";
import { DeleteIcon, CreateIcon } from "@/Icons/Icons";
import CustomTable from "@/components/Table";
import { HelpCircle, Network, Percent, Pipette, TextCursorInput } from "lucide-react";
import { handleApiCall } from "@/lib/handlers";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import AddNewButton from "@/components/AddNewButton";
import CustomModal from "@/components/CustomModal";
import Link from "next/link";
import { mongooseConnect } from "@/lib/mongoose";
import { Country } from "@/models/Country";

export default function Categories({countries}) {
  const tCategoriesBut = useTranslations('Buttons');
  const tCategories = useTranslations('Categories');
  const tCategoryModal = useTranslations('Modal');

  const [editedCategory, setEditedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [name,setName] = useState('');
  const [parentCategory,setParentCategory] = useState('');
  const [parentCategoryName,setParentCategoryName] = useState('');
  const [categories,setCategories] = useState([]);
  const [filteredCategories,setFilteredCategories] = useState([]);
  const [isShowingDeprecated,setIsShowingDeprecated] = useState(false);
  const [selectProperties,setSelectProperties] = useState([]);
  const [inputProperties,setInputProperties] = useState([]);
  const [selectParentProps, setSelectParentProps] = useState([]);
  const [inputParentProps, setInputParentProps] = useState([]);
  const [vatPercentages, setVatPercentages] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);

  const [isDeprecatable, setIsDeprecatable] = useState(false);

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  useEffect(() => {
    fetchCategories();
  }, []);
  async function fetchCategories() {
    const res = await handleApiCall(axios.get('/api/categories'), 'fetching categories', false);
    setCategories(res.data);
    if (isShowingDeprecated) setFilteredCategories(res.data);
    else setFilteredCategories(res.data.filter(category => !category.isDeprecated));
  };

  function filterCategories(ev) {
    setIsShowingDeprecated(ev.target.checked);
    if (ev.target.checked) {
      setFilteredCategories(categories);
    } else {
      setFilteredCategories(categories.filter(category => !category.isDeprecated));
    };
  };

  async function saveCategory(ev){
    ev.preventDefault();
    const data = {
      name,
      parentCategory,
      selectProperties:selectProperties.map(p => ({
        name:p.name,
        values:p.values.split(','),
      })),
      inputProperties,vatPercentages
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await handleApiCall(axios.put('/api/categories', data), 'updating category');
      setEditedCategory(null);
    } else {
      await handleApiCall(axios.post('/api/categories', data), 'creating category');
    }
    setName('');
    setParentCategory('');
    setParentCategoryName('');
    setSelectProperties([]);
    fetchCategories();
    onOpenChange();
  };

  function onEdit(category){
    console.log(category)
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setParentCategoryName(category.parent?.name)
    setSelectProperties(
      category.selectProperties.map(({name,values}) => ({
        name,
        values:values.join(',')
      }))
    );
    setInputProperties(category.inputProperties);
    setVatPercentages(category.vatPercentages);
    setSelectedCountries(category.vatPercentages.map(p => p.country));
    setSelectedCountries(prev => {
      const newCountries = [...prev];
      countries.forEach(c => {
        if (!newCountries.includes(c._id) && c.isDeprecated) newCountries.push(c._id);
      });
      return newCountries;
    });
    let parentPropsFill = [];
    if (category.parent) {
        category.parent.selectProperties.forEach((property) => parentPropsFill.push(property));
        setSelectParentProps(parentPropsFill);
    };
    onOpen();
  };

  async function onDelete(category) {
    await checkDeprecatable(category);
    onOpen();
  };
  async function onUnDeprecate(category) {
    const {_id} = category;
    await handleApiCall(axios.put('/api/categories', {_id, isDeprecated:false}), 'un-deprecating category');
    fetchCategories();
  };

  async function deleteCategory(){
    const {_id} = categoryToDelete;
    await handleApiCall(axios.delete('/api/categories?_id='+_id), 'deleting category');
    fetchCategories();
    setCategoryToDelete(null)
    setIsDeprecatable(false);
    onOpenChange();
  };
  async function deprecateCategory(){
    const {_id} = categoryToDelete;
    await handleApiCall(axios.put('/api/categories', {_id, isDeprecated:true}), 'deprecating category');
    fetchCategories();
    setCategoryToDelete(null);
    setIsDeprecatable(false);
    onOpenChange();
  };

  async function checkDeprecatable(category) {
    if (!category) {
      toast.info('No category selected.');
      return;
    };
    let productCount = await handleApiCall(axios.get('/api/products?categoryId='+category._id), 'fetching category products', false);
    let categoryCount = await handleApiCall(axios.get('/api/categories?categoryId='+category._id), 'fetching category sub-categories', false);

    if (productCount.data > 0 || categoryCount.data > 0) setIsDeprecatable(true);
    else setIsDeprecatable(false);
    setCategoryToDelete(category);
  };

  function addSelectProperty() {
    setSelectProperties(prev => {
      return [...prev, {name:'',values:''}];
    });
  };
  function handleSelectPropertyNameChange(index,property,newName) {
    setSelectProperties(prev => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  };
  function handleSelectPropertyValuesChange(index,property,newValues) {
    setSelectProperties(prev => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  };
  function removeSelectProperty(indexToRemove) {
    setSelectProperties(prev => {
      return [...prev].filter((p,pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  };

  function addInputProperty() {
    setInputProperties(prev => {
      return [...prev, {name:'',type:''}];
    });
  };
  function handleInputPropertyNameChange(index,property,newName) {
    setInputProperties(prev => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  };
  function handleInputPropertyTypeChange(index,property,newType) {
    setInputProperties(prev => {
      const properties = [...prev];
      properties[index].type = newType;
      return properties;
    });
  };
  function removeInputProperty(indexToRemove) {
    setInputProperties(prev => {
      return [...prev].filter((p,pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  };

  function addVatPercentage() {
    setVatPercentages(prev => {
      return [...prev, {country:'',percentage:0}];
    });
  };
  function handleVatCountryChange(index,newCountry) {
    setVatPercentages(prev => {
      const percentages = [...prev];
      percentages[index].country = newCountry;
      return percentages;
    });
    setSelectedCountries(prev => {
      const countries = [...prev];
      countries.push(newCountry);
      return countries;
    });
  };
  function handleVatPercentageChange(index,newPercentage) {
    setVatPercentages(prev => {
      const percentages = [...prev];
      percentages[index].percentage = parseInt(newPercentage);
      return percentages;
    });
  };
  function removeVatPercentage(indexToRemove) {
    setVatPercentages(prev => {
      return [...prev].filter((p,pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
    setSelectedCountries(prev => {
      return [...prev].filter((p,pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  };

  function handleChangeParentCategory(parentCat) {
    setParentCategory(parentCat);
    if (!parentCat) return;

    let parentFullCat = categories.find((category) => (category._id === parentCat));
    setParentCategoryName(parentFullCat.name);

    if (parentFullCat.selectProperties.length > 0) {
      let parentPropsFill = [];
      parentFullCat.selectProperties.forEach((property) => parentPropsFill.push(property));
      if (parentFullCat.parent?.selectProperties.length > 0) {
          parentFullCat.parent.selectProperties.forEach((property) => parentPropsFill.push(property));
      };
      setSelectParentProps(parentPropsFill);
    };

    if (parentFullCat.inputProperties.length > 0) {
      let parentPropsFill = [];
      parentFullCat.inputProperties.forEach((property) => parentPropsFill.push(property));
      if (parentFullCat.parent?.inputProperties.length > 0) {
          parentFullCat.parent.inputProperties.forEach((property) => parentPropsFill.push(property));
      };
      setInputParentProps(parentPropsFill);
    };
  };

  function clearCategory() {
    onOpenChange();
    setSelectParentProps([]);
    setInputParentProps([]);
    setEditedCategory(null);
    setName('');
    setParentCategory('');
    setSelectProperties([]);
    setInputProperties([]);
    setVatPercentages([]);
    setCategoryToDelete(null);
    setIsDeprecatable(false);
  };

  const columns = [
    {name: "name", uid: "cName"},
    {name: "parent", uid: "parent"},
    {name: "actions", uid: "actions"},
  ];

  const inputTypes = [
    {name: tCategories('InputTypes.text'), uid: "text"},
    {name: tCategories('InputTypes.number'), uid: "number"},
    {name: tCategories('InputTypes.date'), uid: "date"},
  ];

  const providedBody = (<>
    {categoryToDelete && isDeprecatable && (<>
      {tCategoryModal('deprecate_description', {name: 'category'})}
      <div className="flex items-center gap-1">
        {tCategoryModal('refer_to_docs')}
        <Link target="_blank" href='/settings/docs' className="text-primary"><HelpCircle className="w-4 h-4" /></Link>
      </div>
    </>)}
    {categoryToDelete && !isDeprecatable && (
      tCategoryModal('delete_description', {name: 'category'})
    )}
    {!categoryToDelete && !isDeprecatable && (
      <>
        <div className="flex max-sm:flex-col items-center gap-2">
          <Input onChange={ev => setName(ev.target.value)} value={name} size="sm" type="text" isRequired label={tCategories('name')} placeholder={tCategories('name_placeholder')} />
          <Select onChange={ev => handleChangeParentCategory(ev.target.value)} size="sm" label={tCategories('parent_category')} defaultSelectedKeys={[parentCategory]}>
            {categories.length > 0 && categories.map(category => (
              <SelectItem className={editedCategory && category._id === editedCategory._id ? 'hidden' : ''} key={category._id} value={category._id}>{category.name}</SelectItem>
            ))}
          </Select>
        </div>
        
        <div className="mb-2">
          <Accordion selectionMode="multiple">
            {(selectParentProps.length > 0 || inputParentProps.length > 0) && (
              <AccordionItem key="1" aria-label="Parent properties" title={<div>{tCategories('parent_properties_from')} <span className="font-semibold">{parentCategoryName}</span></div>} startContent={<Network className="w-6 h-6"/>}>
                <div className="flex flex-col gap-2 mb-3 mt-[-5px]">

                  <div>{tCategories('selection_properties')}</div>
                  {selectParentProps.length > 0 && selectParentProps.map((property, index) => (
                    <div key={index} className="relative flex items-center max-sm:pl-3 max-sm:mb-4 gap-1">
                      <div className="sm:hidden absolute h-full w-[4px] rounded left-0 bg-default-100"></div>
                      <div className="flex max-sm:flex-col items-center w-full">
                        <Input isDisabled className="max-sm:mb-2" value={property.name} size="sm" type="text" label={tCategories('property_name')} />
                        <div className="max-sm:hidden mx-2"> - </div>
                        <Input isDisabled value={property.values} size="sm" type="text" label="Values" />
                      </div>
                      <Tooltip color="danger" content={tCategoriesBut('delete_property')}> <a className="invisible mx-2 text-lg text-danger cursor-pointer active:opacity-50"> <DeleteIcon height='20px' /> </a> </Tooltip>
                    </div>
                  ))}

                  <div>{tCategories('input_properties')}</div>
                  {inputParentProps.length > 0 && inputParentProps.map((property, index) => (
                    <div key={index} className="relative flex items-center max-sm:pl-3 max-sm:mb-4 gap-1">
                      <div className="sm:hidden absolute h-full w-[4px] rounded left-0 bg-default-100"></div>
                      <div className="flex max-sm:flex-col items-center w-full">
                        <Input isDisabled className="max-sm:mb-2" value={property.name} size="sm" type="text" label={tCategories('property_name')} />
                        <div className="max-sm:hidden mx-2"> - </div>
                        <Input isDisabled value={property.type} size="sm" type="text" label="Type" />
                      </div>
                      <Tooltip color="danger" content={tCategoriesBut('delete_property')}> <a className="invisible mx-2 text-lg text-danger cursor-pointer active:opacity-50"> <DeleteIcon height='20px' /> </a> </Tooltip>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            )}
            
            <AccordionItem key="2" aria-label={tCategories('own_selection_properties')} title={tCategories('own_selection_properties')} startContent={<Pipette className="w-6 h-6"/>}>
              <div className="flex flex-col gap-2 mb-3 mt-[-5px]">
                {selectProperties.length > 0 && selectProperties.map((property, index) => (
                  <div key={index} className="relative flex items-center max-sm:pl-3 max-sm:mb-4 gap-1">
                    <div className="sm:hidden absolute h-full w-[4px] rounded left-0 bg-default-200"></div>
                    <div className="flex max-sm:flex-col items-center w-full">
                      <Input className="max-sm:mb-2" onChange={ev => handleSelectPropertyNameChange(index, property, ev.target.value)} value={property.name} size="sm" type="text" label={tCategories('property_name')} placeholder={tCategories('selection_name_placeholder')} />
                      <div className="max-sm:hidden mx-2"> - </div>
                      <Input className="" onChange={ev => handleSelectPropertyValuesChange(index, property, ev.target.value)} value={property.values} size="sm" type="text" label={tCategories('values')} placeholder={tCategories('selection_value_placeholder')} />
                    </div>
                    <Tooltip color="danger" content={tCategoriesBut('delete_property')}>
                      <a onClick={() => removeSelectProperty(index)} className="mx-2 text-lg text-danger cursor-pointer active:opacity-50">
                        <DeleteIcon height='20px' />
                      </a>
                    </Tooltip>
                  </div>
                ))}

                <div className="flex items-center mt-1 mr-auto text-default-600">
                  <Button onClick={addSelectProperty} type="button" className="w-9 h-9 p-0 mr-2 min-w-10 min-h-10" color="secondary" startContent={<CreateIcon />}></Button>
                  <div className="text-sm">{tCategories('add_selection_property')}</div>
                </div>
              </div>
            </AccordionItem>
            <AccordionItem key="3" aria-label={tCategories('own_input_properties')} title={tCategories('own_input_properties')} startContent={<TextCursorInput className="w-6 h-6"/>}>
              <div className="flex flex-col gap-2 mb-3 mt-[-5px]">
                {inputProperties.length > 0 && inputProperties.map((property, index) => (
                  <div key={index} className="relative flex items-center max-sm:pl-3 max-sm:mb-4 gap-1">
                    <div className="sm:hidden absolute h-full w-[4px] rounded left-0 bg-default-200"></div>
                    <div className="flex max-sm:flex-col items-center w-full">
                      <Input className="max-sm:mb-2" onChange={ev => handleInputPropertyNameChange(index, property, ev.target.value)} value={property.name} size="sm" type="text" label={tCategories('property_name')} placeholder={tCategories('input_name_placeholder')} />
                      <div className="max-sm:hidden mx-2"> - </div>
                      <Select onChange={ev => handleInputPropertyTypeChange(index, property, ev.target.value)} size="sm" label={tCategories('type')} placeholder={tCategories('select_property_type')} defaultSelectedKeys={[property.type]}>
                        {inputTypes.length > 0 && inputTypes.map(type => (
                          <SelectItem key={type.uid} value={type.uid}>{type.name}</SelectItem>
                        ))}
                      </Select>
                    </div>
                    <Tooltip color="danger" content={tCategoriesBut('delete_property')}>
                      <a onClick={() => removeInputProperty(index)} className="mx-2 text-lg text-danger cursor-pointer active:opacity-50">
                        <DeleteIcon height='20px' />
                      </a>
                    </Tooltip>
                  </div>
                ))}

                <div className="flex items-center mt-1 mr-auto text-default-600">
                  <Button onClick={addInputProperty} type="button" className="w-9 h-9 p-0 mr-2 min-w-10 min-h-10" color="secondary" startContent={<CreateIcon />}></Button>
                  <div className="text-sm">{tCategories('add_input_property')}</div>
                </div>
              </div>
            </AccordionItem>
            <AccordionItem key="4" aria-label={tCategories('vat_percentages')} title={tCategories('vat_percentages')} startContent={<Percent className="w-6 h-6"/>}>
              <div className="flex flex-col gap-2 mb-3 mt-[-5px]">
                {vatPercentages.length > 0 && vatPercentages.map((percentage, index) => (
                  <div key={index} className="relative flex items-center max-sm:pl-3 max-sm:mb-4 gap-1">
                    <div className="sm:hidden absolute h-full w-[4px] rounded left-0 bg-default-200"></div>
                    <div className="flex max-sm:flex-col items-center w-full">
                      <Input className="max-sm:mb-2" onChange={ev => handleVatPercentageChange(index,ev.target.value)} value={percentage.percentage} size="sm" type="number" label={tCategories('percentage')} placeholder={tCategories('vat_placeholder')} />
                      <div className="max-sm:hidden mx-2"> - </div>
                      <Select onChange={ev => handleVatCountryChange(index,ev.target.value)} size="sm" label={tCategories('country')} placeholder={tCategories('select_country')} disabledKeys={selectedCountries} defaultSelectedKeys={[percentage.country]}>
                        {countries.length > 0 && countries.map(type => (
                          <SelectItem key={type._id} value={type._id}>{type.name}</SelectItem>
                        ))}
                      </Select>
                    </div>
                    <Tooltip color="danger" content={tCategoriesBut('delete_vat')}>
                      <a onClick={() => removeVatPercentage(index)} className="mx-2 text-lg text-danger cursor-pointer active:opacity-50">
                        <DeleteIcon height='20px' />
                      </a>
                    </Tooltip>
                  </div>
                ))}

                {countries.length === vatPercentages.length ? (
                  <div className="text-sm text-textSecondary">{tCategories('described_all_countries')}</div>
                ) : (
                  <div className="flex items-center mt-1 mr-auto text-default-600">
                    <Button onClick={addVatPercentage} type="button" className="w-9 h-9 p-0 mr-2 min-w-10 min-h-10" color="secondary" startContent={<CreateIcon />}></Button>
                    <div className="text-sm">{tCategories('add_vat')}</div>
                  </div>
                )}
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </>
    )}
  </>);

  return (<>
    <Layout>
      <div className="flex items-center mb-4 ml-4 text-default-600">
        <AddNewButton onOpen={onOpen} name="category" />
        <Checkbox color="warning" className="ml-auto" onChange={(ev) => filterCategories(ev)}>{tCategoriesBut('show_deprecated', {name: 'categories'})}</Checkbox>
      </div>
      <CustomTable items={filteredCategories} columns={columns} editFunc={onEdit} deleteFunc={onDelete} unDeprecateFunc={onUnDeprecate}></CustomTable>
    </Layout>

    <CustomModal
      isOpen={isOpen} onOpenChange={onOpenChange} 
      toDelete={categoryToDelete} toEdit={editedCategory} entity='category' title={editedCategory?.name || categoryToDelete?.name}
      clearFunc={clearCategory} deleteFunc={deleteCategory} saveFunc={saveCategory} deprecateFunc={deprecateCategory} isDeprecatable={isDeprecatable}
      disableCondition={!name || vatPercentages.length < 1} providedBody={providedBody} 
    />
  </>);
};

export async function getServerSideProps(context) {
  mongooseConnect();
  const countries = await Country.find();
  return {
    props:{
      messages: (await import(`@/locales/${context.locale}.json`)).default,
      countries: JSON.parse(JSON.stringify(countries))
    }
  };
};