import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import Spinner from "../Globals/Spinner";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export default function AddressForm({ page, setData, countriesExt }) {
  const tAddressForm = useTranslations('AddressForm');
  const tAddressFormButtons = useTranslations('Buttons');

  const { data: session } = useSession();
  const [countries, setCountries] = useState(countriesExt);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [billCity, setBillCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [billPostalCode, setBillPostalCode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [billStreetAddress, setBillStreetAddress] = useState("");
  const [countryId, setCountryId] = useState("");
  const [billCountry, setbillCountry] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAllData, setIsAllData] = useState(false);
  const [isBillAddress, setIsBillAddress] = useState(false);
  const [addressLoaded, setAddressLoaded] = useState(false);

  const [isValidEmail, setIsValidEmail] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    if (session === null) {
      setAddressLoaded(true);
      return;
    };
    axios.get("/api/address").then((response) => {
      if (response.data) {
        let rd = response.data;
        onEmailChange(rd.email);
        setName(rd.name);
        setEmail(rd.email);

        setCity(rd.city);
        setPostalCode(rd.postalCode);
        setStreetAddress(rd.streetAddress);
        setCountryId(rd.countryId);

        setBillCity(rd.billCity);
        setBillPostalCode(rd.billPostalCode);
        setBillStreetAddress(rd.billStreetAddress);
        setbillCountry(rd.billCountry);
        setIsBillAddress(rd.isBillAddress);
      }
    });

    setAddressLoaded(true);
  }, []);

  useEffect(() => {
    isAllDataChecker();
  }, [name, email, city, postalCode, streetAddress, countryId, billCity, billPostalCode, billStreetAddress, billCountry, isBillAddress]);

  function isAllDataChecker() {
    if (name && email && city && postalCode && streetAddress && countryId && !isBillAddress) {setIsAllData(true)}
    else if (name && email && city && postalCode && streetAddress && countryId && isBillAddress && billCity && billPostalCode && billStreetAddress && billCountry && isBillAddress) setIsAllData(true);
    else setIsAllData(false);
  };

  async function logout() {
    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_URL });
  };
  async function login() {
    await signIn("google");
  };

  async function saveAddress() {
    setIsSaving(true);
    let data;
    if (isBillAddress) {
      data = {name,email,city,streetAddress,postalCode,countryId,billCity,billStreetAddress,billPostalCode,billCountry,isBillAddress};
    } else {
      data = {name,email,city,streetAddress,postalCode,countryId,billCity: "",billStreetAddress: "",billPostalCode: "",billCountry: "",isBillAddress: false};
    };
    await axios.put("/api/address", data);
    toast({
      title: "Account details saved",
      description: "Your account details has been successfully saved.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setIsEditing(false);
    setIsSaving(false);
  };

  const validateEmail = (email) => email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);
  function onEmailChange(newEmail) {
    if (newEmail === "") return;
    setIsValidEmail(validateEmail(email) ? true : false);
    setEmail(newEmail);
  };

  function throwDataUp() {
    console.log('coutry', countryId)
    if (isBillAddress) { setData({name,email,city,streetAddress,postalCode,countryId,billCity,billStreetAddress,billPostalCode,billCountry,isBillAddress}); }
    else { setData({name,email,city,streetAddress,postalCode,countryId,billCity:'',billStreetAddress:'',billPostalCode:'',billCountry:'',isBillAddress:false}); };
  };

  return (
    <>
      <div className="rounded-lg px-1">
        {session && page === "account" && (
          <h2 className="mb-2">{tAddressForm('account_details')}</h2>
        )}
        {!addressLoaded && <Spinner />}
        {addressLoaded && (
          <>
            <Input disabled={!isEditing} type="text" placeholder={tAddressForm('full_name')} value={name} name="name" onChange={(ev) => setName(ev.target.value)}
            />
            <Input disabled={!isEditing} type="text" placeholder={tAddressForm('email')} name="email" value={email} onChange={(ev) => onEmailChange(ev.target.value)}
            />
            {isValidEmail && (
              <div className="mt-[-5px] mb-1 text-sm text-red-400">
                {tAddressForm('invalid_email')}
              </div>
            )}

            <div className="flex gap-1.5">
              <Input disabled={!isEditing} type="text" placeholder={tAddressForm('city')} value={city} name="city" onChange={(ev) => setCity(ev.target.value)}
              />
              <Input disabled={!isEditing} type="text" placeholder={tAddressForm('postal_code')} value={postalCode} name="postalCode" onChange={(ev) => setPostalCode(ev.target.value)}
              />
            </div>
            <Input disabled={!isEditing} type="text" placeholder={tAddressForm('street_address')} value={streetAddress} name="streetAddress" onChange={(ev) => setStreetAddress(ev.target.value)}
            />
            <Select disabled={!isEditing} onValueChange={(ev) => setCountryId(ev)} value={countryId}>
              <SelectTrigger>
                <SelectValue placeholder={tAddressForm('select_country')} />
              </SelectTrigger>
              <SelectContent>
                {countries.length > 0 && countries.map((country) => (
                  <SelectItem key={country._id} value={country._id}>
                    <div>{country.name}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          {isEditing ? (
            <div className="flex items-center gap-2 my-4">
              <Checkbox className="" type="checkbox" checked={isBillAddress} onCheckedChange={(ev) => setIsBillAddress((prev) => !prev)}
              />
              <span>{tAddressForm('use_different_billing_address')}</span>
            </div>
          ) : (
            <div className='my-2'>{tAddressForm('your_billing_address')}</div>
          )}

            {isBillAddress && (
              <>
                <div className="flex gap-1.5">
                  <Input disabled={!isEditing} type="text" placeholder={tAddressForm('billing_city')} value={billCity} name="billCity" onChange={(ev) => setBillCity(ev.target.value)}
                  />
                  <Input disabled={!isEditing} type="text" placeholder={tAddressForm('billing_postal_code')} value={billPostalCode} name="billPostalCode" onChange={(ev) => setBillPostalCode(ev.target.value)}
                  />
                </div>
                <Input disabled={!isEditing} type="text" placeholder={tAddressForm('billing_street_address')} value={billStreetAddress} name="billStreetAddress" onChange={(ev) => setBillStreetAddress(ev.target.value)}
                />
                <Input disabled={!isEditing} type="text" placeholder={tAddressForm('billing_country')} value={billCountry} name="billCountry" onChange={(ev) => setbillCountry(ev.target.value)}
                />
              </>
            )}

            {page === "account" && isEditing && (
              <Button className="my-2 w-full" onClick={saveAddress} disabled={isValidEmail || !isAllData || isSaving}>
                {isSaving ? (
                  <span>{tAddressFormButtons('saving')}</span>
                ) : (
                  <span>{tAddressFormButtons('save')}</span>
                )}
              </Button>
            )}
            {page === "account" && !isEditing && (
              <Button className="my-2 w-full" onClick={() => setIsEditing(true)}>{tAddressFormButtons('edit')}</Button>
            )}
          </>
        )}
        {page === "account" && (<>
          {session ? (
            <Button variant="secondary" className="w-full" onClick={logout}>
              {tAddressFormButtons('logout')}
            </Button>
          ) : (
            <Button className="w-full" onClick={login}>
              {tAddressFormButtons('login_with_google')}
            </Button>
          )}
        </>)}
        {page === "cart" && <Button onClick={throwDataUp}>{tAddressFormButtons('confirm')}</Button>}
      </div>
    </>
  );
};
