import type { BuildingUpgradeRow, ClashKingSpellEntry, ClashKingTroopEntry, ClashKingUnitLevel } from "./buildingCatalogTypes";
import { deriveFamily, displayNameFor } from "./buildingCatalogNames";
import { parseBuildTimeSeconds } from "./buildingCatalogTime";
import { withThumbnail } from "./buildingCatalogRowUtils";

function villageLabel(village: ClashKingTroopEntry["village"]) {
  if (village === "builderBase") {
    return "Builder Base";
  }

  if (village === "clanCapital") {
    return "Capital";
  }

  return "Home";
}

function numericValue(...values: Array<number | null | undefined>) {
  return values.find((value): value is number => typeof value === "number") ?? null;
}

function buildUnitRows({
  entry,
  itemClass,
  defaultResource,
}: {
  entry: ClashKingTroopEntry | ClashKingSpellEntry;
  itemClass: "Troop" | "Spell";
  defaultResource: string;
}) {
  const displayName = displayNameFor(entry);
  const exportName = entry.TID?.name || entry.raw_name || entry.name;
  const assetKey = exportName;
  const baseHousingSpace = numericValue(entry.housing_space);
  const baseAttackRange = "attack_range" in entry ? numericValue(entry.attack_range) : null;
  const village = villageLabel(entry.village);

  return entry.levels.map((levelEntry, index) => {
    const buildTime = parseBuildTimeSeconds(numericValue(levelEntry.upgrade_time, levelEntry.build_time) ?? 0);
    const resource = entry.upgrade_resource || defaultResource;
    const row = {
      id: `${entry._id}:${itemClass.toLowerCase()}:${levelEntry.level ?? index + 1}`,
      name: displayName,
      family: deriveFamily(displayName, exportName),
      level: levelEntry.level,
      exportName,
      assetKey,
      buildingClass: itemClass,
      buildResource: resource,
      buildCost: numericValue(levelEntry.upgrade_cost, levelEntry.build_cost),
      buildTimeDays: buildTime.buildTimeDays,
      buildTimeHours: buildTime.buildTimeHours,
      buildTimeMinutes: buildTime.buildTimeMinutes,
      buildTimeSeconds: buildTime.buildTimeSeconds,
      buildTimeTotalMinutes: buildTime.buildTimeTotalMinutes,
      townHallLevel: numericValue(levelEntry.required_townhall, levelEntry.town_hall_level),
      capitalHallLevel: null,
      width: null,
      height: null,
      hitpoints: numericValue(levelEntry.hitpoints),
      dps: numericValue(levelEntry.dps),
      damage: numericValue(levelEntry.damage),
      attackRange: numericValue(levelEntry.attack_range, baseAttackRange),
      housingSpace: numericValue(levelEntry.housing_space, baseHousingSpace),
      resourcePer100Hours: null,
      resourceMax: null,
      maxStoredGold: null,
      maxStoredElixir: null,
      maxStoredDarkElixir: null,
      village,
      searchText: [
        displayName,
        exportName,
        itemClass,
        resource,
        village,
      ]
        .join(" ")
        .toLowerCase(),
    } satisfies Omit<BuildingUpgradeRow, "thumbnail">;

    return withThumbnail(row);
  });
}

export function rowsFromClashKingTroopEntry(entry: ClashKingTroopEntry) {
  return buildUnitRows({
    entry,
    itemClass: "Troop",
    defaultResource: "Elixir",
  });
}

export function rowsFromClashKingSpellEntry(entry: ClashKingSpellEntry) {
  return buildUnitRows({
    entry,
    itemClass: "Spell",
    defaultResource: "Elixir",
  });
}
