export type SourceRow = {
  name: string;
  publisher: string;
  retrieved: string;
  url: string;
};

export const SOURCES: SourceRow[] = [
  {
    name: "Property Assessments Parcel Data (for downloads)",
    publisher: "Allegheny County / WPRDC",
    retrieved: "2026-09-26",
    url: "https://data.wprdc.org/dataset/property-assessments-parcel-data-for-downloads",
  },
  {
    name: "Allegheny County Parcels (OPENDATA/Parcels)",
    publisher: "Allegheny County GIS",
    retrieved: "2026-09-26",
    url: "https://openac-alcogis.opendata.arcgis.com/",
  },
  {
    name: "Pittsburgh Neighborhoods",
    publisher: "City of Pittsburgh / WPRDC",
    retrieved: "2026-09-26",
    url: "https://data.wprdc.org/dataset/e672f13d-71c4-4a66-8f38-710e75ed80a4/resource/4af8e160-57e9-4ebf-a501-76ca1b42fc99/download/neighborhoods.geojson",
  },
  {
    name: "Pittsburgh Street Centerline (fallback; Allegheny County Street Centerlines not found)",
    publisher: "City of Pittsburgh / WPRDC",
    retrieved: "2026-09-26",
    url: "https://data.wprdc.org/dataset/pittsburgh-street-centerline",
  },
  {
    name: "Landslide Prone",
    publisher: "City of Pittsburgh / WPRDC",
    retrieved: "2026-09-26",
    url: "https://data.wprdc.org/dataset/landslide-prone-areas",
  },
  {
    name: "Undermined Areas",
    publisher: "City of Pittsburgh / WPRDC",
    retrieved: "2026-09-26",
    url: "https://data.wprdc.org/dataset/undermined-areas",
  },
  {
    name: "Greenways",
    publisher: "City of Pittsburgh / WPRDC",
    retrieved: "2026-09-26",
    url: "https://data.wprdc.org/dataset/greenways",
  },
  {
    name: "PWSA Water Service",
    publisher: "PA DEP via WPRDC",
    retrieved: "2026-09-26",
    url: "https://data.wprdc.org/",
  },
  {
    name: "National Flood Hazard Layer (MapServer/28; /gis/nfhl/ 404)",
    publisher: "FEMA",
    retrieved: "2026-09-26",
    url: "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28",
  },
  {
    name: "PRT Transit Stops",
    publisher: "Pittsburgh Regional Transit / WPRDC",
    retrieved: "2026-09-26",
    url: "https://data.wprdc.org/dataset/prt-of-allegheny-county-transit-stops",
  },
  {
    name: "City of Pittsburgh Property Tax Delinquency (fallback; allegheny-county-tax-delinquency 404)",
    publisher: "City of Pittsburgh / WPRDC",
    retrieved: "2026-09-26",
    url: "https://data.wprdc.org/dataset/city-of-pittsburgh-property-tax-delinquency",
  },
  {
    name: "PLI Permits",
    publisher: "City of Pittsburgh / WPRDC",
    retrieved: "2026-09-26",
    url: "https://data.wprdc.org/dataset/pli-permits",
  },
  {
    name: "Real Estate Sales",
    publisher: "Allegheny County / WPRDC",
    retrieved: "2026-09-26",
    url: "https://data.wprdc.org/dataset/real-estate-sales",
  },
  {
    name: "HUD FY2026 Small Area FMRs",
    publisher: "HUD",
    retrieved: "2026-09-26",
    url: "https://www.huduser.gov/portal/datasets/fmr/fmr2026/fy2026_safmrs.xlsx",
  },
  {
    name: "Condemned and Dead-End Properties",
    publisher: "City of Pittsburgh / WPRDC",
    retrieved: "2026-09-27",
    url: "https://data.wprdc.org/dataset/condemned-properties",
  },
  {
    name: "Pittsburgh PLI / DOMI / ES Violations Report",
    publisher: "City of Pittsburgh / WPRDC",
    retrieved: "2026-09-27",
    url: "https://data.wprdc.org/dataset/pittsburgh-pli-violations-report",
  },
  {
    name: "City of Pittsburgh Property Tax Abatements",
    publisher: "City of Pittsburgh / WPRDC",
    retrieved: "2026-09-27",
    url: "https://data.wprdc.org/dataset/city-property-tax-abatements",
  },
  {
    name: "Zillow Home Value Index, ZIP, all homes",
    publisher: "Zillow",
    retrieved: "2026-09-27",
    url: "https://www.zillow.com/research/data/",
  },
  {
    name: "Producer Price Index, inputs to residential construction (WPUIP231000)",
    publisher: "BLS",
    retrieved: "2026-09-27",
    url: "https://data.bls.gov/timeseries/WPUIP231000",
  },
  {
    name: "Esri World Imagery tiles",
    publisher: "Esri",
    retrieved: "2026-09-27",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
];

export function sourceCite(needle: string): string {
  const row = SOURCES.find((s) => s.name.includes(needle) || s.publisher.includes(needle));
  if (!row) return "";
  return `${row.publisher} · ${row.retrieved}`;
}

export const SITE_CITES = {
  city: sourceCite("Landslide"),
  flood: sourceCite("Flood"),
  water: sourceCite("PWSA"),
  streets: sourceCite("Street"),
  condemned: sourceCite("Condemned"),
  violations: sourceCite("Violations"),
  abatements: sourceCite("Abatements"),
};
