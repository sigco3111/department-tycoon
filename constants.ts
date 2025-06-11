import { ShopDefinition, ShopType, ShopCategory, GameEventDefinition, QuestDefinition, Synergy, CustomerType, DepartmentStoreRank, GameState, VOCMessageDefinition, MarketingCampaignDefinition, ResearchDefinition, ResearchEffectType, StaffRole, StaffRoleDefinition } from './types';

export const INITIAL_GOLD = 50000;
export const INITIAL_REPUTATION = 0;
export const INITIAL_RESEARCH_POINTS = 0; 
export const RP_PER_DAY = 1; // Research points earned per day
export const INITIAL_FLOORS = 1;
export const SLOTS_PER_FLOOR = 5;
export const GAME_TICK_INTERVAL_MS = 1000; // 1 second per game tick
export const TICKS_PER_DAY = 60; // 1 minute of real time = 1 game day
export const NEW_FLOOR_COST_BASE = 100000;
export const NEW_FLOOR_COST_MULTIPLIER = 1.5;
export const INITIAL_MAX_VOC_MESSAGES = 5;
export const SHOP_INVESTMENT_COST_BASE = 500;
export const SHOP_INVESTMENT_COST_MULTIPLIER = 1.3;

export const DEFAULT_FLOOR_CLEANLINESS = 70;
export const FLOOR_CLEANLINESS_DECAY_RATE_PER_DAY = 5; // Points cleanliness drops per day if no cleaner

// Staff Management Constants
export const INITIAL_MAX_STAFF_SLOTS = 3;
export const APPLICANT_GENERATION_CHANCE_PER_DAY = 0.6; // Chance to get 1-2 new applicants
export const MAX_APPLICANTS = 5;
export const STAFF_NAMES_POOL: string[] = [
  "김민준", "이서연", "박도윤", "최지우", "정하준", "윤서아", "강지호", "임하윤", "송은우", "한유진",
  "오지안", "신예은", "황시우", "조아라", "백건우", "안나은", "장도현", "유채원", "서유준", "문소율"
];

export const STAFF_ROLE_DEFINITIONS: Record<StaffRole, StaffRoleDefinition> = {
  [StaffRole.MANAGER]: {
    role: StaffRole.MANAGER,
    name: "매니저",
    emoji: "👨‍💼",
    description: "층의 운영을 관리하여 효율성을 높입니다. 배정된 층의 상점 수입을 증가시키고 백화점 전체 평판을 매일 약간씩 올립니다.",
    baseSalaryPerDay: 75,
    skillPointSalaryBonus: 25, // For each skill point
    minReputationRequired: 150,
    effectsPerSkillLevel: {
      floorIncomeBoostPercent: 0.02, // 2% per skill level
      globalReputationBoostPerDay: 1, // 1 rep per skill level
    }
  },
  [StaffRole.CLEANER]: {
    role: StaffRole.CLEANER,
    name: "청소부",
    emoji: "🧹",
    description: "백화점 환경을 깨끗하게 유지합니다. 배정된 층의 청결도를 매일 향상시킵니다.",
    baseSalaryPerDay: 30,
    skillPointSalaryBonus: 10,
    minReputationRequired: 50,
    effectsPerSkillLevel: {
      floorCleanlinessBoostPerDay: 10, // 10 cleanliness points per skill level
    }
  }
};

// AI Competitor Constants
export const AI_NAMES: string[] = ["라이벌 마트", "스타 몰", "시티 스퀘어", "골든 플라자", "에이스 백화점"];
export const AI_INITIAL_REPUTATION_MIN = 20;
export const AI_INITIAL_REPUTATION_MAX = 50;
export const AI_GROWTH_INTERVAL_TICKS: number = TICKS_PER_DAY / 2; // AI grows twice a day
export const AI_REP_GAIN_PER_INTERVAL_BASE: number = 2; // Base reputation gain
export const AI_REP_GAIN_PER_PLAYER_LEVEL_BONUS: number = 0.5; // AI gets slight bonus based on player's rank
export const AI_LEVEL_THRESHOLDS: number[] = [0, 150, 400, 800, 1500]; // Reputation needed for AI levels 1-5
export const AI_LEVEL_ATTRACTION_BONUS: number = 30; // Bonus attraction power per AI level
export const AI_DEFAULT_ACTIVITY_MESSAGE = "경쟁사 운영 중...";

// Customer Attraction Modifiers
export const PLAYER_REP_ATTRACTION_WEIGHT = 1.0;
export const PLAYER_SHOP_COUNT_ATTRACTION_WEIGHT = 2.0; // Each shop contributes
export const PLAYER_AVG_SHOP_LEVEL_ATTRACTION_WEIGHT = 5.0; // Avg shop level contributes
export const PLAYER_AVG_CLEANLINESS_ATTRACTION_WEIGHT = 0.5; // Avg cleanliness in % (0-100) -> (0-50 points)
export const AI_REP_ATTRACTION_WEIGHT = 1.0;
export const BASE_POTENTIAL_CUSTOMERS_PER_TICK = 3; // Base customers entering the "market" each tick
export const CUSTOMER_GROWTH_PER_DAY_FACTOR = 0.05; // Potential customers increase slightly each day
export const CUSTOMER_ATTRACTION_RANDOM_FACTOR = 0.1; // Small random fluctuation in attraction

// Delegation Mode Constants
export const DELEGATION_MODE_ACTION_INTERVAL_BASE_TICKS = 15; // Base interval for minor actions
export const DELEGATION_MODE_BUILD_CHECK_INTERVAL_TICKS = TICKS_PER_DAY / 3; // Check for building roughly 3 times a day
export const DELEGATION_MODE_INVEST_CHECK_INTERVAL_TICKS = TICKS_PER_DAY / 2; // Check for investments twice a day
export const DELEGATION_MODE_STAFF_CHECK_INTERVAL_TICKS = TICKS_PER_DAY / 2; // Check staff twice a day
export const DELEGATION_MODE_MARKETING_CHECK_INTERVAL_TICKS = TICKS_PER_DAY; // Check marketing once a day
export const DELEGATION_MODE_RESEARCH_CHECK_INTERVAL_TICKS = TICKS_PER_DAY; // Check research once a day
export const DELEGATION_MODE_NEW_FLOOR_CHECK_INTERVAL_TICKS = TICKS_PER_DAY * 2; // Check for new floor every 2 days

