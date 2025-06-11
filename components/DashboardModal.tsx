import React, { useState } from 'react';
import { FinancialSummary, IncomeByShopCategory, IncomeByShopType, FloorPerformanceData, ShopPopularityData, ShopDefinition, ShopCategory, ShopType } from '../types';
import Modal from './Modal';
import ProgressBar from './ProgressBar'; // Assuming ProgressBar can be reused or adapted
import { SHOP_DEFINITIONS, TICKS_PER_DAY } from '../constants'; // TICKS_PER_DAY might be needed

type DashboardTab = 'financial' | 'customer';

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  financialSummary: FinancialSummary;
  incomeByShopCategory: IncomeByShopCategory[];
  incomeByShopType: IncomeByShopType[];
  floorPerformanceData: FloorPerformanceData[];
  shopPopularityData: ShopPopularityData[];
  shopDefinitions: Record<ShopType, ShopDefinition>;
  ticksPerDay: number;
}

const getCategoryName = (category: ShopCategory): string => {
    // Simple mapping, can be expanded or moved to constants
    const names: Record<ShopCategory, string> = {
        [ShopCategory.FOOD]: "음식",
        [ShopCategory.GOODS]: "상품",
        [ShopCategory.ENTERTAINMENT]: "오락",
        [ShopCategory.SERVICE]: "서비스",
        [ShopCategory.SPECIAL]: "특별",
        [ShopCategory.FACILITY]: "시설",
    };
    return names[category] || category;
}


