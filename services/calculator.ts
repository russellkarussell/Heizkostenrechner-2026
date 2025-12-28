import { CONFIG } from '../constants';
import { FormData, CalculationResult } from '../types';

export const calculateResults = (data: FormData): CalculationResult => {
  const {
    method,
    verbrauch,
    flaeche,
    gebaeudeklasse,
    heizsystem,
    wirkungsgradAlt,
    preisAlt,
    strompreis,
    anteilFussbodenheizung,
    vorlauftemperatur,
    useFans,
    useSolarthermie,
    solarthermieTyp,
    solarthermieFlaeche,
    investition,
    foerderung,
    wartungAlt,
    wartungNeu
  } = data;

  let energieInputAltanlage_kWh = 0;
  let kostenAltGesamt = 0;
  let co2Alt = 0;

  if (heizsystem !== 'keine') {
    const isVerbrauch = method === 'verbrauch';
    
    if (isVerbrauch) {
        const factor = CONFIG.energyFactors[heizsystem] || 0;
        energieInputAltanlage_kWh = verbrauch * factor;
    } else {
        const factor = CONFIG.klasseFactors[gebaeudeklasse] || 0;
        energieInputAltanlage_kWh = flaeche * factor;
    }

    // Special case for electric heating old system: efficiency 100% implicitly handled later? 
    // The original code sets efficiency to 1.0 if system is 'strom' just before calc.
    const effectiveWirkungsgrad = heizsystem === 'strom' ? 1.0 : (wirkungsgradAlt / 100);

    let kostenAltBrennstoff = 0;
    if (isVerbrauch) {
        kostenAltBrennstoff = verbrauch * preisAlt;
    } else {
        const factor = CONFIG.energyFactors[heizsystem] || 1;
        // If calculation is by area, we derived kWh. convert back to unit for price calc
        // Unit amount = kWh / energyFactor
        // Price = Unit amount * priceAlt
        // if energyFactor is 0 (shouldnt happen), handle safely
        kostenAltBrennstoff = factor > 0 ? (energieInputAltanlage_kWh / factor) * preisAlt : 0;
    }
    
    kostenAltGesamt = kostenAltBrennstoff + wartungAlt;
    co2Alt = energieInputAltanlage_kWh * (CONFIG.co2FactorsKwhInput[heizsystem] || 0);
  }

  // Demand Calculation
  // Old efficiency is from slider 0-100, but logic uses 0-1.
  const effectiveWirkungsgradCalc = heizsystem === 'strom' ? 1.0 : (wirkungsgradAlt / 100);
  
  let nutzwaermebedarf_kWh = energieInputAltanlage_kWh * effectiveWirkungsgradCalc;
  
  if (heizsystem === 'keine') {
      nutzwaermebedarf_kWh = flaeche * (CONFIG.klasseFactors[gebaeudeklasse] || 0);
  }

  let wpBedarf_kWh = nutzwaermebedarf_kWh;
  const solarErtrag = solarthermieFlaeche * (CONFIG.solarYieldFactors[solarthermieTyp] || 0);
  
  if (useSolarthermie) {
      wpBedarf_kWh = Math.max(0, nutzwaermebedarf_kWh - solarErtrag);
  }

  let effektiveVorlaufTemp = vorlauftemperatur;
  if (useFans) {
      effektiveVorlaufTemp -= CONFIG.heizkoerperventilatorEffekt;
  }

  // SCOP Calculation: Linear interpolation
  // 35°C -> 4.8
  // 55°C -> 3.2
  const calcScop = (temp: number) => 4.8 + ((temp - 35) / (55 - 35)) * (3.2 - 4.8);
  const jaz_final = calcScop(effektiveVorlaufTemp);
  const basisSCOP = calcScop(vorlauftemperatur);

  const stromverbrauchWP_kWh = (wpBedarf_kWh > 0 && jaz_final > 0) ? wpBedarf_kWh / jaz_final : 0;
  
  // No PV calculation as per user instructions "PV ENTFERNT" in standard options, 
  // although supported in logic. We assume 0 PV for simplicity unless explicitly enabled in UI which is hidden.
  // We'll calculate purely on grid price.
  const kostenWPVal = stromverbrauchWP_kWh * strompreis;
  
  const kostenWPGesamt = kostenWPVal + wartungNeu;
  const co2WP = stromverbrauchWP_kWh * CONFIG.stromCo2Faktor;
  
  const ersparnis = kostenAltGesamt - kostenWPGesamt;
  const co2Ersparnis = co2Alt - co2WP;
  
  const specificLoad = CONFIG.specificHeatLoad[gebaeudeklasse] || 50;
  const wpLeistung = (flaeche * specificLoad) / 1000;
  
  const effektiveInvestition = Math.max(0, investition - foerderung);
  let amortisation: number | string = '–';
  
  if (heizsystem !== 'keine') {
      if (ersparnis > 0 && effektiveInvestition > 0) {
          amortisation = (effektiveInvestition / ersparnis).toFixed(1);
      } else if (ersparnis <= 0 && effektiveInvestition > 0) {
          amortisation = 'none'; // Will be translated in View
      } else if (effektiveInvestition <= 0) {
          amortisation = 'immediate'; // Will be translated in View
      }
  } else {
      amortisation = 'na'; // New build
  }

  return {
    nutzwaermeBedarf: nutzwaermebedarf_kWh,
    kostenAltGesamt,
    co2Alt,
    wpLeistung,
    basisSCOP,
    effektiverSCOP: jaz_final,
    kostenWPGesamt,
    co2WP,
    ersparnis,
    co2Ersparnis,
    co2Fussballfelder: co2Ersparnis > 0 ? (co2Ersparnis / CONFIG.kgCo2ProFussballfeldWaldProJahr) : 0,
    amortisation,
    fanEffekt: useFans ? { temp: effektiveVorlaufTemp, scop: jaz_final } : undefined,
    solarErtrag: useSolarthermie ? solarErtrag : 0
  };
};