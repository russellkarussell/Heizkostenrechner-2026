import { FormData, CalculationResult } from '../types';
import { calcHeatCost, normalizeInputs } from './heatUtils';

/**
 * Wrapper für die neue Berechnungslogik in heatUtils.
 * Stellt sicher, dass die Daten normalisiert werden, bevor die Berechnung startet.
 */
export const calculateResults = (data: FormData): CalculationResult => {
  const normalizedData = normalizeInputs(data);
  return calcHeatCost(normalizedData);
};