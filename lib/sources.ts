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
    name: "Allegheny County Parcels",
    publisher: "Allegheny County GIS",
    retrieved: "2026-09-26",
    url: "https://openac-alcogis.opendata.arcgis.com/",
  },
  {
    name: "Pittsburgh Neighborhoods",
    publisher: "City of Pittsburgh / WPRDC",
    retrieved: "2026-09-26",
    url: "https://data.wprdc.org/dataset/neighborhoods2",
  },
  {
    name: "Pittsburgh Street Centerline",
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
    name: "National Flood Hazard Layer",
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
    name: "City of Pittsburgh Property Tax Delinquency",
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
];
