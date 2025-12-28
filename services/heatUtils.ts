import { FormData, CalculationResult } from '../types';
import { CONFIG } from '../constants';

const SYSTEM_EFFICIENCY_FACTOR = 0.95; // Berücksichtigt Verluste durch Hydraulik, Puffer, Taktung etc.

/**
 * Normalisiert Benutzereingaben:
 * - Wandelt Strings in Zahlen
 * - Ersetzt Kommas durch Punkte
 * - Setzt Grenzwerte (Clamping)
 */
export const normalizeInputs = (data: FormData): FormData => {
  const normalizeNumber = (val: any, min: number, max: number, defaultVal: number): number => {
    if (typeof val === 'string') {
      val = val.replace(',', '.');
    }
    let num = parseFloat(val);
    if (isNaN(num)) return defaultVal;
    return Math.min(Math.max(num, min), max);
  };

  // Clone data to avoid mutation
  const normalized = { ...data };

  normalized.verbrauch = Math.max(0, parseFloat(String(data.verbrauch).replace(',', '.')) || 0);
  normalized.flaeche = Math.max(0, parseFloat(String(data.flaeche).replace(',', '.')) || 0);
  
  // Clamping technischer Werte
  normalized.wirkungsgradAlt = normalizeNumber(data.wirkungsgradAlt, 1, 100, 80);
  normalized.vorlauftemperatur = normalizeNumber(data.vorlauftemperatur, 30, 75, 55);
  normalized.anteilFussbodenheizung = normalizeNumber(data.anteilFussbodenheizung, 0, 100, 0);
  
  // Preise sollten nicht negativ sein
  normalized.preisAlt = Math.max(0, parseFloat(String(data.preisAlt).replace(',', '.')) || 0);
  normalized.strompreis = Math.max(0, parseFloat(String(data.strompreis).replace(',', '.')) || 0);
  
  normalized.solarthermieFlaeche = Math.max(0, parseFloat(String(data.solarthermieFlaeche).replace(',', '.')) || 0);
  
  // Investition & Förderung
  normalized.investition = Math.max(0, parseFloat(String(data.investition).replace(',', '.')) || 0);
  normalized.foerderung = Math.max(0, parseFloat(String(data.foerderung).replace(',', '.')) || 0);

  return normalized;
};

/**
 * Berechnet den SCOP basierend auf Vorlauftemperatur mit Begrenzung (Clamping)
 * Interpolation: 35°C -> 4.8, 55°C -> 3.2
 */
export const calculateClampedSCOP = (temp: number): number => {
  // Begrenze Temp für die Formel auf sinnvollen Bereich, um extreme SCOP Werte zu vermeiden
  const t = Math.min(Math.max(temp, 25), 75);
  
  // Lineare Interpolation
  let scop = 4.8 + ((t - 35) / (55 - 35)) * (3.2 - 4.8);
  
  // Hard clamp, damit keine physikalisch unsinnigen Werte entstehen
  return Math.min(Math.max(scop, 1.5), 6.0);
};

