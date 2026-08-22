import type { BuildTimeFormat, BuildingUpgradeRow } from "./buildingCatalog";
import { formatTotalMinutes } from "./upgradeLibraryUtils";

export function clampDiscountPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

function discountMultiplier(discountPercent: number) {
  return (100 - clampDiscountPercent(discountPercent)) / 100;
}

export function applyDiscountToCost(cost: number | null | undefined, discountPercent: number) {
  if (cost === null || cost === undefined) {
    return null;
  }

  return Math.max(0, Math.round(cost * discountMultiplier(discountPercent)));
}

export function applyDiscountToMinutes(minutes: number, discountPercent: number) {
  return Math.max(0, minutes * discountMultiplier(discountPercent));
}

export function formatDiscountedBuildTime(row: BuildingUpgradeRow, timeFormat: BuildTimeFormat, discountPercent: number) {
  return formatTotalMinutes(applyDiscountToMinutes(row.buildTimeTotalMinutes, discountPercent), timeFormat);
}
