import React, { useState, useEffect, useMemo } from 'react';
import LanguageSwitcher from './components/LanguageSwitcher';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import { FormData, Language, CalculationResult } from './types';
// Updated import to use the new utility directly for clearer intent, though calculator.ts wrapper exists
import { calcHeatCost, normalizeInputs } from './services/heatUtils';
import { TRANSLATIONS } from './constants';

// Declare global for jspdf imported via script tag
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

const INITIAL_DATA: FormData = {
  method: 'flaeche',
  verbrauch: 2000,
  flaeche: 150,
  gebaeudeklasse: 'alt_unsaniert',
  heizsystem: 'heizoel',
  wirkungsgradAlt: 80,
  preisAlt: 1.03,
  strompreis: 0.25,
  anteilFussbodenheizung: 50,
  vorlauftemperatur: 55,
  useFans: false,
  useSolarthermie: false,
  solarthermieTyp: 'flach',
  solarthermieFlaeche: 4,
  investition: 20000,
  foerderung: 5000,
  wartungAlt: 150,
  wartungNeu: 250
};

function App() {
  const [lang, setLang] = useState<Language>('de');
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL_DATA);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportCount, setExportCount] = useState(0);

  useEffect(() => {
    const savedLang = localStorage.getItem('calculatorLanguage') as Language;
    if (savedLang) setLang(savedLang);
    const count = localStorage.getItem('pdfExportCount');
    if (count) setExportCount(parseInt(count, 10));
  }, []);

  const handleLangChange = (l: Language) => {
    setLang(l);
    localStorage.setItem('calculatorLanguage', l);
  };

  const updateData = (partial: Partial<FormData>) => {
    setData(prev => {
        const next = { ...prev, ...partial };
        // Reacting to building class change for defaults
        if (partial.gebaeudeklasse) {
             let fbh = 50, vorlauf = 55;
             switch(partial.gebaeudeklasse) {
                 case "alt_unsaniert":   fbh = 0;   vorlauf = 60; break;
                 case "alt_teilsaniert": fbh = 10;  vorlauf = 55; break;
                 case "alt_saniert":     fbh = 30;  vorlauf = 48; break;
                 case "neubau":          fbh = 90;  vorlauf = 40; break;
                 case "niedrigenergie":  fbh = 100; vorlauf = 35; break;
             }
             next.anteilFussbodenheizung = fbh;
             next.vorlauftemperatur = vorlauf;
             if(fbh >= 50 && next.useFans) next.useFans = false;
        }
        return next;
    });
  };

  const handleNext = () => {
    if (step < 4) {
      if (step === 3) {
        // Audit Implementation: Normalize inputs explicitly before calculation
        const normalized = normalizeInputs(data);
        // Update local state with normalized data to ensure UI consistency if user goes back
        setData(normalized); 
        
        // Calculate with robust logic
        setResults(calcHeatCost(normalized));
      }
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate a config ID hash
  const configId = useMemo(() => {
     const str = JSON.stringify(data);
     let hash = 0;
     for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
     }
     return ('00000000' + (Math.abs(hash) >>> 0).toString(16)).slice(-8).toUpperCase();
  }, [data]);

  const handlePdfExport = async () => {
    if (!window.jspdf || !window.html2canvas) {
        alert("PDF Libraries not loaded");
        return;
    }
    setExporting(true);
    
    const element = document.getElementById('results-container'); 
    if (element) {
        try {
            const canvas = await window.html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.setFontSize(18);
            pdf.text(TRANSLATIONS[lang].pdfTitle, 15, 20);
            
            pdf.setFontSize(10);
            pdf.text("Westech Solar", 15, 10);

            pdf.setFontSize(12);
            pdf.text(TRANSLATIONS[lang].pdfInputsTitle, 15, 30);
            // Inputs are now visually in the image, so we can reduce text dump or keep it as metadata
            // For cleaner PDF, we rely on the screenshot of the results-container which now includes the summary
            
            let y = 40;
            pdf.addImage(imgData, 'PNG', 15, y, pdfWidth - 30, pdfHeight - 30); 
            
            pdf.save(`Heizkosten_Analyse_${configId}.pdf`);
            
            const newCount = exportCount + 1;
            setExportCount(newCount);
            localStorage.setItem('pdfExportCount', newCount.toString());
            
        } catch (e) {
            console.error(e);
            alert("Export failed");
        }
    }
    setExporting(false);
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden min-h-[600px] border border-white/50 relative">
        <LanguageSwitcher current={lang} onChange={handleLangChange} />

        {/* Modern Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
           <div 
             className="h-full bg-gradient-to-r from-[#4DBCE9] to-[#3ca9d5] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(77,188,233,0.5)]"
             style={{ width: `${((step) / 4) * 100}%` }}
           />
        </div>

        <div className="p-8 sm:p-10 pt-12">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-8">
                {step === 1 && <Step1 data={data} lang={lang} updateData={updateData} />}
                {step === 2 && <Step2 data={data} lang={lang} updateData={updateData} />}
                {step === 3 && <Step3 data={data} lang={lang} updateData={updateData} />}
                {step === 4 && results && <Step4 results={results} data={data} lang={lang} onExportPdf={handlePdfExport} exporting={exporting} exportCount={exportCount} configId={configId} isNewBuild={data.heizsystem === 'keine'} />}
            </div>

            <div className={`flex mt-10 pt-6 border-t border-slate-100 ${step === 1 ? 'justify-end' : 'justify-between'}`}>
              {step > 1 && (
                  <button 
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 rounded-xl font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200"
                  >
                    {t.prevBtn}
                  </button>
              )}
              {step < 4 && (
                  <button 
                    type="button"
                    onClick={handleNext}
                    className="bg-gradient-to-r from-[#4DBCE9] to-[#29b6f6] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                  >
                    {t.nextBtn}
                  </button>
              )}
            </div>
          </form>
        </div>
      </div>
      
      <div className="text-center mt-6 text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Westech Solar</p>
      </div>
    </div>
  );
}

export default App;