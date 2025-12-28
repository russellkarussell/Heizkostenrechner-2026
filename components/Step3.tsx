import React from 'react';
import { FormData, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import Slider from './ui/Slider';

interface Step3Props {
  data: FormData;
  lang: Language;
  updateData: (partial: Partial<FormData>) => void;
}

const Step3: React.FC<Step3Props> = ({ data, lang, updateData }) => {
  const t = TRANSLATIONS[lang];
  const isNewBuild = data.heizsystem === 'keine';

  return (
    <div className="fade-in-up space-y-10">
       <div className="text-center mb-8">
           <h2 className="text-2xl font-bold text-slate-800">{t.step3Title}</h2>
           <div className="h-1 w-20 bg-[#4DBCE9] mx-auto mt-3 rounded-full"></div>
       </div>

       <section className="bg-slate-50 p-6 sm:p-8 rounded-3xl shadow-sm">
           <h3 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#4DBCE9]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {t.investmentTitle}
           </h3>
           
           <Slider 
              label={t.investmentLabel}
              min={5000} max={50000} step={500}
              value={data.investition}
              onChange={(v) => updateData({ investition: v })}
              unit="€"
           />
           <p className="text-xs text-slate-400 mt-1 mb-8">{t.investmentDisclaimer}</p>

           <hr className="border-slate-200 mb-6" />

           <Slider 
              label={t.fundingLabel}
              min={0} max={25000} step={100}
              value={data.foerderung}
              onChange={(v) => updateData({ foerderung: v })}
              unit="€"
           />
           <p className="text-xs text-slate-400 mt-1">{t.fundingDisclaimer}</p>
       </section>

       <section className="bg-slate-50 p-6 sm:p-8 rounded-3xl shadow-sm">
           <h3 className="text-lg font-semibold text-slate-700 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#F39C12]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {t.runningCostsTitle}
           </h3>
           
           {!isNewBuild && (
               <div className="mb-6">
                   <Slider 
                      label={t.maintenanceOldLabel}
                      min={0} max={1000} step={10}
                      value={data.wartungAlt}
                      onChange={(v) => updateData({ wartungAlt: v })}
                      unit="€"
                   />
                   <hr className="border-slate-200 mt-6" />
               </div>
           )}

           <Slider 
              label={t.maintenanceNewLabel}
              min={0} max={1000} step={10}
              value={data.wartungNeu}
              onChange={(v) => updateData({ wartungNeu: v })}
              unit="€"
           />
       </section>
    </div>
  );
};

export default Step3;