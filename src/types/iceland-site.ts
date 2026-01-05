// Type definitions for Iceland aquaculture site data

export interface IcelandSite {
  company: string;
  id_number: string;
  location: string;
  latitude: number | string;
  longitude: number | string;
  species: string;
  maximal_allowed_biomass: number;
  valid_until: string;
  type: string;
  hover_text?: string;
}

export interface IcelandFilterOptions {
  companies: string[];
  species: string[];
  types: string[];
}

export interface IcelandMapData {
  sites: IcelandSite[];
  filters: IcelandFilterOptions;
  totalCount: number;
}

