import { CreateIcon } from "@/Icons/Icons";
import { Button } from "@nextui-org/react";
import { useTranslations } from "next-intl";

export default function AddNewButton({onOpen, name, direction='ltr'}) {
  const tAddNew = useTranslations('Buttons');
  return (
    <div className={`flex items-center gap-2 ${direction === 'ltr' ? '' : 'flex-row-reverse ml-auto' }`}>
      <Button 
        onClick={onOpen} 
        className="w-10 h-10 p-0 ml-2 min-w-10 min-h-10" 
        color="primary" 
        startContent={<CreateIcon />}
      >
      </Button>
      <div className="text-sm">{tAddNew('add_new', {name: name})}</div>
    </div>
  );
}