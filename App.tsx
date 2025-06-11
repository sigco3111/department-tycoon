
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ShopType, PlacedShop, Floor as FloorType, CustomerStats, CustomerType, ActiveGameEvent, ActiveMarketingCampaign, MarketingCampaignDefinition,
  ActiveVOCMessage, QuestStatus, Synergy, GameState, DepartmentStoreRank, ShopCategory, LogMessage, ActiveQuest, ResearchDefinition, ResearchEffectType,
  StaffMember, StaffRole, StaffRoleDefinition, FinancialSummary, IncomeByShopCategory, FloorPerformanceData, ShopPopularityData, IncomeByShopType,
  AIDepartmentStore, ShopDefinition 
} from './types';
import {
  INITIAL_GOLD, INITIAL_REPUTATION, INITIAL_FLOORS, SLOTS_PER_FLOOR, SHOP_DEFINITIONS,
  GAME_TICK_INTERVAL_MS, TICKS_PER_DAY, PERIODIC_EVENT_DEFINITIONS, VOC_MESSAGES_DEFINITIONS, INITIAL_MAX_VOC_MESSAGES,
  QUEST_DEFINITIONS, SYNERGY_DEFINITIONS, NEW_FLOOR_COST_BASE, NEW_FLOOR_COST_MULTIPLIER,
  SHOP_INVESTMENT_COST_BASE, SHOP_INVESTMENT_COST_MULTIPLIER, DEPARTMENT_STORE_RANKS,
  UNLOCKABLE_CUSTOMER_TYPES_BY_REPUTATION, MARKETING_CAMPAIGN_DEFINITIONS,
  RESEARCH_DEFINITIONS, INITIAL_RESEARCH_POINTS, RP_PER_DAY,
  STAFF_ROLE_DEFINITIONS, INITIAL_MAX_STAFF_SLOTS, APPLICANT_GENERATION_CHANCE_PER_DAY, MAX_APPLICANTS, STAFF_NAMES_POOL,
  DEFAULT_FLOOR_CLEANLINESS, FLOOR_CLEANLINESS_DECAY_RATE_PER_DAY,
  AI_NAMES, AI_INITIAL_REPUTATION_MIN, AI_INITIAL_REPUTATION_MAX, AI_GROWTH_INTERVAL_TICKS,
  AI_REP_GAIN_PER_INTERVAL_BASE, AI_LEVEL_THRESHOLDS, AI_LEVEL_ATTRACTION_BONUS, AI_DEFAULT_ACTIVITY_MESSAGE,
  PLAYER_REP_ATTRACTION_WEIGHT, PLAYER_SHOP_COUNT_ATTRACTION_WEIGHT, PLAYER_AVG_SHOP_LEVEL_ATTRACTION_WEIGHT,
  PLAYER_AVG_CLEANLINESS_ATTRACTION_WEIGHT, AI_REP_ATTRACTION_WEIGHT,
  BASE_POTENTIAL_CUSTOMERS_PER_TICK, CUSTOMER_GROWTH_PER_DAY_FACTOR, AI_REP_GAIN_PER_PLAYER_LEVEL_BONUS, CUSTOMER_ATTRACTION_RANDOM_FACTOR,
  DELEGATION_MODE_ACTION_INTERVAL_BASE_TICKS, DELEGATION_GOLD_RESERVE_FIXED_AMOUNT, DELEGATION_GOLD_RESERVE_PERCENTAGE,
  DELEGATION_SHOP_REPUTATION_WEIGHT, DELEGATION_SHOP_INCOME_WEIGHT, DELEGATION_CLEANLINESS_HIRE_THRESHOLD,
  DELEGATION_MODE_BUILD_CHECK_INTERVAL_TICKS, DELEGATION_MODE_INVEST_CHECK_INTERVAL_TICKS, DELEGATION_MODE_STAFF_CHECK_INTERVAL_TICKS,
  DELEGATION_MODE_MARKETING_CHECK_INTERVAL_TICKS, DELEGATION_MODE_RESEARCH_CHECK_INTERVAL_TICKS, DELEGATION_MODE_NEW_FLOOR_CHECK_INTERVAL_TICKS,
  DELEGATION_MIN_SLOTS_BEFORE_NEW_FLOOR, DELEGATION_MAX_COUNT_CHEAP_FACILITIES, CHEAP_FACILITY_TYPES_FOR_DELEGATION_LIMIT
} from './constants';
import BuildingGrid from './components/BuildingGrid';
import InfoPanel from './components/InfoPanel';
import Modal from './components/Modal';
import ConfirmModal from './components/ConfirmModal'; // Added
import GameLog from './components/GameLog';
import TimeControls from './components/TimeControls';
import MarketingModal from './components/MarketingModal';
import ResearchModal from './components/ResearchModal';
import StaffModal from './components/StaffModal';
import DashboardModal from './components/DashboardModal';

const MAX_LOG_MESSAGES = 50;
const LOCAL_STORAGE_KEY = 'departmentStoreTycoonSave';

interface SavedGameState {
  gold: number;
  reputation: number;
  researchPoints: number;
  day: number;
  tickCounter: number;
  floors: FloorType[];
  unlockedShopTypes: ShopType[];
  completedResearch: string[]; // Store as array for JSON
  activeEvent: ActiveGameEvent | null;
  activeMarketingCampaign: ActiveMarketingCampaign | null;
  quests: { id: string; status: QuestStatus }[]; // Store simplified quest data
  customerStats: CustomerStats;
  currentMaxVOCs: number;
  staff: StaffMember[];
  availableApplicants: StaffMember[];
  maxStaffSlots: number;
  aiStore: AIDepartmentStore | null;
  isDelegationModeActive: boolean;
  gameSpeed: number;
  isPaused: boolean;
  // Note: gameLogMessages are not saved to keep save file smaller and focused on core state
}


