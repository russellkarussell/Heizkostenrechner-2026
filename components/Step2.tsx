import React from 'react';
import { FormData, Language } from '../types';
import { TRANSLATIONS, CONFIG } from '../constants';
import * as Icons from './ui/Icons';
import CardOption from './ui/CardOption';
import Slider from './ui/Slider';

interface Step2Props {
  data: FormData;
  lang: Language;
  updateData: (partial: Partial<FormData>) => void;
}

const Step2: React.FC<Step2Props> = ({ data, lang, updateData }) => {
  const t = TRANSLATIONS[lang];

  const calcBasisScop = () => {
      return (4.8 + ((data.vorlauftemperatur - 35) / (55 - 35)) * (3.2 - 4.8)).toFixed(1);
  };

  const calcFanEffect = () => {
      const newTemp = data.vorlauftemperatur - CONFIG.heizkoerperventilatorEffekt;
      const newScop = 4.8 + ((newTemp - 35) / (55 - 35)) * (3.2 - 4.8);
      return { temp: newTemp, scop: newScop };
  };

  const fanEffect = calcFanEffect();
  const showFanOption = data.anteilFussbodenheizung < 50;
  const estimatedSolarYield = data.solarthermieFlaeche * (CONFIG.solarYieldFactors[data.solarthermieTyp] || 0);

  return (
    <div className="fade-in-up space-y-10">
       <div className="text-center mb-8">
           <h2 className="text-2xl font-bold text-slate-800">{t.step2Title}</h2>
           <div className="h-1 w-20 bg-[#4DBCE9] mx-auto mt-3 rounded-full"></div>
       </div>
       
       <section className="bg-slate-50 p-6 sm:p-8 rounded-3xl shadow-sm">
           <h3 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2">
               <span className="w-8 h-8 rounded-full bg-[#e0f7fa] text-[#4DBCE9] flex items-center justify-center text-sm font-bold">1</span>
               {t.heatpumpDataTitle}
           </h3>
           
           <Slider 
              label={t.gridPriceLabel}
              min={0.15} max={0.80} step={0.01}
              value={data.strompreis}
              onChange={(v) => {
                  const updates: Partial<FormData> = { strompreis: v };
                  if (data.heizsystem === 'strom') updates.preisAlt = v;
                  updateData(updates);
              }}
              unit="€/kWh"
           />
           <p className="text-xs text-slate-400 mt-1 mb-8">{t.gridPriceDisclaimer}</p>
           
           <hr className="border-slate-200 mb-6" />

           <Slider 
              label={t.floorHeatingShareLabel}
              min={0} max={100} step={1}
              value={data.anteilFussbodenheizung}
              onChange={(v) => {
                  const u: Partial<FormData> = { anteilFussbodenheizung: v };
                  if (v >= 50 && data.useFans) u.useFans = false; 
                  updateData(u);
              }}
              unit="%"
           />
           <p className="text-xs text-slate-400 mt-1 mb-8">{t.floorHeatingShareDisclaimer}</p>

           <hr className="border-slate-200 mb-6" />

           <Slider 
              label={t.flowTempLabel}
              min={30} max={75} step={1}
              value={data.vorlauftemperatur}
              onChange={(v) => updateData({ vorlauftemperatur: v })}
              unit="°C"
           />
           <div className="bg-white p-3 rounded-lg mt-3 border border-slate-100 shadow-sm text-center">
               <p className="text-sm text-slate-500">
                   {t.baseScopInfo} <span className="font-bold text-[#F39C12] text-lg">{calcBasisScop()}</span>
               </p>
           </div>
       </section>

       <section>
            <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
               <span className="w-8 h-8 rounded-full bg-[#fff3e0] text-[#F39C12] flex items-center justify-center text-sm font-bold">2</span>
               {t.optimizationsTitle}
            </h3>
            <p className="mb-6 text-slate-500 text-sm ml-10">{t.optimizationsText}</p>
            
            <div className="flex gap-4 justify-center mb-6">
                <CardOption 
                    selected={data.useSolarthermie}
                    onClick={() => updateData({ useSolarthermie: !data.useSolarthermie })}
                    icon={<Icons.IconSolar />}
                    label="Solarthermie"
                />
                {showFanOption && (
                    <CardOption 
                        selected={data.useFans}
                        onClick={() => updateData({ useFans: !data.useFans })}
                        icon={<Icons.IconFans />}
                        label="Heizkörperlüfter"
                    />
                )}
            </div>

            {data.useFans && showFanOption && (
                <div className="mt-4 p-4 bg-gradient-to-r from-[#e0f7fa] to-white rounded-xl text-sm text-slate-700 border-l-4 border-[#4DBCE9] shadow-sm animate-pulse-once">
                    {t.fanEffectText} <span className="font-bold text-[#4DBCE9] text-lg">{fanEffect.temp.toFixed(0)}</span>°C. 
                    <br/>
                    {t.fanEffectScopText} <span className="font-bold text-[#4DBCE9] text-lg">{fanEffect.scop.toFixed(1)}</span>.
                </div>
            )}

            {data.useSolarthermie && (
                <div className="mt-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                    <label className="block font-semibold text-slate-700 mb-4">{t.solarTypeLabel}</label>
                    <div className="flex gap-4 mb-8">
                        <CardOption 
                            selected={data.solarthermieTyp === 'flach'}
                            onClick={() => updateData({ solarthermieTyp: 'flach' })}
                            icon={<Icons.IconSolarFlat />}
                            label="Flachkollektor"
                        />
                        <CardOption 
                            selected={data.solarthermieTyp === 'roehren'}
                            onClick={() => updateData({ solarthermieTyp: 'roehren' })}
                            icon={<Icons.IconSolarTube />}
                            label="Röhrenkollektor"
                        />
                    </div>
                    
                    <Slider 
                        label={t.solarAreaLabel}
                        min={0} max={30} step={1}
                        value={data.solarthermieFlaeche}
                        onChange={(v) => updateData({ solarthermieFlaeche: v })}
                        unit="m²"
                    />
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm mt-4 border border-slate-100">
                         <span className="text-slate-500 text-sm">{t.solarYieldInfo}:</span>
                         <span className="font-bold text-[#F39C12] text-lg">{estimatedSolarYield.toFixed(0)} <span className="text-sm text-slate-400">kWh</span></span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{t.solarDisclaimer}</p>
                </div>
            )}
       </section>
    </div>
  );
};

export default Step2;