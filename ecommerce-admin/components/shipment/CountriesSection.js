import { HelpCircle, Percent } from "lucide-react";
import { Accordion, AccordionItem, Button, Input, Select, SelectItem, Tooltip, useDisclosure } from "@nextui-org/react";
import { useState } from "react";
import axios from "axios";
import { handleApiCall } from "@/lib/handlers";
import { useTranslations } from "next-intl";
import CustomModal from "../CustomModal";
import Link from "next/link";
import CustomTable from "../Table";
import AddNewButton from "../AddNewButton";
import { CreateIcon, DeleteIcon } from "@/Icons/Icons";
import { toast } from "sonner";

export default function CountriesSection({countries, reloadData, setIsLoading}) {
  const tCountries = useTranslations('Shipping');
  const tCountriesModal = useTranslations('Modal');
  const tCountriesBut = useTranslations('Buttons');
  const tCategories = useTranslations('Categories');

  const [countryToEdit, setCountryToEdit] = useState(null);
  const [countryToDelete, setCountryToDelete] = useState(null);
  const [isDeprecatable, setIsDeprecatable] = useState(false);

  const [name, setName] = useState('');
  const [vatPercentages, setVatPercentages] = useState([]);
  const [vatPToDelete, setVatPToDelete] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  async function getCategories(countryId) {
    const res = await handleApiCall(axios.get('/api/categories'), 'fetching categories for country', false);
    if (!res.data || res.data.length === 0) return;

    let vPercents = [];
    let selectedCats = [];
    res.data.forEach(cat => {
      cat.vatPercentages.forEach(vat => {
        if (vat.country === countryId) {
          vPercents.push({category:cat._id, percentage:vat.percentage});
          selectedCats.push(cat._id);
        };
      });
      if (cat.isDeprecated && !selectedCats.includes(cat._id)) selectedCats.push(cat._id);
    });
    setVatPercentages(vPercents);
    setSelectedCategories(selectedCats);
    setCategories(res.data);
  };

  async function startCountryCreation() {
    await getCategories();
    onOpen();
  };

  async function saveChangedCategoryVat() {
    if (!countryToEdit?._id || !vatPercentages || vatPercentages.length === 0) return;
    let categoriesToSave = [];

    vatPercentages.forEach(vat => {
      let origVat = categories.find(cat => cat._id === vat.category)?.vatPercentages;
      if (origVat?.find(v => v.country === countryToEdit._id)) {
        origVat.find(v => v.country === countryToEdit._id).percentage = vat.percentage
      } else {
        origVat.push({country:countryToEdit._id, percentage:vat.percentage});
      };
      origVat = origVat.map(v => ({country:v.country, percentage:v.percentage}));

      categoriesToSave.push({
        _id: vat.category,
        vatPercentages: origVat
      });
    });

    if (vatPToDelete.length > 0) {
      vatPToDelete.forEach(vat => {
        let origVat = categories.find(cat => cat._id === vat.category)?.vatPercentages;
        if (origVat && origVat.length > 0) origVat = origVat.filter(v => v.country !== vat.country);
  
        categoriesToSave.push({
          _id: vat.category,
          vatPercentages: origVat
        });
      });
    };

    await handleApiCall(axios.put('/api/categories', {categoriesToSave}), 'updating categories');
  };

  async function saveCountry() {
    if (!name) return;
    setIsLoading(true);
    if (countryToEdit?._id) {
      await handleApiCall(axios.put('/api/countries', {name, _id:countryToEdit._id}), 'updating country');
    } else {
      await handleApiCall(axios.post('/api/countries', {name}), 'creating country');
    };

    await saveChangedCategoryVat();

    setIsLoading(false);
    setCountryToEdit(null);
    reloadData();
    onOpenChange();
  };
  function onEdit(country) {
    if (!country) return;
    setCountryToEdit(country);
    setName(country.name);
    getCategories(country._id);
    onOpen();
  };
  async function onDelete(country) {
    await checkDeprecatable(country);
    onOpen();
  };
  async function deleteCountry() {
    if (!countryToDelete) return;
    setIsLoading(true);
    await handleApiCall(axios.delete(`/api/countries/?id=${countryToDelete._id}`), 'deleting country');
    reloadData();
    setIsLoading(false);
    clearCountry();
  };
  function clearCountry() {
    setCountryToDelete(null);
    setCountryToEdit(null);
    setName('');
    setIsDeprecatable(false);
    setVatPercentages([]);
    setSelectedCategories([]);
    setCategories([]);
    onOpenChange();
  };

  async function deprecateCountry(){
    const {_id} = countryToDelete;
    await handleApiCall(axios.put('/api/countries', {_id, isDeprecated:true}), 'deprecating country');
    reloadData();
    setCountryToDelete(null);
    setIsDeprecatable(false);
    onOpenChange();
  };
  async function onUnDeprecate(country) {
    const {_id} = country;
    await handleApiCall(axios.put('/api/countries', {_id, isDeprecated:false}), 'un-deprecating country');
    reloadData();
  };

  async function checkDeprecatable(country) {
    if (!country) {
      toast.info('No country selected.');
      return;
    };
    let methodsCount = await handleApiCall(axios.get('/api/shipment-methods?countryId='+country._id), 'fetching country methods', false);

    if (methodsCount.data > 0) setIsDeprecatable(true);
    else setIsDeprecatable(false);
    setCountryToDelete(country);
  };

  function addVatPercentage() {
    setVatPercentages(prev => {
      return [...prev, {category:'',percentage:0}];
    });
  };
  function handleVatCategoryChange(index,newCategory) {
    setVatPercentages(prev => {
      const percentages = [...prev];
      percentages[index].category = newCategory;
      console.log('percentages',percentages);
      return percentages;
    });
    setSelectedCategories(prev => {
      const categories = [...prev];
      categories.push(newCategory);
      return categories;
    });
  };
  function handleVatPercentageChange(index,newPercentage) {
    if (!newPercentage) newPercentage = 0;
    setVatPercentages(prev => {
      const percentages = [...prev];
      percentages[index].percentage = parseInt(newPercentage);
      return percentages;
    });
  };
  function removeVatPercentage(indexToRemove, categoryId) {
    setVatPercentages(prev => {
      return [...prev].filter((p,pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
    setSelectedCategories(prev => {
      return [...prev].filter((c,cIndex) => {
        return cIndex !== indexToRemove;
      });
    });
    setVatPToDelete(prev => {
      const toDelete = [...prev];
      toDelete.push({category:categoryId, country:countryToEdit._id});
      console.log('toDelete',toDelete);
      return toDelete;
    });
  };

  const providedBody = (<>
    {countryToDelete && isDeprecatable && (<>
      <div>{tCountriesModal('deprecate_description', {name: 'country'})}</div>
      <div className="flex items-center gap-1">
        {tCountriesModal('refer_to_docs')}
        <Link target="_blank" href='/settings/docs' className="text-primary"><HelpCircle className="w-4 h-4" /></Link>
      </div>
    </>)}
    {countryToDelete && !isDeprecatable && (
      tCountriesModal('delete_description', {name: 'country'})
    )}
    {!countryToDelete && !isDeprecatable && (<>
      <div className="flex max-sm:flex-col items-center gap-2">
        <Input onChange={ev => setName(ev.target.value)} value={name} size="sm" type="text" isRequired label='name' placeholder='name_placeholder' />
      </div>
      <Accordion selectionMode="multiple">
        <AccordionItem key="1" aria-label="Generics" 
          title={<div className="flex items-center justify-between w-full">
            <div>Categories VAT</div>
          </div>}
          startContent={<Percent className="w-6 h-6"/>}
        >

          <div className="flex flex-col gap-2 mb-3 mt-[-5px]">
            {vatPercentages.length > 0 && vatPercentages.map((percentage, index) => (
              <div key={index} className="relative flex items-center max-sm:pl-3 max-sm:mb-4 gap-1">
                <div className="sm:hidden absolute h-full w-[4px] rounded left-0 bg-default-200"></div>
                <div className="flex max-sm:flex-col items-center w-full">
                  <Input className="max-sm:mb-2" onChange={ev => handleVatPercentageChange(index,ev.target.value)} value={percentage.percentage} size="sm" type="number" label={tCategories('percentage')} placeholder={tCategories('vat_placeholder')} />
                  <div className="max-sm:hidden mx-2"> - </div>
                  <Select onChange={ev => handleVatCategoryChange(index,ev.target.value)} size="sm" label={tCategories('category')} placeholder={tCategories('select_country')} disabledKeys={selectedCategories} defaultSelectedKeys={[percentage.category]}>
                    {categories.length > 0 && categories.map(cat => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
                  </Select>
                </div>
                <Tooltip color="danger" content={tCountriesBut('delete_vat')}>
                  <a onClick={() => removeVatPercentage(index, percentage.category)} className="mx-2 text-lg text-danger cursor-pointer active:opacity-50">
                    <DeleteIcon height='20px' />
                  </a>
                </Tooltip>
              </div>
            ))}

            {categories.length === vatPercentages.length ? (
              <div className="text-sm text-textSecondary">{tCategories('described_all_categries')}</div>
            ) : (
              <div className="flex items-center mt-1 mr-auto text-default-600">
                <Button onClick={addVatPercentage} type="button" className="w-9 h-9 p-0 mr-2 min-w-10 min-h-10" color="secondary" startContent={<CreateIcon />}></Button>
                <div className="text-sm">{tCategories('add_vat')}</div>
              </div>
            )}
          </div>
        </AccordionItem>
      </Accordion>
    </>)}
  </>);

  const columns = [
    {name: 'name', uid: 'cName'},
    {name: 'actions', uid: 'actions'},
  ];

  return (<>
    <div className="flex items-center mt-10 mb-4 ml-4 text-default-600">
      <div className="absolute left-0 right-0 w-fit text-center text-2xl mx-auto">{tCountries('countries')}</div>
      <AddNewButton onOpen={onOpen} name="shipment_method" direction="rtl" />
    </div>  
    <CustomTable items={countries} columns={columns} editFunc={onEdit} deleteFunc={onDelete} unDeprecateFunc={onUnDeprecate} />
    

    <CustomModal
      isOpen={isOpen} onOpenChange={onOpenChange} 
      toDelete={countryToDelete} toEdit={countryToEdit} entity='country' title={countryToEdit?.name || countryToDelete?.name}
      clearFunc={clearCountry} deleteFunc={deleteCountry} deprecateFunc={deprecateCountry} saveFunc={saveCountry}
      isDeprecatable={isDeprecatable} providedBody={providedBody} 
    />
  </>);
};