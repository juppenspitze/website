import BackButton from "@/components/BackButton";
import axios from "axios";
import { useEffect, useState } from "react";
import CustomTable from "@/components/Table";
import { CreateIcon, DeleteIcon } from "@/Icons/Icons";
import {Input, Button, useDisclosure, Tooltip, Select, SelectItem, Accordion, AccordionItem, Textarea} from "@nextui-org/react";
import { AlertTriangle, Globe, Truck } from "lucide-react";
import { handleApiCall } from "@/lib/handlers";
import AddNewButton from "../AddNewButton";
import { useTranslations } from "next-intl";
import CustomModal from "../CustomModal";
import { useRouter } from "next/router";
import { CustomTab, CustomTabs } from "../CustomTabs";

export default function ShipmentMethodsSection({shipmentMethods,shipmentProfiles,countriesExt,reloadData,setIsLoading}) {
  const tShipmentMethods = useTranslations('Shipping.Methods');
  const tLocaleShipment = useTranslations('LocaleSwitcher');
  const tMethodsModal = useTranslations('Modal');
  const tMethodsButtons = useTranslations('Buttons');

  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [shipmentMethodToEdit, setShipmentMethodToEdit] = useState('');
  const [shipmentMethodToDelete, setShipmentMethodToDelete] = useState('');
  const [isCountryDeprecated, setIsCountryDeprecated] = useState(false);
  const [isProfileDeprecated, setIsProfileDeprecated] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState({});
  const [countries, setCountries] = useState(countriesExt || []);
  const [profiles, setProfiles] = useState([]);

  let {locales} = useRouter();
  locales = locales.filter(loc => loc !== 'default');

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  useEffect(() => {
    if (profiles.length <= 0) return;
    let selectedProfiles = [];
    profiles.forEach(profile => {
      if (!profile.profileId) return;
      let selectedProfile = shipmentProfiles.find(p => p._id === profile.profileId)?._id;
      if (selectedProfile) selectedProfiles.push(selectedProfile);
    });
    shipmentProfiles.forEach(profile => {
      if(profile.isDeprecated) {
        setIsProfileDeprecated(true);
        if (selectedProfiles.includes(profile._id)) return;
        selectedProfiles.push(profile._id);
      };
    });
    setSelectedProfiles(selectedProfiles);
  }, [profiles, shipmentProfiles]);

  useEffect(() => {
    if (countries.length <= 0) return;
    let selectedCountries = [];
    countries.forEach(country => {
      if (!country.countryId) return;
      let selectedCountry = countriesExt.find(c => c._id === country.countryId)?._id;
      if (selectedCountry) selectedCountries.push(selectedCountry);
    });
    selectedCountries.forEach(country => {
      if (country.isDeprecated) {
        setIsCountryDeprecated(true);
        if (selectedCountries.includes(country._id)) return;
        selectedCountries.push(country._id);
      };
    });
    setSelectedCountries(selectedCountries);
  }, [countries, countriesExt]);

  async function saveShipmentMethod() {
    setIsLoading(true);
    const data = { name,description,countries,profiles };
    if (shipmentMethodToEdit) {
      let _id = shipmentMethodToEdit._id;
      await handleApiCall(axios.put('/api/shipment-methods', {...data, _id}), 'updating shipment method');
    } else {
      await handleApiCall(axios.post('/api/shipment-methods', { ...data }), 'creating shipment method');
    };
    setIsLoading(false);
    clearShipmentMethod();
    reloadData();
  };

  function onDelete(shipmentMethod) {
    if (!shipmentMethod) return;
    setShipmentMethodToDelete(shipmentMethod);
    onOpen();
  };
  async function deleteShipmentMethod() {
    setIsLoading(true);
    await handleApiCall(axios.delete('/api/shipment-methods?id='+shipmentMethodToDelete._id), 'deleting shipment method');
    setIsLoading(false);
    setShipmentMethodToDelete({});
    reloadData();
  };

  function onEdit(shipmentMethod) {
    if (!shipmentMethod) return;
    console.log(shipmentMethod);
    setShipmentMethodToEdit(shipmentMethod);
    setName(shipmentMethod.name);
    setDescription(shipmentMethod.description);
    setCountries(shipmentMethod.countries);
    setProfiles(shipmentMethod.profiles);
    onOpen();
  };

  function clearShipmentMethod() {
    setName('');
    setDescription('');
    setCountries([]);
    setProfiles([]);
    setIsCountryDeprecated(false);
    setIsProfileDeprecated(false);
    onOpenChange();
  };

  function handleDescriptionChange(locale, description) {
    if (!locale) locale = 'en';
    setDescription(prev => {
      const newDescription = {...prev};
      newDescription[locale] = description;
      return newDescription;
    });
  };

  function addCountry() {
    setCountries(prev => {
      return [...prev, {countryId:'',baseFee:''}];
    });
  };
  function handleCountryIdChange(index,newId) {
    setCountries(prev => {
      const countries = [...prev];
      countries[index].countryId = newId;
      return countries;
    });
  };
  function handleCountryFeeChange(index,newBaseFee) {
    setCountries(prev => {
      const countries = [...prev];
      countries[index].baseFee = newBaseFee;
      return countries;
    });
  };
  function removeCountry(indexToRemove) {
    setCountries(prev => {
      return [...prev].filter((p,pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  };

  function addProfile() {
    setProfiles(prev => {
      return [...prev, {profileId:'',profileFee:''}];
    });
  };
  function handleProfileChange(index,newId) {
    if (!newId) return;
    setProfiles(prev => {
      const profiles = [...prev];
      profiles[index].profileId = newId;
      return profiles;
    });
  };
  function handleProfileFeeChange(index,newProfileFee) {
    setProfiles(prev => {
      const profiles = [...prev];
      profiles[index].profileFee = newProfileFee;
      return profiles;
    });
  };
  function removeProfile(indexToRemove) {
    setProfiles(prev => {
      return [...prev].filter((p,pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  };

  const columns = [
    {name: "name", uid: "cName"},
    {name: "countries", uid: "countries"},
    {name: "profiles", uid: "profiles"},
    {name: "actions", uid: "actions"},
  ];

  const providedBody = (<>
    {shipmentMethodToDelete ? (
      tMethodsModal('delete_description', {name: 'shipment_method'})
    ) : (<>
      <div className="flex flex-col gap-2 mb-3">
        <div>{tShipmentMethods('shipment_method_name')}</div>
        <Input size='md' className="" value={name} onChange={ev => setName(ev.target.value)} type="text" isRequired placeholder={tShipmentMethods('shipment_method_name_description')} />
      </div>
      <div className="flex flex-col gap-2 mb-3">
        <div>{tShipmentMethods('shipment_method_description')}</div>

        <CustomTabs>
          {locales.map((loc) => (
            <CustomTab key={loc} title={tLocaleShipment('switchLocale', {locale: loc})}>
              <Textarea size='sm' className="" value={description?.[loc] || ''} onChange={ev => handleDescriptionChange(loc, ev.target.value)} type="text" placeholder={tShipmentMethods('shipment_method_descr_descr')} />
            </CustomTab>
          ))}
        </CustomTabs>
      </div>

      <Accordion selectionMode="multiple">
        <AccordionItem key="1" aria-label="countries" 
          title={<div className="flex items-center justify-between w-full">
            <div>{tShipmentMethods('countries')}</div>
            {isCountryDeprecated && (
              <span className="flex items-center gap-2 text-warning text-sm">
                <AlertTriangle className="text-warning w-5 h-5" /> 
                {tShipmentMethods('deprecated')}
              </span>
            )}
          </div>}
          startContent={<Globe className="w-6 h-6"/>}
        >
          <div className="flex flex-col gap-2 mb-3 mt-[-5px]">
            {countries && countries.map((country,index) => (
              <div key={`${index}+country`} className="relative flex items-center max-sm:pl-3 max-sm:mb-4 gap-1">
                <div className="flex max-sm:flex-col items-center w-full">
                  <Select onChange={ev => handleCountryIdChange(index,ev.target.value)} size="sm" label={tShipmentMethods('shipment_country')} disabledKeys={selectedCountries} defaultSelectedKeys={[country.countryId]}>
                    {countriesExt.length > 0 && countriesExt.map(country => (
                      <SelectItem key={country._id} value={country._id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <div className="max-sm:hidden mx-2"> - </div>
                  <Input onChange={ev => handleCountryFeeChange(index, ev.target.value)} value={country.baseFee} size="sm" type="number" label={tShipmentMethods('base_price')} placeholder={tShipmentMethods('base_price_description', {name: 'country'})} />
                </div>
                <Tooltip color="danger" content={tMethodsButtons('delete')}>
                  <a onClick={() => removeCountry(index)} className="mx-2 text-lg text-danger cursor-pointer active:opacity-50">
                    <DeleteIcon height='20px' />
                  </a>
                </Tooltip>
              </div>
            ))}
            {countries.length === countriesExt.length ? (
              <div className="text-sm text-textSecondary">{tShipmentMethods('described_all_countries')}</div>
            ) : (
              <div className="flex items-center mb-4 mr-auto text-default-600">
                <Button onClick={addCountry} type="button" className="w-9 h-9 p-0 mr-2 min-w-10 min-h-10" color="secondary" startContent={<CreateIcon />}></Button>
                <div className="text-sm">{tMethodsButtons('add_new', {name: 'country'})}</div>
              </div>
            )}
          </div>
        </AccordionItem>
        <AccordionItem key="2" aria-label="shipment profiles" 
          title={<div className="flex items-center justify-between w-full">
            <div>{tShipmentMethods('shipment_profiles')}</div>
            {isProfileDeprecated && (
              <span className="flex items-center gap-2 text-warning text-sm">
                <AlertTriangle className="text-warning w-5 h-5" /> 
                {tShipmentMethods('deprecated')}
              </span>
            )}
          </div>}
          startContent={<Truck className="w-6 h-6"/>}
        >
          <div className="flex flex-col gap-2 mb-3">
            {profiles && profiles.map((profile,index) => (
              <div key={`${index}+profile`} className="relative flex items-center max-sm:pl-3 max-sm:mb-4 gap-1">
                <div className="flex max-sm:flex-col items-center w-full">
                  <Select onChange={ev => handleProfileChange(index,ev.target.value)} size="sm" label={tShipmentMethods('shipment_profile')} disabledKeys={selectedProfiles} defaultSelectedKeys={[profile.profileId]}>
                    {shipmentProfiles.length > 0 && shipmentProfiles.map(profile => (
                      <SelectItem key={profile._id} value={profile._id} textValue={profile.profileName} >
                        <div>{profile.profileName}</div>
                        <div className="text-xs text-textSecondary">{profile.profileDescription}</div>
                      </SelectItem>
                    ))}
                  </Select>
                  <div className="max-sm:hidden mx-2"> - </div>
                  <Input onChange={ev => handleProfileFeeChange(index, ev.target.value)} value={profile.profileFee} size="sm" type="number" label={tShipmentMethods('base_price')} placeholder={tShipmentMethods('base_price_description', {name: 'profile'})} />
                </div>
                <Tooltip color="danger" content={tMethodsButtons('delete')}>
                  <a onClick={() => removeProfile(index)} className="mx-2 text-lg text-danger cursor-pointer active:opacity-50">
                    <DeleteIcon height='20px' />
                  </a>
                </Tooltip>
              </div>
            ))}
            {selectedProfiles.length === shipmentProfiles.length ? (
              <div className="text-sm text-textSecondary">{tShipmentMethods('described_all_profiles')}</div>
            ) : (
              <div className="flex items-center mb-4 mr-auto text-default-600">
                <Button onClick={addProfile} type="button" className="w-9 h-9 p-0 mr-2 min-w-10 min-h-10" color="secondary" startContent={<CreateIcon />}></Button>
                <div className="text-sm">{tMethodsButtons('add_new', {name: 'profile'})}</div>
              </div>
            )}
          </div>
        </AccordionItem>
      </Accordion>
    </>)}
  </>);

  return (<>
    <div className="flex items-center mb-4 ml-4 text-default-600">
      <BackButton />
      <div className="absolute left-0 right-0 w-fit text-center text-2xl mx-auto">{tShipmentMethods('shipment_methods')}</div>
      <AddNewButton onOpen={onOpen} name="shipment_method" direction="rtl" />
    </div>
    <CustomTable items={shipmentMethods} columns={columns} editFunc={onEdit} deleteFunc={onDelete} shipmentProfiles={shipmentProfiles} countries={countriesExt}></CustomTable>

    <CustomModal
      isOpen={isOpen} onOpenChange={onOpenChange} 
      toDelete={shipmentMethodToDelete} toEdit={shipmentMethodToEdit} entity='shipment_profile' title={shipmentMethodToEdit?.name || shipmentMethodToDelete?.name}
      clearFunc={clearShipmentMethod} deleteFunc={deleteShipmentMethod} saveFunc={saveShipmentMethod} //ToDo: deprecated
      disableCondition={!name || countries.length === 0 || profiles.length === 0} providedBody={providedBody} 
    />
  </>);
};