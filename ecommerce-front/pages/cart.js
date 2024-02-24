import {useContext, useEffect, useState, useRef} from "react";
import {CartContext} from "@/components/CartContext";
import Layout from "@/components/Globals/Layout";
import AddressForm from "@/components/Account/AddressForm";
import SelectedProductsSection from "@/components/Cart/Final/SelectedProductsSections";
import axios from "axios";
import MoneyLine from "@/components/Cart/Final/MoneyLine";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ShipmentMethod } from "@/models/ShipmentMethod";
import { mongooseConnect } from "@/lib/mongoose";
import { ShipmentProfile } from "@/models/ShipmentProfile";
import ShipingSection from "@/components/Cart/Final/ShipingSection";
import { Button } from "@/components/ui/button";
import { Country } from "@/models/Country";
import { uuidv4Regex } from "@/lib/regex";
import { useTranslations } from "next-intl";

export default function Cart({shipmentMethods,shipmentProfiles,countriesExt}) {
  const tCart = useTranslations('Cart');
  const tCartButtons = useTranslations('Buttons');

  const {cartProducts,clearCart} = useContext(CartContext);
  const [products,setProducts] = useState([]);

  const [data,setData] = useState(null);

  const [shipingMethods,setShippingMethods] = useState(shipmentMethods);
  const [selectedShipingMethod,setSelectedShipingMethod] = useState(null);

  const [profileFee,setProfileFee] = useState(0);
  const [countryFee,setCountryFee] = useState(0);
  const [vatPercentages,setVatPercentages] = useState([]);
  const [vatFee, setVatFee] = useState(0);

  const [isSuccess,setIsSuccess] = useState(false);
  const [biggestShipProfile,setBiggestShipProfile] = useState('');
  const hasPageSuccessRun = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasPageSuccessRun.current && window?.location.href.includes('success')) { 
      history.pushState(null, null, location.href);
      window.onpopstate = function () { history.go(1); };
      pageSuccess();
      hasPageSuccessRun.current = true;
    } else if (window?.location.href.includes('canceled')) { 
      history.pushState(null, null, location.href);
      window.onpopstate = function () { history.go(1); };
      pageCanceled(); 
    };
  }, []);

  useEffect(() => {
    if (cartProducts.length > 0) fetchCartProducts();
    else setProducts([]);
  }, [cartProducts]);
  async function fetchCartProducts() {
    const res = await axios.post('/api/cart', {ids:cartProducts, countryId:data?.countryId});
    if (res.data?.allProducts.length === 0) return;

    const prods = res.data.allProducts;
    let biggestShipProfile;

    prods.forEach(prod => {
      let currentProfile = shipmentProfiles.find(profile => profile._id === prod.profileId);
      if (!biggestShipProfile) biggestShipProfile = currentProfile;
      if (currentProfile.sizeIndex > biggestShipProfile?.sizeIndex) biggestShipProfile = currentProfile;
    });

    setProducts(prods);
    if (biggestShipProfile) setBiggestShipProfile(biggestShipProfile._id);
    if (res.data?.vatUniquePercentages) setVatPercentages(res.data.vatUniquePercentages);
  };

  useEffect(() => {
    if (cartProducts.every(id => uuidv4Regex.test(id))) {
      setProfileFee(0);
      setCountryFee(0);
      return
    };
    if (!selectedShipingMethod || !shipingMethods) return;
    let currentMethod = shipmentMethods.find(method => method._id === selectedShipingMethod);
    if (!currentMethod) return;

    if (biggestShipProfile) {
      let profileFee = currentMethod.profiles.find(p => p.profileId.toString() === biggestShipProfile)?.profileFee;
      setProfileFee(profileFee || 0);
    };

    if (data?.countryId) {
      let countryFee = currentMethod.countries.find(c => c.countryId === data.countryId)?.baseFee;
      setCountryFee(countryFee || 0);
    };
  }, [selectedShipingMethod, data?.countryId, biggestShipProfile]);

  async function pageSuccess() {
    let _id = window.location.href.split('success=')[1];
    let state = 'processing';
    await axios.put('/api/orders', {state, _id});
    setIsSuccess(true);
    clearCart();
    await axios.post(`/api/emails?orderId=${_id}`);
  };

  async function pageCanceled() {
    let _id = window.location.href.split('canceled=')[1];
    await axios.delete('/api/orders?_id='+_id);
  };
  async function goToPayment() {
    let fullData = {...data, cartProducts, products, vatFee, shipmentMethodId:selectedShipingMethod, profileId:biggestShipProfile};
    console.log(fullData);
    if (!fullData) return;
    const response = await axios.post('/api/checkout', fullData);
    if (!response.data.url) return;
    if (response.data.url.includes('canceled')) {
      await axios.delete('/api/orders?_id='+response.data.orderId);
    };
    window.location = response.data.url;
  };

  if (isSuccess) {
    return (
      <>
        <Layout>
          <div className='text-center mt-10'>
            <div className='text-2xl'>{tCart('thanks_for_order')}</div>
            <div>{tCart('thanks_description')}</div>
          </div>
        </Layout>
      </>
    );
  };
  if (cartProducts.length === 0) {
    return (
      <>
        <Layout>
          <div className='text-center mt-10'>
            <div className='text-2xl'>{tCart('your_cart_is_empty')}</div>
            <div>{tCart('empty_description')}</div>
          </div>
        </Layout>
      </>
    );
  };
  return (
    <>
      <Layout>
        <div className='flex flex-col gap-5 mt-4'>
          <MoneyLine cartProducts={cartProducts} products={products} countryId={data?.countryId} countryFee={countryFee} profileFee={profileFee} vatFee={vatFee} setVatFee={setVatFee} vatPercentages={vatPercentages}/>

          <Accordion type='multiple' defaultValue={['products']} collapsible="true" className="w-full">
            <AccordionItem value="products" >
              <AccordionTrigger>{tCart('products')}</AccordionTrigger>
              <AccordionContent>
                <SelectedProductsSection cartProducts={cartProducts} products={products} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem disabled={!(cartProducts?.length > 0)} value="shipAddress">
              <AccordionTrigger>{tCart('shipment_address')}</AccordionTrigger>
              <AccordionContent>
                <AddressForm page='cart' setData={setData} countriesExt={countriesExt} />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem disabled={!data} value="shipMethod">
              <AccordionTrigger>{tCart('shipment_method')}</AccordionTrigger>
              <AccordionContent>
                <ShipingSection shipingMethods={shipingMethods} setSelectedShipingMethod={setSelectedShipingMethod} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button onClick={goToPayment} disabled={!data || !selectedShipingMethod} className='w-full'>{tCartButtons('go_to_payment')}</Button>
        </div>
      </Layout>
    </>
  );
};

export async function getServerSideProps(ctx) {
  await mongooseConnect();
  const shipmentMethods = await ShipmentMethod.find();
  const shipmentProfiles = await ShipmentProfile.find();
  const countries = await Country.find();
  return {
    props:{
      messages: (await import(`@/locales/${ctx.locale}.json`)).default,
      shipmentMethods: JSON.parse(JSON.stringify(shipmentMethods)),
      shipmentProfiles: JSON.parse(JSON.stringify(shipmentProfiles)),
      countriesExt: JSON.parse(JSON.stringify(countries))
    }
  };
}
