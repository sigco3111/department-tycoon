import React from 'react';

interface TimeControlsProps {
  isPaused: boolean;
  gameSpeed: number;
  onTogglePausePlay: () => void;
  onChangeSpeed: () => void;
  currentDay: number;
  currentTick: number;
  ticksPerDay: number;
  isDelegationModeActive: boolean; 
  onToggleDelegationMode: () => void;
  onResetGame: () => void;
  onSaveGame: () => void;
}

const TimeControls: React.FC<TimeControlsProps> = ({
  isPaused,
  gameSpeed,
  onTogglePausePlay,
  onChangeSpeed,
  currentDay,
  currentTick,
  ticksPerDay,
  isDelegationModeActive,
  onToggleDelegationMode,
  onResetGame,
  onSaveGame,
}) => {
  return (
    <div className="w-full p-3 bg-slate-800 border-t border-b border-slate-700 flex justify-between items-center shadow-md flex-shrink-0 h-16">
      <div className="flex items-center">
        <div className="text-center">
          <p className="text-sm text-slate-200 font-semibold">날짜: {currentDay}일</p>
          <p className="text-xs text-slate-400">시간: {currentTick}/{ticksPerDay}</p>
        </div>
        <button
          onClick={onResetGame}
          disabled={isDelegationModeActive}
          className={`px-2 py-2 sm:px-3 rounded-md text-white text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
                        bg-red-600 hover:bg-red-500 focus:ring-red-500 ml-16 /* Changed margin here */
                        ${isDelegationModeActive ? 'disabled:bg-slate-500 disabled:cursor-not-allowed' : ''}`}
          aria-label="새 게임 시작"
        >
          🔄 새 게임
        </button>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2">
        <button
          onClick={onToggleDelegationMode}
          className={`px-2 py-2 sm:px-3 rounded-md text-white text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
                        ${isDelegationModeActive ? 'bg-purple-600 hover:bg-purple-500 focus:ring-purple-500' : 'bg-gray-600 hover:bg-gray-500 focus:ring-gray-500'}`}
          aria-label={isDelegationModeActive ? "위임 모드 비활성화" : "위임 모드 활성화"}
        >
          {isDelegationModeActive ? '🤖 위임 중' : '🤖 위임'}
        </button>
        <button
          onClick={onTogglePausePlay}
          disabled={isDelegationModeActive} 
          className={`px-2 py-2 sm:px-3 rounded-md text-white text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
                        ${isPaused ? 'bg-green-600 hover:bg-green-500 focus:ring-green-500' : 'bg-yellow-600 hover:bg-yellow-500 focus:ring-yellow-500'}
                        ${isDelegationModeActive ? 'disabled:bg-slate-500 disabled:cursor-not-allowed' : ''}`}
          aria-label={isPaused ? "게임 시작" : "일시 정지"}
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>
        <button
          onClick={onChangeSpeed}
          disabled={isDelegationModeActive} 
           className={`px-2 py-2 sm:px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800
                        ${isDelegationModeActive ? 'disabled:bg-slate-500 disabled:cursor-not-allowed' : ''}`}
          aria-label={`게임 속도 변경, 현재 ${gameSpeed}배속`}
        >
          {gameSpeed}x
        </button>
        <button
          onClick={onSaveGame}
          disabled={isDelegationModeActive}
          className={`px-2 py-2 sm:px-3 rounded-md text-white text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
                        bg-blue-600 hover:bg-blue-500 focus:ring-blue-500
                        ${isDelegationModeActive ? 'disabled:bg-slate-500 disabled:cursor-not-allowed' : ''}`}
          aria-label="게임 저장"
        >
          💾 저장
        </button>
      </div>
    </div>
  );
};

export default TimeControls;