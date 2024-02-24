import {useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Spinner from "@/components/Spinner";
import CustomTable from "@/components/Table";
import {Input, useDisclosure, Checkbox} from "@nextui-org/react";
import axios from "axios";
import DragAndDrop from "@/components/DragAndDrop";
import Editor from "@/components/Editor";
import { handleApiCall } from "@/lib/handlers";
import AddNewButton from "@/components/AddNewButton";
import { useTranslations } from "next-intl";
import CustomModal from "@/components/CustomModal";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { CustomTab, CustomTabs } from "@/components/CustomTabs";
import { useRouter } from "next/router";
import { toast } from "sonner";

export default function Authors() {
  const tAuthors = useTranslations('Buttons');
  const tAuthorsModal = useTranslations('Modal');
  const tLocaleAuthors = useTranslations('LocaleSwitcher');

  const [isLoading,setIsLoading] = useState(false);
  const [authors,setAuthors] = useState([]);
  const [authorName,setAuthorName] = useState('');
  const [description,setDescription] = useState({});
  const [image,setImage] = useState('');
  const [authorToEdit,setAuthorToEdit] = useState(null);
  const [authorToDelete,setAuthorToDelete] = useState(null);

  const [filteredAuthors,setFilteredAuthors] = useState([]);
  const [isShowingDeprecated,setIsShowingDeprecated] = useState(false);
  const [isDeprecatable, setIsDeprecatable] = useState(false);

  let {locales} = useRouter();
  locales = locales.filter(loc => loc !== 'default');

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  useEffect(() => {
    setIsLoading(true);
    fetchAuthors();
  }, []);

  async function fetchAuthors() {
    const res = await handleApiCall(axios.get('/api/authors'), 'fetching authors', false);
    setAuthors(res.data);
    if (isShowingDeprecated) setFilteredAuthors(res.data);
    else setFilteredAuthors(res.data.filter(author => !author.isDeprecated));
    setIsLoading(false);
  };

  function filterAuthors(ev) {
    setIsShowingDeprecated(ev.target.checked);
    if (ev.target.checked) {
      setFilteredAuthors(authors);
    } else {
      setFilteredAuthors(authors.filter(author => !author.isDeprecated));
    };
  };

  async function saveAuthor() {
    if (authorName && description && image) {
      const data = { authorName,description,image };
      if (authorToEdit) {
        let _id = authorToEdit._id;
        await handleApiCall(axios.put('/api/authors', {...data, _id}), 'updating author');
      } else { await handleApiCall(axios.post('/api/authors', data), 'creating author'); };
      fetchAuthors();
      clearAuthor();
    };
  };

  function onEditAuthor(author) {
    setAuthorToEdit(author);
    setAuthorName(author.authorName);
    setDescription(author.description || {});
    setImage(author.image);
    onOpen();
  };

  function handleDescriptionChange(locale, html) {
    if (!locale) locale = 'en';
    setDescription(prev => {
      const newDescription = {...prev};
      if (html === '<p class="editor-paragraph"><br></p>') html = '';
      newDescription[locale] = html;
      return newDescription;
    });
  };

  async function onDeleteAuthor(author) {
    await checkDeprecatable(author);
    onOpen();
  };
  async function onUnDeprecate(author) {
    const {_id} = author;
    await handleApiCall(axios.put('/api/authors', {_id, isDeprecated:false}), 'un-deprecating author');
    fetchAuthors();
  };

  async function checkDeprecatable(author) {
    if (!author) {
      toast.info('No author selected.');
      return;
    };
    let productCount = await handleApiCall(axios.get('/api/products?authorId='+author._id), 'fetching author products');

    if (productCount.data > 0) setIsDeprecatable(true);
    else setIsDeprecatable(false);
    setAuthorToDelete(author); 
  };

  async function deleteAuthor() {
    await handleApiCall(axios.delete('/api/authors?id='+authorToDelete._id), 'deleting author');
    fetchAuthors();
    clearAuthor();
  };
  async function deprecateAuthor(){
    const {_id} = authorToDelete;
    await handleApiCall(axios.put('/api/authors', {_id, isDeprecated:true}), 'deprecating author');
    fetchAuthors();
    setAuthorToDelete(null);
    setIsDeprecatable(false);
    onOpenChange();
  };

  function clearAuthor() {
    setAuthorName('');
    setDescription('');
    setImage('');
    setAuthorToEdit(null);
    setAuthorToDelete(null);
    onOpenChange();
  };

  function onFilesChange(files) {
    setImage(files[0]?.link);
  }

  const columns = [
    {name: "image", uid: "authorImage"},
    {name: "name", uid: "authorName"},
    {name: "description", uid: "description"},
    {name: "actions", uid: "actions"}
  ];

  const providedBody = (<>
    {authorToDelete && isDeprecatable && (<>
      <div>{tAuthorsModal('deprecate_description', {name: 'author'})}</div>
      <div className="flex items-center gap-1">
        {tAuthorsModal('refer_to_docs')}
        <Link target="_blank" href='/settings/docs' className="text-primary"><HelpCircle className="w-4 h-4" /></Link>
      </div>
    </>)}
    {authorToDelete && !isDeprecatable && (
      tAuthorsModal('delete_description', {name: 'author'})
    )}
    {!authorToDelete && !isDeprecatable && (<>
      <div className="flex flex-col gap-1 mb-3">
        <div className="text-textSecondary capitalize">{tAuthorsModal('name', {name: 'author'})}</div>
        <Input size='sm' className="" value={authorName} onChange={ev => setAuthorName(ev.target.value)} isRequired label="Author" placeholder="Author name" />
      </div>

      <div className="flex flex-col gap-1 mb-3">
        <div className="text-textSecondary capitalize">{tAuthorsModal('description', {name: 'author'})}</div>

        <CustomTabs>
          {locales.map((loc) => (
            <CustomTab key={loc} title={tLocaleAuthors('switchLocale', {locale: loc})}>
              <Editor onHtmlChange={handleDescriptionChange} locale={loc} initialHtml={description?.[loc] || ''} />
            </CustomTab>
          ))}
        </CustomTabs>
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-textSecondary">{tAuthorsModal('file', {amount: 1})}</div>
        <DragAndDrop onFilesChange={onFilesChange} existingFiles={image} maxFiles={1}/>
      </div>
    </>)}
  </>);

  return (<>
    <Layout>
      {isLoading ? (
        <Spinner />
      ) : (<>
        <div className="flex items-center mb-4 ml-4 text-default-600">
          <AddNewButton onOpen={onOpen} name='author' />
          <Checkbox color="warning" className="ml-auto" onChange={(ev) => filterAuthors(ev)}>{tAuthors('show_deprecated', {name: 'authors'})}</Checkbox>
        </div>
        <CustomTable items={filteredAuthors} columns={columns} editFunc={onEditAuthor} deleteFunc={onDeleteAuthor} unDeprecateFunc={onUnDeprecate}></CustomTable>
      </>)}
    </Layout>

    <CustomModal 
      isOpen={isOpen} onOpenChange={onOpenChange} 
      toDelete={authorToDelete} toEdit={authorToEdit} entity='author' title={authorToEdit?.authorName || authorToDelete?.authorName}
      clearFunc={clearAuthor} deleteFunc={deleteAuthor} saveFunc={saveAuthor} deprecateFunc={deprecateAuthor}
      isDeprecatable={isDeprecatable} disableCondition={!authorName || !description || !image} providedBody={providedBody} 
    />
  </>);
};

export async function getServerSideProps(context) {
  return {
    props:{
      messages: (await import(`@/locales/${context.locale}.json`)).default,
    }
  };
};