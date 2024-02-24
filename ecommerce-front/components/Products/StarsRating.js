import StarOutline from "@/components/icons/StarOutline";
import {useState} from "react";
import StarSolid from "@/components/icons/StarSolid";
import {primary} from "@/lib/colors";

export default function StarsRating({
  size='md',
  defaultHowMany=0,disabled,onChange
}) {
  const [howMany,setHowMany] = useState(defaultHowMany);
  const five = [1,2,3,4,5];
  function handleStarClick(n) {
    if (disabled) {
      return;
    }
    setHowMany(n);
    onChange(n);
  }
  return (
    <div className="inline-flex items-center gap-[1px]">
      {five.map(n => (
        <button key={`start-${n}`} className={`inline-block bg-transparent text-${primary} p-0 border-0 ${!disabled && 'cursor-pointer'} ${size === 'md' ? 'h-6 w-6' : 'h-4 w-4' }`} 
          disabled={disabled}
          size={size}
          onClick={() => handleStarClick(n)}>
          {howMany >= n ? <StarSolid /> : <StarOutline />}
        </button>
      ))}
    </div>
  );
}