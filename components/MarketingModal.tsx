import React from 'react';
import { MarketingCampaignDefinition } from '../types';
import Modal from './Modal';
import { TICKS_PER_DAY } from '../constants';

interface MarketingModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: MarketingCampaignDefinition[];
  onStartCampaign: (campaignId: string) => void;
  currentGold: number;
  currentReputation: number;
  activeCampaignId?: string;
}

const MarketingModal: React.FC<MarketingModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  onStartCampaign,
  currentGold,
  currentReputation,
  activeCampaignId,
}) => {
  if (!isOpen) return null;

  const formatEffects = (effects: MarketingCampaignDefinition['effects']): string[] => {
    const parts: string[] = [];
    if (effects.customerAttractionBoost) parts.push(`고객 유치 +${effects.customerAttractionBoost}/틱`);
    if (effects.incomeMultiplier) parts.push(`수입 x${effects.incomeMultiplier.toFixed(1)}`);
    if (effects.reputationBoostOnStart) parts.push(`평판 즉시 +${effects.reputationBoostOnStart}`);
    return parts;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📣 마케팅 캠페인" size="xl">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        {campaigns.map(campaign => {
          const isAffordable = currentGold >= campaign.cost;
          const isReputationSufficient = !campaign.minReputationRequired || currentReputation >= campaign.minReputationRequired;
          const canStart = isAffordable && isReputationSufficient && !activeCampaignId;
          const isThisCampaignActive = activeCampaignId === campaign.id;

          return (
            <div
              key={campaign.id}
              className={`p-4 rounded-lg shadow ${
                isThisCampaignActive ? 'bg-fuchsia-800 ring-2 ring-fuchsia-500' : 'bg-slate-700'
              } transition-all`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-grow mb-3 sm:mb-0">
                  <h4 className="text-xl font-semibold text-purple-300 flex items-center">
                    <span className="text-3xl mr-3">{campaign.emoji}</span>
                    {campaign.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 mb-2">{campaign.description}</p>
                  <div className="text-xs space-y-0.5">
                    {formatEffects(campaign.effects).map((effect, i) => (
                      <p key={i} className="text-purple-300">{effect}</p>
                    ))}
                    <p className="text-slate-400">지속 기간: {campaign.durationTicks / TICKS_PER_DAY}일 ({campaign.durationTicks}틱)</p>
                     {campaign.minReputationRequired && (
                        <p className={`text-xs ${currentReputation >= campaign.minReputationRequired ? 'text-green-400' : 'text-red-400'}`}>
                            필요 평판: {campaign.minReputationRequired.toLocaleString()} (현재: {currentReputation.toLocaleString()})
                        </p>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 sm:ml-4 sm:text-right">
                  <p className={`text-lg font-semibold mb-1 ${isAffordable ? 'text-yellow-400' : 'text-red-400'}`}>
                    비용: {campaign.cost.toLocaleString()}G
                  </p>
                  {isThisCampaignActive ? (
                     <p className="px-4 py-2 text-sm text-center bg-fuchsia-600 text-white rounded-md">진행 중</p>
                  ) : (
                    <button
                      onClick={() => onStartCampaign(campaign.id)}
                      disabled={!canStart}
                      className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md shadow-md disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      시작하기
                    </button>
                  )}
                  {!isAffordable && <p className="text-xs text-red-400 mt-1">골드가 부족합니다.</p>}
                  {!isReputationSufficient && <p className="text-xs text-red-400 mt-1">평판이 부족합니다.</p>}
                  {activeCampaignId && !isThisCampaignActive && <p className="text-xs text-amber-400 mt-1">다른 캠페인 진행 중</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default MarketingModal;