export const DELEGATION_GOLD_RESERVE_FIXED_AMOUNT = 10000; // Keep at least this much gold
export const DELEGATION_GOLD_RESERVE_PERCENTAGE = 0.1; // Or keep 10% of current gold, whichever is higher
export const DELEGATION_SHOP_REPUTATION_WEIGHT = 2.0; // Prioritize reputation gain more for shops
export const DELEGATION_SHOP_INCOME_WEIGHT = 1.0; // Also consider income for future actions
export const DELEGATION_CLEANLINESS_HIRE_THRESHOLD = 50; // Hire cleaner if avg cleanliness drops below this
export const DELEGATION_MIN_SLOTS_BEFORE_NEW_FLOOR = 0.7; // Consider new floor if 70% of slots are filled
export const DELEGATION_MAX_COUNT_CHEAP_FACILITIES = 2; // Max count for shops like Vending Machines, Photo Booths by delegation
export const CHEAP_FACILITY_TYPES_FOR_DELEGATION_LIMIT: ShopType[] = [
    ShopType.VENDING_MACHINE_AREA,
    ShopType.PHOTO_BOOTH,
    // ShopType.ATM_KIOSK, // Example: Add more if needed
];


export const SHOP_DEFINITIONS: Record<ShopType, ShopDefinition> = {
  // --- Existing Food ---
  [ShopType.BAKERY]: {
    id: ShopType.BAKERY, name: "베이커리", emoji: "🍞", category: ShopCategory.FOOD,
    cost: 10000, baseIncome: 20, baseReputation: 5, description: "갓 구운 신선한 빵."
  },
  [ShopType.CAFE]: {
    id: ShopType.CAFE, name: "카페", emoji: "☕", category: ShopCategory.FOOD,
    cost: 15000, baseIncome: 25, baseReputation: 8, description: "커피 한 잔과 함께 휴식을 취하세요.",
    minReputationRequired: 50,
  },
  [ShopType.FAST_FOOD]: {
    id: ShopType.FAST_FOOD, name: "패스트푸드", emoji: "🍔", category: ShopCategory.FOOD,
    cost: 18000, baseIncome: 30, baseReputation: 6, description: "빠르고 맛있는 식사.",
    minReputationRequired: 80,
  },
  [ShopType.RESTAURANT]: {
    id: ShopType.RESTAURANT, name: "레스토랑", emoji: "🍜", category: ShopCategory.FOOD,
    cost: 30000, baseIncome: 50, baseReputation: 12, description: "고급스러운 다이닝 경험.",
    minReputationRequired: 200,
  },

  // --- New Food ---
  [ShopType.SUSHI_BAR]: {
    id: ShopType.SUSHI_BAR, name: "스시 바", emoji: "🍣", category: ShopCategory.FOOD,
    cost: 45000, baseIncome: 65, baseReputation: 18, description: "신선한 재료로 만든 정통 일식 스시.",
    minReputationRequired: 400,
  },
  [ShopType.ICE_CREAM_PARLOR]: {
    id: ShopType.ICE_CREAM_PARLOR, name: "아이스크림 가게", emoji: "🍦", category: ShopCategory.FOOD,
    cost: 12000, baseIncome: 22, baseReputation: 7, description: "달콤하고 시원한 다양한 맛의 아이스크림.",
    minReputationRequired: 70,
  },
  [ShopType.PIZZERIA]: {
    id: ShopType.PIZZERIA, name: "피자 전문점", emoji: "🍕", category: ShopCategory.FOOD,
    cost: 28000, baseIncome: 45, baseReputation: 10, description: "화덕에서 구운 정통 이탈리안 피자.",
    minReputationRequired: 180,
  },
  [ShopType.STEAKHOUSE]: {
    id: ShopType.STEAKHOUSE, name: "스테이크 하우스", emoji: "🥩", category: ShopCategory.FOOD,
    cost: 60000, baseIncome: 80, baseReputation: 25, description: "최고급 부위의 스테이크를 맛보세요.",
    minReputationRequired: 500,
  },
  [ShopType.RAMEN_SHOP]: {
    id: ShopType.RAMEN_SHOP, name: "라멘 전문점", emoji: "🍥", category: ShopCategory.FOOD,
    cost: 20000, baseIncome: 35, baseReputation: 9, description: "깊고 진한 국물의 일본 라멘.",
    minReputationRequired: 120,
  },
  [ShopType.JUICE_BAR]: {
    id: ShopType.JUICE_BAR, name: "주스 바", emoji: "🍹", category: ShopCategory.FOOD,
    cost: 13000, baseIncome: 18, baseReputation: 6, description: "신선한 과일과 채소로 만든 건강 주스.",
    minReputationRequired: 60,
  },
  [ShopType.DELICATESSEN]: {
    id: ShopType.DELICATESSEN, name: "델리카트슨", emoji: "🥪", category: ShopCategory.FOOD,
    cost: 25000, baseIncome: 40, baseReputation: 11, description: "고급 샌드위치, 샐러드, 샤퀴테리.",
    minReputationRequired: 150,
  },
  [ShopType.FOOD_TRUCK_ZONE]: {
    id: ShopType.FOOD_TRUCK_ZONE, name: "푸드트럭 존", emoji: "🚚", category: ShopCategory.FOOD,
    cost: 35000, baseIncome: 55, baseReputation: 15, description: "다양한 길거리 음식을 맛볼 수 있는 공간.",
    minReputationRequired: 250,
  },
  [ShopType.TEA_HOUSE]: {
    id: ShopType.TEA_HOUSE, name: "전통 찻집", emoji: "🍵", category: ShopCategory.FOOD,
    cost: 18000, baseIncome: 28, baseReputation: 9, description: "고요한 분위기에서 즐기는 다양한 전통 차.",
    minReputationRequired: 90,
  },

  // --- Existing Goods ---
  [ShopType.BOOKSTORE]: {
    id: ShopType.BOOKSTORE, name: "서점", emoji: "📚", category: ShopCategory.GOODS,
    cost: 12000, baseIncome: 15, baseReputation: 7, description: "독서가를 위한 조용한 공간."
  },
  [ShopType.TOY_STORE]: {
    id: ShopType.TOY_STORE, name: "장난감 가게", emoji: "🧸", category: ShopCategory.GOODS,
    cost: 22000, baseIncome: 35, baseReputation: 9, description: "아이들을 위한 장난감.",
    minReputationRequired: 120,
  },
  [ShopType.CHILDRENS_CLOTHING]: {
    id: ShopType.CHILDRENS_CLOTHING, name: "아동복 매장", emoji: "👕", category: ShopCategory.GOODS,
    cost: 20000, baseIncome: 30, baseReputation: 8, description: "어린이들을 위한 의류.",
    minReputationRequired: 100,
  },
  [ShopType.JEWELRY_STORE]: {
    id: ShopType.JEWELRY_STORE, name: "보석상", emoji: "💎", category: ShopCategory.GOODS,
    cost: 50000, baseIncome: 70, baseReputation: 20, description: "반짝이는 보석과 고급 금속.",
    minReputationRequired: 300,
  },
  [ShopType.FLOWER_SHOP]: {
    id: ShopType.FLOWER_SHOP, name: "꽃집", emoji: "💐", category: ShopCategory.GOODS,
    cost: 16000, baseIncome: 22, baseReputation: 7, description: "모든 행사를 위한 아름다운 꽃다발.",
    minReputationRequired: 60,
  },
  
  // --- New Goods ---
  [ShopType.ELECTRONICS_STORE]: {
    id: ShopType.ELECTRONICS_STORE, name: "전자제품 매장", emoji: "💻", category: ShopCategory.GOODS,
    cost: 70000, baseIncome: 90, baseReputation: 22, description: "최신 스마트폰, 노트북, 가전제품.",
    minReputationRequired: 600,
  },
  [ShopType.SUPERMARKET]: {
    id: ShopType.SUPERMARKET, name: "슈퍼마켓", emoji: "🛒", category: ShopCategory.GOODS,
    cost: 80000, baseIncome: 100, baseReputation: 15, description: "다양한 식료품과 생필품을 한 곳에서.",
    minReputationRequired: 350,
  },
  [ShopType.LUXURY_BOUTIQUE]: {
    id: ShopType.LUXURY_BOUTIQUE, name: "명품 부티크", emoji: "👜", category: ShopCategory.GOODS,
    cost: 120000, baseIncome: 150, baseReputation: 40, description: "최고급 디자이너 브랜드 상품.",
    minReputationRequired: 1000,
  },
  [ShopType.SPORTING_GOODS]: {
    id: ShopType.SPORTING_GOODS, name: "스포츠 용품점", emoji: "⚽", category: ShopCategory.GOODS,
    cost: 35000, baseIncome: 50, baseReputation: 13, description: "다양한 스포츠 의류 및 장비.",
    minReputationRequired: 280,
  },
  [ShopType.PET_STORE]: {
    id: ShopType.PET_STORE, name: "애완동물 용품점", emoji: "🐾", category: ShopCategory.GOODS,
    cost: 28000, baseIncome: 40, baseReputation: 10, description: "사랑스러운 반려동물을 위한 모든 것.",
    minReputationRequired: 180,
  },
  [ShopType.PHARMACY]: {
    id: ShopType.PHARMACY, name: "약국", emoji: "💊", category: ShopCategory.GOODS,
    cost: 20000, baseIncome: 25, baseReputation: 8, description: "의약품, 건강 보조제 및 위생용품.",
    minReputationRequired: 100,
  },
  [ShopType.HOME_GOODS]: {
    id: ShopType.HOME_GOODS, name: "생활용품점", emoji: "🛋️", category: ShopCategory.GOODS,
    cost: 45000, baseIncome: 60, baseReputation: 16, description: "가구, 침구, 주방용품 등 인테리어 소품.",
    minReputationRequired: 320,
  },
  [ShopType.STATIONERY_STORE]: {
    id: ShopType.STATIONERY_STORE, name: "문구점", emoji: "✏️", category: ShopCategory.GOODS,
    cost: 9000, baseIncome: 12, baseReputation: 4, description: "학용품, 사무용품, 팬시 용품.",
    minReputationRequired: 30,
  },
  [ShopType.COSMETICS_STORE]: {
    id: ShopType.COSMETICS_STORE, name: "화장품 가게", emoji: "💄", category: ShopCategory.GOODS,
    cost: 30000, baseIncome: 45, baseReputation: 12, description: "다양한 브랜드의 스킨케어 및 메이크업 제품.",
    minReputationRequired: 220,
  },
  [ShopType.MUSIC_STORE]: {
    id: ShopType.MUSIC_STORE, name: "음반 가게", emoji: "🎸", category: ShopCategory.GOODS,
    cost: 25000, baseIncome: 38, baseReputation: 10, description: "최신 음반, LP, 악기 및 관련 상품.",
    minReputationRequired: 160,
  },
  [ShopType.FASHION_APPAREL]: {
    id: ShopType.FASHION_APPAREL, name: "패션 의류점", emoji: "👗", category: ShopCategory.GOODS,
    cost: 40000, baseIncome: 55, baseReputation: 14, description: "트렌디한 남성 및 여성 의류.",
    minReputationRequired: 250,
  },
  [ShopType.SHOE_STORE]: {
    id: ShopType.SHOE_STORE, name: "신발 전문점", emoji: "👟", category: ShopCategory.GOODS,
    cost: 32000, baseIncome: 48, baseReputation: 11, description: "운동화, 구두 등 다양한 신발.",
    minReputationRequired: 200,
  },
  [ShopType.BAG_STORE]: {
    id: ShopType.BAG_STORE, name: "가방 전문점", emoji: "🎒", category: ShopCategory.GOODS,
    cost: 30000, baseIncome: 42, baseReputation: 10, description: "핸드백, 백팩, 여행가방 등.",
    minReputationRequired: 190,
  },
   [ShopType.SOUVENIR_SHOP]: {
    id: ShopType.SOUVENIR_SHOP, name: "기념품 가게", emoji: "🎁", category: ShopCategory.GOODS,
    cost: 15000, baseIncome: 25, baseReputation: 8, description: "여행의 추억을 담은 특별한 기념품.",
    minReputationRequired: 100,
  },

  // --- Existing Entertainment ---
  [ShopType.ARCADE]: { 
    id: ShopType.ARCADE, name: "오락실", emoji: "🕹️", category: ShopCategory.ENTERTAINMENT,
    cost: 25000, baseIncome: 40, baseReputation: 10, description: "남녀노소 모두를 위한 재미와 게임.",
    minReputationRequired: 150,
  },

  // --- New Entertainment ---
  [ShopType.CINEMA]: {
    id: ShopType.CINEMA, name: "영화관", emoji: "🎬", category: ShopCategory.ENTERTAINMENT,
    cost: 75000, baseIncome: 85, baseReputation: 20, description: "최신 영화를 대형 스크린과 편안한 좌석에서.",
    minReputationRequired: 550,
  },
  [ShopType.BOWLING_ALLEY]: {
    id: ShopType.BOWLING_ALLEY, name: "볼링장", emoji: "🎳", category: ShopCategory.ENTERTAINMENT,
    cost: 60000, baseIncome: 70, baseReputation: 18, description: "친구, 가족과 함께 즐기는 신나는 볼링.",
    minReputationRequired: 450,
  },
  [ShopType.KARAOKE]: {
    id: ShopType.KARAOKE, name: "노래방", emoji: "🎤", category: ShopCategory.ENTERTAINMENT,
    cost: 40000, baseIncome: 60, baseReputation: 15, description: "최신곡과 함께 스트레스를 해소하세요.",
    minReputationRequired: 300,
  },
  [ShopType.ART_GALLERY]: {
    id: ShopType.ART_GALLERY, name: "미술관", emoji: "🖼️", category: ShopCategory.ENTERTAINMENT,
    cost: 35000, baseIncome: 30, baseReputation: 25, description: "다양한 예술 작품을 감상할 수 있는 공간.",
    minReputationRequired: 400,
  },
  [ShopType.VR_ZONE]: {
    id: ShopType.VR_ZONE, name: "VR 체험존", emoji: "🕶️", category: ShopCategory.ENTERTAINMENT,
    cost: 50000, baseIncome: 75, baseReputation: 17, description: "가상현실 게임과 콘텐츠를 생생하게 체험.",
    minReputationRequired: 380,
  },
  [ShopType.PHOTO_BOOTH]: {
    id: ShopType.PHOTO_BOOTH, name: "즉석 사진 부스", emoji: "📸", category: ShopCategory.ENTERTAINMENT,
    cost: 8000, baseIncome: 15, baseReputation: 5, description: "친구, 연인과 특별한 순간을 남기세요.",
    minReputationRequired: 40,
  },
  [ShopType.BOARD_GAME_CAFE]: {
    id: ShopType.BOARD_GAME_CAFE, name: "보드게임 카페", emoji: "🎲", category: ShopCategory.ENTERTAINMENT,
    cost: 28000, baseIncome: 40, baseReputation: 12, description: "다양한 보드게임을 음료와 함께 즐겨요.",
    minReputationRequired: 170,
  },
  [ShopType.LIVE_MUSIC_HALL]: {
    id: ShopType.LIVE_MUSIC_HALL, name: "라이브 홀", emoji: "🎶", category: ShopCategory.ENTERTAINMENT,
    cost: 65000, baseIncome: 70, baseReputation: 22, description: "인디 밴드부터 다양한 장르의 라이브 공연.",
    minReputationRequired: 500,
  },

  // --- Existing Service --- (RESTROOM becomes Facility)
  [ShopType.RESTROOM]: {
    id: ShopType.RESTROOM, name: "화장실", emoji: "🚽", category: ShopCategory.FACILITY, 
    cost: 5000, baseIncome: 0, baseReputation: 1, description: "필수적인 편의시설.",
     minReputationRequired: 10,
  },

  // --- New Service ---
  [ShopType.HAIR_SALON]: {
    id: ShopType.HAIR_SALON, name: "헤어 살롱", emoji: "💇‍♀️", category: ShopCategory.SERVICE,
    cost: 35000, baseIncome: 50, baseReputation: 12, description: "전문가의 손길로 완성되는 트렌디한 헤어스타일.",
    minReputationRequired: 260,
  },
  [ShopType.SPA_NAIL_SALON]: {
    id: ShopType.SPA_NAIL_SALON, name: "스파 & 네일", emoji: "💅", category: ShopCategory.SERVICE,
    cost: 45000, baseIncome: 60, baseReputation: 15, description: "편안한 휴식과 아름다움을 위한 공간.",
    minReputationRequired: 340,
  },
  [ShopType.TRAVEL_AGENCY]: {
    id: ShopType.TRAVEL_AGENCY, name: "여행사", emoji: "✈️", category: ShopCategory.SERVICE,
    cost: 25000, baseIncome: 30, baseReputation: 10, description: "꿈꿔왔던 여행을 현실로 만들어 드립니다.",
    minReputationRequired: 200,
  },
  [ShopType.OPTICAL_SHOP]: {
    id: ShopType.OPTICAL_SHOP, name: "안경점", emoji: "👓", category: ShopCategory.SERVICE,
    cost: 22000, baseIncome: 35, baseReputation: 9, description: "시력 검사 및 다양한 안경, 콘택트렌즈.",
    minReputationRequired: 130,
  },
  [ShopType.SHOE_REPAIR]: {
    id: ShopType.SHOE_REPAIR, name: "구두 수선점", emoji: "👞", category: ShopCategory.SERVICE,
    cost: 10000, baseIncome: 15, baseReputation: 4, description: "낡은 구두도 새것처럼 말끔하게.",
    minReputationRequired: 50,
  },
  [ShopType.LAUNDROMAT]: {
    id: ShopType.LAUNDROMAT, name: "코인 빨래방", emoji: "🧺", category: ShopCategory.SERVICE,
    cost: 18000, baseIncome: 20, baseReputation: 5, description: "대용량 세탁과 건조를 한번에.",
    minReputationRequired: 90,
  },
  [ShopType.BANK_BRANCH]: {
    id: ShopType.BANK_BRANCH, name: "은행 지점", emoji: "🏦", category: ShopCategory.SERVICE,
    cost: 50000, baseIncome: 10, baseReputation: 15, description: "입출금, 송금 등 다양한 금융 서비스 제공.",
    minReputationRequired: 400,
  },

  // --- New Special/Facility ---
  [ShopType.INFORMATION_DESK]: {
    id: ShopType.INFORMATION_DESK, name: "안내 데스크", emoji: "ℹ️", category: ShopCategory.FACILITY,
    cost: 8000, baseIncome: 0, baseReputation: 5, description: "백화점 이용 안내 및 고객 지원.",
    minReputationRequired: 20,
  },
  [ShopType.VENDING_MACHINE_AREA]: {
    id: ShopType.VENDING_MACHINE_AREA, name: "자판기 코너", emoji: "🥤", category: ShopCategory.FACILITY,
    cost: 3000, baseIncome: 5, baseReputation: 2, description: "음료와 간식을 빠르고 편리하게.",
  },
  [ShopType.LOCKER_ROOM]: {
    id: ShopType.LOCKER_ROOM, name: "물품 보관함", emoji: "🔑", category: ShopCategory.FACILITY,
    cost: 6000, baseIncome: 2, baseReputation: 3, description: "무거운 짐을 안전하게 보관하세요.",
    minReputationRequired: 30,
  },
  [ShopType.NURSING_ROOM]: {
    id: ShopType.NURSING_ROOM, name: "수유실", emoji: "🍼", category: ShopCategory.FACILITY,
    cost: 7000, baseIncome: 0, baseReputation: 4, description: "아기와 엄마를 위한 아늑한 공간.",
    minReputationRequired: 50,
  },
  [ShopType.ATM_KIOSK]: {
    id: ShopType.ATM_KIOSK, name: "ATM기", emoji: "🏧", category: ShopCategory.FACILITY,
    cost: 10000, baseIncome: 1, baseReputation: 2, description: "현금 인출 및 간단한 금융 거래.",
    minReputationRequired: 70,
  },
  [ShopType.PUBLIC_SEATING_AREA]: {
    id: ShopType.PUBLIC_SEATING_AREA, name: "휴게 공간", emoji: "🛋", category: ShopCategory.FACILITY,
    cost: 12000, baseIncome: 0, baseReputation: 3, description: "쇼핑 중 잠시 쉬어갈 수 있는 편안한 의자.",
    minReputationRequired: 80,
  },

  // --- Research Unlocked Shops ---
  [ShopType.ROBOTICS_LAB]: {
    id: ShopType.ROBOTICS_LAB, name: "로보틱스 연구소", emoji: "🤖", category: ShopCategory.SPECIAL,
    cost: 250000, baseIncome: 200, baseReputation: 50, description: "미래 기술을 선보이는 첨단 연구 시설입니다. 높은 평판과 수입을 제공합니다.",
    isResearchLocked: true, // This shop can only be unlocked via research
  },
};