export const calcHeatCost = (data: FormData): CalculationResult => {
  const {
    method,
    verbrauch,
    flaeche,
    gebaeudeklasse,
    heizsystem,
    wirkungsgradAlt,
    preisAlt,
    strompreis,
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

  // 1. Energiebedarf Altanlage ermitteln
  let energieInputAltanlage_kWh = 0;
  
  if (heizsystem !== 'keine') {
    if (method === 'verbrauch') {
        const factor = CONFIG.energyFactors[heizsystem] || 0;
        energieInputAltanlage_kWh = verbrauch * factor;
    } else {
        const factor = CONFIG.klasseFactors[gebaeudeklasse] || 0;
        energieInputAltanlage_kWh = flaeche * factor;
    }
  }

  // 2. Kosten & CO2 Altanlage
  let kostenAltGesamt = 0;
  let co2Alt = 0;
  let nutzwaermebedarf_kWh = 0;

  if (heizsystem !== 'keine') {
      const effectiveWirkungsgrad = heizsystem === 'strom' ? 1.0 : (wirkungsgradAlt / 100);
      
      // Nutzwärmebedarf = Input * Wirkungsgrad
      nutzwaermebedarf_kWh = energieInputAltanlage_kWh * effectiveWirkungsgrad;

      // Kosten Brennstoff
      let kostenAltBrennstoff = 0;
      if (method === 'verbrauch') {
          kostenAltBrennstoff = verbrauch * preisAlt;
      } else {
          const factor = CONFIG.energyFactors[heizsystem] || 1;
          kostenAltBrennstoff = factor > 0 ? (energieInputAltanlage_kWh / factor) * preisAlt : 0;
      }
      
      kostenAltGesamt = kostenAltBrennstoff + wartungAlt;
      co2Alt = energieInputAltanlage_kWh * (CONFIG.co2FactorsKwhInput[heizsystem] || 0);
  } else {
      // Neubau Fall
      nutzwaermebedarf_kWh = flaeche * (CONFIG.klasseFactors[gebaeudeklasse] || 0);
  }

  // 3. Wärmepumpen-Bedarf & Solar
  let wpWaermeBedarf_kWh = nutzwaermebedarf_kWh;
  const solarErtrag = solarthermieFlaeche * (CONFIG.solarYieldFactors[solarthermieTyp] || 0);
  
  if (useSolarthermie) {
      // WICHTIG: Max(0, ...) um negative Werte zu verhindern
      wpWaermeBedarf_kWh = Math.max(0, nutzwaermebedarf_kWh - solarErtrag);
  }

  // 4. Effektiver SCOP mit Lüfter & Systemfaktor
  let effektiveVorlaufTemp = vorlauftemperatur;
  if (useFans) {
      effektiveVorlaufTemp -= CONFIG.heizkoerperventilatorEffekt;
  }

  const basisSCOP = calculateClampedSCOP(vorlauftemperatur);
  const effektiverSCOP = calculateClampedSCOP(effektiveVorlaufTemp);

  // Stromverbrauch = Wärmebedarf / (SCOP * Systemfaktor)
  // Der Systemfaktor (z.B. 0.95) erhöht den Strombedarf leicht, um Verluste abzubilden.
  const stromverbrauchWP_kWh = (wpWaermeBedarf_kWh > 0) 
    ? wpWaermeBedarf_kWh / (effektiverSCOP * SYSTEM_EFFICIENCY_FACTOR) 
    : 0;

  // 5. Kosten & CO2 Neu
  const kostenWPStrom = stromverbrauchWP_kWh * strompreis;
  const kostenWPGesamt = kostenWPStrom + wartungNeu;
  const co2WP = stromverbrauchWP_kWh * CONFIG.stromCo2Faktor;

  // 6. Ersparnis & Amortisation
  const ersparnis = kostenAltGesamt - kostenWPGesamt;
  const co2Ersparnis = co2Alt - co2WP;

  const effektiveInvestition = investition - foerderung;
  let amortisation: number | string = '–';

  if (heizsystem !== 'keine') {
      if (effektiveInvestition <= 0) {
          amortisation = 'immediate'; // Sofort (durch Förderung gedeckt oder keine Investition)
      } else if (ersparnis <= 0) {
          amortisation = 'none'; // Keine Einsparung, amortisiert sich nie
      } else {
          amortisation = (effektiveInvestition / ersparnis).toFixed(1);
      }
  } else {
      amortisation = 'na'; // Neubau
  }

  // Heizlast Schätzung
  const specificLoad = CONFIG.specificHeatLoad[gebaeudeklasse] || 50;
  const wpLeistung = (flaeche * specificLoad) / 1000;

  return {
    nutzwaermeBedarf: nutzwaermebedarf_kWh,
    kostenAltGesamt,
    co2Alt,
    wpLeistung,
    basisSCOP,
    effektiverSCOP,
    kostenWPGesamt,
    co2WP,
    ersparnis,
    co2Ersparnis,
    co2Fussballfelder: co2Ersparnis > 0 ? (co2Ersparnis / CONFIG.kgCo2ProFussballfeldWaldProJahr) : 0,
    amortisation,
    fanEffekt: useFans ? { temp: effektiveVorlaufTemp, scop: effektiverSCOP } : undefined,
    solarErtrag: useSolarthermie ? solarErtrag : 0
  };
};