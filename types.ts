export type Language = 'de' | 'en' | 'ro';

export type CalculationMethod = 'flaeche' | 'verbrauch';

export interface AppState {
  language: Language;
  step: number;
  configId: string;
  pdfExportCount: number;
}

export interface FormData {
  method: CalculationMethod;
  verbrauch: number;
  flaeche: number;
  gebaeudeklasse: string;
  heizsystem: string;
  wirkungsgradAlt: number; // 0-100
  preisAlt: number;
  
  // Step 2
  strompreis: number;
  anteilFussbodenheizung: number;
  vorlauftemperatur: number;
  
  // Optimizations
  useFans: boolean;
  useSolarthermie: boolean;
  solarthermieTyp: string;
  solarthermieFlaeche: number;
  
  // Step 3
  investition: number;
  foerderung: number;
  wartungAlt: number;
  wartungNeu: number;
}

export interface CalculationResult {
  nutzwaermeBedarf: number;
  kostenAltGesamt: number;
  co2Alt: number;
  
  wpLeistung: number;
  basisSCOP: number;
  effektiverSCOP: number;
  
  kostenWPGesamt: number;
  co2WP: number;
  
  ersparnis: number;
  co2Ersparnis: number;
  co2Fussballfelder: number;
  amortisation: number | string;
  
  fanEffekt?: {
    temp: number;
    scop: number;
  };
  
  solarErtrag: number;
}
