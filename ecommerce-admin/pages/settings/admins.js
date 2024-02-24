import Layout from "@/components/Layout";
import React from "react";
import {useEffect, useState, useMemo} from "react";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { Input, useDisclosure } from "@nextui-org/react";
import CustomTable from "@/components/Table";
import BackButton from "@/components/BackButton";
import { handleApiCall } from "@/lib/handlers";
import { toast } from "sonner";
import AddNewButton from "@/components/AddNewButton";
import CustomModal from "@/components/CustomModal";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

export default function AdminsPage() {
  const tAdminsModal = useTranslations('Modal');

  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [adminEmails,setAdminEmails] = useState([]);
  const [deletingAdmin, setDeletingAdmin] = useState('');
  const [adminToEdit, setAdminToEdit] = useState('');

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  
  const [isLoading,setIsLoading] = useState(false);

  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const validateEmail = (email) => email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);
  const isInvalid = useMemo(() => {
    if (email === "") return false;
    return validateEmail(email) ? false : true;
  }, [email]);

  async function addAdmin(ev){
    ev.preventDefault();
    if (adminToEdit) {
      const {_id} = adminToEdit;
      await handleApiCall(axios.put('/api/admins', {_id,email,password}), 'editing admin');
    } else {
      await handleApiCall(axios.post('/api/admins', {email,password}), 'creating admin');
    };
    stopAdminAction();
    loadAdmins();
  };
  function onDelete(adminToDelete) {
    if (!adminToDelete) return;
    setDeletingAdmin(adminToDelete);
    onOpen();
  };
  function onEdit(adminToEdit) {
    if (!adminToEdit) return;
    setAdminToEdit(adminToEdit);
    setEmail(adminToEdit.email);
    setPassword(adminToEdit.normalPassword);
    onOpen();
  };
  async function deleteAdmin() {
    if (adminEmails.length === 1) {
      toast.info('You cannot remove the last admin.');
      return;
    };
    if (deletingAdmin) {
      await handleApiCall(axios.delete('/api/admins?_id='+deletingAdmin._id), 'deleting admin');
      setDeletingAdmin('');
      onOpenChange();
      loadAdmins();
    }
  }
  async function loadAdmins() {
    setIsLoading(true);
    const res = await handleApiCall(axios.get('/api/admins'), 'fetching admins', false);
    setAdminEmails(res.data);
    setIsLoading(false);
  }
  function stopAdminAction() {
    setEmail('');
    setPassword('');
    setDeletingAdmin('');
    setAdminToEdit('');
    onOpenChange();
  }
  useEffect(() => {
    loadAdmins();
  }, []);

  const columns = [
    {name: 'google_email', uid: "email"},
    {name: 'creation_date', uid: "date"},
    {name: 'actions', uid: "actions"},
  ];

  const providedBody = (<>
    {deletingAdmin? (
      tAdminsModal('delete_description', {name: 'admin'})
    ) : (
      <>
        <div className="flex flex-col gap-3">
          <Input size="sm" isRequired label="Email" type="email" className={isInvalid ? 'border border-danger rounded-xl mb-0' : 'mb-0'} value={email} onChange={ev => setEmail(ev.target.value)} placeholder="google email"/>

          <Input size="sm" isRequired label="Password" type={isVisible ? "text" : "password"} className={isInvalid ? 'border border-danger rounded-xl mb-0' : 'mb-0'} value={password} onChange={ev => setPassword(ev.target.value)} placeholder="Password"
            endContent={
              <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Eye className="w-5 h-5 text-default-400 pointer-events-none" />
                ) : (
                  <EyeOff className="w-5 h-5 text-default-400 pointer-events-none" />
                )}
              </button>
            } 
          />
        </div>
        {isInvalid && (<div className="text-[12px] ml-3 mt-[-10px] text-textSecondary">{tAdminsModal('incorrect_email')}</div>)}
        
      </>
    )}
  </>);

  return (<>
    <Layout>
      {isLoading ? (
        <Spinner />
      ) : (<>
        <div className="flex items-center mb-4 ml-4 text-default-600">
          <BackButton />
          <AddNewButton onOpen={onOpen} name="admin" direction="rtl" />
        </div>
        <CustomTable items={adminEmails} columns={columns} deleteFunc={onDelete} editFunc={onEdit}></CustomTable>
      </>)}
    </Layout>

    <CustomModal 
      isOpen={isOpen} onOpenChange={onOpenChange} 
      toDelete={deletingAdmin} toEdit={adminToEdit} entity='admin' title='admin'
      clearFunc={stopAdminAction} deleteFunc={deleteAdmin} saveFunc={addAdmin} 
      disableCondition={isInvalid} providedBody={providedBody} 
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