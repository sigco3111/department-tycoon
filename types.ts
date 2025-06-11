
export enum ShopCategory {
  FOOD = "Food",
  GOODS = "Goods",
  ENTERTAINMENT = "Entertainment",
  SERVICE = "Service",
  SPECIAL = "Special", // For utility shops like restrooms, info desks
  FACILITY = "Facility", // For small, often non-income generating conveniences
}

export enum ShopType {
  // Existing Food
  BAKERY = "BAKERY",
  CAFE = "CAFE",
  FAST_FOOD = "FAST_FOOD",
  RESTAURANT = "RESTAURANT",

  // New Food
  SUSHI_BAR = "SUSHI_BAR",
  ICE_CREAM_PARLOR = "ICE_CREAM_PARLOR",
  PIZZERIA = "PIZZERIA",
  STEAKHOUSE = "STEAKHOUSE",
  RAMEN_SHOP = "RAMEN_SHOP",
  JUICE_BAR = "JUICE_BAR",
  DELICATESSEN = "DELICATESSEN", // 고급 샌드위치 & 샐러드
  FOOD_TRUCK_ZONE = "FOOD_TRUCK_ZONE", // 다양한 푸드트럭 (실외 느낌)
  TEA_HOUSE = "TEA_HOUSE", // 전통 찻집

  // Existing Goods
  BOOKSTORE = "BOOKSTORE",
  TOY_STORE = "TOY_STORE",
  CHILDRENS_CLOTHING = "CHILDRENS_CLOTHING",
  JEWELRY_STORE = "JEWELRY_STORE",
  FLOWER_SHOP = "FLOWER_SHOP",

  // New Goods
  ELECTRONICS_STORE = "ELECTRONICS_STORE",
  SUPERMARKET = "SUPERMARKET",
  LUXURY_BOUTIQUE = "LUXURY_BOUTIQUE",
  SPORTING_GOODS = "SPORTING_GOODS",
  PET_STORE = "PET_STORE",
  PHARMACY = "PHARMACY",
  HOME_GOODS = "HOME_GOODS", // 가구 및 인테리어
  STATIONERY_STORE = "STATIONERY_STORE",
  COSMETICS_STORE = "COSMETICS_STORE",
  MUSIC_STORE = "MUSIC_STORE", // 음반 및 악기
  FASHION_APPAREL = "FASHION_APPAREL", // 일반 의류 매장
  SHOE_STORE = "SHOE_STORE", // 신발 전문 매장
  BAG_STORE = "BAG_STORE", // 가방 전문 매장
  SOUVENIR_SHOP = "SOUVENIR_SHOP", // 기념품 가게

  // Existing Entertainment
  ARCADE = "ARCADE", // 오락실 (비디오 게임 위주)

  // New Entertainment
  CINEMA = "CINEMA",
  BOWLING_ALLEY = "BOWLING_ALLEY",
  KARAOKE = "KARAOKE",
  ART_GALLERY = "ART_GALLERY",
  VR_ZONE = "VR_ZONE",
  PHOTO_BOOTH = "PHOTO_BOOTH", // 즉석 사진 부스
  BOARD_GAME_CAFE = "BOARD_GAME_CAFE", // 보드게임 카페
  LIVE_MUSIC_HALL = "LIVE_MUSIC_HALL", // 소규모 라이브 공연장
  
  // Existing Service
  RESTROOM = "RESTROOM",

  // New Service
  HAIR_SALON = "HAIR_SALON",
  SPA_NAIL_SALON = "SPA_NAIL_SALON", // 스파 및 네일 아트
  TRAVEL_AGENCY = "TRAVEL_AGENCY",
  OPTICAL_SHOP = "OPTICAL_SHOP", // 안경점
  SHOE_REPAIR = "SHOE_REPAIR",
  LAUNDROMAT = "LAUNDROMAT", // 빨래방
  BANK_BRANCH = "BANK_BRANCH", // 은행 지점

  // New Special/Facility (utility, often low/no income but boost satisfaction)
  INFORMATION_DESK = "INFORMATION_DESK",
  VENDING_MACHINE_AREA = "Vending_Machine_Area",
  LOCKER_ROOM = "LOCKER_ROOM",
  NURSING_ROOM = "NURSING_ROOM", // 수유실
  ATM_KIOSK = "ATM_KIOSK", // ATM 기기
  PUBLIC_SEATING_AREA = "PUBLIC_SEATING_AREA", // 공용 휴게 공간

  // Research Unlocked Shops
  ROBOTICS_LAB = "ROBOTICS_LAB", // Example unique shop
}