export const CUSTOMER_TYPE_EMOJIS: Record<CustomerType, string> = {
  [CustomerType.STUDENT]: "🚶‍♀️",
  [CustomerType.SHOPPER]: "🛍️",
  [CustomerType.PROFESSIONAL]: "👨‍💼",
  [CustomerType.SENIOR]: "👵",
  [CustomerType.CHILD]: "🧒",
  [CustomerType.TEENAGER]: "🧑‍🎤",
  [CustomerType.TOURIST]: "📸",
  [CustomerType.FAMILY_GROUP]: "👨‍👩‍👧‍👦",
  [CustomerType.WEALTHY_PATRON]: "🎩",
  [CustomerType.PET_OWNER]: "🐕",
  [CustomerType.FITNESS_ENTHUSIAST]: "🏋️‍♂️",
  [CustomerType.TECHIE]: "🤖",
  [CustomerType.FOODIE]: "😋",
  [CustomerType.ART_LOVER]: "🎨",
  [CustomerType.GAMER]: "🎮",
  [CustomerType.MUSIC_FAN]: "🎧",
  [CustomerType.TRENDSETTER]: "✨",
};

export const CUSTOMER_TYPE_NAMES_KR: Record<CustomerType, string> = {
  [CustomerType.STUDENT]: "학생",
  [CustomerType.SHOPPER]: "쇼핑객",
  [CustomerType.PROFESSIONAL]: "직장인",
  [CustomerType.SENIOR]: "노년층",
  [CustomerType.CHILD]: "어린이",
  [CustomerType.TEENAGER]: "십대",
  [CustomerType.TOURIST]: "관광객",
  [CustomerType.FAMILY_GROUP]: "가족 단위",
  [CustomerType.WEALTHY_PATRON]: "부유층 고객",
  [CustomerType.PET_OWNER]: "반려동물 동반",
  [CustomerType.FITNESS_ENTHUSIAST]: "운동 마니아",
  [CustomerType.TECHIE]: "기술 애호가",
  [CustomerType.FOODIE]: "미식가",
  [CustomerType.ART_LOVER]: "예술 애호가",
  [CustomerType.GAMER]: "게이머",
  [CustomerType.MUSIC_FAN]: "음악 팬",
  [CustomerType.TRENDSETTER]: "트렌드세터",
};

