import { useCallback, useMemo, useState } from "react";
import type { BuildingUpgradeRow } from "./buildingCatalog";
import { useUpgradeLibrarySelectionState } from "./useUpgradeLibrarySelectionState";
import { useUpgradeLibraryViewState } from "./useUpgradeLibraryViewState";

export function useUpgradeLibraryModel() {
  const viewState = useUpgradeLibraryViewState();
  const selectionState = useUpgradeLibrarySelectionState(viewState.displayedRows, viewState.timeFormat);
  const [activeBuilding, setActiveBuilding] = useState<BuildingUpgradeRow | null>(null);
  const closeBuildingDetails = useCallback(() => {
    setActiveBuilding(null);
  }, []);

  return useMemo(
    () => ({
      ...viewState,
      ...selectionState,
      activeBuilding,
      openBuildingDetails: setActiveBuilding,
      closeBuildingDetails,
    }),
    [activeBuilding, closeBuildingDetails, selectionState, viewState],
  );
}
