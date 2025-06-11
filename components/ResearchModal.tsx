
import React from 'react';
import { ResearchDefinition, GameState, ShopType, ResearchEffectType, ShopCategory } from '../types';
import Modal from './Modal';
import { SHOP_DEFINITIONS } from '../constants';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  researchItems: ResearchDefinition[];
  onUnlockResearch: (researchId: string) => void;
  currentResearchPoints: number;
  completedResearch: Set<string>;
  getGameState: () => GameState; // For potential future use, not directly used now
}

const ResearchModal: React.FC<ResearchModalProps> = ({
  isOpen,
  onClose,
  researchItems,
  onUnlockResearch,
  currentResearchPoints,
  completedResearch,
  // getGameState // Not used currently but kept for potential future complex effect descriptions
}) => {
  if (!isOpen) return null;

  const getPrerequisiteText = (prerequisites?: string[]): string | null => {
    if (!prerequisites || prerequisites.length === 0) return null;
    const unmet = prerequisites.filter(pId => !completedResearch.has(pId));
    if (unmet.length === 0) return null; // All prerequisites met
    return "선행 연구: " + unmet.map(pId => researchItems.find(r => r.id === pId)?.name || '알 수 없는 연구').join(', ');
  };
  
  const getEffectDescription = (research: ResearchDefinition): string[] => {
    return research.effects.map(effect => {
        switch(effect.type) {
            case ResearchEffectType.UNLOCK_SHOP:
                const shopName = effect.shopType ? SHOP_DEFINITIONS[effect.shopType as ShopType]?.name : "알 수 없는 상점";
                return `상점 잠금 해제: ${shopName} ${effect.shopType ? SHOP_DEFINITIONS[effect.shopType as ShopType]?.emoji : ''}`;
            case ResearchEffectType.INCREASE_MAX_VOC_MESSAGES:
                return `최대 VOC 메시지 표시 개수 +${effect.value}`;
            case ResearchEffectType.GLOBAL_INCOME_MULTIPLIER:
                const categoryKR = effect.category === ShopCategory.FOOD ? "식품" 
                                 : effect.category === ShopCategory.GOODS ? "상품"
                                 : effect.category === ShopCategory.ENTERTAINMENT ? "오락"
                                 : effect.category === ShopCategory.SERVICE ? "서비스"
                                 : effect.category === ShopCategory.SPECIAL ? "특별"
                                 : effect.category === ShopCategory.FACILITY ? "시설" : "";
                const targetDesc = effect.category ? `${categoryKR} 카테고리` : "모든";
                return `${targetDesc} 상점 수입 +${(effect.value || 0) * 100}%`;
            case ResearchEffectType.INCREASE_MAX_STAFF_SLOTS:
                 return `최대 직원 고용 슬롯 +${effect.value}`;
            default:
                // This will inform if a new ResearchEffectType is added but not handled here.
                const exhaustiveCheck: never = effect.type; 
                return `알 수 없는 효과 유형: ${exhaustiveCheck}`;
        }
    });
  }

  // Sort by tier (ascending), then by RP cost (ascending)
  const sortedResearchItems = [...researchItems].sort((a,b) => (a.tier || 0) - (b.tier || 0) || a.costRP - b.costRP);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔬 연구 및 개발" size="xl">
      <div className="mb-4 text-center">
        <p className="text-xl text-cyan-400 font-semibold">
          사용 가능 연구 점수 (RP): <span className="font-orbitron">{currentResearchPoints.toLocaleString()}</span>
        </p>
      </div>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto p-1 pr-2">
        {sortedResearchItems.map(item => {
          const isCompleted = completedResearch.has(item.id);
          const prerequisitesMet = !item.prerequisites || item.prerequisites.every(pId => completedResearch.has(pId));
          const canAfford = currentResearchPoints >= item.costRP;
          const canResearch = !isCompleted && prerequisitesMet && canAfford;
          const prerequisiteText = getPrerequisiteText(item.prerequisites);

          return (
            <div
              key={item.id}
              className={`p-3 rounded-lg shadow-md transition-all border ${
                isCompleted 
                  ? 'bg-green-800 border-green-600' 
                  : prerequisitesMet 
                    ? 'bg-slate-700 border-slate-600 hover:border-sky-500' 
                    : 'bg-slate-800 border-slate-700 opacity-60' // Not meet prerequisites
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-grow mb-2 sm:mb-0 sm:mr-4">
                  <h4 className="text-lg font-semibold text-sky-300 flex items-center">
                    <span className="text-2xl mr-2">{item.emoji}</span>
                    {item.name}
                    {isCompleted && <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full font-medium">완료됨</span>}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 mb-1.5">{item.description}</p>
                  <div className="text-xs space-y-0.5 mb-1.5">
                    {getEffectDescription(item).map((desc, i) => (
                        <p key={i} className="text-sky-400">✨ {desc}</p>
                    ))}
                  </div>
                  {prerequisiteText && !isCompleted && (
                    <p className="text-xs text-amber-400 mt-1">⚠️ {prerequisiteText}</p>
                  )}
                </div>
                <div className="flex-shrink-0 sm:text-right">
                  <p className={`text-md font-semibold mb-1 ${canAfford || isCompleted ? 'text-cyan-400' : 'text-red-400'}`}>
                    비용: {item.costRP.toLocaleString()} RP
                  </p>
                  {!isCompleted && prerequisitesMet && (
                    <button
                      onClick={() => onUnlockResearch(item.id)}
                      disabled={!canResearch}
                      className="w-full sm:w-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow-md disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      aria-label={`연구 시작: ${item.name}`}
                    >
                      연구 시작
                    </button>
                  )}
                  {!isCompleted && !prerequisitesMet && (
                     <p className="text-xs text-amber-500 mt-1 text-center sm:text-right">선행 연구 필요</p>
                  )}
                  {!isCompleted && prerequisitesMet && !canAfford && (
                    <p className="text-xs text-red-500 mt-1 text-center sm:text-right">RP 부족</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
         {sortedResearchItems.length === 0 && (
            <p className="text-center text-slate-500 py-4">사용 가능한 연구 항목이 없습니다.</p>
        )}
      </div>
    </Modal>
  );
};

export default ResearchModal;
