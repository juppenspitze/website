import AuthorCard from "@/components/AuthorCard";
import Layout from "@/components/Globals/Layout"
import { mongooseConnect } from "@/lib/mongoose";
import { Author } from "@/models/Author";
import { useTranslations } from "next-intl";

export default function Authors({authors}) {
  console.log(authors);
  const tAuthors = useTranslations('Authors');
  return (
    <Layout>
      <div className="flex flex-wrap gap-8">
        {authors && authors.map(author => (
          <AuthorCard className='flex-1' key={author._id} author={author} />
        ))} 
      </div>

      {!authors && <p>{tAuthors('no_authors')}</p>}
    </Layout>
  );
};

export async function getServerSideProps(ctx) {
  await mongooseConnect();
  const authors = await Author.find({}, null, {sort:{'authorName':1}});
  return {
    props:{
      messages: (await import(`@/locales/${ctx.locale}.json`)).default,
      authors: JSON.parse(JSON.stringify(authors)),
    }
  };
}