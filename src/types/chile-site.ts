// Type definitions for Chile aquaculture site data

export interface ChileSite {
  // Common identifiers
  id: string;
  site_id?: string;
  concession_number?: string;
  
  // Location
  site_name: string;
  location: string;
  commune?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  
  // Company/Operator
  company: string;
  holder?: string;
  operator?: string;
  
  // Species
  species: string[];
  species_type?: string;
  
  // Concession details
  concession_type?: string;
  status: string;
  status_description?: string;
  
  // Business/Activity
  activity_type?: string;
  business_type?: string;
  
  // Administrative
  registration_date?: string;
  expiration_date?: string;
  administrative_resolution?: string;
  
  // Area
  area_ha?: number;
  area_utilized_ha?: number;
  
  // Generated fields
  hover_text?: string;
}

export interface ChileFilterOptions {
  species: string[];
  companies: string[];
  statuses: string[];
  regions: string[];
  concession_types: string[];
  activity_types: string[];
}

export interface ChileMapData {
  sites: ChileSite[];
  filters: ChileFilterOptions;
  totalCount: number;
}

