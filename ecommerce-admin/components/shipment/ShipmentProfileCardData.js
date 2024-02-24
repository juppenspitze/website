import { MoveHorizontal,MoveVertical,Codepen,Scale } from "lucide-react";

export default function ShipmentProfileCardData({profile}) {
  return (
    <div className="flex flex-col gap-4 text-textSecondary">
      <div className="flex gap-3">
        <Scale />
        {profile.minWeight}kg - {profile.maxWeight}kg
      </div>
      <div className="flex gap-3">
        <MoveHorizontal />
        {profile.minWidth}cm - {profile.maxWidth}cm
      </div>
      <div className="flex gap-3">
        <MoveVertical />
        {profile.minHeight}cm - {profile.maxHeight}cm
      </div>
      <div className="flex gap-3">
        <Codepen />
        {profile.minDepth}cm - {profile.maxDepth}cm
      </div>
    </div>
  );
};