export interface ShopDefinition {
  id: ShopType;
  name: string;
  emoji: string;
  category: ShopCategory;
  cost: number;
  baseIncome: number; // Income per game tick
  baseReputation: number; // Reputation gain on build & per investment
  description: string;
  minReputationRequired?: number; // Reputation needed to unlock
  isResearchLocked?: boolean; // If true, requires research to unlock
}

export interface PlacedShop {
  id: string; // Unique instance ID
  shopTypeId: ShopType;
  level: number;
  currentIncome: number;
  currentReputationBoost: number;
  visitCount?: number; // New: Tracks customer visits/interactions
}

export interface FloorSlot {
  shop: PlacedShop | null;
}

export interface Floor {
  id: string; // Unique floor ID
  floorNumber: number;
  slots: FloorSlot[];
  activeSynergies: Synergy[];
  cleanliness: number; // 0-100
  // assignedStaffIds: string[]; // IDs of staff members assigned to this floor - derived from StaffMember.assignedFloorId
}

export enum CustomerType {
  // Existing
  STUDENT = "STUDENT",
  SHOPPER = "SHOPPER", 
  PROFESSIONAL = "PROFESSIONAL",
  SENIOR = "SENIOR",
  CHILD = "CHILD",

  // New
  TEENAGER = "TEENAGER", // 십대
  TOURIST = "TOURIST", // 관광객
  FAMILY_GROUP = "FAMILY_GROUP", // 가족 단위 (여러 명으로 구성)
  WEALTHY_PATRON = "WEALTHY_PATRON", // 부유층 고객
  PET_OWNER = "PET_OWNER", // 반려동물 동반 또는 용품 구매자
  FITNESS_ENTHUSIAST = "FITNESS_ENTHUSIAST", // 운동 마니아
  TECHIE = "TECHIE", // 기술 애호가
  FOODIE = "FOODIE", // 미식가
  ART_LOVER = "ART_LOVER", // 예술 애호가
  GAMER = "GAMER", // 게임 매니아 (아케이드, VR존, 보드게임 카페 등)
  MUSIC_FAN = "MUSIC_FAN", // 음악 팬 (음반 가게, 라이브 홀 등)
  TRENDSETTER = "TRENDSETTER", // 유행을 선도하는 사람
}

export interface CustomerStats {
  total: number;
  types: Record<CustomerType, number>;
}

export interface GameEventDefinition {
  id: string;
  name: string;
  description: string;
  durationTicks: number; // How many game ticks it lasts
  incomeMultiplier?: number;
  reputationMultiplier?: number;
  customerAttractionBoost?: number; // Flat boost to new customers per tick
  triggerCondition?: (gameState: GameState) => boolean; // Optional: for complex triggers
}

export interface ActiveGameEvent extends GameEventDefinition {
  ticksRemaining: number;
}

export interface VOCMessageDefinition {
  id: string;
  message: string;
  type: "positive" | "negative" | "neutral";
  triggerCondition?: (gameState: GameState) => boolean; // e.g., low variety of food shops
}

export interface ActiveVOCMessage extends VOCMessageDefinition {
  displayId: string; // for unique key in list
  timestamp: number;
}

export enum QuestStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export interface QuestReward {
  gold?: number;
  reputation?: number;
  researchPoints?: number; // RP as quest reward
  unlockShopTypes?: ShopType[];
}

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  getCurrentValue: (gameState: GameState) => number;
  reward: QuestReward;
  isRecurring?: boolean; // For future, e.g. "Earn X gold this week"
}

export interface ActiveQuest extends QuestDefinition {
  status: QuestStatus;
}

export interface Synergy {
  id: string;
  name: string;
  description: string;
  requiredShopTypes: ShopType[]; // Specific types
  requiredCategories?: { category: ShopCategory, count: number }[]; // Or X shops of a category
  incomeBonusPercent?: number; // e.g., 0.1 for +10%
  reputationBonusPoints?: number; // Flat points boost to shops on this floor
  message: string; // Notification message
}

export interface MarketingCampaignDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  durationTicks: number;
  effects: {
    customerAttractionBoost?: number; // Flat boost to new customers per tick
    incomeMultiplier?: number; // Multiplier for all shop income (e.g., 1.2 for +20%)
    reputationBoostOnStart?: number; // One-time reputation gain when campaign starts
  };
  minReputationRequired?: number;
}

export interface ActiveMarketingCampaign extends MarketingCampaignDefinition {
  ticksRemaining: number;
}

