
import React, { useState } from 'react';
import { StaffMember, StaffRole, Floor, StaffRoleDefinition } from '../types';
import { STAFF_ROLE_DEFINITIONS } from '../constants';
import Modal from './Modal';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStaff: StaffMember[];
  availableApplicants: StaffMember[];
  onHireStaff: (applicantId: string) => void;
  onFireStaff: (staffId: string) => void;
  onAssignStaffToFloor: (staffId: string, floorId: string | null) => void;
  maxStaffSlots: number;
  floors: Floor[];
  currentGold: number; // For affordability checks, though salary is daily
  currentReputation: number; // For role unlock checks
}

type StaffModalTab = 'hire' | 'manage';

const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  currentStaff,
  availableApplicants,
  onHireStaff,
  onFireStaff,
  onAssignStaffToFloor,
  maxStaffSlots,
  floors,
  currentGold,
  currentReputation,
}) => {
  const [activeTab, setActiveTab] = useState<StaffModalTab>('hire');

  if (!isOpen) return null;

  const getRoleDefinition = (role: StaffRole): StaffRoleDefinition => {
    return STAFF_ROLE_DEFINITIONS[role];
  };

  const renderApplicantCard = (applicant: StaffMember) => {
    const roleDef = getRoleDefinition(applicant.role);
    const canHire = currentStaff.length < maxStaffSlots;
    // Basic affordability check, actual salary is daily.
    // const canAfford = currentGold >= applicant.salaryPerDay; 
    // Not strictly needed as salary is daily, but can be a soft indicator. Hire button mostly limited by slots.

    return (
      <div key={applicant.id} className="bg-slate-700 p-3 rounded-md shadow flex flex-col sm:flex-row justify-between items-start">
        <div className="flex-grow mb-2 sm:mb-0">
          <div className="flex items-center mb-1">
            <span className="text-3xl mr-2">{applicant.emoji}</span>
            <div>
              <h4 className="text-lg font-semibold text-sky-300">{applicant.name}</h4>
              <p className="text-sm text-slate-300">{roleDef.name} (기술 {applicant.skillLevel}레벨)</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-1">{roleDef.description}</p>
          <p className="text-xs text-yellow-300">일일 급여: {applicant.salaryPerDay.toLocaleString()}G</p>
        </div>
        <div className="flex-shrink-0 sm:ml-3 text-right w-full sm:w-auto">
          <button
            onClick={() => onHireStaff(applicant.id)}
            disabled={!canHire}
            className="w-full sm:w-auto px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md shadow-md disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            aria-label={`고용: ${applicant.name}`}
          >
            고용하기
          </button>
          {!canHire && <p className="text-xs text-red-400 mt-1">직원 슬롯 부족</p>}
        </div>
      </div>
    );
  };

  const renderStaffCard = (staffMember: StaffMember) => {
    const roleDef = getRoleDefinition(staffMember.role);
    return (
      <div key={staffMember.id} className="bg-slate-700 p-3 rounded-md shadow flex flex-col sm:flex-row justify-between items-start">
        <div className="flex-grow mb-2 sm:mb-0">
           <div className="flex items-center mb-1">
            <span className="text-3xl mr-2">{staffMember.emoji}</span>
            <div>
              <h4 className="text-lg font-semibold text-sky-300">{staffMember.name}</h4>
              <p className="text-sm text-slate-300">{roleDef.name} (기술 {staffMember.skillLevel}레벨)</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-1">일일 급여: {staffMember.salaryPerDay.toLocaleString()}G</p>
           <div className="flex items-center space-x-2 mt-2">
            <label htmlFor={`assign-${staffMember.id}`} className="text-xs text-slate-400">배정:</label>
            <select
                id={`assign-${staffMember.id}`}
                value={staffMember.assignedFloorId || ""}
                onChange={(e) => onAssignStaffToFloor(staffMember.id, e.target.value === "" ? null : e.target.value)}
                className="bg-slate-600 text-slate-200 text-xs p-1 rounded-md border border-slate-500 focus:ring-sky-500 focus:border-sky-500"
            >
                <option value="">미배정</option>
                {floors.map(floor => (
                <option key={floor.id} value={floor.id}>{floor.floorNumber}층</option>
                ))}
            </select>
          </div>
        </div>
        <div className="flex-shrink-0 sm:ml-3 text-right w-full sm:w-auto">
            <button
                onClick={() => onFireStaff(staffMember.id)}
                className="w-full sm:w-auto px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-md shadow-md transition-colors text-sm font-medium"
                aria-label={`해고: ${staffMember.name}`}
            >
                해고하기
            </button>
        </div>
      </div>
    );
  };
  
  const availableRolesForApplication = (Object.keys(STAFF_ROLE_DEFINITIONS) as StaffRole[]).filter(role => 
        currentReputation >= STAFF_ROLE_DEFINITIONS[role].minReputationRequired
      );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🧑‍💼 직원 관리" size="xl">
      <div className="mb-4 flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('hire')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'hire' ? 'border-b-2 border-sky-400 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          고용 ({availableApplicants.length})
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'manage' ? 'border-b-2 border-sky-400 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          직원 목록 ({currentStaff.length}/{maxStaffSlots})
        </button>
      </div>

      <div className="space-y-3 max-h-[65vh] overflow-y-auto p-1 pr-2">
        {activeTab === 'hire' && (
          <>
            {availableApplicants.length === 0 && <p className="text-slate-500 text-center py-4">현재 지원자가 없습니다. 매일 새로운 지원자가 올 수 있습니다.</p>}
            {availableApplicants.map(renderApplicantCard)}
            {availableRolesForApplication.length === 0 && availableApplicants.length === 0 &&
              <p className="text-slate-500 text-center py-4">평판이 낮아 아직 지원 가능한 직무가 없습니다. 평판을 높여보세요!</p>
            }
          </>
        )}
        {activeTab === 'manage' && (
          <>
            {currentStaff.length === 0 && <p className="text-slate-500 text-center py-4">고용된 직원이 없습니다.</p>}
            {currentStaff.map(renderStaffCard)}
          </>
        )}
      </div>
    </Modal>
  );
};

export default StaffModal;
