import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import ShipmentProfilesSection from "@/components/shipment/ShipmentProfilesSection";
import ShipmentMethodsSection from "@/components/shipment/ShipmentMethodsSection";
import CountriesSection from "@/components/shipment/CountriesSection";
import { mongooseConnect } from "@/lib/mongoose";
import { ShipmentMethod } from "@/models/ShipmentMethod";
import { ShipmentProfile } from "@/models/ShipmentProfile";
import { Country } from "@/models/Country";
import { handleApiCall } from "@/lib/handlers";

export default function ShippingSettings({shipmentMethodsOrig, shipmentProfilesOrig, countriesOrig}) {
  const [shipmentMethods, setShipmentMethods] = useState(shipmentMethodsOrig);
  const [shipmentProfiles, setShipmentProfiles] = useState(shipmentProfilesOrig.sort((a, b) => a.sizeIndex - b.sizeIndex));
  const [countries, setCountries] = useState(countriesOrig);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getShipmentMethods();
    getShipmentProfiles();
    getCountries();
  }, []);

  async function getShipmentMethods() {
    setIsLoading(true);
    const res = await handleApiCall(axios.get('/api/shipment-methods'), 'fetching shipment methods', false);
    setShipmentMethods(res.data);
    setIsLoading(false);
  };
  async function getShipmentProfiles() {
    setIsLoading(true);
    const res = await handleApiCall(axios.get('/api/shipment-profiles'), 'fetching shipment profiles', false);
    let shipmentProfiles = res.data.sort((a, b) => a.sizeIndex - b.sizeIndex);
    setShipmentProfiles(shipmentProfiles);
    setIsLoading(false);
  };
  async function getCountries() {
    setIsLoading(true);
    const res = await handleApiCall(axios.get('/api/countries'), 'fetching countries', false);
    setCountries(res.data);
    setIsLoading(false);
  };

  return (<>
    <Layout>

      {isLoading || !shipmentMethods || !shipmentProfiles || !countries ? (
        <Spinner />
      ) : (<>
        <ShipmentMethodsSection shipmentMethods={shipmentMethods} shipmentProfiles={shipmentProfiles} countriesExt={countries} reloadData={getShipmentMethods} setIsLoading={setIsLoading}/>
        <CountriesSection countries={countries} reloadData={getCountries} setIsLoading={setIsLoading} />
        <ShipmentProfilesSection shipmentProfiles={shipmentProfiles} setShipmentProfiles={setShipmentProfiles} reloadData={getShipmentProfiles} setIsLoading={setIsLoading} />
        </>)}
    </Layout>
  </>);
};

export async function getServerSideProps(ctx) {
  await mongooseConnect();
  const shipmentMethods = await ShipmentMethod.find();
  const shipmentProfiles = await ShipmentProfile.find();
  const countries = await Country.find();
  return {
    props: {
      messages: (await import(`@/locales/${ctx.locale}.json`)).default,
      shipmentMethodsOrig: JSON.parse(JSON.stringify(shipmentMethods)),
      shipmentProfilesOrig: JSON.parse(JSON.stringify(shipmentProfiles)),
      countriesOrig: JSON.parse(JSON.stringify(countries))
    }
  };
};