import AddNewButton from "@/components/AddNewButton";
import BackButton from "@/components/BackButton";
import Layout from "@/components/Layout";
import Spinner from "@/components/Spinner";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function email_templates() {
  const tEmailsModal = useTranslations('Modal');
  const [isLoading,setIsLoading] = useState(false);

  return (
    <Layout>
      {isLoading ? (
        <Spinner />
      ) : (<>
        <div className="flex items-center mb-4 ml-4 text-default-600">
          <BackButton />
          <AddNewButton  name="email_template" direction="rtl" />
        </div>
      </>)}
    </Layout>
  );
};

export async function getServerSideProps(context) {
  return {
    props:{
      messages: (await import(`@/locales/${context.locale}.json`)).default,
    }
  };
};