export const SYNERGY_DEFINITIONS: Synergy[] = [
  {
    id: "DESSERT_TIME", name: "디저트 타임",
    requiredShopTypes: [ShopType.BAKERY, ShopType.CAFE],
    incomeBonusPercent: 0.1, reputationBonusPoints: 5,
    description: "베이커리 + 카페. 달콤한 간식과 커피는 환상의 조합입니다!",
    message: "🍰 디저트 타임 시너지! 베이커리와 카페가 서로를 강화합니다!"
  },
  {
    id: "FOOD_COURT_BASIC", name: "미니 푸드코트",
    requiredShopTypes: [],
    requiredCategories: [{category: ShopCategory.FOOD, count: 3}],
    incomeBonusPercent: 0.15, reputationBonusPoints: 10,
    description: "같은 층에 식음료 매장 3개. 배고픈 고객들을 위한 더 많은 선택지!",
    message: "🍽️ 미니 푸드코트! 이 층의 식음료 매장들이 호황입니다!"
  },
  {
    id: "KIDS_CORNER", name: "키즈 코너",
    requiredShopTypes: [ShopType.TOY_STORE, ShopType.CHILDRENS_CLOTHING],
    incomeBonusPercent: 0.12, reputationBonusPoints: 8,
    description: "장난감 가게 + 아동복 매장. 아이들을 위한 천국!",
    message: "🎈 키즈 코너! 장난감 가게와 아동복 매장의 매출이 증가합니다!"
  },
  {
    id: "ENTERTAINMENT_HUB_BASIC", name: "펀 존",
    requiredShopTypes: [ShopType.ARCADE, ShopType.TOY_STORE],
    incomeBonusPercent: 0.1, reputationBonusPoints: 7,
    description: "오락실 + 장난감 가게. 재미가 두 배!",
    message: "🎉 펀 존! 오락실과 장난감 가게가 더 많은 방문객을 유치하고 있습니다!"
  },
  {
    id: "FASHION_STREET_ENTRANCE", name: "패션 스트리트 입구",
    requiredShopTypes: [ShopType.FASHION_APPAREL, ShopType.SHOE_STORE, ShopType.BAG_STORE],
    incomeBonusPercent: 0.2, reputationBonusPoints: 15,
    description: "의류, 신발, 가방 매장이 모여 패션 거리를 형성합니다.",
    message: "👠 패션 스트리트! 의류, 신발, 가방 매장의 시너지 효과 발생!"
  },
  {
    id: "LUXURY_AVENUE", name: "럭셔리 애비뉴",
    requiredShopTypes: [ShopType.LUXURY_BOUTIQUE, ShopType.JEWELRY_STORE, ShopType.STEAKHOUSE],
    incomeBonusPercent: 0.25, reputationBonusPoints: 30,
    description: "최고급 매장들이 모여 부유층 고객을 사로잡습니다.",
    message: "💎 럭셔리 애비뉴! 명품관들이 빛을 발합니다!"
  },
   {
    id: "TECH_PARADISE", name: "테크 파라다이스",
    requiredShopTypes: [ShopType.ELECTRONICS_STORE, ShopType.VR_ZONE, ShopType.ARCADE],
    incomeBonusPercent: 0.18, reputationBonusPoints: 20,
    description: "전자제품, VR, 게임이 만나 첨단 기술의 즐거움을 선사합니다.",
    message: "💡 테크 파라다이스! 첨단 기술 매장들이 활기를 띱니다!"
  },
  {
    id: "FULL_FOOD_COURT", name: "대형 푸드코트",
    requiredShopTypes: [], 
    requiredCategories: [{category: ShopCategory.FOOD, count: 5}],
    incomeBonusPercent: 0.25, reputationBonusPoints: 25,
    description: "같은 층에 식음료 매장 5개 이상. 미식가들의 천국!",
    message: "🍲 대형 푸드코트! 이 층은 미식의 중심지입니다!"
  },
];

