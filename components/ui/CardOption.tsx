import React from 'react';

interface CardOptionProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  subLabel?: React.ReactNode;
  activeColor?: string; // Kept for interface compatibility but generally not used with new design
  disabled?: boolean;
}

const CardOption: React.FC<CardOptionProps> = ({ selected, onClick, icon, label, subLabel, disabled }) => {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300 text-center min-w-[100px] flex-1 basis-[calc(33.333%-16px)] box-border
        ${selected 
          ? 'bg-white ring-2 ring-[#4DBCE9] shadow-md z-10' 
          : 'bg-slate-50 hover:bg-white hover:shadow-md hover:-translate-y-1'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed hover:transform-none hover:shadow-none' : ''}
      `}
    >
      <div className={`transition-colors duration-300 ${selected ? 'text-[#4DBCE9] scale-110' : 'text-slate-400 grayscale-[0.5]'}`}>
        {React.cloneElement(icon as React.ReactElement, { className: `w-10 h-10 mb-3 fill-current` })}
      </div>
      <span className={`text-sm leading-tight font-medium transition-colors ${selected ? 'text-[#4DBCE9]' : 'text-slate-600'}`}>
        {label}
        {subLabel && <span className="block text-xs text-slate-400 mt-1.5 font-normal">{subLabel}</span>}
      </span>
      
      {/* Active Indicator Checkmark */}
      {selected && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-[#4DBCE9] rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </div>
      )}
    </div>
  );
};

export default CardOption;