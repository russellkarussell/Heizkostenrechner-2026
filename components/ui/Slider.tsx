import React from 'react';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({ label, min, max, step, value, onChange, unit, disabled }) => {
  return (
    <div className={`mt-6 mb-2 ${disabled ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
      <div className="flex justify-between items-end mb-3">
        <label className="font-semibold text-slate-700 text-sm">{label}</label>
        <span className="font-bold text-[#4DBCE9] bg-[#e0f7fa] px-3 py-1 rounded-full text-sm shadow-sm">
          {value.toFixed(step < 1 ? 2 : 0)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
          <span>{min}</span>
          <span>{max}</span>
      </div>
    </div>
  );
};

export default Slider;