export const PERIODIC_EVENT_DEFINITIONS: GameEventDefinition[] = [
  {
    id: "WEEKEND_SALE", name: "주말 세일!",
    description: "주말입니다! 모든 상점의 수입이 증가하고 더 많은 고객을 유치합니다.",
    durationTicks: 2 * TICKS_PER_DAY, 
    incomeMultiplier: 1.5,
    reputationMultiplier: 1.2,
    customerAttractionBoost: 10,
    triggerCondition: (gameState: GameState) => gameState.day % 7 === 0 || gameState.day % 7 === 1 
  },
  {
    id: "CELEBRITY_VISIT", name: "유명인 방문!",
    description: "유명 연예인이 방문했습니다! 평판과 고객 트래픽이 크게 증가합니다.",
    durationTicks: 1 * TICKS_PER_DAY,
    reputationMultiplier: 2.0,
    customerAttractionBoost: 25,
    triggerCondition: (gameState: GameState) => gameState.reputation > 500 && Math.random() < 0.05 
  }
];

export const VOC_MESSAGES_DEFINITIONS: VOCMessageDefinition[] = [
  { id: "VOC_POSITIVE_GENERIC", message: "이곳은 정말 멋져요! 볼거리가 정말 많아요!", type: "positive"},
  { id: "VOC_NEED_RESTROOM", message: "발이 아파요... 그리고 화장실은 어디죠?", type: "negative",
    triggerCondition: (gs: GameState) => !gs.floors.some(f => f.slots.some(s => s.shop?.shopTypeId === ShopType.RESTROOM)) && gs.customerStats.total > 20
  },
  { id: "VOC_NEED_MORE_FOOD_VARIETY", message: "배고픈데, 먹을 만한 곳이 별로 없네요.", type: "negative",
    triggerCondition: (gs: GameState) => {
      const foodShopCount = gs.floors.reduce((acc, f) => acc + f.slots.filter(s => s.shop && SHOP_DEFINITIONS[s.shop.shopTypeId].category === ShopCategory.FOOD).length, 0);
      return foodShopCount < 3 && gs.reputation > 100 && gs.customerStats.total > 50;
    }
  },
  { id: "VOC_LOVE_THE_FOOD_COURT", message: "여기 푸드코트는 정말 최고예요!", type: "positive",
    triggerCondition: (gs: GameState) => gs.floors.some(f => f.activeSynergies.some(syn => syn.id.includes("FOOD_COURT")))
  },
  { id: "VOC_TOO_CROWDED", message: "여기가 좀 혼잡해지고 있어요!", type: "neutral",
    triggerCondition: (gs: GameState) => gs.customerStats.total > 500
  },
  { id: "VOC_EXPENSIVE", message: "몇몇 물건들이 좀 비싸네요...", type: "negative",
    triggerCondition: (gs: GameState) => gs.floors.some(f => f.slots.some(s => s.shop && s.shop.level > 5)) && gs.reputation > 300
  },
  { id: "VOC_NEED_SEATING", message: "쇼핑하다 지쳤어요. 앉을 곳이 있었으면...", type: "negative",
    triggerCondition: (gs: GameState) => !gs.floors.some(f => f.slots.some(s => s.shop?.shopTypeId === ShopType.PUBLIC_SEATING_AREA || s.shop?.shopTypeId === ShopType.CAFE)) && gs.customerStats.total > 100
  },
  { id: "VOC_LOVE_THE_ATMOSPHERE", message: "백화점 분위기가 너무 좋아요!", type: "positive",
    triggerCondition: (gs: GameState) => gs.reputation > 400 && Math.random() < 0.1
  },
  { id: "VOC_LOW_CLEANLINESS", message: "백화점이 좀 지저분하네요... 청소가 필요해 보여요.", type: "negative",
    triggerCondition: (gs: GameState) => gs.floors.some(f => f.cleanliness < 30) && gs.customerStats.total > 30 && !gs.staff.some(s => s.role === StaffRole.CLEANER && s.assignedFloorId !== null)
  },
];

