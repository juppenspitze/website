import { Button } from "@nextui-org/react";
import { Trash2,Pencil, Stethoscope } from "lucide-react";
import ShipmentProfileCardData from "./ShipmentProfileCardData";
import { useTranslations } from "next-intl";

export default function ShipmentProfileCard({profile, onEdit, onDelete, isMini, isCurrentlyEditing, onUnDeprecate}) {
  const tProfileButtons = useTranslations('Buttons');
  return (
    <div className={`${isMini ? 'max-w-[12rem] max-h-72 px-5 cursor-move' : 'w-64 h-72'} flex flex-col p-4 bg-background rounded-xl border border-solid border-border ${profile.isDeprecated ? 'border-warning' : 'hover:border-primary'} shadow-sm select-none`}>
      <div className={`text-xl text-center mb-5 ${isCurrentlyEditing && 'text-primary'}`}>{profile.profileName}</div>
      <ShipmentProfileCardData className="w-16 h-16 mx-auto" profile={profile} />
      <div className="flex gap-2 mt-auto">
        {profile.isDeprecated && !isMini ? (
          <Button onClick={() => onUnDeprecate(profile)} size="sm" className="w-full text-warning border border-solid border-warning hover:text-foreground hover:bg-warning">
            <Stethoscope className="w-4 h-4" />
            {tProfileButtons('undeprecate')}
          </Button>
        ) : (<>
          {onEdit && 
            <Button onClick={() => onEdit(profile)} size="sm" className="w-full text-primary border border-solid border-primary hover:text-foreground hover:bg-primary">
              <Pencil className="w-4 h-4" />
              {tProfileButtons('edit')}
            </Button>
          }
          {onDelete && 
            <Button disabled={profile.amountOfShipMethods > 0} onClick={() => onDelete(profile)} size="sm" className="w-full text-danger border border-solid border-danger disabled:opacity-70 disabled:hover:text-danger disabled:hover:border-danger disabled:hover:bg-transparent hover:text-foreground hover:bg-danger">
              <Trash2 className="w-4 h-4" />
              {tProfileButtons('delete')}
            </Button>
          }
        </>)}
      </div>
    </div>
  );
};