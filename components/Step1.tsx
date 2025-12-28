import React from 'react';
import { FormData, Language } from '../types';
import { TRANSLATIONS, CONFIG } from '../constants';
import * as Icons from './ui/Icons';
import CardOption from './ui/CardOption';
import Slider from './ui/Slider';

interface Step1Props {
  data: FormData;
  lang: Language;
  updateData: (partial: Partial<FormData>) => void;
}

const Step1: React.FC<Step1Props> = ({ data, lang, updateData }) => {
  const t = TRANSLATIONS[lang];
  const isNewBuild = data.heizsystem === 'keine';

  const buildingClasses = [
    { value: 'alt_unsaniert', icon: <Icons.IconBuildingOldUnrenovated />, label: 'Altbau, unsaniert', kwh: '200', w: '100' },
    { value: 'alt_teilsaniert', icon: <Icons.IconBuildingOldPartial />, label: 'Altbau, teilsaniert', kwh: '150', w: '70' },
    { value: 'alt_saniert', icon: <Icons.IconBuildingOldRenovated />, label: 'Altbau, saniert', kwh: '100', w: '50' },
    { value: 'neubau', icon: <Icons.IconBuildingNew />, label: 'Neubau', kwh: '70', w: '40' },
    { value: 'niedrigenergie', icon: <Icons.IconBuildingLowEnergy />, label: 'Niedrigenergie', kwh: '30', w: '30' }
  ];

  const systems = [
    { value: 'heizoel', icon: <Icons.IconOil />, label: 'Heizöl' },
    { value: 'erdgas_h', icon: <Icons.IconGasH />, label: 'Erdgas (H)' },
    { value: 'erdgas_l', icon: <Icons.IconGasL />, label: 'Erdgas (L)' },
    { value: 'fluessiggas', icon: <Icons.IconLPG />, label: 'Flüssiggas' },
    { value: 'pellets', icon: <Icons.IconPellets />, label: 'Pellets' },
    { value: 'strom', icon: <Icons.IconElectricity />, label: 'Strom' },
    { value: 'keine', icon: <Icons.IconNewBuild />, label: 'Keine (Neubau)' }
  ];

  const handleSystemChange = (sys: string) => {
      const isNew = sys === 'keine';
      const updates: Partial<FormData> = { heizsystem: sys };
      
      if (isNew) {
          updates.method = 'flaeche';
      }
      
      if (CONFIG.defaultWirkungsgrade[sys]) {
          updates.wirkungsgradAlt = CONFIG.defaultWirkungsgrade[sys];
      }
      if (CONFIG.defaultPrices[sys]) {
          updates.preisAlt = CONFIG.defaultPrices[sys];
      }
      if (sys === 'strom') {
          updates.preisAlt = data.strompreis; 
      }
      
      updateData(updates);
  };

  const getPriceConfig = () => {
     if (data.heizsystem === 'strom') return CONFIG.priceSliderConfigs.strom;
     return CONFIG.priceSliderConfigs[data.heizsystem] || CONFIG.priceSliderConfigs.heizoel;
  };

  const priceConfig = getPriceConfig();

  return (
    <div className="fade-in-up space-y-10">
      <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">{t.step1Title}</h2>
          <div className="h-1 w-20 bg-[#4DBCE9] mx-auto mt-3 rounded-full"></div>
      </div>
      
      {!isNewBuild && (
        <section>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">{t.basisTitle}</h3>
          <p className="mb-6 text-slate-500 text-sm">{t.basisText}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className={`flex-1 p-5 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all duration-300 ${data.method === 'flaeche' ? 'bg-white ring-2 ring-[#4DBCE9] shadow-lg scale-[1.02]' : 'bg-slate-50 hover:bg-white hover:shadow-md'}`}>
                <input type="radio" className="hidden" name="method" checked={data.method === 'flaeche'} onChange={() => updateData({ method: 'flaeche' })} />
                <div className={data.method === 'flaeche' ? 'text-[#4DBCE9]' : 'text-slate-400'}><Icons.IconMethodArea /></div>
                <span className={`font-bold mt-2 ${data.method === 'flaeche' ? 'text-[#4DBCE9]' : 'text-slate-700'}`}>{t.basisArea}</span>
            </label>
            <label className={`flex-1 p-5 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all duration-300 ${data.method === 'verbrauch' ? 'bg-white ring-2 ring-[#4DBCE9] shadow-lg scale-[1.02]' : 'bg-slate-50 hover:bg-white hover:shadow-md'}`}>
                <input type="radio" className="hidden" name="method" checked={data.method === 'verbrauch'} onChange={() => updateData({ method: 'verbrauch' })} />
                <div className={data.method === 'verbrauch' ? 'text-[#4DBCE9]' : 'text-slate-400'}><Icons.IconMethodConsumption /></div>
                <span className={`font-bold mt-2 ${data.method === 'verbrauch' ? 'text-[#4DBCE9]' : 'text-slate-700'}`}>{t.basisConsumption}</span>
            </label>
          </div>
        </section>
      )}

      {data.method === 'verbrauch' && !isNewBuild ? (
          <section className="bg-slate-50 p-6 rounded-2xl">
             <h3 className="text-lg font-semibold text-slate-700 mb-4">{t.yourConsumptionTitle}</h3>
             <label className="block font-medium text-slate-500 mb-2 text-sm">{t.annualConsumptionLabel}</label>
             <div className="flex gap-3 items-center">
                 <input 
                    type="number" 
                    value={data.verbrauch} 
                    onChange={(e) => updateData({ verbrauch: parseFloat(e.target.value) || 0 })}
                    className="flex-1 p-3 border-0 bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-[#4DBCE9] outline-none text-lg font-semibold text-slate-700"
                 />
                 <span className="text-slate-500 font-medium whitespace-nowrap bg-white px-4 py-3 rounded-xl shadow-sm">
                    {data.heizsystem === 'heizoel' || data.heizsystem === 'fluessiggas' ? 'Liter' : 
                     data.heizsystem === 'pellets' ? 'kg' : 
                     data.heizsystem === 'strom' ? 'kWh' : 'm³'}
                 </span>
             </div>
          </section>
      ) : (
          <section>
             <h3 className="text-lg font-semibold text-slate-700 mb-4">{t.yourPropertyTitle}</h3>
             <label className="block font-medium text-slate-500 mb-3 text-sm">{t.buildingClassLabel}</label>
             <div className="flex flex-wrap gap-3 justify-center mb-6">
                 {buildingClasses.map((b) => (
                     <CardOption 
                        key={b.value}
                        selected={data.gebaeudeklasse === b.value}
                        onClick={() => updateData({ gebaeudeklasse: b.value })}
                        icon={b.icon}
                        label={b.label}
                        subLabel={<span>(~{b.kwh} kWh/m²a)<br/>(~{b.w} W/m²)</span>}
                     />
                 ))}
             </div>
             <div className="bg-slate-50 p-6 rounded-2xl">
                 <Slider 
                    label={t.areaLabel}
                    min={50} max={400} step={1}
                    value={data.flaeche}
                    onChange={(v) => updateData({ flaeche: v })}
                    unit="m²"
                 />
             </div>
          </section>
      )}

      <section>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">{t.currentSystemTitle}</h3>
          <div className="flex flex-wrap gap-3 justify-center mb-6">
             {systems.map((s) => (
                 <CardOption 
                    key={s.value}
                    selected={data.heizsystem === s.value}
                    onClick={() => handleSystemChange(s.value)}
                    icon={s.icon}
                    label={s.label}
                 />
             ))}
          </div>
          
          <div className={`transition-all duration-500 bg-slate-50 p-6 rounded-2xl ${isNewBuild ? 'opacity-40 grayscale' : 'opacity-100'}`}>
              <Slider 
                  label={t.efficiencyOldLabel}
                  min={50} max={100} step={1}
                  value={data.wirkungsgradAlt}
                  onChange={(v) => updateData({ wirkungsgradAlt: v })}
                  unit="%"
                  disabled={isNewBuild}
              />
              <p className="text-xs text-slate-400 mt-1 mb-6 italic">{t.efficiencyOldDisclaimer}</p>

              <div className="border-t border-slate-200 pt-2">
                <Slider 
                    label={t.priceOldLabel}
                    min={priceConfig.min} max={priceConfig.max} step={priceConfig.step}
                    value={data.preisAlt}
                    onChange={(v) => updateData({ preisAlt: v })}
                    unit={priceConfig.unit}
                    disabled={isNewBuild || data.heizsystem === 'strom'}
                />
              </div>
          </div>
      </section>

    </div>
  );
};

export default Step1;