export const QUEST_DEFINITIONS: QuestDefinition[] = [
  {
    id: "BUILD_FIRST_SHOPS", title: "그랜드 오프닝 준비",
    description: "첫 두 개의 상점을 건설하세요: 베이커리와 서점.",
    targetValue: 2,
    getCurrentValue: (gs: GameState) => {
      const hasBakery = gs.floors.some(f => f.slots.some(s => s.shop?.shopTypeId === ShopType.BAKERY));
      const hasBookstore = gs.floors.some(f => f.slots.some(s => s.shop?.shopTypeId === ShopType.BOOKSTORE));
      return (hasBakery ? 1 : 0) + (hasBookstore ? 1 : 0);
    },
    reward: { gold: 5000, reputation: 20, researchPoints: 1 }
  },
  {
    id: "UNLOCK_CAFE", title: "커피 브레이크",
    description: "평판 50을 달성하여 카페를 잠금 해제하세요.",
    targetValue: 50,
    getCurrentValue: (gs: GameState) => gs.reputation,
    reward: { reputation: 10, unlockShopTypes: [ShopType.CAFE], researchPoints: 2 }
  },
  {
    id: "REACH_100_REPUTATION", title: "인기 상승",
    description: "평판 100을 달성하여 더 다양한 고객을 유치하세요.",
    targetValue: 100,
    getCurrentValue: (gs: GameState) => gs.reputation,
    reward: { gold: 10000, reputation: 20, researchPoints: 3, unlockShopTypes: [ShopType.FAST_FOOD, ShopType.CHILDRENS_CLOTHING, ShopType.PHARMACY] }
  },
  {
    id: "FIRST_SYNERGY", title: "똑똑한 조합",
    description: "어느 층에서든 첫 번째 상점 시너지를 발견하세요.",
    targetValue: 1,
    getCurrentValue: (gs: GameState) => gs.floors.some(f => f.activeSynergies.length > 0) ? 1 : 0,
    reward: { gold: 15000, reputation: 50, researchPoints: 5 }
  },
   {
    id: "BUILD_NEW_FLOOR", title: "위로 확장",
    description: "백화점의 두 번째 층을 건설하세요.",
    targetValue: 2,
    getCurrentValue: (gs: GameState) => gs.floors.length,
    reward: { gold: 20000, reputation: 30, researchPoints: 5, unlockShopTypes: [ShopType.INFORMATION_DESK] }
  },
  {
    id: "BUILD_SUPERMARKET", title: "생활의 중심",
    description: "슈퍼마켓을 건설하여 주민들의 편의를 도모하세요.",
    targetValue: 1,
    getCurrentValue: (gs: GameState) => gs.floors.some(f => f.slots.some(s => s.shop?.shopTypeId === ShopType.SUPERMARKET)) ? 1 : 0,
    reward: { gold: 50000, reputation: 70, researchPoints: 10, unlockShopTypes: [ShopType.HOME_GOODS] }
  },
  {
    id: "ENTERTAINMENT_ZONE", title: "엔터테인먼트의 왕",
    description: "영화관, 볼링장, 노래방 중 2개 이상을 건설하세요.",
    targetValue: 2,
    getCurrentValue: (gs: GameState) => {
        let count = 0;
        const entertainmentShops = [ShopType.CINEMA, ShopType.BOWLING_ALLEY, ShopType.KARAOKE, ShopType.ARCADE, ShopType.VR_ZONE];
        entertainmentShops.forEach(shopType => {
            if(gs.floors.some(f => f.slots.some(s => s.shop?.shopTypeId === shopType))) count++;
        });
        return count;
    },
    reward: { gold: 70000, reputation: 100, researchPoints: 15, unlockShopTypes: [ShopType.LIVE_MUSIC_HALL] }
  },
  {
    id: "HIRE_FIRST_STAFF", title: "첫 직원 고용",
    description: "첫 번째 직원을 고용하여 백화점 운영을 도와주세요.",
    targetValue: 1,
    getCurrentValue: (gs: GameState) => gs.staff.length,
    reward: { gold: 2000, reputation: 10, researchPoints: 2 }
  }
];

