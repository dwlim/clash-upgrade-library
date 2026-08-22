import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { BuildTimeFormat, BuildingUpgradeRow } from "./buildingCatalog";
import { formatResourceLabel } from "./buildingCatalog";
import { applyDiscountToCost, formatDiscountedBuildTime } from "./upgradeDiscount";
import { formatInteger, normalizeTownHallLevel } from "./upgradeLibraryUtils";

function isSameUpgradeItem(activeRow: BuildingUpgradeRow, row: BuildingUpgradeRow) {
  return (
    row.name === activeRow.name &&
    row.exportName === activeRow.exportName &&
    row.buildingClass === activeRow.buildingClass &&
    row.village === activeRow.village
  );
}

function sortByLevel(left: BuildingUpgradeRow, right: BuildingUpgradeRow) {
  if (left.level === null && right.level === null) return left.id.localeCompare(right.id);
  if (left.level === null) return 1;
  if (right.level === null) return -1;
  return left.level - right.level;
}

function renderResourceLabel(resource: string) {
  const label = formatResourceLabel(resource);
  const normalizedResource = label.replace(/\s+/g, "");
  const toneClass =
    normalizedResource === "Gold"
      ? "resource-tone-gold"
      : normalizedResource === "Elixir"
        ? "resource-tone-elixir"
        : normalizedResource === "DarkElixir"
          ? "resource-tone-dark-elixir"
          : "";

  return <span className={`resource-label ${toneClass}`}>{label}</span>;
}

function renderTownHallLabel(level: number | null) {
  const normalizedLevel = normalizeTownHallLevel(level);
  return normalizedLevel === null ? "—" : `TH ${normalizedLevel}`;
}

export function BuildingDetailModal({
  row,
  rows,
  timeFormat,
  discountPercent,
  onClose,
}: {
  row: BuildingUpgradeRow;
  rows: BuildingUpgradeRow[];
  timeFormat: BuildTimeFormat;
  discountPercent: number;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const itemRows = rows.filter((candidate) => isSameUpgradeItem(row, candidate)).sort(sortByLevel);
  const levelCountLabel = itemRows.length === 1 ? "1 level" : `${itemRows.length} levels`;

  return (
    <div className="building-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="building-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="building-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="building-modal-header">
          <div className="building-modal-hero">
            <img className="building-modal-thumb" src={row.thumbnail} alt="" />
            <div className="building-modal-title-block">
              <p className="building-modal-kicker">Upgrade details</p>
              <h3 id="building-detail-title">{row.name}</h3>
              <p className="building-modal-subtitle">
                {row.buildingClass} · {row.village} · {levelCountLabel}
              </p>
            </div>
          </div>

          <button ref={closeButtonRef} type="button" className="button selection-clear-button building-modal-close" onClick={onClose}>
            <X size={14} />
            Close
          </button>
        </div>

        <div className="building-modal-badges">
          <span className="detail-badge">{formatResourceLabel(row.buildResource)}</span>
          <span className="detail-badge">{row.exportName}</span>
          <span className="detail-badge">{row.assetKey}</span>
        </div>

        <div className="building-modal-body">
          <div className="detail-upgrades-wrap">
            <table className="data-table detail-upgrades-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Lvl</th>
                  <th>Town Hall</th>
                  <th>Resource</th>
                  <th>Cost</th>
                  <th>Time</th>
                  <th>HP</th>
                  <th>DPS</th>
                </tr>
              </thead>
              <tbody>
                {itemRows.map((itemRow) => (
                  <tr key={itemRow.id} className={itemRow.id === row.id ? "detail-active-row" : ""}>
                    <td className="table-name" data-label="Name">
                      <strong>{itemRow.name}</strong>
                    </td>
                    <td data-label="Class">{itemRow.buildingClass || "Unknown"}</td>
                    <td data-label="Lvl">{itemRow.level ?? "—"}</td>
                    <td data-label="Town Hall">{renderTownHallLabel(itemRow.townHallLevel)}</td>
                    <td data-label="Resource">{renderResourceLabel(itemRow.buildResource)}</td>
                    <td data-label="Cost">{formatInteger(applyDiscountToCost(itemRow.buildCost, discountPercent))}</td>
                    <td data-label="Time">{formatDiscountedBuildTime(itemRow, timeFormat, discountPercent)}</td>
                    <td data-label="HP">{formatInteger(itemRow.hitpoints)}</td>
                    <td data-label="DPS">{formatInteger(itemRow.dps)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