const App: React.FC = () => {
  const [isGameLoaded, setIsGameLoaded] = useState<boolean>(false);
  const [gold, setGold] = useState<number>(INITIAL_GOLD);
  const [reputation, setReputation] = useState<number>(INITIAL_REPUTATION);
  const [researchPoints, setResearchPoints] = useState<number>(INITIAL_RESEARCH_POINTS);
  const [day, setDay] = useState<number>(1);
  const [tickCounter, setTickCounter] = useState<number>(0); 

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameSpeed, setGameSpeed] = useState<number>(1); 
  const [isDelegationModeActive, setIsDelegationModeActive] = useState<boolean>(false);


  const initialFloors = Array.from({ length: INITIAL_FLOORS }, (_, i) => ({
    id: `floor-${i}-${Date.now()}`,
    floorNumber: i + 1,
    slots: Array(SLOTS_PER_FLOOR).fill(null).map(() => ({ shop: null })),
    activeSynergies: [],
    cleanliness: DEFAULT_FLOOR_CLEANLINESS,
  }));
  const [floors, setFloors] = useState<FloorType[]>(initialFloors);

  const [unlockedShopTypes, setUnlockedShopTypes] = useState<ShopType[]>(
    Object.values(SHOP_DEFINITIONS)
      .filter(s => (!s.minReputationRequired || s.minReputationRequired <= INITIAL_REPUTATION) && !s.isResearchLocked)
      .map(s => s.id)
  );
  
  const [customerStats, setCustomerStats] = useState<CustomerStats>({
    total: 0,
    types: Object.values(CustomerType).reduce((acc, type) => { acc[type] = 0; return acc; }, {} as Record<CustomerType, number>)
  });

  const [activeEvent, setActiveEvent] = useState<ActiveGameEvent | null>(null);
  const [activeMarketingCampaign, setActiveMarketingCampaign] = useState<ActiveMarketingCampaign | null>(null);
  const [activeVOCs, setActiveVOCs] = useState<ActiveVOCMessage[]>([]);
  const [quests, setQuests] = useState<ActiveQuest[]>(
    QUEST_DEFINITIONS.map(q => ({ ...q, status: QuestStatus.ACTIVE }))
  );
  
  const [completedResearch, setCompletedResearch] = useState<Set<string>>(new Set());
  const [currentMaxVOCs, setCurrentMaxVOCs] = useState<number>(INITIAL_MAX_VOC_MESSAGES);

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [availableApplicants, setAvailableApplicants] = useState<StaffMember[]>([]);
  const [maxStaffSlots, setMaxStaffSlots] = useState<number>(INITIAL_MAX_STAFF_SLOTS);

  const [selectedSlot, setSelectedSlot] = useState<{ floorIndex: number; slotIndex: number } | null>(null);
  const [isBuildModalOpen, setIsBuildModalOpen] = useState<boolean>(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState<boolean>(false);
  const [isMarketingModalOpen, setIsMarketingModalOpen] = useState<boolean>(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState<boolean>(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState<boolean>(false);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState<boolean>(false); // Added
  
  const [gameLogMessages, setGameLogMessages] = useState<LogMessage[]>([]);
  
  const [aiStore, setAiStore] = useState<AIDepartmentStore | null>(null);
  const [playerMarketShare, setPlayerMarketShare] = useState<number>(100);


  const goldRef = useRef(gold);
  const reputationRef = useRef(reputation);
  const researchPointsRef = useRef(researchPoints);
  const dayRef = useRef(day);
  const tickCounterRef = useRef(tickCounter);
  const floorsRef = useRef(floors);
  const unlockedShopTypesRef = useRef(unlockedShopTypes);
  const completedResearchRef = useRef(completedResearch);
  const activeEventRef = useRef(activeEvent);
  const activeMarketingCampaignRef = useRef(activeMarketingCampaign);
  const questsRef = useRef(quests);
  const customerStatsRef = useRef(customerStats);
  const currentMaxVOCsRef = useRef(currentMaxVOCs);
  const staffRef = useRef(staff);
  const availableApplicantsRef = useRef(availableApplicants);
  const maxStaffSlotsRef = useRef(maxStaffSlots);
  const aiStoreRef = useRef(aiStore);
  const isDelegationModeActiveRef = useRef(isDelegationModeActive);
  const isPausedRef = useRef(isPaused);
  const gameSpeedRef = useRef(gameSpeed); // Added for saving

  useEffect(() => { goldRef.current = gold; }, [gold]);
  useEffect(() => { reputationRef.current = reputation; }, [reputation]);
  useEffect(() => { researchPointsRef.current = researchPoints; }, [researchPoints]);
  useEffect(() => { dayRef.current = day; }, [day]);
  useEffect(() => { tickCounterRef.current = tickCounter; }, [tickCounter]);
  useEffect(() => { floorsRef.current = floors; }, [floors]);
  useEffect(() => { unlockedShopTypesRef.current = unlockedShopTypes; }, [unlockedShopTypes]);
  useEffect(() => { completedResearchRef.current = completedResearch; }, [completedResearch]);
  useEffect(() => { activeEventRef.current = activeEvent; }, [activeEvent]);
  useEffect(() => { activeMarketingCampaignRef.current = activeMarketingCampaign; }, [activeMarketingCampaign]);
  useEffect(() => { questsRef.current = quests; }, [quests]);
  useEffect(() => { customerStatsRef.current = customerStats; }, [customerStats]);
  useEffect(() => { currentMaxVOCsRef.current = currentMaxVOCs; }, [currentMaxVOCs]);
  useEffect(() => { staffRef.current = staff; }, [staff]);
  useEffect(() => { availableApplicantsRef.current = availableApplicants; }, [availableApplicants]);
  useEffect(() => { maxStaffSlotsRef.current = maxStaffSlots; }, [maxStaffSlots]);
  useEffect(() => { aiStoreRef.current = aiStore; }, [aiStore]);
  useEffect(() => { isDelegationModeActiveRef.current = isDelegationModeActive; }, [isDelegationModeActive]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { gameSpeedRef.current = gameSpeed; }, [gameSpeed]);


  const addLogMessage = useCallback((message: string, type: LogMessage['type'] = 'info') => {
    setGameLogMessages(prev => {
      const newLog: LogMessage = { id: Date.now() + Math.random(), message, type, timestamp: Date.now() };
      const updatedLogs = [newLog, ...prev]; 
      if (updatedLogs.length > MAX_LOG_MESSAGES) {
        return updatedLogs.slice(0, MAX_LOG_MESSAGES);
      }
      return updatedLogs;
    });
  }, []);

  const getGameState = useCallback((): GameState => ({
    gold: goldRef.current, 
    reputation: reputationRef.current, 
    researchPoints: researchPointsRef.current,
    day: dayRef.current, 
    floors: floorsRef.current, 
    unlockedShopTypes: unlockedShopTypesRef.current, 
    completedResearch: completedResearchRef.current,
    activeEvent: activeEventRef.current, 
    activeMarketingCampaign: activeMarketingCampaignRef.current, 
    quests: questsRef.current, 
    customerStats: customerStatsRef.current, 
    maxVOCs: currentMaxVOCsRef.current,
    shopDefinitions: SHOP_DEFINITIONS,
    staff: staffRef.current,
    availableApplicants: availableApplicantsRef.current,
    maxStaffSlots: maxStaffSlotsRef.current,
    aiStore: aiStoreRef.current,
    isDelegationModeActive: isDelegationModeActiveRef.current,
  }), []); 

  const departmentRank = useMemo(() => DEPARTMENT_STORE_RANKS.slice().reverse().find(r => reputation >= r.minReputation) || DEPARTMENT_STORE_RANKS[0], [reputation]);
  const departmentRankIndex = useMemo(() => DEPARTMENT_STORE_RANKS.findIndex(r => r.name === departmentRank.name), [departmentRank]);

  const calculateNewFloorCost = useCallback(() => {
    return Math.floor(NEW_FLOOR_COST_BASE * Math.pow(NEW_FLOOR_COST_MULTIPLIER, floorsRef.current.length -1));
  }, []); 

  const saveGameState = useCallback(() => {
    try {
      const stateToSave: SavedGameState = {
        gold: goldRef.current,
        reputation: reputationRef.current,
        researchPoints: researchPointsRef.current,
        day: dayRef.current,
        tickCounter: tickCounterRef.current,
        floors: floorsRef.current,
        unlockedShopTypes: unlockedShopTypesRef.current,
        completedResearch: Array.from(completedResearchRef.current),
        activeEvent: activeEventRef.current,
        activeMarketingCampaign: activeMarketingCampaignRef.current,
        quests: questsRef.current.map(q => ({ id: q.id, status: q.status })),
        customerStats: customerStatsRef.current,
        currentMaxVOCs: currentMaxVOCsRef.current,
        staff: staffRef.current,
        availableApplicants: availableApplicantsRef.current,
        maxStaffSlots: maxStaffSlotsRef.current,
        aiStore: aiStoreRef.current,
        isDelegationModeActive: isDelegationModeActiveRef.current,
        gameSpeed: gameSpeedRef.current,
        isPaused: isPausedRef.current,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      // console.log("Game state saved."); // Optional: for debugging
    } catch (error) {
      console.error("Error saving game state:", error);
      addLogMessage("게임 저장 중 오류 발생!", 'error');
    }
  }, [addLogMessage]);

  const loadGameState = useCallback(() => {
    try {
      const savedStateString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateString) {
        const savedState: SavedGameState = JSON.parse(savedStateString);

        setGold(savedState.gold);
        setReputation(savedState.reputation);
        setResearchPoints(savedState.researchPoints || INITIAL_RESEARCH_POINTS);
        setDay(savedState.day);
        setTickCounter(savedState.tickCounter || 0);
        
        // Ensure floors have all necessary properties
        const loadedFloors = savedState.floors.map(f => ({
            ...f,
            activeSynergies: f.activeSynergies || [],
            cleanliness: typeof f.cleanliness === 'number' ? f.cleanliness : DEFAULT_FLOOR_CLEANLINESS,
            slots: f.slots.map(s => ({
                ...s,
                shop: s.shop ? {
                    ...s.shop,
                    visitCount: s.shop.visitCount || 0
                } : null
            }))
        }));
        setFloors(loadedFloors);

        setUnlockedShopTypes(savedState.unlockedShopTypes);
        setCompletedResearch(new Set(savedState.completedResearch || []));
        setActiveEvent(savedState.activeEvent || null);
        setActiveMarketingCampaign(savedState.activeMarketingCampaign || null);

        // Rehydrate quests
        const loadedQuests = savedState.quests.map(sq => {
          const definition = QUEST_DEFINITIONS.find(qd => qd.id === sq.id);
          if (definition) {
            return { ...definition, status: sq.status };
          }
          return null; 
        }).filter(Boolean) as ActiveQuest[];
        // Add any new quests not in the save file
        QUEST_DEFINITIONS.forEach(def => {
            if(!loadedQuests.some(lq => lq.id === def.id)){
                loadedQuests.push({...def, status: QuestStatus.ACTIVE});
            }
        });
        setQuests(loadedQuests);


        const loadedCustomerStatsTypes = { ...savedState.customerStats.types };
        Object.values(CustomerType).forEach(type => { // Ensure all current enum keys exist
            if (loadedCustomerStatsTypes[type] === undefined) {
                loadedCustomerStatsTypes[type] = 0;
            }
        });
        setCustomerStats({total: savedState.customerStats.total, types: loadedCustomerStatsTypes});

        setCurrentMaxVOCs(savedState.currentMaxVOCs || INITIAL_MAX_VOC_MESSAGES);
        setStaff(savedState.staff || []);
        setAvailableApplicants(savedState.availableApplicants || []);
        setMaxStaffSlots(savedState.maxStaffSlots || INITIAL_MAX_STAFF_SLOTS);
        setAiStore(savedState.aiStore || null);
        setIsDelegationModeActive(savedState.isDelegationModeActive || false);
        setGameSpeed(savedState.gameSpeed || 1);
        setIsPaused(savedState.isPaused || false);

        addLogMessage("저장된 게임을 불러왔습니다!", 'success');
      } else {
        addLogMessage("새로운 백화점 타이쿤 게임을 시작합니다!", 'info');
        // Initialize AI Store if new game
         const randomAIName = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
         const initialAIReputation = Math.floor(Math.random() * (AI_INITIAL_REPUTATION_MAX - AI_INITIAL_REPUTATION_MIN + 1)) + AI_INITIAL_REPUTATION_MIN;
          setAiStore({
            name: randomAIName,
            reputation: initialAIReputation,
            level: 1,
            attractionPower: initialAIReputation * AI_REP_ATTRACTION_WEIGHT + AI_LEVEL_THRESHOLDS[0] * AI_LEVEL_ATTRACTION_BONUS,
            lastActivityMessage: `${randomAIName} 오픈!`,
            lastGrowthTick: 0,
          });
         addLogMessage(`경쟁사 ${randomAIName}이(가) 시장에 등장했습니다!`, "info");
      }
    } catch (error) {
      console.error("Error loading game state:", error);
      addLogMessage("게임 불러오기 중 오류 발생! 새 게임을 시작합니다.", 'error');
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted save
       // Initialize AI Store if loading failed
         const randomAIName = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
         const initialAIReputation = Math.floor(Math.random() * (AI_INITIAL_REPUTATION_MAX - AI_INITIAL_REPUTATION_MIN + 1)) + AI_INITIAL_REPUTATION_MIN;
          setAiStore({
            name: randomAIName,
            reputation: initialAIReputation,
            level: 1,
            attractionPower: initialAIReputation * AI_REP_ATTRACTION_WEIGHT + AI_LEVEL_THRESHOLDS[0] * AI_LEVEL_ATTRACTION_BONUS,
            lastActivityMessage: `${randomAIName} 오픈!`,
            lastGrowthTick: 0,
          });
         addLogMessage(`경쟁사 ${randomAIName}이(가) 시장에 등장했습니다!`, "info");
    }
    setIsGameLoaded(true);
  }, [addLogMessage]);

  const handleRequestResetGame = useCallback(() => {
    setIsResetConfirmModalOpen(true);
  }, []);

  const handleConfirmResetGame = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    addLogMessage("게임 데이터가 초기화되었습니다. 페이지를 새로고침합니다.", "info");
    setIsResetConfirmModalOpen(false);
    // Short delay to allow log message to potentially render before reload.
    setTimeout(() => window.location.reload(), 100); 
  }, [addLogMessage]);

  const handleCancelResetGame = useCallback(() => {
    setIsResetConfirmModalOpen(false);
  }, []);

  const handleSaveGameManually = useCallback(() => {
    saveGameState();
    addLogMessage("게임 상태를 수동으로 저장했습니다.", 'success');
  }, [saveGameState, addLogMessage]);


  // Load game on initial mount
  useEffect(() => {
    loadGameState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  // Save game on before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if(isGameLoaded) { // Only save if game has loaded to prevent overwriting with initial state
          saveGameState();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveGameState, isGameLoaded]);


  useEffect(() => { // Initialize AI Store if it's null after loading (e.g. new game or failed load)
    if (isGameLoaded && !aiStoreRef.current) {
        const randomAIName = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)];
        const initialAIReputation = Math.floor(Math.random() * (AI_INITIAL_REPUTATION_MAX - AI_INITIAL_REPUTATION_MIN + 1)) + AI_INITIAL_REPUTATION_MIN;
        setAiStore({
            name: randomAIName,
            reputation: initialAIReputation,
            level: 1,
            attractionPower: initialAIReputation * AI_REP_ATTRACTION_WEIGHT + (AI_LEVEL_THRESHOLDS.length > 0 ? AI_LEVEL_THRESHOLDS[0] : 0) * AI_LEVEL_ATTRACTION_BONUS,
            lastActivityMessage: `${randomAIName} 오픈!`,
            lastGrowthTick: 0,
        });
        // Log is handled by loadGameState or if it's explicitly a new game
    }
  }, [isGameLoaded, addLogMessage]);


  const generateApplicants = useCallback(() => {
    if (Math.random() < APPLICANT_GENERATION_CHANCE_PER_DAY && availableApplicantsRef.current.length < MAX_APPLICANTS) {
      const numNewApplicants = Math.random() < 0.7 ? 1 : 2; 
      const newApplicants: StaffMember[] = [];
      const currentRep = reputationRef.current;

      const availableRoles = (Object.keys(STAFF_ROLE_DEFINITIONS) as StaffRole[]).filter(role => 
        currentRep >= STAFF_ROLE_DEFINITIONS[role].minReputationRequired
      );

      if(availableRoles.length === 0) return;

      for (let i = 0; i < numNewApplicants; i++) {
        if (availableApplicantsRef.current.length + newApplicants.length >= MAX_APPLICANTS) break;

        const role = availableRoles[Math.floor(Math.random() * availableRoles.length)];
        const definition = STAFF_ROLE_DEFINITIONS[role];
        const skillLevel = Math.floor(Math.random() * 3) + 1; 
        const salary = definition.baseSalaryPerDay + (skillLevel -1) * definition.skillPointSalaryBonus;
        
        let applicantName = STAFF_NAMES_POOL[Math.floor(Math.random() * STAFF_NAMES_POOL.length)];
        const allNames = [...staffRef.current.map(s => s.name), ...availableApplicantsRef.current.map(a => a.name), ...newApplicants.map(na => na.name)];
        let attempt = 0;
        while(allNames.includes(applicantName) && attempt < STAFF_NAMES_POOL.length * 2){
            applicantName = STAFF_NAMES_POOL[Math.floor(Math.random() * STAFF_NAMES_POOL.length)] + (attempt > STAFF_NAMES_POOL.length ? " Jr." : "");
            attempt++;
        }

        newApplicants.push({
          id: `staff-${Date.now()}-${Math.random()}`,
          name: applicantName,
          role,
          skillLevel,
          salaryPerDay: salary,
          assignedFloorId: null,
          emoji: definition.emoji,
        });
      }
      if (newApplicants.length > 0) {
        setAvailableApplicants(prev => [...prev, ...newApplicants].slice(0, MAX_APPLICANTS));
        addLogMessage(`${newApplicants.length}명의 새로운 직원 지원자가 도착했습니다.`, 'info');
      }
    }
  }, [addLogMessage]);

  useEffect(() => {
    if (isGameLoaded) { // Only run this after initial load
        generateApplicants();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameLoaded]); // Rerun if gameLoaded state changes (though it only changes once)

  const handleBuildShop = useCallback((shopTypeId: ShopType, floorIdx: number, slotIdx: number, isDelegation: boolean = false) => {
    const definition = SHOP_DEFINITIONS[shopTypeId];
    if (goldRef.current < definition.cost) {
      if (!isDelegation) addLogMessage("골드가 부족합니다!", 'error');
      return false;
    }

    setGold(prev => prev - definition.cost);
    setReputation(prev => prev + definition.baseReputation);
    setFloors(prevFloors => {
      const newFloors = prevFloors.map(f => ({...f, slots: f.slots.map(s => ({...s}))})); 
      const newShop: PlacedShop = {
        id: `shop-${floorIdx}-${slotIdx}-${Date.now()}`,
        shopTypeId,
        level: 1,
        currentIncome: definition.baseIncome,
        currentReputationBoost: definition.baseReputation,
        visitCount: 0, 
      };
      newFloors[floorIdx].slots[slotIdx].shop = newShop;
      return newFloors;
    });
    addLogMessage(`${isDelegation ? "[위임] " : ""}${definition.name} ${definition.emoji} 건설 완료!`, isDelegation ? 'delegation' : 'success');
    if (!isDelegation) {
        setIsBuildModalOpen(false);
        setSelectedSlot(null);
    }
    return true;
  }, [addLogMessage]);

  const handleInvestShop = useCallback((floorIdx: number, slotIdx: number, isDelegation: boolean = false) => {
    const shopToInvest = floorsRef.current[floorIdx]?.slots[slotIdx]?.shop;
    if (!shopToInvest) return false;
    
    const definition = SHOP_DEFINITIONS[shopToInvest.shopTypeId];
    const investmentCost = Math.floor(SHOP_INVESTMENT_COST_BASE * Math.pow(SHOP_INVESTMENT_COST_MULTIPLIER, shopToInvest.level -1));

    if (goldRef.current < investmentCost) {
      if (!isDelegation) addLogMessage("투자에 필요한 골드가 부족합니다!", 'error');
      return false;
    }

    setGold(prev => prev - investmentCost);
    setReputation(prev => prev + Math.floor(definition.baseReputation * 0.5 * shopToInvest.level)); 
    setFloors(prevFloors => {
      const newFloors = prevFloors.map(f => ({...f, slots: f.slots.map(s => ({...s, shop: s.shop ? {...s.shop} : null}))}));
      const targetShop = newFloors[floorIdx].slots[slotIdx].shop!;
      targetShop.level += 1;
      return newFloors;
    });
    addLogMessage(`${isDelegation ? "[위임] " : ""}"${definition.name}" ${shopToInvest.level +1 } 레벨로 투자 완료!`, isDelegation ? 'delegation' : 'success');
    return true;
  }, [addLogMessage]);

  const handleDemolishShop = useCallback(() => {
    if (!selectedSlot || !floorsRef.current[selectedSlot.floorIndex].slots[selectedSlot.slotIndex].shop) return;
    
    const shop = floorsRef.current[selectedSlot.floorIndex].slots[selectedSlot.slotIndex].shop!;
    const definition = SHOP_DEFINITIONS[shop.shopTypeId];
    const refund = Math.floor(definition.cost * 0.25); 

    setGold(prev => prev + refund);
    setFloors(prevFloors => {
      const newFloors = prevFloors.map(f => ({...f, slots: f.slots.map(s => ({...s}))}));
      newFloors[selectedSlot.floorIndex].slots[selectedSlot.slotIndex].shop = null;
      return newFloors;
    });
    addLogMessage(`"${definition.name}" 철거 완료. +${refund}G`, 'info');
    setIsManageModalOpen(false);
    setSelectedSlot(null);
  }, [addLogMessage, selectedSlot]);


  const handleAddFloor = useCallback((isDelegation: boolean = false) => {
    const cost = calculateNewFloorCost();
    if (goldRef.current < cost) {
      if (!isDelegation) addLogMessage("새 층을 건설할 골드가 부족합니다!", 'error');
      return false;
    }
    setGold(prev => prev - cost);
    setFloors(prevFloors => [
      ...prevFloors,
      {
        id: `floor-${prevFloors.length}-${Date.now()}`,
        floorNumber: prevFloors.length + 1,
        slots: Array(SLOTS_PER_FLOOR).fill(null).map(() => ({ shop: null })),
        activeSynergies: [],
        cleanliness: DEFAULT_FLOOR_CLEANLINESS,
      }
    ]);
    addLogMessage(`${isDelegation ? "[위임] " : ""}${floorsRef.current.length + 1}층 건설 완료!`, isDelegation ? 'delegation' : 'success');
    return true;
  }, [addLogMessage, calculateNewFloorCost]);

  const handleStartMarketingCampaign = useCallback((campaignId: string, isDelegation: boolean = false) => { 
    const definition = MARKETING_CAMPAIGN_DEFINITIONS.find(c => c.id === campaignId);
    if (!definition) {
      if (!isDelegation) addLogMessage("알 수 없는 마케팅 캠페인입니다.", "error");
      return false;
    }
    if (goldRef.current < definition.cost) {
      if (!isDelegation) addLogMessage(`"${definition.name}" 캠페인을 시작하기 위한 골드가 부족합니다!`, "error");
      return false;
    }
    if (activeMarketingCampaignRef.current) {
      if (!isDelegation) addLogMessage("이미 다른 마케팅 캠페인이 진행 중입니다.", "error");
      return false;
    }
    if (definition.minReputationRequired && reputationRef.current < definition.minReputationRequired) {
        if (!isDelegation) addLogMessage(`"${definition.name}" 캠페인을 시작하려면 평판 ${definition.minReputationRequired}이 필요합니다.`, 'error');
        return false;
    }

    setGold(g => g - definition.cost);
    if (definition.effects.reputationBoostOnStart) {
      setReputation(r => r + definition.effects.reputationBoostOnStart!);
    }
    setActiveMarketingCampaign({ ...definition, ticksRemaining: definition.durationTicks });
    addLogMessage(`${isDelegation ? "[위임] " : ""}마케팅 캠페인 "${definition.name}"을(를) 시작합니다!`, isDelegation ? 'delegation' : 'success');
    if (!isDelegation) setIsMarketingModalOpen(false);
    return true;
  }, [addLogMessage]);

  const handleUnlockResearch = useCallback((researchId: string, isDelegation: boolean = false) => {
    const researchDef = RESEARCH_DEFINITIONS.find(r => r.id === researchId);
    if (!researchDef) {
      if(!isDelegation) addLogMessage("알 수 없는 연구입니다.", "error");
      return false;
    }
    if (researchPointsRef.current < researchDef.costRP) {
      if(!isDelegation) addLogMessage(`"${researchDef.name}" 연구에 필요한 RP가 부족합니다! (필요: ${researchDef.costRP} RP)`, "error");
      return false;
    }
    if (completedResearchRef.current.has(researchId)) {
      if(!isDelegation) addLogMessage(`"${researchDef.name}" 연구는 이미 완료되었습니다.`, "info");
      return false;
    }
    if (researchDef.prerequisites && !researchDef.prerequisites.every(pId => completedResearchRef.current.has(pId))) {
      if(!isDelegation) {
        const unmetPrereqs = researchDef.prerequisites
          .filter(pId => !completedResearchRef.current.has(pId))
          .map(pId => RESEARCH_DEFINITIONS.find(r => r.id === pId)?.name || pId)
          .join(', ');
        addLogMessage(`"${researchDef.name}" 연구의 선행 조건(${unmetPrereqs})이(가) 충족되지 않았습니다.`, "error");
      }
      return false;
    }

    setResearchPoints(rp => rp - researchDef.costRP);
    setCompletedResearch(prev => new Set(prev).add(researchId));
    addLogMessage(`${isDelegation ? "[위임] " : ""}연구 완료: ${researchDef.name} ${researchDef.emoji}! 효과가 적용됩니다.`, isDelegation ? 'delegation' : 'success');

    researchDef.effects.forEach(effect => {
      switch (effect.type) {
        case ResearchEffectType.UNLOCK_SHOP:
          if (effect.shopType && !unlockedShopTypesRef.current.includes(effect.shopType)) {
            setUnlockedShopTypes(prev => [...prev, effect.shopType!]);
            const shopDetail = SHOP_DEFINITIONS[effect.shopType as ShopType];
            addLogMessage(`연구로 새로운 상점 "${shopDetail.name} ${shopDetail.emoji}" 잠금 해제!`, 'info');
          }
          break;
        case ResearchEffectType.INCREASE_MAX_VOC_MESSAGES:
          if (typeof effect.value === 'number') {
            setCurrentMaxVOCs(prev => {
                const newValue = prev + effect.value!;
                addLogMessage(`최대 VOC 메시지 표시 개수가 ${effect.value}만큼 증가했습니다. (현재: ${newValue})`, 'info');
                return newValue;
            });
          }
          break;
        case ResearchEffectType.GLOBAL_INCOME_MULTIPLIER:
          break;
        case ResearchEffectType.INCREASE_MAX_STAFF_SLOTS:
            if (typeof effect.value === 'number') {
                setMaxStaffSlots(prev => {
                    const newValue = prev + effect.value!;
                    addLogMessage(`최대 직원 고용 슬롯이 ${effect.value}만큼 증가했습니다. (현재: ${newValue})`, 'info');
                    return newValue;
                });
            }
            break;
      }
    });
    return true;
  }, [addLogMessage]);


  const handleHireStaff = useCallback((applicantId: string, isDelegation: boolean = false) => {
    if (staffRef.current.length >= maxStaffSlotsRef.current) {
      if(!isDelegation) addLogMessage("최대 직원 수에 도달했습니다. 더 고용하려면 연구를 통해 슬롯을 늘리세요.", "error");
      return false;
    }
    const applicant = availableApplicantsRef.current.find(a => a.id === applicantId);
    if (!applicant) {
      if(!isDelegation) addLogMessage("유효하지 않은 지원자입니다.", "error");
      return false;
    }

    setStaff(prevStaff => [...prevStaff, applicant]);
    setAvailableApplicants(prevApplicants => prevApplicants.filter(a => a.id !== applicantId));
    addLogMessage(`${isDelegation ? "[위임] " : ""}${applicant.emoji}${applicant.name} (${STAFF_ROLE_DEFINITIONS[applicant.role].name}) 님을 고용했습니다! 일일 급여: ${applicant.salaryPerDay.toLocaleString()}G`, isDelegation ? 'delegation' : "success");
    return true;
  }, [addLogMessage]);

  const handleFireStaff = useCallback((staffId: string) => { 
    const staffToFire = staffRef.current.find(s => s.id === staffId);
    if (!staffToFire) return;

    setStaff(prevStaff => prevStaff.filter(s => s.id !== staffId));
    addLogMessage(`${staffToFire.emoji}${staffToFire.name} 님을 해고했습니다.`, "info");
  }, [addLogMessage]);

  const handleAssignStaffToFloor = useCallback((staffId: string, floorId: string | null, isDelegation: boolean = false) => {
    setStaff(prevStaff => prevStaff.map(s => {
      if (s.id === staffId) {
        if (s.assignedFloorId !== floorId) { 
            const floorNumber = floorId ? floorsRef.current.find(f=>f.id === floorId)?.floorNumber : null;
            const assignmentMsg = floorNumber ? `${floorNumber}층에` : "미배정 상태로";
            addLogMessage(`${isDelegation ? "[위임] " : ""}${s.emoji}${s.name} 님을 ${assignmentMsg} 배정했습니다.`, isDelegation ? 'delegation' : "info");
        }
        return { ...s, assignedFloorId: floorId };
      }
      return s;
    }));
    return true; 
  }, [addLogMessage]);
  
  // Main Game Loop
  useEffect(() => {
    if (!isGameLoaded || isPausedRef.current) { 
      return; 
    }

    const intervalId = setInterval(() => {
      const currentTickForLogic = tickCounterRef.current;
      let nextTickValue = currentTickForLogic + 1;

      let incomeThisTick = 0;
      const currentActiveMarketingCampaign = activeMarketingCampaignRef.current;
      const currentCompletedResearch = completedResearchRef.current;
      const currentStaff = staffRef.current;

      const newFloorsWithIncomeAndVisits = floorsRef.current.map(floor => {
        let floorIncomeBoostFromManager = 0;
        const managerOnFloor = currentStaff.find(s => s.role === StaffRole.MANAGER && s.assignedFloorId === floor.id);
        if (managerOnFloor) {
            const managerDef = STAFF_ROLE_DEFINITIONS[StaffRole.MANAGER];
            if(managerDef.effectsPerSkillLevel.floorIncomeBoostPercent) {
                 floorIncomeBoostFromManager = managerDef.effectsPerSkillLevel.floorIncomeBoostPercent * managerOnFloor.skillLevel;
            }
        }

        return {
        ...floor,
        slots: floor.slots.map(slot => {
          if (slot.shop) {
            const definition = SHOP_DEFINITIONS[slot.shop.shopTypeId];
            let effectiveIncome = definition.baseIncome * slot.shop.level;
            
            effectiveIncome *= (1 + floorIncomeBoostFromManager);

            floor.activeSynergies.forEach(synergy => {
              if (synergy.incomeBonusPercent) {
                effectiveIncome *= (1 + synergy.incomeBonusPercent);
              }
            });

            RESEARCH_DEFINITIONS.forEach(researchDef => {
                if (currentCompletedResearch.has(researchDef.id)) {
                    researchDef.effects.forEach(effect => {
                        if (effect.type === ResearchEffectType.GLOBAL_INCOME_MULTIPLIER && typeof effect.value === 'number') {
                            if (!effect.category || effect.category === definition.category) {
                                effectiveIncome *= (1 + effect.value);
                            }
                        }
                    });
                }
            });

            if (activeEventRef.current?.incomeMultiplier) {
              effectiveIncome *= activeEventRef.current.incomeMultiplier;
            }
            if (currentActiveMarketingCampaign?.effects.incomeMultiplier) {
              effectiveIncome *= currentActiveMarketingCampaign.effects.incomeMultiplier;
            }
            
            const roundedIncome = Math.round(effectiveIncome);
            incomeThisTick += roundedIncome;
            
            const newVisitCount = (slot.shop.visitCount || 0) + (roundedIncome > 0 ? Math.ceil(Math.random() * 3) : 0); 

            return { 
              ...slot, 
              shop: { 
                ...slot.shop, 
                currentIncome: roundedIncome,
                visitCount: newVisitCount 
              } 
            };
          }
          return slot;
        })
      }});
      setFloors(newFloorsWithIncomeAndVisits);
      setGold(g => g + incomeThisTick);

      if (aiStoreRef.current && (currentTickForLogic - aiStoreRef.current.lastGrowthTick >= AI_GROWTH_INTERVAL_TICKS || currentTickForLogic < aiStoreRef.current.lastGrowthTick)) {
        setAiStore(prevAiStore => {
          if (!prevAiStore) return null;
          let newReputation = prevAiStore.reputation + AI_REP_GAIN_PER_INTERVAL_BASE + Math.floor(departmentRankIndex * AI_REP_GAIN_PER_PLAYER_LEVEL_BONUS);
          newReputation = Math.max(0, newReputation); 
          let newLevel = prevAiStore.level;
          let activityMessage = prevAiStore.lastActivityMessage;

          const currentLevelThreshold = AI_LEVEL_THRESHOLDS[newLevel -1];
          const nextLevelThreshold = AI_LEVEL_THRESHOLDS[newLevel];

          if (nextLevelThreshold !== undefined && newReputation >= nextLevelThreshold) {
            newLevel = Math.min(newLevel + 1, AI_LEVEL_THRESHOLDS.length);
            activityMessage = `${prevAiStore.name} 확장! (레벨 ${newLevel} 달성)`;
            addLogMessage(activityMessage, 'info');
          } else if (Math.random() < 0.2) { 
             activityMessage = `${prevAiStore.name}의 명성이 상승 중입니다.`;
          }
          
          const newAttractionPower = newReputation * AI_REP_ATTRACTION_WEIGHT + (newLevel-1) * AI_LEVEL_ATTRACTION_BONUS;

          return {
            ...prevAiStore,
            reputation: newReputation,
            level: newLevel,
            attractionPower: newAttractionPower,
            lastActivityMessage: activityMessage,
            lastGrowthTick: currentTickForLogic,
          };
        });
      }


      if (nextTickValue >= TICKS_PER_DAY) {
        const currentDayValue = dayRef.current;
        setDay(d => d + 1);
        nextTickValue = 0; 
        
        setResearchPoints(rp => rp + RP_PER_DAY);
        addLogMessage(`새로운 ${currentDayValue + 1}일차 시작! (+${RP_PER_DAY} RP 획득)`, 'info');

        let totalSalaries = 0;
        staffRef.current.forEach(s => totalSalaries += s.salaryPerDay);
        if (totalSalaries > 0) {
          setGold(g => {
            const newGold = g - totalSalaries;
            if (newGold < 0) addLogMessage(`골드 부족! 직원 급여 ${totalSalaries.toLocaleString()}G를 지불하지 못했습니다.`, 'error');
            return Math.max(0, newGold);
          });
        }
        
        setFloors(prevFloors => prevFloors.map(f => {
          let newCleanliness = Math.max(0, f.cleanliness - FLOOR_CLEANLINESS_DECAY_RATE_PER_DAY);
          staffRef.current.forEach(s => {
            if (s.role === StaffRole.CLEANER && s.assignedFloorId === f.id) {
              const cleanerDef = STAFF_ROLE_DEFINITIONS[StaffRole.CLEANER];
              if(cleanerDef.effectsPerSkillLevel.floorCleanlinessBoostPerDay){
                newCleanliness += cleanerDef.effectsPerSkillLevel.floorCleanlinessBoostPerDay * s.skillLevel;
              }
            }
          });
          return { ...f, cleanliness: Math.min(100, Math.max(0, newCleanliness)) };
        }));

        let totalRepBoostFromManagers = 0;
        staffRef.current.forEach(s => {
            if (s.role === StaffRole.MANAGER && s.assignedFloorId) {
                 const managerDef = STAFF_ROLE_DEFINITIONS[StaffRole.MANAGER];
                 if(managerDef.effectsPerSkillLevel.globalReputationBoostPerDay) {
                    totalRepBoostFromManagers += managerDef.effectsPerSkillLevel.globalReputationBoostPerDay * s.skillLevel;
                 }
            }
        });
        if(totalRepBoostFromManagers > 0) {
            setReputation(r => r + totalRepBoostFromManagers);
            addLogMessage(`관리자들로부터 평판 +${totalRepBoostFromManagers} 획득!`, 'success');
        }

        generateApplicants();
        saveGameState(); // Save at the end of the day
      }
      setTickCounter(nextTickValue);

      if (activeEventRef.current) {
        if (activeEventRef.current.ticksRemaining > 1) {
          setActiveEvent(prev => prev ? { ...prev, ticksRemaining: prev.ticksRemaining - 1 } : null);
        } else {
          addLogMessage(`${activeEventRef.current.name} 이벤트가 종료되었습니다.`, 'info');
          setActiveEvent(null);
        }
      }

       if (activeMarketingCampaignRef.current) {
        if (activeMarketingCampaignRef.current.ticksRemaining > 1) {
          setActiveMarketingCampaign(prev => prev ? { ...prev, ticksRemaining: prev.ticksRemaining - 1 } : null);
        } else {
          addLogMessage(`마케팅 캠페인 "${activeMarketingCampaignRef.current.name}"이(가) 종료되었습니다.`, 'info');
          setActiveMarketingCampaign(null);
        }
      }

      if (!activeEventRef.current) {
        const gameStateForEventTrigger = getGameState(); 
        PERIODIC_EVENT_DEFINITIONS.forEach(eventDef => {
          if (eventDef.triggerCondition ? eventDef.triggerCondition(gameStateForEventTrigger) : (gameStateForEventTrigger.day % 7 === 0 && eventDef.id === "WEEKEND_SALE")) { 
            if(Math.random() < 0.3){ 
                 setActiveEvent({ ...eventDef, ticksRemaining: eventDef.durationTicks });
                 addLogMessage(`이벤트 시작: ${eventDef.name}!`, 'info');
            }
          }
        });
      }
      
        setCustomerStats(prevStats => {
            const currentRep = reputationRef.current;
            const currentFloors = floorsRef.current;
            const currentDay = dayRef.current;
            const currentAiStore = aiStoreRef.current;

            let playerAttractionScore = currentRep * PLAYER_REP_ATTRACTION_WEIGHT;
            const totalShops = currentFloors.reduce((sum, f) => sum + f.slots.filter(s => s.shop).length, 0);
            playerAttractionScore += totalShops * PLAYER_SHOP_COUNT_ATTRACTION_WEIGHT;
            
            let totalShopLevels = 0;
            currentFloors.forEach(f => f.slots.forEach(s => { if (s.shop) totalShopLevels += s.shop.level; }));
            const avgShopLevel = totalShops > 0 ? totalShopLevels / totalShops : 0;
            playerAttractionScore += avgShopLevel * PLAYER_AVG_SHOP_LEVEL_ATTRACTION_WEIGHT;

            const totalCleanliness = currentFloors.reduce((sum, f) => sum + f.cleanliness, 0);
            const avgCleanliness = currentFloors.length > 0 ? totalCleanliness / currentFloors.length : 0;
            playerAttractionScore += (avgCleanliness / 100) * PLAYER_AVG_CLEANLINESS_ATTRACTION_WEIGHT * 100; 

            if (activeEventRef.current?.customerAttractionBoost) {
                playerAttractionScore += activeEventRef.current.customerAttractionBoost * 5; 
            }
             if (activeMarketingCampaignRef.current?.effects.customerAttractionBoost) {
                playerAttractionScore += activeMarketingCampaignRef.current.effects.customerAttractionBoost * 5;
            }
            playerAttractionScore *= (1 + (Math.random() * CUSTOMER_ATTRACTION_RANDOM_FACTOR * 2 - CUSTOMER_ATTRACTION_RANDOM_FACTOR)); 
            playerAttractionScore = Math.max(1, playerAttractionScore); 

            const aiAttractionScore = currentAiStore ? currentAiStore.attractionPower : 0;
            const totalMarketAttraction = playerAttractionScore + aiAttractionScore;
            
            let currentPlayerMarketShare = 100;
            if (totalMarketAttraction > 0) {
                 currentPlayerMarketShare = (playerAttractionScore / totalMarketAttraction) * 100;
            } else if (aiAttractionScore > 0) { 
                 currentPlayerMarketShare = 0;
            }
            setPlayerMarketShare(currentPlayerMarketShare);


            const baseNewCustomersPotential = BASE_POTENTIAL_CUSTOMERS_PER_TICK + Math.floor(currentDay * CUSTOMER_GROWTH_PER_DAY_FACTOR);
            const actualPlayerNewCustomers = Math.floor(baseNewCustomersPotential * (currentPlayerMarketShare / 100));

            const availableCustomerTypesForPlayer = UNLOCKABLE_CUSTOMER_TYPES_BY_REPUTATION
                .filter(ct => currentRep >= ct.reputation)
                .map(ct => ct.customerType);

            const newTypeCounts = { ...prevStats.types };
            Object.values(CustomerType).forEach(type => { 
                 if (!availableCustomerTypesForPlayer.includes(type as CustomerType)) {
                    newTypeCounts[type as CustomerType] = 0;
                }
            });
            
            if (actualPlayerNewCustomers > 0 && availableCustomerTypesForPlayer.length > 0) {
                 for (let i = 0; i < actualPlayerNewCustomers; i++) {
                    const randomType = availableCustomerTypesForPlayer[Math.floor(Math.random() * availableCustomerTypesForPlayer.length)];
                    newTypeCounts[randomType] = (newTypeCounts[randomType] || 0) + 1;
                }
            }

            Object.keys(newTypeCounts).forEach(typeStr => {
                const type = typeStr as CustomerType;
                let currentCountForType = newTypeCounts[type];
                 if (currentCountForType > 0 && Math.random() < 0.01) { 
                    currentCountForType -= 1;
                }
                const maxCapForType = 10 + Math.floor(currentRep / 20) + (currentFloors.length * 3) + Math.floor(totalShops / 2);
                newTypeCounts[type] = Math.max(0, Math.min(currentCountForType, maxCapForType));
            });
            
            const newTotalCustomers = Object.values(newTypeCounts).reduce((sum, count) => sum + count, 0);
            return { total: newTotalCustomers, types: newTypeCounts };
        });


      if ((tickCounterRef.current % (Math.floor(TICKS_PER_DAY / 4))) === 0) { 
        const gameStateForVOC = getGameState();
        const potentialVOCs = VOC_MESSAGES_DEFINITIONS.filter(voc => 
          voc.triggerCondition ? voc.triggerCondition(gameStateForVOC) : true
        );
        if (potentialVOCs.length > 0 && Math.random() < 0.2) { 
          const newVOC = potentialVOCs[Math.floor(Math.random() * potentialVOCs.length)];
          setActiveVOCs(prev => {
            if (prev.length > 0 && prev[0].id === newVOC.id && (Date.now() - prev[0].timestamp < 10000)) { 
                return prev;
            }
            return [{ ...newVOC, displayId: `voc-${Date.now()}`, timestamp: Date.now() }, ...prev].slice(0, currentMaxVOCsRef.current);
          });
        }
      }

      if (isDelegationModeActiveRef.current) {
        const goldReserve = Math.max(DELEGATION_GOLD_RESERVE_FIXED_AMOUNT, goldRef.current * DELEGATION_GOLD_RESERVE_PERCENTAGE);
        const SYNERGY_COMPLETION_SCORE_BONUS_FACTOR = 3.0; 
        const SYNERGY_CONTRIBUTION_SCORE_BONUS_FACTOR = 1.0;

        if (currentTickForLogic % DELEGATION_MODE_BUILD_CHECK_INTERVAL_TICKS === 0) {
            const possibleBuildActions: {
                shopDef: ShopDefinition;
                floorIndex: number;
                slotIndex: number;
                score: number;
            }[] = [];

            floorsRef.current.forEach((floor, floorIndex) => {
                floor.slots.forEach((slot, slotIndex) => {
                    if (!slot.shop) { // If slot is empty
                        const currentShopsOnFloorTypes = floor.slots
                            .map(s => s.shop?.shopTypeId)
                            .filter(Boolean) as ShopType[];

                        Object.values(SHOP_DEFINITIONS)
                            .filter(shopDefToConsider =>
                                ((!shopDefToConsider.minReputationRequired || reputationRef.current >= shopDefToConsider.minReputationRequired) || unlockedShopTypesRef.current.includes(shopDefToConsider.id)) &&
                                (!shopDefToConsider.isResearchLocked || (shopDefToConsider.isResearchLocked && unlockedShopTypesRef.current.includes(shopDefToConsider.id))) &&
                                goldRef.current >= shopDefToConsider.cost + goldReserve
                            )
                            .forEach(shopDefToConsider => {
                                let baseScore = (shopDefToConsider.baseReputation * DELEGATION_SHOP_REPUTATION_WEIGHT + shopDefToConsider.baseIncome * DELEGATION_SHOP_INCOME_WEIGHT) / (shopDefToConsider.cost || 1);
                                let synergyScoreContribution = 0;

                                SYNERGY_DEFINITIONS.forEach(synergyDef => {
                                    const isAlreadyActiveOnFloor = floor.activeSynergies.some(as => as.id === synergyDef.id);
                                    if (isAlreadyActiveOnFloor) return;

                                    const tempShopsOnFloorTypes = [...currentShopsOnFloorTypes, shopDefToConsider.id];
                                    const tempShopsOnFloorCategories = tempShopsOnFloorTypes.map(typeId => SHOP_DEFINITIONS[typeId].category);

                                    let completedByType = true;
                                    if (synergyDef.requiredShopTypes.length > 0) {
                                        completedByType = synergyDef.requiredShopTypes.every(reqType => tempShopsOnFloorTypes.includes(reqType));
                                    }
                                    let completedByCategory = true;
                                    if (synergyDef.requiredCategories) {
                                        completedByCategory = synergyDef.requiredCategories.every(reqCat =>
                                            tempShopsOnFloorCategories.filter(cat => cat === reqCat.category).length >= reqCat.count
                                        );
                                    }

                                    if (completedByType && completedByCategory) {
                                        synergyScoreContribution += (shopDefToConsider.baseReputation + shopDefToConsider.baseIncome) * SYNERGY_COMPLETION_SCORE_BONUS_FACTOR;
                                    } else {
                                        let contributesToSynergy = false;
                                        if (synergyDef.requiredShopTypes.length > 0 && synergyDef.requiredShopTypes.includes(shopDefToConsider.id)) {
                                            contributesToSynergy = true;
                                        }
                                        if (synergyDef.requiredCategories) {
                                            synergyDef.requiredCategories.forEach(reqCat => {
                                                if (reqCat.category === shopDefToConsider.category) {
                                                    const currentCountOfCategory = currentShopsOnFloorTypes
                                                        .map(typeId => SHOP_DEFINITIONS[typeId].category)
                                                        .filter(cat => cat === reqCat.category).length;
                                                    if (currentCountOfCategory < reqCat.count) {
                                                        contributesToSynergy = true;
                                                    }
                                                }
                                            });
                                        }
                                        if (contributesToSynergy) {
                                            synergyScoreContribution += (shopDefToConsider.baseReputation + shopDefToConsider.baseIncome) * SYNERGY_CONTRIBUTION_SCORE_BONUS_FACTOR;
                                        }
                                    }
                                });
                                
                                let finalScore = baseScore + (synergyScoreContribution / (shopDefToConsider.cost || 1));


                                if (CHEAP_FACILITY_TYPES_FOR_DELEGATION_LIMIT.includes(shopDefToConsider.id)) {
                                    const getShopCount = (shopTypeId: ShopType): number => {
                                        return floorsRef.current.reduce((count, f) => {
                                            return count + f.slots.filter(s => s.shop?.shopTypeId === shopTypeId).length;
                                        }, 0);
                                    };
                                    const currentCount = getShopCount(shopDefToConsider.id);
                                    if (currentCount >= DELEGATION_MAX_COUNT_CHEAP_FACILITIES) {
                                        finalScore *= 0.01;
                                    }
                                }
                                
                                const needsRestroom = !floorsRef.current.some(f => f.slots.some(s => s.shop?.shopTypeId === ShopType.RESTROOM)) && customerStatsRef.current.total > 20;
                                if (shopDefToConsider.id === ShopType.RESTROOM && needsRestroom && unlockedShopTypesRef.current.includes(ShopType.RESTROOM)) {
                                    finalScore *= 1000; // Apply large multiplier for essential needs
                                }
                    
                                const needsInfoDesk = !floorsRef.current.some(f => f.slots.some(s => s.shop?.shopTypeId === ShopType.INFORMATION_DESK)) && customerStatsRef.current.total > 10 && floorsRef.current.length > 0 ;
                                if (shopDefToConsider.id === ShopType.INFORMATION_DESK && needsInfoDesk && unlockedShopTypesRef.current.includes(ShopType.INFORMATION_DESK)) {
                                    finalScore *= 800; // Apply large multiplier
                                }

                                if (finalScore > 0.001) {
                                     possibleBuildActions.push({
                                        shopDef: shopDefToConsider,
                                        floorIndex,
                                        slotIndex,
                                        score: finalScore
                                    });
                                }
                            });
                    }
                });
            });

            if (possibleBuildActions.length > 0) {
                possibleBuildActions.sort((a, b) => b.score - a.score);
                const bestAction = possibleBuildActions[0];
                handleBuildShop(bestAction.shopDef.id, bestAction.floorIndex, bestAction.slotIndex, true);
            }
        }
        
        if (currentTickForLogic % DELEGATION_MODE_INVEST_CHECK_INTERVAL_TICKS === 0) {
            const shopsToInvest: {floorIndex: number, slotIndex: number, shop: PlacedShop, def: ShopDefinition, score: number}[] = [];
            floorsRef.current.forEach((floor, floorIndex) => {
                floor.slots.forEach((slot, slotIndex) => {
                    if (slot.shop && slot.shop.level < 10) { 
                        const def = SHOP_DEFINITIONS[slot.shop.shopTypeId];
                        if (def.category === ShopCategory.FACILITY || def.category === ShopCategory.SPECIAL) return; 

                        const investmentCost = Math.floor(SHOP_INVESTMENT_COST_BASE * Math.pow(SHOP_INVESTMENT_COST_MULTIPLIER, slot.shop.level -1));
                        if (goldRef.current >= investmentCost + goldReserve) {
                            const repGain = Math.floor(def.baseReputation * 0.5 * slot.shop.level);
                            const score = (repGain * DELEGATION_SHOP_REPUTATION_WEIGHT) + (def.baseIncome * DELEGATION_SHOP_INCOME_WEIGHT) / investmentCost;
                            shopsToInvest.push({floorIndex, slotIndex, shop: slot.shop, def, score});
                        }
                    }
                });
            });
            if (shopsToInvest.length > 0) {
                shopsToInvest.sort((a,b) => b.score - a.score);
                handleInvestShop(shopsToInvest[0].floorIndex, shopsToInvest[0].slotIndex, true);
            }
        }

        if (currentTickForLogic % DELEGATION_MODE_RESEARCH_CHECK_INTERVAL_TICKS === 0) {
            const availableResearch = RESEARCH_DEFINITIONS.filter(r => 
                !completedResearchRef.current.has(r.id) &&
                researchPointsRef.current >= r.costRP &&
                (!r.prerequisites || r.prerequisites.every(pId => completedResearchRef.current.has(pId)))
            ).sort((a,b) => { 
                const scoreA = (a.effects.some(e => e.type === ResearchEffectType.UNLOCK_SHOP) ? 100 : 0) +
                               (a.effects.some(e => e.type === ResearchEffectType.INCREASE_MAX_STAFF_SLOTS) ? 50 : 0) -
                               a.costRP;
                const scoreB = (b.effects.some(e => e.type === ResearchEffectType.UNLOCK_SHOP) ? 100 : 0) +
                               (b.effects.some(e => e.type === ResearchEffectType.INCREASE_MAX_STAFF_SLOTS) ? 50 : 0) -
                               b.costRP;
                return scoreB - scoreA;
            });
            if (availableResearch.length > 0) {
                handleUnlockResearch(availableResearch[0].id, true);
            }
        }
        
        if (currentTickForLogic % DELEGATION_MODE_MARKETING_CHECK_INTERVAL_TICKS === 0 && !activeMarketingCampaignRef.current) {
            const availableCampaigns = MARKETING_CAMPAIGN_DEFINITIONS.filter(c => 
                goldRef.current >= c.cost + goldReserve &&
                (!c.minReputationRequired || reputationRef.current >= c.minReputationRequired)
            ).sort((a,b) => (b.effects.reputationBoostOnStart || 0) - (a.effects.reputationBoostOnStart || 0)); 
            
            if (availableCampaigns.length > 0) {
                handleStartMarketingCampaign(availableCampaigns[0].id, true);
            }
        }

        if (currentTickForLogic % DELEGATION_MODE_STAFF_CHECK_INTERVAL_TICKS === 0) {
            if (staffRef.current.length < maxStaffSlotsRef.current && availableApplicantsRef.current.length > 0) {
                const bestApplicant = availableApplicantsRef.current
                    .filter(app => STAFF_ROLE_DEFINITIONS[app.role].minReputationRequired <= reputationRef.current)
                    .sort((a,b) => { 
                        let scoreA = a.skillLevel / a.salaryPerDay;
                        if (a.role === StaffRole.MANAGER) scoreA += 100;
                        else if (a.role === StaffRole.CLEANER) scoreA += 50;
                        
                        let scoreB = b.skillLevel / b.salaryPerDay;
                        if (b.role === StaffRole.MANAGER) scoreB += 100;
                        else if (b.role === StaffRole.CLEANER) scoreB += 50;
                        return scoreB - scoreA;
                    })[0];
                
                if (bestApplicant) {
                    handleHireStaff(bestApplicant.id, true);
                }
            }
            staffRef.current.forEach(staffMember => {
                if (!staffMember.assignedFloorId) {
                    if (staffMember.role === StaffRole.MANAGER) {
                        const unmanagedFloors = floorsRef.current.filter(f => !staffRef.current.some(s => s.role === StaffRole.MANAGER && s.assignedFloorId === f.id));
                        if (unmanagedFloors.length > 0) handleAssignStaffToFloor(staffMember.id, unmanagedFloors[0].id, true);
                    } else if (staffMember.role === StaffRole.CLEANER) {
                        const dirtyFloors = floorsRef.current
                            .filter(f => !staffRef.current.some(s => s.role === StaffRole.CLEANER && s.assignedFloorId === f.id))
                            .sort((a,b) => a.cleanliness - b.cleanliness);
                        if (dirtyFloors.length > 0 && dirtyFloors[0].cleanliness < DELEGATION_CLEANLINESS_HIRE_THRESHOLD + 20) { 
                             handleAssignStaffToFloor(staffMember.id, dirtyFloors[0].id, true);
                        }
                    }
                }
            });
        }
        
        if (currentTickForLogic % DELEGATION_MODE_NEW_FLOOR_CHECK_INTERVAL_TICKS === 0) {
            const totalSlots = floorsRef.current.length * SLOTS_PER_FLOOR;
            const filledSlots = floorsRef.current.reduce((acc, f) => acc + f.slots.filter(s => s.shop).length, 0);
            if ((filledSlots / totalSlots) >= DELEGATION_MIN_SLOTS_BEFORE_NEW_FLOOR) {
                const cost = calculateNewFloorCost();
                if (goldRef.current >= cost + goldReserve * 2) { 
                    handleAddFloor(true);
                }
            }
        }
      }


    }, GAME_TICK_INTERVAL_MS / gameSpeedRef.current);

    return () => clearInterval(intervalId); 
  }, [isGameLoaded, isPaused, gameSpeed, addLogMessage, getGameState, generateApplicants, departmentRankIndex, handleBuildShop, handleInvestShop, handleAddFloor, handleStartMarketingCampaign, handleUnlockResearch, handleHireStaff, handleAssignStaffToFloor, calculateNewFloorCost, saveGameState]); 


  useEffect(() => {
    if (!isGameLoaded) return; // Don't run quest/unlock checks until game is loaded
    const currentGameState = getGameState(); 
    setQuests(prevQuests => 
      prevQuests.map(quest => {
        if (quest.status === QuestStatus.ACTIVE && quest.getCurrentValue(currentGameState) >= quest.targetValue) {
          addLogMessage(`퀘스트 완료: ${quest.title}!`, 'success');
          if (quest.reward.gold) setGold(g => g + quest.reward.gold!);
          if (quest.reward.reputation) setReputation(r => r + quest.reward.reputation!);
          if (quest.reward.researchPoints) setResearchPoints(rp => rp + quest.reward.researchPoints!);
          if (quest.reward.unlockShopTypes) {
            setUnlockedShopTypes(prevUnlocked => {
              const newlyUnlocked = quest.reward.unlockShopTypes!.filter(type => !prevUnlocked.includes(type));
              if (newlyUnlocked.length > 0) {
                newlyUnlocked.forEach(shopId => addLogMessage(`새로운 상점 잠금 해제: ${SHOP_DEFINITIONS[shopId].name} ${SHOP_DEFINITIONS[shopId].emoji}!`, 'info'));
                return [...prevUnlocked, ...newlyUnlocked];
              }
              return prevUnlocked;
            });
          }
          return { ...quest, status: QuestStatus.COMPLETED };
        }
        return quest;
      })
    );

    Object.values(SHOP_DEFINITIONS).forEach(shopDef => {
      if (shopDef.minReputationRequired && currentGameState.reputation >= shopDef.minReputationRequired && 
          !currentGameState.unlockedShopTypes.includes(shopDef.id) && !shopDef.isResearchLocked) {
        setUnlockedShopTypes(prevUnlocked => {
          if (!prevUnlocked.includes(shopDef.id)) {
            addLogMessage(`평판으로 새로운 상점 잠금 해제: ${shopDef.name} ${shopDef.emoji}!`, 'info');
            return [...prevUnlocked, shopDef.id];
          }
          return prevUnlocked;
        });
      }
    });
  }, [isGameLoaded, reputation, floors, gold, day, researchPoints, staff, addLogMessage, getGameState]);


  const checkSynergies = useCallback(() => {
    setFloors(prevFloors => prevFloors.map(floor => {
      const presentShopTypesOnFloor = floor.slots.map(s => s.shop?.shopTypeId).filter(Boolean) as ShopType[];
      const presentShopCategoriesOnFloor = presentShopTypesOnFloor.map(typeId => SHOP_DEFINITIONS[typeId].category);
      
      const newActiveSynergies: Synergy[] = [];
      SYNERGY_DEFINITIONS.forEach(synergyDef => {
        let satisfied = true;
        if (synergyDef.requiredShopTypes.length > 0) {
          satisfied = synergyDef.requiredShopTypes.every(reqType => presentShopTypesOnFloor.includes(reqType));
        }
        if (satisfied && synergyDef.requiredCategories) {
           satisfied = synergyDef.requiredCategories.every(reqCat => 
             presentShopCategoriesOnFloor.filter(cat => cat === reqCat.category).length >= reqCat.count
           );
        }

        if (satisfied) {
          const alreadyActive = floor.activeSynergies.find(as => as.id === synergyDef.id);
          if(!alreadyActive) {
            addLogMessage(synergyDef.message, 'success');
          }
          newActiveSynergies.push(synergyDef);
        }
      });
      return { ...floor, activeSynergies: newActiveSynergies };
    }));
  }, [addLogMessage]);

  useEffect(() => {
    if (isGameLoaded) { // Only check synergies after game data is confirmed
      checkSynergies();
    }
  }, [isGameLoaded, floors, checkSynergies]); 


  const handleSlotClick = (floorIndex: number, slotIndex: number) => {
    if (isDelegationModeActiveRef.current) {
        addLogMessage("위임 모드 중에는 수동 조작이 불가능합니다.", "info");
        return;
    }
    setSelectedSlot({ floorIndex, slotIndex });
    const shop = floors[floorIndex].slots[slotIndex].shop;
    if (shop) {
      setIsManageModalOpen(true);
      setIsBuildModalOpen(false);
    } else {
      setIsBuildModalOpen(true);
      setIsManageModalOpen(false);
    }
  };
  
  const onBuildShopUser = (shopTypeId: ShopType) => {
    if (!selectedSlot) return;
    handleBuildShop(shopTypeId, selectedSlot.floorIndex, selectedSlot.slotIndex);
  }

  const onInvestShopUser = () => {
    if (!selectedSlot || !floors[selectedSlot.floorIndex].slots[selectedSlot.slotIndex].shop) return;
    handleInvestShop(selectedSlot.floorIndex, selectedSlot.slotIndex);
  }

  const onAddFloorUser = () => {
    handleAddFloor();
  }

  const onStartMarketingCampaignUser = (campaignId: string) => {
    handleStartMarketingCampaign(campaignId);
  }
  
  const onUnlockResearchUser = (researchId: string) => {
    handleUnlockResearch(researchId);
  }

  const onHireStaffUser = (applicantId: string) => {
    handleHireStaff(applicantId);
  }

  const onAssignStaffToFloorUser = (staffId: string, floorId: string | null) => {
    handleAssignStaffToFloor(staffId, floorId);
  }

  const handleOpenMarketingModal = () => {
    if (isDelegationModeActiveRef.current) { addLogMessage("위임 모드 중에는 마케팅 패널을 열 수 없습니다.", "info"); return; }
    setIsMarketingModalOpen(true);
  }
  const handleOpenResearchModal = () => {
    if (isDelegationModeActiveRef.current) { addLogMessage("위임 모드 중에는 연구 패널을 열 수 없습니다.", "info"); return; }
    setIsResearchModalOpen(true);
  }
  const handleOpenStaffModal = () => {
    if (isDelegationModeActiveRef.current) { addLogMessage("위임 모드 중에는 직원 관리 패널을 열 수 없습니다.", "info"); return; }
    setIsStaffModalOpen(true);
  }
  const handleOpenDashboardModal = () => setIsDashboardModalOpen(true);


  const currentTotalIncomePerTick = useMemo(() => {
    if (!isGameLoaded) return 0; // Don't calculate if game isn't loaded
    let total = 0;
    const currentActiveCampaign = activeMarketingCampaignRef.current;
    const currentActiveEv = activeEventRef.current;
    const currentCompletedRes = completedResearchRef.current; 
    const currentStaffList = staffRef.current;

    floorsRef.current.forEach(floor => {
        let floorIncomeBoostFromManager = 0;
        const managerOnFloor = currentStaffList.find(s => s.role === StaffRole.MANAGER && s.assignedFloorId === floor.id);
        if (managerOnFloor) {
            const managerDef = STAFF_ROLE_DEFINITIONS[StaffRole.MANAGER];
             if(managerDef.effectsPerSkillLevel.floorIncomeBoostPercent){
                floorIncomeBoostFromManager = managerDef.effectsPerSkillLevel.floorIncomeBoostPercent * managerOnFloor.skillLevel;
             }
        }

        floor.slots.forEach(slot => {
            if (slot.shop) {
                 const definition = SHOP_DEFINITIONS[slot.shop.shopTypeId];
                 let shopIncome = definition.baseIncome * slot.shop.level; 
                
                shopIncome *= (1 + floorIncomeBoostFromManager);

                floor.activeSynergies.forEach(synergy => {
                    if (synergy.incomeBonusPercent) {
                        shopIncome *= (1 + synergy.incomeBonusPercent);
                    }
                });

                RESEARCH_DEFINITIONS.forEach(researchDef => {
                    if (currentCompletedRes.has(researchDef.id)) {
                        researchDef.effects.forEach(effect => {
                            if (effect.type === ResearchEffectType.GLOBAL_INCOME_MULTIPLIER && typeof effect.value === 'number') {
                                if (!effect.category || effect.category === definition.category) {
                                   shopIncome *= (1 + effect.value);
                                }
                            }
                        });
                    }
                });

                if (currentActiveEv?.incomeMultiplier) {
                    shopIncome *= currentActiveEv.incomeMultiplier;
                }
                if (currentActiveCampaign?.effects.incomeMultiplier) {
                    shopIncome *= currentActiveCampaign.effects.incomeMultiplier;
                }
                total += Math.round(shopIncome);
            }
        });
    });
    return total;
  }, [isGameLoaded, floors, staff, completedResearch, activeEvent, activeMarketingCampaign]);


  const selectedShopInstance = selectedSlot && floors[selectedSlot.floorIndex]?.slots[selectedSlot.slotIndex]?.shop;
  const selectedShopDefinition = selectedShopInstance ? SHOP_DEFINITIONS[selectedShopInstance.shopTypeId] : null;

  const handleTogglePausePlay = () => setIsPaused(p => !p);
  const handleChangeSpeed = () => {
    setGameSpeed(s => {
      if (s === 1) return 2;
      if (s === 2) return 3;
      return 1; 
    });
  };

  const handleToggleDelegationMode = () => {
    setIsDelegationModeActive(prev => {
        const newMode = !prev;
        addLogMessage(`위임 모드가 ${newMode ? "활성화" : "비활성화"}되었습니다.`, newMode ? "delegation" : "info");
        if (newMode) { 
            setIsBuildModalOpen(false);
            setIsManageModalOpen(false);
            setIsMarketingModalOpen(false);
            setIsResearchModalOpen(false);
            setIsStaffModalOpen(false);
            setSelectedSlot(null);
        }
        return newMode;
    });
  };

  const getFilteredShopDefinitions = useCallback((): ShopDefinition[] => {
    return Object.values(SHOP_DEFINITIONS)
      .filter(def => {
        const isUnlockedByReputationOrQuest = 
            (!def.minReputationRequired || reputationRef.current >= def.minReputationRequired) || 
            unlockedShopTypesRef.current.includes(def.id);

        if (def.isResearchLocked) {
          return unlockedShopTypesRef.current.includes(def.id); 
        }
        return isUnlockedByReputationOrQuest;
      })
      .sort((a, b) => a.cost - b.cost);
  }, []); 

  const financialSummary = useMemo((): FinancialSummary => {
    if (!isGameLoaded) return { totalIncomePerTick: 0, totalSalaryPerDay: 0, netProfitPerTick: 0, netProfitPerDay: 0 };
    const totalSalaryPerDay = staff.reduce((sum, s) => sum + s.salaryPerDay, 0);
    const netProfitPerTick = currentTotalIncomePerTick - (totalSalaryPerDay / TICKS_PER_DAY);
    const netProfitPerDay = (currentTotalIncomePerTick * TICKS_PER_DAY) - totalSalaryPerDay;
    return {
      totalIncomePerTick: currentTotalIncomePerTick,
      totalSalaryPerDay,
      netProfitPerTick,
      netProfitPerDay,
    };
  }, [isGameLoaded, currentTotalIncomePerTick, staff]);

  const incomeByShopCategory = useMemo((): IncomeByShopCategory[] => {
    if (!isGameLoaded) return [];
    const categoryMap: Record<ShopCategory, { totalIncome: number; shopCount: number }> = 
      Object.values(ShopCategory).reduce((acc, cat) => {
        acc[cat] = { totalIncome: 0, shopCount: 0 };
        return acc;
      }, {} as any);

    floors.forEach(floor => {
      floor.slots.forEach(slot => {
        if (slot.shop) {
          const def = SHOP_DEFINITIONS[slot.shop.shopTypeId];
          categoryMap[def.category].totalIncome += slot.shop.currentIncome;
          categoryMap[def.category].shopCount += 1;
        }
      });
    });
    return Object.entries(categoryMap).map(([category, data]) => ({
      category: category as ShopCategory,
      ...data,
    })).filter(data => data.shopCount > 0).sort((a,b) => b.totalIncome - a.totalIncome);
  }, [isGameLoaded, floors]);
  
  const incomeByShopType = useMemo((): IncomeByShopType[] => {
    if (!isGameLoaded) return [];
    const typeMap: Record<ShopType, { totalIncome: number; shopCount: number }> = {} as any;

    floors.forEach(floor => {
      floor.slots.forEach(slot => {
        if (slot.shop) {
          if (!typeMap[slot.shop.shopTypeId]) {
            typeMap[slot.shop.shopTypeId] = { totalIncome: 0, shopCount: 0 };
          }
          typeMap[slot.shop.shopTypeId].totalIncome += slot.shop.currentIncome;
          typeMap[slot.shop.shopTypeId].shopCount += 1;
        }
      });
    });

    return Object.entries(typeMap).map(([shopTypeId, data]) => ({
      shopType: shopTypeId as ShopType,
      definition: SHOP_DEFINITIONS[shopTypeId as ShopType],
      totalIncome: data.totalIncome,
      shopCount: data.shopCount,
      averageIncomePerShop: data.shopCount > 0 ? data.totalIncome / data.shopCount : 0,
    })).sort((a,b) => b.totalIncome - a.totalIncome);

  }, [isGameLoaded, floors]);


  const floorPerformanceData = useMemo((): FloorPerformanceData[] => {
    if (!isGameLoaded) return [];
    return floors.map(floor => {
      let totalTraffic = 0;
      let topShopOnFloor: { name: string; emoji: string; traffic: number } | undefined = undefined;
      let maxTrafficOnFloor = -1;
      const shopsData: PlacedShop[] = [];

      floor.slots.forEach(slot => {
        if (slot.shop) {
          const traffic = slot.shop.visitCount || 0;
          totalTraffic += traffic;
          shopsData.push(slot.shop);
          if (traffic > maxTrafficOnFloor) {
            maxTrafficOnFloor = traffic;
            const def = SHOP_DEFINITIONS[slot.shop.shopTypeId];
            topShopOnFloor = { name: def.name, emoji: def.emoji, traffic };
          }
        }
      });
      return {
        floorNumber: floor.floorNumber,
        cleanliness: floor.cleanliness,
        totalTraffic,
        topShop: topShopOnFloor,
        shopsData,
      };
    });
  }, [isGameLoaded, floors]);

  const shopPopularityData = useMemo((): ShopPopularityData[] => {
    if (!isGameLoaded) return [];
    const allShops: ShopPopularityData[] = [];
    floors.forEach(floor => {
      floor.slots.forEach((slot, slotIndex) => {
        if (slot.shop) {
          const def = SHOP_DEFINITIONS[slot.shop.shopTypeId];
          allShops.push({
            shopName: def.name,
            emoji: def.emoji,
            shopType: slot.shop.shopTypeId,
            floorNumber: floor.floorNumber,
            slotIndex: slotIndex,
            level: slot.shop.level,
            traffic: slot.shop.visitCount || 0,
          });
        }
      });
    });
    return allShops.sort((a, b) => b.traffic - a.traffic);
  }, [isGameLoaded, floors]);

  if (!isGameLoaded) {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-900 text-sky-400">
            <div className="text-2xl font-orbitron">로딩 중...</div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-inter">
      <div className="flex flex-row flex-grow overflow-hidden"> 
        <div className="w-2/3 p-2 md:p-4 h-full">
          <BuildingGrid floors={floors} onSlotClick={handleSlotClick} selectedSlot={selectedSlot} />
        </div>

        <div className="w-1/3 p-2 md:p-4 h-full">
          <InfoPanel 
            gameState={getGameState()} 
            activeVOCs={activeVOCs} 
            totalIncomePerTick={currentTotalIncomePerTick} 
            departmentRank={departmentRank}
            onAddFloor={onAddFloorUser}
            onOpenMarketingModal={handleOpenMarketingModal}
            onOpenResearchModal={handleOpenResearchModal}
            onOpenStaffModal={handleOpenStaffModal}
            onOpenDashboardModal={handleOpenDashboardModal}
            currentGold={gold}
            newFloorCost={calculateNewFloorCost()}
            floorCount={floors.length}
            aiStore={aiStore}
            playerMarketShare={playerMarketShare}
          />
        </div>
      </div>
      
      <TimeControls
        isPaused={isPaused}
        gameSpeed={gameSpeed}
        onTogglePausePlay={handleTogglePausePlay}
        onChangeSpeed={handleChangeSpeed}
        currentDay={day}
        currentTick={tickCounter}
        ticksPerDay={TICKS_PER_DAY}
        isDelegationModeActive={isDelegationModeActive}
        onToggleDelegationMode={handleToggleDelegationMode}
        onResetGame={handleRequestResetGame}
        onSaveGame={handleSaveGameManually}
      />
      <GameLog messages={gameLogMessages} />

      {selectedSlot && !floors[selectedSlot.floorIndex].slots[selectedSlot.slotIndex].shop && (
        <Modal isOpen={isBuildModalOpen} onClose={() => { setIsBuildModalOpen(false); setSelectedSlot(null);}} title="새 상점 건설" size="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1 pr-2">
            {getFilteredShopDefinitions()
              .map(def => (
              <button
                key={def.id}
                onClick={() => onBuildShopUser(def.id)}
                disabled={gold < def.cost}
                className="p-3 bg-slate-700 hover:bg-slate-600 rounded-md text-left disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-slate-600 hover:border-sky-500"
                aria-label={`건설: ${def.name}`}
              >
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-3xl mr-3">{def.emoji}</span>
                        <div>
                            <h4 className="font-semibold text-sky-400">{def.name}</h4>
                            <p className="text-xs text-slate-300">{def.description}</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm text-yellow-400">{def.cost.toLocaleString()}G</p>
                        <p className="text-xs text-green-400">+{def.baseIncome}/틱</p>
                        <p className="text-xs text-pink-400">+{def.baseReputation} 평판</p>
                    </div>
                </div>
                 {def.minReputationRequired && reputation < def.minReputationRequired && !unlockedShopTypes.includes(def.id) && !def.isResearchLocked && (
                    <p className="text-xs text-amber-400 mt-1">잠금 해제 필요: 평판 {def.minReputationRequired.toLocaleString()}</p>
                  )}
                  {def.isResearchLocked && !unlockedShopTypes.includes(def.id) && (
                     <p className="text-xs text-purple-400 mt-1">연구를 통해 잠금 해제 가능</p>
                  )}
              </button>
            ))}
             {getFilteredShopDefinitions().length === 0 && (
                <p className="text-center text-slate-500 col-span-full py-4">건설 가능한 상점이 없습니다. 평판을 높이거나 연구를 진행하세요.</p>
            )}
          </div>
        </Modal>
      )}

      {selectedSlot && selectedShopInstance && selectedShopDefinition && (
         <Modal isOpen={isManageModalOpen} onClose={() => { setIsManageModalOpen(false); setSelectedSlot(null);}} title={`관리: ${selectedShopDefinition.name} ${selectedShopDefinition.emoji}`} size="md">
           <div className="space-y-4">
            <p className="text-slate-300">{selectedShopDefinition.description}</p>
            <p>레벨: <span className="text-sky-300">{selectedShopInstance.level}</span></p>
            <p>현재 수입: <span className="text-green-400">+{selectedShopInstance.currentIncome.toLocaleString()}/틱</span></p>
            <p>누적 방문객: <span className="text-teal-300">{(selectedShopInstance.visitCount || 0).toLocaleString()}</span></p>
            <p>기본 평판 기여 (건설/투자 시): <span className="text-pink-400">{selectedShopDefinition.baseReputation}</span></p>

            {selectedShopDefinition.category !== ShopCategory.FACILITY && 
             selectedShopDefinition.category !== ShopCategory.SPECIAL && ( 
                 <button
                    onClick={onInvestShopUser}
                    disabled={gold < (SHOP_INVESTMENT_COST_BASE * Math.pow(SHOP_INVESTMENT_COST_MULTIPLIER, selectedShopInstance.level -1))}
                    className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md shadow-md disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    투자 (비용: {Math.floor(SHOP_INVESTMENT_COST_BASE * Math.pow(SHOP_INVESTMENT_COST_MULTIPLIER, selectedShopInstance.level -1)).toLocaleString()}G)
                </button>
            )}
            <button
                onClick={handleDemolishShop}
                className="w-full px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md shadow-md transition-colors"
            >
                철거 (환급: {Math.floor(selectedShopDefinition.cost * 0.25).toLocaleString()}G)
            </button>
           </div>
         </Modal>
      )}

      <MarketingModal
        isOpen={isMarketingModalOpen}
        onClose={() => setIsMarketingModalOpen(false)}
        campaigns={MARKETING_CAMPAIGN_DEFINITIONS}
        onStartCampaign={onStartMarketingCampaignUser}
        currentGold={gold}
        currentReputation={reputation}
        activeCampaignId={activeMarketingCampaign?.id}
      />

      <ResearchModal
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
        researchItems={RESEARCH_DEFINITIONS}
        onUnlockResearch={onUnlockResearchUser}
        currentResearchPoints={researchPoints}
        completedResearch={completedResearch}
        getGameState={getGameState}
      />

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        currentStaff={staff}
        availableApplicants={availableApplicants}
        onHireStaff={onHireStaffUser}
        onFireStaff={handleFireStaff} 
        onAssignStaffToFloor={onAssignStaffToFloorUser}
        maxStaffSlots={maxStaffSlots}
        floors={floors}
        currentGold={gold}
        currentReputation={reputation}
      />

      <DashboardModal
        isOpen={isDashboardModalOpen}
        onClose={() => setIsDashboardModalOpen(false)}
        financialSummary={financialSummary}
        incomeByShopCategory={incomeByShopCategory}
        incomeByShopType={incomeByShopType}
        floorPerformanceData={floorPerformanceData}
        shopPopularityData={shopPopularityData.slice(0, 10)} 
        shopDefinitions={SHOP_DEFINITIONS}
        ticksPerDay={TICKS_PER_DAY}
      />

      <ConfirmModal
        isOpen={isResetConfirmModalOpen}
        onClose={handleCancelResetGame}
        title="게임 초기화 확인"
        message={"저장된 게임 데이터를 삭제하고\n처음부터 다시 시작하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다."}
        onConfirm={handleConfirmResetGame}
        onCancel={handleCancelResetGame}
        confirmButtonText="초기화"
        cancelButtonText="취소"
      />

    </div>
  );
};

export default App;
