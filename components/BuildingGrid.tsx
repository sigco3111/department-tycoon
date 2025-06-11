
import React from 'react';
import { Floor as FloorType } from '../types';
import ShopCell from './ShopCell';
import { SLOTS_PER_FLOOR } from '../constants';
import ProgressBar from './ProgressBar';

interface BuildingGridProps {
  floors: FloorType[];
  onSlotClick: (floorIndex: number, slotIndex: number) => void;
  selectedSlot: { floorIndex: number; slotIndex: number } | null;
}

const BuildingGrid: React.FC<BuildingGridProps> = ({ floors, onSlotClick, selectedSlot }) => {
  return (
    <div className="space-y-1 bg-slate-800 p-2 rounded-lg shadow-lg h-full overflow-y-auto">
      {floors.slice().reverse().map((floor, reversedIndex) => {
        const floorIndex = floors.length - 1 - reversedIndex;
        return (
          <div key={floor.id} className="bg-slate-700 p-1.5 rounded-md">
            <div className="flex justify-between items-center mb-1 px-1">
              <h3 className="text-xs text-slate-300 font-semibold">{floor.floorNumber}층</h3>
              <div className="text-xs text-sky-300">
                ✨ 청결도: {floor.cleanliness.toFixed(0)}%
              </div>
            </div>
            {floor.activeSynergies.length > 0 && (
              <div className="mb-1 text-center">
                {floor.activeSynergies.map(synergy => (
                  <span key={synergy.id} title={synergy.description} className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full mr-1 last:mr-0">
                    {synergy.name}
                  </span>
                ))}
              </div>
            )}
            <div className={`grid grid-cols-${SLOTS_PER_FLOOR} gap-1`}>
              {floor.slots.map((slot, slotIndex) => (
                <ShopCell
                  key={`${floor.id}-${slotIndex}`}
                  shop={slot.shop}
                  onClick={() => onSlotClick(floorIndex, slotIndex)}
                  isSelected={selectedSlot?.floorIndex === floorIndex && selectedSlot?.slotIndex === slotIndex}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BuildingGrid;