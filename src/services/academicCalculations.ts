import type { StudentResultItem } from '../types';

export type ValidAcademicResult = StudentResultItem;

export function getValidAcademicResults(
  results: StudentResultItem[] | null | undefined,
): ValidAcademicResult[] {
  if (!Array.isArray(results)) {
    return [];
  }

  return results.filter((item) => {
    const gradePoint = Number(item.grade_point);
    const creditUnit = Number(item.credit_unit);

    return Number.isFinite(gradePoint) && Number.isFinite(creditUnit) && creditUnit > 0;
  });
}

export function calculateWeightedAverage(
  results: StudentResultItem[] | null | undefined,
): number | null {
  const validResults = getValidAcademicResults(results);

  if (validResults.length === 0) {
    return null;
  }

  const totalQualityPoints = validResults.reduce((sum, item) => {
    const gradePoint = Number(item.grade_point);
    const creditUnit = Number(item.credit_unit);
    return sum + gradePoint * creditUnit;
  }, 0);

  const totalCreditUnits = validResults.reduce((sum, item) => {
    return sum + Number(item.credit_unit);
  }, 0);

  if (totalCreditUnits <= 0) {
    return null;
  }

  return Number((totalQualityPoints / totalCreditUnits).toFixed(2));
}

export function calculateSemesterGpa(
  results: StudentResultItem[] | null | undefined,
): number | null {
  return calculateWeightedAverage(results);
}

export function calculateCgpa(
  results: StudentResultItem[] | null | undefined,
): number | null {
  return calculateWeightedAverage(results);
}
