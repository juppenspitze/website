import BackButton from "@/components/BackButton";
import Layout from "@/components/Layout";
import { useTranslations } from "next-intl";

export default function DocsPage () {
  const tDocs = useTranslations('Docs');
  return (
    <Layout>
      <div className="flex items-center mb-4 ml-4">
        <BackButton />
      </div>
      <h2 className="text-center">
        {tDocs('nothing_here')}
      </h2>
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