export const DEPARTMENT_STORE_RANKS: DepartmentStoreRank[] = [
  { name: "새싹 사업", minReputation: 0 },
  { name: "동네 인기점", minReputation: 100 },
  { name: "소문난 명소", minReputation: 250 },
  { name: "도시의 핫스팟", minReputation: 500 },
  { name: "지역의 중심", minReputation: 800 },
  { name: "전국구 스타", minReputation: 1200 },
  { name: "글로벌 아이콘", minReputation: 2000 },
  { name: "백화점의 전설 ⭐", minReputation: 3500 },
];

export const UNLOCKABLE_CUSTOMER_TYPES_BY_REPUTATION: { reputation: number, customerType: CustomerType }[] = [
    { reputation: 0, customerType: CustomerType.SHOPPER },
    { reputation: 20, customerType: CustomerType.STUDENT },
    { reputation: 80, customerType: CustomerType.TEENAGER },
    { reputation: 150, customerType: CustomerType.PROFESSIONAL },
    { reputation: 200, customerType: CustomerType.CHILD },
    { reputation: 250, customerType: CustomerType.FAMILY_GROUP },
    { reputation: 300, customerType: CustomerType.FOODIE },
    { reputation: 350, customerType: CustomerType.SENIOR },
    { reputation: 400, customerType: CustomerType.GAMER },
    { reputation: 450, customerType: CustomerType.TECHIE },
    { reputation: 500, customerType: CustomerType.PET_OWNER },
    { reputation: 600, customerType: CustomerType.FITNESS_ENTHUSIAST },
    { reputation: 700, customerType: CustomerType.MUSIC_FAN },
    { reputation: 800, customerType: CustomerType.TOURIST },
    { reputation: 900, customerType: CustomerType.ART_LOVER },
    { reputation: 1000, customerType: CustomerType.TRENDSETTER },
    { reputation: 1200, customerType: CustomerType.WEALTHY_PATRON },
];

