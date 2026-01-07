// Type definitions for aquaculture site data (UK, Iceland, Norway)

export interface AquacultureSite {
  site_name: string;
  facility_id: string;
  marine_scotland_site_id: string;
  species: string;
  stage: string;
  facility_type: string;
  number_of_facilities: number;
  facility_description: string;
  date_registered: string;
  nationalgridreference: string;
  local_authority: string;
  producing_in_last_3_years: string;
  site_address_1: string;
  site_address_2: string;
  site_address_3: string;
  site_post_code: string;
  site_contact_number: string;
  aquaculture_type: string;
  watertype: string;
  health_surveillance: string;
  easting: number;
  northing: number;
  ms_management_area: string;
  region: string;
  company: string;
  latitude?: number;
  longitude?: number;
  hover_text?: string;
}

export interface FilterOptions {
  species: string[];
  companies: string[];
  watertypes: string[];
  regions: string[];
}

export interface MapData {
  sites: AquacultureSite[];
  filters: FilterOptions;
  totalCount: number;
}

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

export interface NorwegianSite {
  site_id: string;
  site_name: string;
  site_status: string;
  approval_date: string;
  approval_type: string;
  site_capacity: number;
  temporary_capacity: number;
  capacity_unit_type: string;
  placement: string;
  water_type: string;
  site_details: string;
  county: string;
  municipality_id: string;
  municipality: string;
  production_area_code: string;
  latitude?: number;
  longitude?: number;
  symbol: string;
  species: string;
  company: string;
  site_url: string;
  external_site_url: string;
  permits: string;
  purpose: string;
  production_method: string;
  hover_text?: string;
}

export interface NorwegianFilterOptions {
  species: string[];
  companies: string[];
  watertypes: string[];
  regions: string[];
}

export interface NorwegianMapData {
  sites: NorwegianSite[];
  filters: NorwegianFilterOptions;
  totalCount: number;
}

export interface MapRegion {
  name: 'uk' | 'iceland' | 'norway' | 'canada';
  displayName: string;
  dataFile: string;
  type: AquacultureSite | IcelandSite | NorwegianSite | CanadianSite;
}

// ============ Canadian Site Types ============

/**
 * Unified interface for Canadian aquaculture site data
 * Supports: British Columbia, New Brunswick, Newfoundland, Nova Scotia, Quebec
 */
export interface CanadianSite {
  // Common fields
  site_id: string;
  company: string;
  species: string;
  species_type: string;
  location: string;
  province: string;
  
  // Coordinates (standardized to WGS84)
  latitude?: number;
  longitude?: number;
  
  // British Columbia specific
  license_type?: string;
  operating_group?: string;
  
  // New Brunswick specific
  authorization_type?: string;
  expiry_date?: string;
  cultivation_method?: string;
  site_size_ha?: number;
  
  // Newfoundland specific
  tenure?: string;
  licence_type?: string;
  operation_type?: string;
  status?: string;
  contact?: string;
  address?: string;
  community?: string;
  postal_code?: string;
  
  // Nova Scotia specific
  county?: string;
  site_status?: string;
  nav_chart?: string;
  hectares?: number;
  
  // Quebec specific
  permit_number?: string;
  research_site?: string;
  operating_sector?: string;
  permit_issued?: string;
  permit_expired?: string;
  activity_type?: string;
  area_ha?: number;
  hectares_used?: number;
  occupancy_percent?: number;
  footprint_wkt?: string;
  
  // Generated fields
  hover_text?: string;
}

export interface CanadianFilterOptions {
  species: string[];
  companies: string[];
  provinces: string[];
  species_types: string[];
  activity_types?: string[];
}

export interface CanadianMapData {
  sites: CanadianSite[];
  filters: CanadianFilterOptions;
  totalCount: number;
}