const DashboardModal: React.FC<DashboardModalProps> = ({
  isOpen,
  onClose,
  financialSummary,
  incomeByShopCategory,
  incomeByShopType,
  floorPerformanceData,
  shopPopularityData,
  shopDefinitions, // Pass shopDefinitions for emoji and names
  ticksPerDay
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('financial');

  if (!isOpen) return null;

  const renderFinancialAnalysis = () => (
    <div className="space-y-6 p-1">
      {/* Overall Summary */}
      <section>
        <h3 className="text-xl font-semibold text-sky-300 mb-2">종합 재무 현황</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-700 p-3 rounded-md">
            <p className="text-slate-400">틱당 총 수입:</p>
            <p className="text-lg text-green-400">{financialSummary.totalIncomePerTick.toLocaleString()} G</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-md">
            <p className="text-slate-400">일일 총 직원 급여:</p>
            <p className="text-lg text-red-400">{financialSummary.totalSalaryPerDay.toLocaleString()} G</p>
          </div>
          <div className="bg-slate-700 p-3 rounded-md">
            <p className="text-slate-400">틱당 순이익:</p>
            <p className={`text-lg ${financialSummary.netProfitPerTick >= 0 ? 'text-yellow-400' : 'text-orange-400'}`}>
              {financialSummary.netProfitPerTick.toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits:1})} G
            </p>
          </div>
          <div className="bg-slate-700 p-3 rounded-md">
            <p className="text-slate-400">일일 순이익:</p>
             <p className={`text-lg ${financialSummary.netProfitPerDay >= 0 ? 'text-yellow-400' : 'text-orange-400'}`}>
              {financialSummary.netProfitPerDay.toLocaleString()} G
            </p>
          </div>
        </div>
      </section>

      {/* Income by Shop Category */}
      <section>
        <h3 className="text-xl font-semibold text-sky-300 mb-2">상점 카테고리별 수입</h3>
        <div className="bg-slate-700 p-3 rounded-md overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-600">
              <tr>
                <th className="px-4 py-2">카테고리</th>
                <th className="px-4 py-2 text-right">총 수입 (틱당)</th>
                <th className="px-4 py-2 text-right">상점 수</th>
              </tr>
            </thead>
            <tbody>
              {incomeByShopCategory.map(cat => (
                <tr key={cat.category} className="border-b border-slate-600 hover:bg-slate-650">
                  <td className="px-4 py-2 font-medium text-slate-200">{getCategoryName(cat.category)}</td>
                  <td className="px-4 py-2 text-right text-green-300">{cat.totalIncome.toLocaleString()} G</td>
                  <td className="px-4 py-2 text-right">{cat.shopCount}</td>
                </tr>
              ))}
              {incomeByShopCategory.length === 0 && <tr><td colSpan={3} className="text-center py-3 text-slate-500">데이터 없음</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      
      {/* Income by Shop Type */}
      <section>
        <h3 className="text-xl font-semibold text-sky-300 mb-2">상점 유형별 수입</h3>
        <div className="bg-slate-700 p-3 rounded-md overflow-x-auto max-h-80">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-600 sticky top-0">
              <tr>
                <th className="px-4 py-2">상점명</th>
                <th className="px-4 py-2 text-right">총 수입 (틱당)</th>
                <th className="px-4 py-2 text-right">상점 수</th>
                <th className="px-4 py-2 text-right">평균 수입/상점</th>
              </tr>
            </thead>
            <tbody>
              {incomeByShopType.map(typeData => (
                <tr key={typeData.shopType} className="border-b border-slate-600 hover:bg-slate-650">
                  <td className="px-4 py-2 font-medium text-slate-200">{typeData.definition.emoji} {typeData.definition.name}</td>
                  <td className="px-4 py-2 text-right text-green-300">{typeData.totalIncome.toLocaleString()} G</td>
                  <td className="px-4 py-2 text-right">{typeData.shopCount}</td>
                   <td className="px-4 py-2 text-right text-green-300">{typeData.averageIncomePerShop.toLocaleString(undefined, {maximumFractionDigits:0})} G</td>
                </tr>
              ))}
              {incomeByShopType.length === 0 && <tr><td colSpan={4} className="text-center py-3 text-slate-500">데이터 없음</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  const renderCustomerInsights = () => (
    <div className="space-y-6 p-1">
      {/* Floor Performance */}
      <section>
        <h3 className="text-xl font-semibold text-sky-300 mb-2">층별 고객 현황</h3>
        <div className="space-y-3">
          {floorPerformanceData.map(floor => (
            <div key={floor.floorNumber} className="bg-slate-700 p-3 rounded-md">
              <h4 className="text-lg font-medium text-amber-300 mb-1.5">{floor.floorNumber}층 현황</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-slate-400">청결도: </span>
                  <span className={`font-semibold ${floor.cleanliness > 70 ? 'text-green-400' : floor.cleanliness > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {floor.cleanliness.toFixed(0)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">총 고객 트래픽: </span>
                  <span className="font-semibold text-teal-300">{floor.totalTraffic.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">가장 인기있는 상점: </span>
                  {floor.topShop ? (
                    <span className="font-semibold text-purple-300">
                      {floor.topShop.emoji} {floor.topShop.name} ({floor.topShop.traffic.toLocaleString()} 방문)
                    </span>
                  ) : (
                    <span className="text-slate-500">없음</span>
                  )}
                </div>
              </div>
               {/* Optional: Floor Heatmap/Slot breakdown - simple version */}
                <div className="mt-2 text-xs">
                    <p className="text-slate-400 mb-1">층 내 상점별 트래픽 (상위 3개):</p>
                    <div className="flex flex-wrap gap-2">
                    {floor.shopsData
                        .filter(s => (s.visitCount || 0) > 0)
                        .sort((a,b) => (b.visitCount || 0) - (a.visitCount || 0))
                        .slice(0,3)
                        .map(s => {
                            const def = shopDefinitions[s.shopTypeId];
                            const trafficPercentage = floor.totalTraffic > 0 ? ((s.visitCount || 0) / floor.totalTraffic) * 100 : 0;
                            let bgColor = 'bg-sky-700';
                            if (trafficPercentage > 50) bgColor = 'bg-sky-500';
                            else if (trafficPercentage > 25) bgColor = 'bg-sky-600';

                            return (
                            <div key={s.id} className={`p-1.5 rounded ${bgColor} text-white text-center min-w-[80px]`}>
                                <div>{def.emoji} {def.name}</div>
                                <div>{s.visitCount || 0} 방문</div>
                            </div>
                            );
                        })
                    }
                     {floor.shopsData.filter(s => (s.visitCount || 0) > 0).length === 0 && <span className="text-slate-500">운영중 상점 없음 또는 트래픽 없음</span>}
                    </div>
                </div>
            </div>
          ))}
           {floorPerformanceData.length === 0 && <p className="text-center py-3 text-slate-500">데이터 없음</p>}
        </div>
      </section>

      {/* Shop Popularity (Overall) */}
      <section>
        <h3 className="text-xl font-semibold text-sky-300 mb-2">전체 상점 인기도 순위 (Top 10)</h3>
        <div className="bg-slate-700 p-3 rounded-md overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-600">
              <tr>
                <th className="px-4 py-2">순위</th>
                <th className="px-4 py-2">상점명</th>
                <th className="px-4 py-2">층</th>
                <th className="px-4 py-2 text-right">총 방문 수</th>
              </tr>
            </thead>
            <tbody>
              {shopPopularityData.map((shop, index) => (
                <tr key={`${shop.shopType}-${shop.floorNumber}-${shop.slotIndex}`} className="border-b border-slate-600 hover:bg-slate-650">
                  <td className="px-4 py-2 text-slate-300">#{index + 1}</td>
                  <td className="px-4 py-2 font-medium text-slate-200">{shop.emoji} {shop.shopName} (레벨 {shop.level})</td>
                  <td className="px-4 py-2 text-slate-300">{shop.floorNumber}층</td>
                  <td className="px-4 py-2 text-right text-teal-300">{shop.traffic.toLocaleString()}</td>
                </tr>
              ))}
              {shopPopularityData.length === 0 && <tr><td colSpan={4} className="text-center py-3 text-slate-500">데이터 없음</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📊 데이터 대시보드" size="xl">
      <div className="mb-4 flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('financial')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'financial' ? 'border-b-2 border-sky-400 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          재무 분석
        </button>
        <button
          onClick={() => setActiveTab('customer')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'customer' ? 'border-b-2 border-sky-400 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          고객 인사이트
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto pr-2">
        {activeTab === 'financial' ? renderFinancialAnalysis() : renderCustomerInsights()}
      </div>
    </Modal>
  );
};

export default DashboardModal;