export enum ResearchEffectType {
  UNLOCK_SHOP = "UNLOCK_SHOP",
  INCREASE_MAX_VOC_MESSAGES = "INCREASE_MAX_VOC_MESSAGES",
  GLOBAL_INCOME_MULTIPLIER = "GLOBAL_INCOME_MULTIPLIER", 
  INCREASE_MAX_STAFF_SLOTS = "INCREASE_MAX_STAFF_SLOTS",
}

export interface ResearchEffect {
  type: ResearchEffectType;
  shopType?: ShopType; // For UNLOCK_SHOP
  value?: number; // For INCREASE_MAX_VOC_MESSAGES, GLOBAL_INCOME_MULTIPLIER, INCREASE_MAX_STAFF_SLOTS
  category?: ShopCategory; // For GLOBAL_INCOME_MULTIPLIER specific to a category
}

export interface ResearchDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  costRP: number; // Cost in Research Points
  effects: ResearchEffect[];
  prerequisites?: string[]; // IDs of other research items required before this one can be researched
  tier?: number; // For visual grouping/progression, lower tier is earlier
}

export enum StaffRole {
  MANAGER = "MANAGER",
  CLEANER = "CLEANER",
  // Future: SECURITY = "SECURITY", TECHNICIAN = "TECHNICIAN", CASHIER = "CASHIER"
}

export interface StaffRoleDefinition {
  role: StaffRole;
  name: string;
  emoji: string;
  description: string;
  baseSalaryPerDay: number;
  skillPointSalaryBonus: number; // Extra salary per skill point above 1
  minReputationRequired: number;
  effectsPerSkillLevel: {
    floorIncomeBoostPercent?: number; // Manager: Applied to assigned floor's shops
    globalReputationBoostPerDay?: number; // Manager: Applied globally if assigned
    floorCleanlinessBoostPerDay?: number; // Cleaner: Applied to assigned floor
  };
}


export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  skillLevel: number; // e.g., 1-3 or 1-5
  salaryPerDay: number;
  assignedFloorId: string | null;
  emoji: string;
}

export interface AIDepartmentStore {
  name: string;
  reputation: number;
  level: number; // Represents growth stage/tier
  attractionPower: number; // Calculated abstract attraction
  lastActivityMessage: string;
  lastGrowthTick: number; // Tracks when AI last had a growth update
}

// Simplified GameState for type-hints in functions
export interface GameState {
  gold: number;
  reputation: number;
  researchPoints: number; // Added
  day: number;
  floors: Floor[];
  unlockedShopTypes: ShopType[];
  completedResearch: Set<string>; // Added: IDs of completed research items
  activeEvent: ActiveGameEvent | null;
  activeMarketingCampaign: ActiveMarketingCampaign | null; 
  quests: ActiveQuest[];
  customerStats: CustomerStats;
  maxVOCs: number; // This will now be dynamic based on research
  shopDefinitions: Record<ShopType, ShopDefinition>;
  staff: StaffMember[];
  availableApplicants: StaffMember[];
  maxStaffSlots: number;
  aiStore: AIDepartmentStore | null; // New: AI Competitor
  isDelegationModeActive: boolean; // New: Delegation Mode
}

export interface DepartmentStoreRank {
  name: string;
  minReputation: number;
}

export interface LogMessage {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error' | 'delegation'; // Added 'delegation' type
  timestamp: number; // Unix timestamp
}

// For Dashboard Modal
export interface FinancialSummary {
  totalIncomePerTick: number;
  totalSalaryPerDay: number;
  netProfitPerTick: number; // totalIncomePerTick - (totalSalaryPerDay / TICKS_PER_DAY)
  netProfitPerDay: number; // (totalIncomePerTick * TICKS_PER_DAY) - totalSalaryPerDay
}

export interface IncomeByShopCategory {
  category: ShopCategory;
  totalIncome: number;
  shopCount: number;
}

export interface IncomeByShopType {
  shopType: ShopType;
  definition: ShopDefinition;
  totalIncome: number;
  shopCount: number;
  averageIncomePerShop: number;
}

export interface FloorPerformanceData {
  floorNumber: number;
  cleanliness: number;
  totalTraffic: number;
  topShop?: { name: string; emoji: string; traffic: number };
  shopsData: PlacedShop[];
}

export interface ShopPopularityData {
  shopName: string;
  emoji: string;
  shopType: ShopType;
  floorNumber: number;
  slotIndex: number; // For identification if needed
  level: number;
  traffic: number;
}
