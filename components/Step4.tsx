import React from 'react';
import { CalculationResult, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface Step4Props {
  results: CalculationResult;
  lang: Language;
  onExportPdf: () => void;
  exporting: boolean;
  exportCount: number;
  configId: string;
  isNewBuild: boolean;
}

const ResultCard = ({ title, value, unit, subtext, highlight = false, negative = false }: any) => (
  <div className={`p-5 rounded-2xl shadow-sm border ${highlight ? (negative ? 'bg-red-50 border-red-100' : 'bg-[#e0f7fa]/50 border-[#4DBCE9]/30') : 'bg-slate-50 border-slate-100'}`}>
    <h4 className="text-slate-500 text-sm font-medium mb-1">{title}</h4>
    <div className={`text-2xl sm:text-3xl font-bold ${negative ? 'text-red-500' : (highlight ? 'text-[#4DBCE9]' : 'text-slate-700')}`}>
      {value} <span className="text-base sm:text-lg font-normal text-slate-400">{unit}</span>
    </div>
    {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
  </div>
);

const Step4: React.FC<Step4Props> = ({ results, lang, onExportPdf, exporting, exportCount, configId, isNewBuild }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="fade-in-up">
      <div className="text-center mb-10">
           <h2 className="text-3xl font-bold text-slate-800">{t.step4Title}</h2>
           <p className="text-slate-400 mt-2">Ihre individuelle Analyse</p>
           <div className="h-1 w-24 bg-[#F39C12] mx-auto mt-4 rounded-full"></div>
      </div>
      
      <div id="results-container" className="space-y-8">
         
         {!isNewBuild && (
             <section className="animate-fade-in delay-100">
                 <h3 className="text-lg font-semibold text-slate-700 mb-4 px-1">{t.resultSavingsAnnual}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className={`md:col-span-1 p-6 rounded-3xl shadow-lg transform transition-transform hover:scale-[1.02] ${results.ersparnis > 0 ? 'bg-gradient-to-br from-[#4DBCE9] to-[#0288d1] text-white' : 'bg-gradient-to-br from-red-400 to-red-600 text-white'}`}>
                        <div className="text-white/80 text-sm font-medium mb-2">Jährliche Ersparnis</div>
                        <div className="text-4xl font-bold mb-1">{results.ersparnis.toFixed(0)} €</div>
                        <div className="text-white/70 text-sm">pro Jahr</div>
                     </div>
                     
                     <div className="md:col-span-1 p-6 rounded-3xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                        <div className="text-white/80 text-sm font-medium mb-2">{t.resultSavingsCo2}</div>
                        <div className="text-4xl font-bold mb-1">{results.co2Ersparnis.toFixed(0)} <span className="text-2xl">kg</span></div>
                        <div className="text-white/70 text-xs mt-2 border-t border-white/20 pt-2">
                           {t.resultSavingsCo2Eq.replace('{value}', results.co2Fussballfelder.toFixed(1))}
                        </div>
                     </div>

                     <div className="md:col-span-1 p-6 rounded-3xl bg-slate-800 text-white shadow-lg">
                        <div className="text-slate-400 text-sm font-medium mb-2">{t.resultAmortization}</div>
                        <div className="text-3xl font-bold mb-1">
                             {typeof results.amortisation === 'string' ? (t as any)[`amortization${results.amortisation.charAt(0).toUpperCase() + results.amortisation.slice(1)}`] || results.amortisation : results.amortisation}
                        </div>
                        <div className="text-slate-500 text-sm">{typeof results.amortisation === 'number' ? t.unitYears : ''}</div>
                     </div>
                 </div>
             </section>
         )}

         <section>
             <h3 className="text-lg font-semibold text-slate-700 mb-4 px-1">Details & Vergleich</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {!isNewBuild && (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-slate-600 mb-4 border-b pb-2 border-slate-200">Altes System</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500 text-sm">{t.resultCostsOld}</span>
                                <span className="font-bold text-slate-700">{results.kostenAltGesamt.toFixed(0)} €</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 text-sm">{t.resultCo2Old}</span>
                                <span className="font-bold text-slate-700">{results.co2Alt.toFixed(0)} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 text-sm">{t.resultHeatDemand}</span>
                                <span className="font-bold text-slate-700">{results.nutzwaermeBedarf.toFixed(0)} kWh</span>
                            </div>
                        </div>
                    </div>
                 )}

                <div className="p-6 bg-[#f0f9ff] rounded-2xl border border-[#b3e5fc]">
                    <h4 className="font-bold text-[#0277bd] mb-4 border-b pb-2 border-[#b3e5fc]">Neues System (WP)</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-600 text-sm">{isNewBuild ? t.resultCostsNewBuild : t.resultCostsNew}</span>
                            <span className="font-bold text-[#0277bd]">{results.kostenWPGesamt.toFixed(0)} €</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 text-sm">{t.resultCo2New}</span>
                            <span className="font-bold text-[#0277bd]">{results.co2WP.toFixed(0)} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 text-sm">{t.resultHpPower}</span>
                            <span className="font-bold text-[#0277bd] bg-white px-2 py-0.5 rounded shadow-sm">{results.wpLeistung.toFixed(1)} kW</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-600 text-sm">{t.resultCop}</span>
                            <div className="text-right">
                                <span className="font-bold text-[#0277bd] bg-white px-2 py-0.5 rounded shadow-sm">{results.effektiverSCOP.toFixed(1)}</span>
                                {results.fanEffekt && <div className="text-[10px] text-slate-500 mt-1">mit Lüftern</div>}
                            </div>
                        </div>
                    </div>
                </div>
             </div>
         </section>

         <section className="mt-8 p-6 bg-amber-50 rounded-2xl border-l-4 border-[#F39C12] text-sm leading-relaxed text-slate-700 shadow-sm">
            <h3 className="font-bold text-[#e65100] mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {t.commentaryTitle}
            </h3>
            <p>
                {isNewBuild ? "Sie investieren von Anfang an in ein zukunftssicheres und hocheffizientes System." : 
                 results.ersparnis < 0 ? "In diesem Szenario sind die neuen Heizkosten höher." :
                 (typeof results.amortisation === 'number' && results.amortisation < 10) ? "Eine ausgezeichnete Investition! Die Anlage amortisiert sich schnell." : "Ein solider Wechsel für die Zukunftssicherheit."}
                {" "}
                {!isNewBuild && <span><br/><br/><b>Hinweis zur Leistung:</b> Die empfohlene Heizleistung ist eine Schätzung. Eine exakte Heizlastberechnung ist für die korrekte Dimensionierung unerlässlich.</span>}
            </p>
         </section>

         <div className="text-xs text-center text-slate-400 mt-8 max-w-lg mx-auto">{t.resultDisclaimer}</div>
      </div>

      <div className="flex flex-col items-center mt-10">
          <button 
            onClick={onExportPdf}
            disabled={exporting}
            className="group relative flex items-center gap-3 bg-slate-800 text-white px-8 py-4 rounded-full shadow-xl hover:bg-slate-700 hover:shadow-2xl transition-all disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
             {exporting ? (
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
             ) : (
                <svg className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
             )}
             <span className="font-bold tracking-wide">{exporting ? 'Erstelle PDF...' : t.exportPdfButton}</span>
          </button>
          
          <div className="mt-4 text-xs text-slate-400 bg-white/50 px-4 py-2 rounded-full">
            {t.priceUpdateInfo}
          </div>
      </div>

      <div className="text-right text-[10px] text-slate-300 mt-10 border-t border-slate-200/50 pt-2">
        ID: {configId} | Exports: {exportCount}
      </div>
    </div>
  );
};

export default Step4;