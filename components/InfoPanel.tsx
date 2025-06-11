
import React from 'react';
import { GameState, ActiveVOCMessage, ActiveQuest, QuestStatus, CustomerType, DepartmentStoreRank, AIDepartmentStore } from '../types';
import { CUSTOMER_TYPE_EMOJIS, CUSTOMER_TYPE_NAMES_KR, DEPARTMENT_STORE_RANKS, TICKS_PER_DAY, RP_PER_DAY, AI_LEVEL_THRESHOLDS } from '../constants';
import ProgressBar from './ProgressBar';

interface InfoPanelProps {
  gameState: GameState;
  activeVOCs: ActiveVOCMessage[];
  totalIncomePerTick: number;
  departmentRank: DepartmentStoreRank;
  onAddFloor: () => void;
  onOpenMarketingModal: () => void;
  onOpenResearchModal: () => void;
  onOpenStaffModal: () => void;
  onOpenDashboardModal: () => void;
  currentGold: number;
  newFloorCost: number;
  floorCount: number;
  aiStore: AIDepartmentStore | null; // New prop
  playerMarketShare: number; // New prop
}

const InfoPanel: React.FC<InfoPanelProps> = ({ 
  gameState, activeVOCs, totalIncomePerTick, departmentRank,
  onAddFloor, onOpenMarketingModal, onOpenResearchModal, onOpenStaffModal, onOpenDashboardModal,
  currentGold, newFloorCost, floorCount, aiStore, playerMarketShare
}) => {
  const { gold, reputation, researchPoints, day, customerStats, activeEvent, quests, activeMarketingCampaign, maxVOCs, staff, maxStaffSlots } = gameState;

  const getNextRank = (): DepartmentStoreRank | null => {
    const currentRankIndex = DEPARTMENT_STORE_RANKS.findIndex(r => r.name === departmentRank.name);
    if (currentRankIndex < DEPARTMENT_STORE_RANKS.length - 1) {
      return DEPARTMENT_STORE_RANKS[currentRankIndex + 1];
    }
    return null;
  };
  const nextRank = getNextRank();

  const getAILevelName = (level: number): string => {
    if (level >= 5) return "거대 기업";
    if (level === 4) return "유명 체인";
    if (level === 3) return "성장 중인 경쟁자";
    if (level === 2) return "소규모 경쟁자";
    return "신생 업체";
  }

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg space-y-3 h-full overflow-y-auto text-sm flex flex-col">
      {/* Header */}
      <div className="text-center mb-1">
        <h2 className="text-3xl font-bold text-sky-400 font-orbitron">백화점 타이쿤</h2>
        <p className="text-slate-400">{day}일차 | 등급: <span className="text-amber-400">{departmentRank.name}</span></p>
      </div>

      {/* Finances & Reputation & RP */}
      <div className="flex flex-col space-y-2 p-3 bg-slate-700 rounded-md">
        <div>
          <div className="text-slate-400">골드</div>
          <div className="text-xl text-yellow-400 font-semibold">🪙 {gold.toLocaleString()}</div>
          <div className="text-xs text-green-400">+{totalIncomePerTick.toLocaleString()}/틱</div>
        </div>
        <div>
          <div className="text-slate-400">평판</div>
          <div className="text-xl text-pink-400 font-semibold">💖 {reputation.toLocaleString()}</div>
          {nextRank && (
            <ProgressBar value={reputation} max={nextRank.minReputation} label={`${nextRank.name} 까지`} color="bg-pink-500" />
          )}
        </div>
         <div>
          <div className="text-slate-400">연구 점수</div>
          <div className="text-xl text-cyan-400 font-semibold">🔬 {researchPoints.toLocaleString()}</div>
           <div className="text-xs text-cyan-300">+{RP_PER_DAY}/일</div>
        </div>
      </div>

      {/* AI Competitor Info */}
      {aiStore && (
        <div className="p-3 bg-red-900 bg-opacity-40 rounded-md border border-red-700">
          <h3 className="text-lg font-semibold text-red-300 mb-1.5">{aiStore.name} (경쟁사)</h3>
          <div className="text-xs space-y-1">
            <p>평판: <span className="text-red-200">{aiStore.reputation.toLocaleString()}</span></p>
            <p>레벨: <span className="text-red-200">{getAILevelName(aiStore.level)} (Lv.{aiStore.level})</span></p>
            <p>시장 점유율: <span className="text-amber-300">{playerMarketShare.toFixed(1)}%</span> (플레이어)</p>
            {aiStore.lastActivityMessage && <p className="text-red-300 italic">"{aiStore.lastActivityMessage}"</p>}
          </div>
        </div>
      )}
      
       {/* Department Store Management */}
       <div className="p-3 bg-slate-700 rounded-md space-y-2.5">
         <h3 className="text-lg font-semibold text-slate-300 mb-1">백화점 관리</h3>
        <button 
          onClick={onAddFloor}
          disabled={currentGold < newFloorCost}
          className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md shadow-md disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
        >
          {floorCount + 1}층 추가 ({newFloorCost.toLocaleString()}G)
        </button>
        <button
          onClick={onOpenStaffModal}
          className="w-full px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-md shadow-md transition-colors text-xs sm:text-sm"
          aria-label="직원 관리 패널 열기"
        >
         🧑‍💼 직원 관리 ({staff.length}/{maxStaffSlots})
        </button>
        <button
          onClick={onOpenMarketingModal}
          disabled={!!activeMarketingCampaign}
          className="w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md shadow-md disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
          aria-label="마케팅 캠페인 시작 또는 관리"
        >
         📣 캠페인 {activeMarketingCampaign ? '진행중' : '시작'}
        </button>
         <button
          onClick={onOpenResearchModal}
          className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow-md transition-colors text-xs sm:text-sm"
          aria-label="연구 및 개발 패널 열기"
        >
         🔬 연구 및 개발
        </button>
        <button
          onClick={onOpenDashboardModal}
          className="w-full px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md shadow-md transition-colors text-xs sm:text-sm"
          aria-label="데이터 대시보드 열기"
        >
         📊 데이터 대시보드
        </button>
      </div>

      {/* Active Event & Marketing */}
      {(activeEvent || activeMarketingCampaign) && (
        <div className="space-y-1.5">
          {activeEvent && (
            <div className="p-2.5 bg-indigo-700 rounded-md">
              <h3 className="text-sm font-semibold text-indigo-200">{activeEvent.name}</h3>
              <p className="text-indigo-300 text-xs">{activeEvent.description}</p>
              <p className="text-indigo-300 text-xs">남은 틱: {activeEvent.ticksRemaining}</p>
            </div>
          )}
          {activeMarketingCampaign && (
            <div className="p-2.5 bg-fuchsia-700 rounded-md">
              <h3 className="text-sm font-semibold text-fuchsia-200">📣 {activeMarketingCampaign.name}</h3>
              <p className="text-fuchsia-300 text-xs">{activeMarketingCampaign.description}</p>
              <p className="text-fuchsia-300 text-xs">남은 틱: {activeMarketingCampaign.ticksRemaining}</p>
            </div>
          )}
        </div>
      )}


      {/* Customer Stats */}
      <div className="p-3 bg-slate-700 rounded-md">
        <h3 className="text-lg font-semibold text-slate-300 mb-1.5">고객: {customerStats.total.toLocaleString()}명</h3>
        <div className="space-y-0.5 text-xs max-h-28 overflow-y-auto">
          {Object.entries(customerStats.types)
            .filter(([, count]) => count > 0) 
            .sort(([, countA], [, countB]) => countB - countA) // Sort by count desc
            .map(([type, count]) => (
            <div key={type} className="flex items-center">
              <span className="text-lg mr-1.5 w-5 text-center">{CUSTOMER_TYPE_EMOJIS[type as CustomerType]}</span>
              <span className="text-slate-400 w-14">{CUSTOMER_TYPE_NAMES_KR[type as CustomerType]}:</span>
              <span className="ml-1 text-slate-200 font-medium">{count.toLocaleString()}명</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quests */}
      <div className="p-3 bg-slate-700 rounded-md">
        <h3 className="text-lg font-semibold text-slate-300 mb-1.5">진행 중인 퀘스트</h3>
        {quests.filter(q => q.status === QuestStatus.ACTIVE).length === 0 && <p className="text-xs text-slate-400">진행 중인 퀘스트가 없습니다.</p>}
        <ul className="space-y-1.5 max-h-24 overflow-y-auto">
          {quests.filter(q => q.status === QuestStatus.ACTIVE).map(quest => (
            <li key={quest.id} className="text-xs">
              <p className="font-medium text-sky-300">{quest.title}</p>
              {/* <p className="text-slate-400">{quest.description}</p> */}
              <ProgressBar 
                value={quest.getCurrentValue(gameState)} 
                max={quest.targetValue} 
                color="bg-teal-500" />
            </li>
          ))}
        </ul>
      </div>

      {/* Voice of Customer */}
      <div className="p-3 bg-slate-700 rounded-md mt-auto"> 
        <h3 className="text-lg font-semibold text-slate-300 mb-1.5">고객의 소리 (VOC) - 최대 {maxVOCs}개</h3>
        {activeVOCs.length === 0 && <p className="text-xs text-slate-400">지금은 고객들이 조용하네요...</p>}
        <ul className="space-y-1 max-h-20 overflow-y-auto">
          {activeVOCs.map(voc => (
            <li key={voc.displayId} className={`text-xs p-1 rounded ${voc.type === 'positive' ? 'bg-green-700 bg-opacity-30 text-green-300' : voc.type === 'negative' ? 'bg-red-700 bg-opacity-30 text-red-300' : 'bg-slate-600 text-slate-300'}`}>
              "{voc.message}"
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InfoPanel;
