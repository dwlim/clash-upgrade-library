import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { BuildTimeFormat, BuildingUpgradeRow } from "./buildingCatalog";
import { formatBuildTimeLabelWithMode, formatResourceLabel } from "./buildingCatalog";
import { formatInteger, normalizeTownHallLevel } from "./upgradeLibraryUtils";

type DetailField = {
  label: string;
  value: string;
};

function formatNullableNumber(value: number | null) {
  return formatInteger(value);
}

function formatNullableText(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function buildDetailSections(row: BuildingUpgradeRow, timeFormat: BuildTimeFormat) {
  const townHall = normalizeTownHallLevel(row.townHallLevel);

  const overview: DetailField[] = [
    { label: "ID", value: row.id },
    { label: "Name", value: row.name },
    { label: "Family", value: row.family },
    { label: "Level", value: formatNullableNumber(row.level) },
    { label: "Export name", value: row.exportName },
    { label: "Asset key", value: row.assetKey },
    { label: "Class", value: row.buildingClass },
    { label: "Village", value: row.village },
  ];

  const upgrade: DetailField[] = [
    { label: "Build resource", value: formatResourceLabel(row.buildResource) },
    { label: "Build cost", value: formatNullableNumber(row.buildCost) },
    { label: "Build time", value: formatBuildTimeLabelWithMode(row, timeFormat) },
    { label: "Build time days", value: formatNullableNumber(row.buildTimeDays) },
    { label: "Build time hours", value: formatNullableNumber(row.buildTimeHours) },
    { label: "Build time minutes", value: formatNullableNumber(row.buildTimeMinutes) },
    { label: "Build time seconds", value: formatNullableNumber(row.buildTimeSeconds) },
    { label: "Total build minutes", value: formatNullableNumber(row.buildTimeTotalMinutes) },
    { label: "Town Hall", value: townHall === null ? "—" : `TH ${townHall}` },
    {
      label: "Capital Hall",
      value: row.capitalHallLevel === null ? "—" : `CH ${row.capitalHallLevel}`,
    },
  ];

  const stats: DetailField[] = [
    { label: "Width", value: formatNullableNumber(row.width) },
    { label: "Height", value: formatNullableNumber(row.height) },
    { label: "Hitpoints", value: formatNullableNumber(row.hitpoints) },
    { label: "DPS", value: formatNullableNumber(row.dps) },
    { label: "Damage", value: formatNullableNumber(row.damage) },
    { label: "Attack range", value: formatNullableNumber(row.attackRange) },
    { label: "Housing space", value: formatNullableNumber(row.housingSpace) },
    { label: "Resource per 100 hours", value: formatNullableNumber(row.resourcePer100Hours) },
    { label: "Resource max", value: formatNullableNumber(row.resourceMax) },
    { label: "Max stored gold", value: formatNullableNumber(row.maxStoredGold) },
    { label: "Max stored elixir", value: formatNullableNumber(row.maxStoredElixir) },
    { label: "Max stored dark elixir", value: formatNullableNumber(row.maxStoredDarkElixir) },
  ];

  const internal: DetailField[] = [
    { label: "Search text", value: row.searchText },
    { label: "Thumbnail", value: row.thumbnail },
  ];

  return { overview, upgrade, stats, internal };
}

function DetailGrid({ fields }: { fields: DetailField[] }) {
  return (
    <div className="detail-grid">
      {fields.map((field) => (
        <div key={field.label} className="detail-field">
          <span>{field.label}</span>
          <strong>{field.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function BuildingDetailModal({
  row,
  timeFormat,
  onClose,
}: {
  row: BuildingUpgradeRow;
  timeFormat: BuildTimeFormat;
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

  const details = buildDetailSections(row, timeFormat);

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
              <p className="building-modal-kicker">Building details</p>
              <h3 id="building-detail-title">{row.name}</h3>
              <p className="building-modal-subtitle">
                {row.buildingClass} · {row.village} · {row.level === null ? "No level" : `Level ${row.level}`}
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
          <span className="detail-badge">{row.id}</span>
        </div>

        <div className="building-modal-body">
          <section className="building-detail-section">
            <h4>Overview</h4>
            <DetailGrid fields={details.overview} />
          </section>

          <section className="building-detail-section">
            <h4>Upgrade</h4>
            <DetailGrid fields={details.upgrade} />
          </section>

          <section className="building-detail-section">
            <h4>Stats</h4>
            <DetailGrid fields={details.stats} />
          </section>

          <section className="building-detail-section">
            <h4>Internal</h4>
            <DetailGrid fields={details.internal} />
          </section>
        </div>
      </div>
    </div>
  );
}
