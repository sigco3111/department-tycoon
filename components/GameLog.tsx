import React, { useEffect, useRef } from 'react';
import { LogMessage } from '../types';

interface GameLogProps {
  messages: LogMessage[];
}

const GameLog: React.FC<GameLogProps> = ({ messages }) => {
  const scrollableLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollableLogRef.current) {
      scrollableLogRef.current.scrollTop = scrollableLogRef.current.scrollHeight;
    }
  }, [messages]);

  const getMessageTypeStyles = (type: LogMessage['type']): string => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'delegation':
        return 'text-purple-400';
      case 'info':
      default:
        return 'text-sky-400';
    }
  };
  
  const getMessageTypeIcon = (type: LogMessage['type']): string => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'delegation':
        return '🤖';
      case 'info':
      default:
        return 'ℹ️';
    }
  }

  return (
    <div className="h-24 bg-slate-950 border-t border-slate-700 p-2 flex flex-col">
      <div ref={scrollableLogRef} className="flex-grow overflow-y-auto space-y-1 text-xs">
        {messages.slice().reverse().map((msg) => (
          <p key={msg.id} className={`${getMessageTypeStyles(msg.type)}`}>
            <span className="mr-1">{getMessageTypeIcon(msg.type)}</span>
            {msg.message}
          </p>
        ))}
         {messages.length === 0 && <p className="text-slate-600 italic">게임 로그가 여기에 표시됩니다...</p>}
      </div>
    </div>
  );
};

export default GameLog;