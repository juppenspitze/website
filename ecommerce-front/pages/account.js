import {RevealWrapper} from "next-reveal";
import Layout from "@/components/Globals/Layout";
import AddressForm from "@/components/Account/AddressForm";
import TabsAndWishList from "@/components/Account/TabsAndWishList";
import { mongooseConnect } from "@/lib/mongoose";
import { Country } from "@/models/Country";

export default function AccountPage(countriesExt) {
  console.log(countriesExt)
  return (
    <>
      <Layout>
        <div className="flex gap-10 my-10 [&p]:m-1.5">
          <div className="flex-1">
            <RevealWrapper delay={0}>
              <TabsAndWishList />
            </RevealWrapper>
          </div>
          <div className="flex-1">
            <RevealWrapper delay={100}>
              <AddressForm page='account' countriesExt={countriesExt.countriesExt}/>
            </RevealWrapper>
          </div>
        </div>
      </Layout>
    </>
  );
};

export async function getServerSideProps(ctx) {
  await mongooseConnect();
  const countriesExt = await Country.find();
  return {
    props:{
      messages: (await import(`@/locales/${ctx.locale}.json`)).default,
      countriesExt: JSON.parse(JSON.stringify(countriesExt)),
    }
  };
};