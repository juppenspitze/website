import { Input, Tooltip } from "@nextui-org/react";
import { AlertTriangle, Check, Pencil, Stethoscope, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CountryCard({country, index, name, setName, saveCountry, deleteCountry, onEdit, onUnDeprecate}) {
  const tCountryButtons = useTranslations('Buttons');
  return (
    <div className={`relative flex items-center gap-3 h-[60px] px-4 transition-all duration-500 bg-background rounded-xl border border-solid border-border ${country.isDeprecated ? 'border-warning' : 'hover:border-primary'} shadow-sm select-none group`}>
      {country.isCreating ? (
        <div className="flex gap-3 items-center">
          <Input value={name} onChange={(ev) => setName(ev.target.value)} placeholder="Country name"/>
          <button onClick={saveCountry} size="sm" className="w-fit p-2 rounded-lg text-primary border border-solid border-primary hover:text-foreground hover:bg-primary">
            <Check className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="text-xl text-center">{country.name}</div>
      )}

      {!!country._id && !country.isCreating && !country.isDeprecated && (
        <div className="hidden group-hover:flex gap-2">
          <Tooltip content={tCountryButtons('edit')} placement="top">
            <button onClick={() => onEdit(country._id)} size="sm" className="w-fit p-2 rounded-lg text-primary border border-solid border-primary hover:text-foreground hover:bg-primary">
              <Pencil className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content={country.amountOfShipMethods > 0 ? (
            <div className="flex items-center gap-3 max-w-[150px] text-warning">
              <AlertTriangle className="w-4 min-w-[1rem] h-4 min-h-[1rem] text-warning" />
              Can&apos;t delete because it has {country.amountOfShipMethods} linked methods.
            </div>
          ) : tCountryButtons('delete')} placement="top">
            <button disabled={country.amountOfShipMethods > 0} onClick={() => deleteCountry(country,index)} size="sm" className="w-fit p-2 rounded-lg text-danger border border-solid border-danger disabled:opacity-70 disabled:hover:text-danger disabled:hover:border-danger disabled:hover:bg-transparent hover:text-foreground hover:bg-danger">
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      )}
      {!!country.isDeprecated && (
        <div className="hidden group-hover:flex">
          <Tooltip color="warning" content={tCountryButtons('undeprecate')}>
            <a onClick={() => onUnDeprecate(country)} className="text-lg text-warning cursor-pointer active:opacity-50">
              <Stethoscope className="w-5 h-5" />
            </a>
          </Tooltip>
        </div>
      )}
    </div>
  );
};