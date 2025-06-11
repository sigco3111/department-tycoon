
import React from 'react';
import { PlacedShop, ShopDefinition } from '../types';
import { SHOP_DEFINITIONS } from '../constants';

interface ShopCellProps {
  shop: PlacedShop | null;
  onClick: () => void;
  isSelected?: boolean;
}

const ShopCell: React.FC<ShopCellProps> = ({ shop, onClick, isSelected }) => {
  const definition = shop ? SHOP_DEFINITIONS[shop.shopTypeId] : null;

  return (
    <button
      onClick={onClick}
      className={`aspect-square border border-slate-700 hover:border-sky-500 flex flex-col items-center justify-center p-1 text-center transition-all duration-150
        ${isSelected ? 'ring-2 ring-sky-400 border-sky-400' : ''}
        ${definition ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-700 hover:bg-slate-600'}`}
    >
      {definition && shop ? (
        <>
          <span className="text-3xl md:text-4xl">{definition.emoji}</span>
          <span className="text-xs text-sky-300 truncate w-full">{definition.name}</span>
          <span className="text-xs text-slate-400">레벨 {shop.level}</span>
        </>
      ) : (
        <span className="text-slate-500 text-2xl">+</span>
      )}
    </button>
  );
};

export default ShopCell;