import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/router";

export default function ShipingSection({ shipingMethods, setSelectedShipingMethod }) {
  const { locale } = useRouter();
  return(
    <RadioGroup onValueChange={setSelectedShipingMethod}>
      {shipingMethods && shipingMethods.map((method,index) => {
        return (
          <div className="flex items-start space-x-2" key={method._id}>
            <RadioGroupItem value={method._id} id={method._id} />
            <div className='flex max-sm:flex-col sm:gap-2 gap-1 cursor-pointer'>
              <Label className='whitespace-nowrap cursor-pointer' htmlFor={method._id}>
                {method.name}
              </Label>
              <span className='text-xs font-light text-muted-foreground'>{method.description?.[locale] || method.description?.['en'] || ''}</span>
            </div>
          </div>
        )
      })}
    </RadioGroup>
  );
};