import ShipmentProfileCard from "./ShipmentProfileCard";
import { Boxes, Combine, HelpCircle, PlusCircle } from "lucide-react";
import {Input, useDisclosure, Accordion, AccordionItem, Kbd,} from "@nextui-org/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { ReactSortable } from "react-sortablejs";
import { handleApiCall } from "@/lib/handlers";
import { useTranslations } from "next-intl";
import CustomModal from "../CustomModal";
import Link from "next/link";
import { toast } from "sonner";

export default function ShipmentProfilesSection({shipmentProfiles,setShipmentProfiles,reloadData,setIsLoading}) {
  const tShipmentProfiles = useTranslations('Shipping.Profiles');
  const tShipmentModal = useTranslations('Modal');

  const [shipmentProfileToEdit, setShipmentProfileToEdit] = useState('');
  const [shipmentProfileToDelete, setShipmentProfileToDelete] = useState('');

  const [profileName, setProfileName] = useState('');

  const [minWeight, setMinWeight] = useState('');
  const [maxWeight, setMaxWeight] = useState('');

  const [minHeight, setMinHeight] = useState('');
  const [maxHeight, setMaxHeight] = useState('');

  const [minWidth, setMinWidth] = useState('');
  const [maxWidth, setMaxWidth] = useState('');

  const [minDepth, setMinDepth] = useState('');
  const [maxDepth, setMaxDepth] = useState('');

  const [sizeIndex, setSizeIndex] = useState(-1);

  const [profileDescription, setProfileDescription] = useState('');

  const [isDeprecatable, setIsDeprecatable] = useState(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  async function saveShipmentProfile() {
    setIsLoading(true);
    const data = { profileName,sizeIndex,profileDescription,minWeight,maxWeight,minHeight,maxHeight,minWidth,maxWidth,minDepth,maxDepth };
    if (shipmentProfileToEdit) {
      let _id = shipmentProfileToEdit._id;
      await handleApiCall(axios.put('/api/shipment-profiles', {...data, _id}), 'updating shipment profile');
    } else {
      await handleApiCall(axios.post('/api/shipment-profiles', { ...data }), 'creating shipment profile');
    };
    setIsLoading(false);
    clearShipmentProfile();
    reloadData();
  };

  async function onDelete(shipmentProfile) {
    await checkDeprecatable(shipmentProfile);
    onOpen();
  };
 
  async function deleteShipmentProfile() {
    setIsLoading(true);
    await handleApiCall(axios.delete('/api/shipment-profiles?id='+shipmentProfileToDelete._id), 'deleting shipment profile');
    setIsLoading(false);
    setShipmentProfileToDelete({});
    reloadData();
  };
  async function deprecateShipmentProfile(){
    const {_id} = shipmentProfileToDelete;
    await handleApiCall(axios.put('/api/shipment-profiles', {_id, isDeprecated:true}), 'deprecating shipent profile');
    reloadData();
    setShipmentProfileToDelete(null);
    setIsDeprecatable(false);
    onOpenChange();
  };
  async function onUnDeprecate(country) {
    const {_id} = country;
    await handleApiCall(axios.put('/api/shipment-profiles', {_id, isDeprecated:false}), 'un-deprecating shipment profile');
    reloadData();
  };
  async function checkDeprecatable(shipmentProfile) {
    if (!shipmentProfile) {
      toast.info('No shipment profile selected.');
      return;
    };
    let methodsCount = await handleApiCall(axios.get('/api/shipment-methods?profileId='+shipmentProfile._id), 'fetching profile methods', false);

    if (methodsCount.data > 0) setIsDeprecatable(true);
    else setIsDeprecatable(false);
    setShipmentProfileToDelete(shipmentProfile);
  };

  function onEdit(shipmentProfile) {
    if (!shipmentProfile) return;
    setShipmentProfileToEdit(shipmentProfile);
    setProfileName(shipmentProfile.profileName);
    setProfileDescription(shipmentProfile.profileDescription);
    setMinWeight(shipmentProfile.minWeight);
    setMaxWeight(shipmentProfile.maxWeight);
    setMinHeight(shipmentProfile.minHeight);
    setMaxHeight(shipmentProfile.maxHeight);
    setMinWidth(shipmentProfile.minWidth);
    setMaxWidth(shipmentProfile.maxWidth);
    setMinDepth(shipmentProfile.minDepth);
    setMaxDepth(shipmentProfile.maxDepth);
    onOpen();
  };

  function clearShipmentProfile() {
    setShipmentProfileToEdit('');
    setShipmentProfileToDelete('');
    setProfileName('');
    setProfileDescription('');
    setMinWeight('');
    setMaxWeight('');
    setMinHeight('');
    setMaxHeight('');
    setMinWidth('');
    setMaxWidth('');
    setMinDepth('');
    setMaxDepth('');
    setIsDeprecatable(false);
    onOpenChange();
  };

  async function updateProfilesChart(profiles) {
    if (!profiles) return;
    for (let i = 0; i < profiles.length; i++) {
      if (profiles[i].sizeIndex !== i && profiles[i]._id) {
        profiles[i].sizeIndex = i;
        await handleApiCall(axios.put('/api/shipment-profiles', {_id:profiles[i]._id, sizeIndex:i}), 'updating shipment profile order', false);
      };
    };
    if (shipmentProfileToEdit) { setSizeIndex(profiles.findIndex(profile => profile._id === shipmentProfileToEdit._id));
    } else { setSizeIndex(profiles.findIndex(profile => profile.fake)); };
    setShipmentProfiles(profiles);
  };

  useEffect(() => {
    if ((!profileName && !minWeight && !maxWeight && !minHeight && !maxHeight && !minWidth && !maxWidth && !minDepth && !maxDepth) || shipmentProfileToEdit) {
      setShipmentProfiles(shipmentProfiles.filter(profile => !profile.fake));
      return;
    };
    
    let index;
    if (sizeIndex === -1)index = shipmentProfiles.length+1;
    else index = sizeIndex;
    let currentProfile = {profileName,sizeIndex:index,minWeight,maxWeight,minHeight,maxHeight,minWidth,maxWidth,minDepth,maxDepth,fake:true};
    setSizeIndex(index);

    let newProfiles = structuredClone(shipmentProfiles);
    if (newProfiles.find(profile => profile.fake)) {
      newProfiles = newProfiles.filter(profile => !profile.fake);
    };
    newProfiles.push(currentProfile);
    setShipmentProfiles(newProfiles);
  }, [profileName,minWeight,maxWeight,minHeight,maxHeight,minWidth,maxWidth,minDepth,maxDepth]);

  const providedBody = (<>
    {shipmentProfileToDelete && isDeprecatable && (<>
      <div>{tShipmentModal('deprecate_description', {name: 'shipment_profile'})}</div>
      <div className="flex items-center gap-1">
        {tShipmentModal('refer_to_docs')}
        <Link target="_blank" href='/settings/docs' className="text-primary"><HelpCircle className="w-4 h-4" /></Link>
      </div>
    </>)}
    {shipmentProfileToDelete && !isDeprecatable && (
      tShipmentModal('delete_description', {name: 'shipment_profile'})
    )}
    {!shipmentProfileToDelete && !isDeprecatable &&(<>
      <div className="flex flex-col gap-2 mb-3">
        <div>{tShipmentProfiles('shipment_profile_name')}</div>
        <Input size='md' className="" value={profileName} onChange={ev => setProfileName(ev.target.value)} type="text" isRequired placeholder={tShipmentProfiles('shipment_profile_name_description')} />
      </div>
      <div className="flex flex-col gap-2 ">
        <div>{tShipmentProfiles('shipment_profile_description')}</div>
        <Input size='md' className="" value={profileDescription} onChange={ev => setProfileDescription(ev.target.value)} type="text" isRequired placeholder={tShipmentProfiles('shipment_profile_descr_descr')} />
      </div>

      <Accordion selectionMode="multiple">
        <AccordionItem key="1" aria-label={tShipmentProfiles('dimentions')} title={tShipmentProfiles('dimentions')} startContent={<Boxes className="w-6 h-6"/>}>
          <div className="flex flex-col gap-2 mb-3 mt-[-10px]">
            <div>{tShipmentProfiles('weight', {size: 'none'})}</div>
            <div className="flex max-sm:flex-col items-center w-full">
              <Input className="max-sm:mb-2" onChange={ev => setMinWeight(ev.target.value)} value={minWeight} size="sm" type="number" label={tShipmentProfiles('weight', {size: 'min'})} placeholder={tShipmentProfiles('weight_description', {size: 'min'})} />
              <div className="max-sm:hidden mx-2"> - </div>
              <Input onChange={ev => setMaxWeight(ev.target.value)} value={maxWeight} size="sm" type="number" label={tShipmentProfiles('weight', {size: 'max'})} placeholder={tShipmentProfiles('weight_description', {size: 'max'})} />
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-3">
            <div>{tShipmentProfiles('width', {size: 'none'})}</div>
            <div className="flex max-sm:flex-col items-center w-full">
              <Input className="max-sm:mb-2" onChange={ev => setMinWidth(ev.target.value)} value={minWidth} size="sm" type="number" label={tShipmentProfiles('width', {size: 'min'})} placeholder={tShipmentProfiles('width_description', {size: 'min'})} />
              <div className="max-sm:hidden mx-2"> - </div>
              <Input onChange={ev => setMaxWidth(ev.target.value)} value={maxWidth} size="sm" type="number" label={tShipmentProfiles('width', {size: 'max'})} placeholder={tShipmentProfiles('width_description', {size: 'max'})} />
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-3">
            <div>{tShipmentProfiles('height', {size: 'none'})}</div>
            <div className="flex max-sm:flex-col items-center w-full">
              <Input className="max-sm:mb-2" onChange={ev => setMinHeight(ev.target.value)} value={minHeight} size="sm" type="number" label={tShipmentProfiles('height', {size: 'min'})} placeholder={tShipmentProfiles('height_description', {size: 'min'})} />
              <div className="max-sm:hidden mx-2"> - </div>
              <Input onChange={ev => setMaxHeight(ev.target.value)} value={maxHeight} size="sm" type="number" label={tShipmentProfiles('height', {size: 'max'})} placeholder={tShipmentProfiles('height_description', {size: 'max'})} />
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-3">
            <div>{tShipmentProfiles('depth', {size: 'none'})}</div>
            <div className="flex max-sm:flex-col items-center w-full">
              <Input className="max-sm:mb-2" onChange={ev => setMinDepth(ev.target.value)} value={minDepth} size="sm" type="number" label={tShipmentProfiles('depth', {size: 'min'})} placeholder={tShipmentProfiles('depth_description', {size: 'min'})} />
              <div className="max-sm:hidden mx-2"> - </div>
              <Input onChange={ev => setMaxDepth(ev.target.value)} value={maxDepth} size="sm" type="number" label={tShipmentProfiles('depth', {size: 'max'})} placeholder={tShipmentProfiles('depth_description', {size: 'max'})} />
            </div>
          </div>
        </AccordionItem>
        <AccordionItem key="2" aria-label={tShipmentProfiles('size_chart')}  title={tShipmentProfiles('size_chart')} startContent={<Combine className="w-6 h-6"/>}>
          <div>{tShipmentProfiles('sort_the_profiles')}</div>
          <div className="text-sm text-textSecondary">{tShipmentProfiles('sort_description')}</div>
          <div className="flex flex-wrap gap-5 mt-6">
            <ReactSortable className="flex items-center flex-wrap gap-2" list={shipmentProfiles} setList={updateProfilesChart}>
              {shipmentProfiles && shipmentProfiles.map((profile,index) => (
                <div className="relative" key={`${profile._id}+${index}+sortable`}>
                  <div className="absolute top-[-14px] text-xl text-textSecondary">{index+1 < 10 ? `0${index+1}` : index+1}</div>
                  <ShipmentProfileCard profile={profile} isMini={true} isCurrentlyEditing={profile.fake || profile._id === shipmentProfileToEdit._id}/>
                </div>
              ))}
            </ReactSortable>
          </div>
        </AccordionItem>
      </Accordion>

    </>)}
  </>);

  return (<>
    <div className="mt-10 mb-6 text-center text-2xl">{tShipmentProfiles('shipment_profiles')}</div>

    <div className="flex flex-wrap gap-5 w-full px-3">
      <div onClick={onOpen} className="flex flex-col w-64 h-72 p-4 bg-background rounded-xl border border-solid border-border hover:border-primary shadow-sm select-none cursor-pointer group">
        <div className="text-xl text-center mb-5">{tShipmentProfiles('create_new_profile')}</div>
        <PlusCircle className="w-10 h-10 m-auto text-textSecondary group-hover:text-primary"/>
      </div>
      
      {shipmentProfiles && shipmentProfiles.map((profile,index) => (
        <ShipmentProfileCard key={`${profile._id}+${index}+card`} profile={profile} onEdit={onEdit} onDelete={onDelete} onUnDeprecate={onUnDeprecate} />
      ))}
    </div>

    
    <CustomModal
      isOpen={isOpen} onOpenChange={onOpenChange} 
      toDelete={shipmentProfileToDelete} toEdit={shipmentProfileToEdit} entity='shipment_profile' 
      title={shipmentProfileToEdit?.profileName || shipmentProfileToDelete?.profileName}
      clearFunc={clearShipmentProfile} deleteFunc={deleteShipmentProfile} saveFunc={saveShipmentProfile} deprecateFunc={deprecateShipmentProfile}
      isDeprecatable={isDeprecatable} providedBody={providedBody} 
    />
  </>);
};