export const MARKETING_CAMPAIGN_DEFINITIONS: MarketingCampaignDefinition[] = [
  {
    id: "FLYER_DISTRIBUTION", name: "전단지 배포", emoji: "📰",
    description: "가장 기본적인 마케팅입니다. 약간의 고객을 더 유치합니다.",
    cost: 5000, durationTicks: TICKS_PER_DAY * 2, 
    effects: { customerAttractionBoost: 5, reputationBoostOnStart: 5 },
    minReputationRequired: 0,
  },
  {
    id: "SOCIAL_MEDIA_ADS", name: "소셜 미디어 광고", emoji: "📱",
    description: "젊은 고객층에게 어필합니다. 고객 유치 및 약간의 수입 증가.",
    cost: 15000, durationTicks: TICKS_PER_DAY * 3, 
    effects: { customerAttractionBoost: 10, incomeMultiplier: 1.1, reputationBoostOnStart: 15 },
    minReputationRequired: 100,
  },
  {
    id: "LOCAL_RADIO_SPOTS", name: "지역 라디오 광고", emoji: "📻",
    description: "지역 사회에 백화점의 명성을 알립니다. 평판과 수입 증가.",
    cost: 30000, durationTicks: TICKS_PER_DAY * 5, 
    effects: { customerAttractionBoost: 5, incomeMultiplier: 1.2, reputationBoostOnStart: 30 },
    minReputationRequired: 250,
  },
  {
    id: "SEASONAL_SALE_PROMO", name: "시즌 세일 프로모션", emoji: "🛍️",
    description: "대규모 세일 이벤트를 홍보합니다. 고객 유치 및 수입이 크게 증가합니다.",
    cost: 50000, durationTicks: TICKS_PER_DAY * 7, 
    effects: { customerAttractionBoost: 20, incomeMultiplier: 1.3, reputationBoostOnStart: 25 },
    minReputationRequired: 500,
  },
  {
    id: "GRAND_OPENING_BLITZ", name: "그랜드 오프닝 블리츠", emoji: "🎉",
    description: "새로운 시작을 화려하게 알립니다! 모든 면에서 큰 효과를 봅니다. (백화점 1회 한정)",
    cost: 100000, durationTicks: TICKS_PER_DAY * 5, 
    effects: { customerAttractionBoost: 30, incomeMultiplier: 1.5, reputationBoostOnStart: 75 },
    minReputationRequired: 20, 
  }
];

export const RESEARCH_DEFINITIONS: ResearchDefinition[] = [
  {
    id: "BASIC_CUSTOMER_INSIGHTS", name: "고객 통찰력 기초", emoji: "🧐",
    description: "고객의 소리(VOC) 최대 표시 개수를 2개 늘립니다.",
    costRP: 5,
    effects: [{ type: ResearchEffectType.INCREASE_MAX_VOC_MESSAGES, value: 2 }],
    tier: 1,
  },
  {
    id: "EFFICIENT_OPERATIONS_1", name: "운영 효율화 I", emoji: "⚙️",
    description: "모든 '식품' 매장의 수입을 5% 증가시킵니다.",
    costRP: 15,
    effects: [{ type: ResearchEffectType.GLOBAL_INCOME_MULTIPLIER, category: ShopCategory.FOOD, value: 0.05 }],
    tier: 2,
  },
  {
    id: "ADVANCED_MARKETING_TECHNIQUES", name: "고급 마케팅 기법", emoji: "📈",
    description: "모든 마케팅 캠페인의 고객 유치 효과를 10% 증가시킵니다. (이 효과는 향후 업데이트로 실제 게임플레이에 반영될 수 있습니다.)", 
    costRP: 10,
    effects: [], 
    prerequisites: ["BASIC_CUSTOMER_INSIGHTS"],
    tier: 2,
  },
  {
    id: "ROBOTICS_BREAKTHROUGH", name: "로보틱스 혁신", emoji: "🤖",
    description: "특별 상점 '로보틱스 연구소' 건설을 잠금 해제합니다. 백화점의 위상을 한층 높여줄 것입니다.",
    costRP: 25,
    effects: [{ type: ResearchEffectType.UNLOCK_SHOP, shopType: ShopType.ROBOTICS_LAB }],
    prerequisites: ["ADVANCED_MARKETING_TECHNIQUES"], 
    tier: 3,
  },
  {
    id: "STAFF_CAPACITY_1", name: "직원 수용량 증가 I", emoji: "👥",
    description: "최대 고용 가능 직원 수를 2명 늘립니다.",
    costRP: 10,
    effects: [{ type: ResearchEffectType.INCREASE_MAX_STAFF_SLOTS, value: 2 }],
    tier: 2,
  },
  {
    id: "STAFF_CAPACITY_2", name: "직원 수용량 증가 II", emoji: "👥+",
    description: "최대 고용 가능 직원 수를 추가로 3명 늘립니다.",
    costRP: 25,
    effects: [{ type: ResearchEffectType.INCREASE_MAX_STAFF_SLOTS, value: 3 }],
    prerequisites: ["STAFF_CAPACITY_1"],
    tier: 3,
  },
];