'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Paper, Chip } from '@mui/material';
import { CanadianSite, CanadianMapData } from '../maps/types/site';

// Dynamically import Leaflet components to avoid SSR issues
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface CanadianMapProps {
  height?: number | string;
  region?: string;
}

const CANADIAN_COLORS = [
  '#1f77b4', // blue
  '#ff7f0e', // orange
  '#2ca02c', // green
  '#d62728', // red
  '#9467bd', // purple
  '#8c564b', // brown
  '#e377c2', // pink
  '#7f7f7f', // gray
  '#bcbd22', // yellow-green
  '#17becf', // cyan
];

export default function CanadianAquacultureMap({ height = 600, region = 'canada' }: CanadianMapProps) {
  const [mapData, setMapData] = useState<CanadianMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');

  // Fetch Canadian map data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/sites?region=${region}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        
        // Ensure data structure is valid
        if (data && data.sites && Array.isArray(data.sites)) {
          setMapData({
            sites: data.sites,
            filters: data.filters || {
              companies: [],
              species: [],
              provinces: [],
              species_types: []
            },
            totalCount: data.totalCount || data.sites.length
          });
        } else {
          throw new Error('Invalid data structure received');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [region]);

  // Create company color index
  const companyColorIndex = useMemo(() => {
    if (!mapData || !mapData.filters) return new Map<string, number>();
    const indexMap = new Map<string, number>();
    (mapData.filters.companies || []).forEach((company, index) => {
      indexMap.set(company, index);
    });
    return indexMap;
  }, [mapData]);

  // Get company color
  const getCompanyColor = (company: string): string => {
    const index = companyColorIndex.get(company) ?? 0;
    return CANADIAN_COLORS[index % CANADIAN_COLORS.length];
  };

  // Filter sites based on selected filters
  const filteredSites = useMemo(() => {
    if (!mapData) return [];
    
    let filtered = mapData.sites;

    if (selectedCompany !== 'All') {
      filtered = filtered.filter(s => s.company === selectedCompany);
    }

    if (selectedSpecies !== 'All') {
      filtered = filtered.filter(s => s.species === selectedSpecies);
    }

    if (selectedType !== 'All') {
      filtered = filtered.filter(s => s.species_type === selectedType);
    }

    if (selectedProvince !== 'All') {
      filtered = filtered.filter(s => s.province === selectedProvince);
    }

    return filtered;
  }, [mapData, selectedCompany, selectedSpecies, selectedType, selectedProvince]);

  // Reset filters
  const resetFilters = () => {
    setSelectedCompany('All');
    setSelectedSpecies('All');
    setSelectedType('All');
    setSelectedProvince('All');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedCompany !== 'All' || 
                          selectedSpecies !== 'All' || 
                          selectedType !== 'All' ||
                          selectedProvince !== 'All';

  // Calculate center of filtered data based on province
  const mapCenter = useMemo(() => {
    // Default centers for Canadian provinces
    const provinceCenters: Record<string, [number, number]> = {
      'British Columbia': [53.7267, -127.6476],
      'New Brunswick': [46.5584, -66.4619],
      'Newfoundland': [53.1355, -57.6604],
      'Nova Scotia': [44.6820, -63.7443],
      'Quebec': [52.9399, -73.5491],
    };

    if (selectedProvince !== 'All' && provinceCenters[selectedProvince]) {
      return provinceCenters[selectedProvince];
    }

    if (filteredSites.length === 0) {
      return [56.1304, -106.3468] as [number, number]; // Center of Canada
    }

    const validSites = filteredSites.filter(s => {
      const lat = s.latitude;
      const lon = s.longitude;
      return lat && lon && !isNaN(lat) && !isNaN(lon);
    });
    
    if (validSites.length === 0) {
      return [56.1304, -106.3468] as [number, number];
    }

    const avgLat = validSites.reduce((sum, s) => sum + (s.latitude || 0), 0) / validSites.length;
    const avgLon = validSites.reduce((sum, s) => sum + (s.longitude || 0), 0) / validSites.length;

    return [avgLat, avgLon] as [number, number];
  }, [filteredSites, selectedProvince]);

  // Calculate appropriate zoom level
  const mapZoom = useMemo(() => {
    if (selectedProvince !== 'All') return 6;
    if (filteredSites.length < 20) return 4;
    return 4;
  }, [filteredSites.length, selectedProvince]);

  if (loading) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
        }}
      >
        <Typography>Loading Canadian aquaculture data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{
          p: 3,
          backgroundColor: '#fee',
          color: '#c00',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6">Error Loading Data</Typography>
        <Typography>{error}</Typography>
      </Paper>
    );
  }

  if (!mapData || mapData.sites.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6">No Data Available</Typography>
        <Typography color="text.secondary">
          No Canadian aquaculture site data was found.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* Filters Panel */}
      <Paper
        sx={{
          flex: '0 0 280px',
          p: 2,
          height: 'fit-content',
          position: 'sticky',
          top: 16,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Canadian Filters</Typography>
          {hasActiveFilters && (
            <Chip
              label="Reset"
              onClick={resetFilters}
              size="small"
              color="primary"
              clickable
            />
          )}
        </Box>

        {/* Province Filter */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Province</InputLabel>
          <Select
            value={selectedProvince}
            label="Province"
            onChange={(e) => setSelectedProvince(e.target.value)}
          >
            <MenuItem value="All">All Provinces</MenuItem>
            {(mapData?.filters?.provinces || []).map(province => (
              <MenuItem key={province} value={province}>{province}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Company</InputLabel>
          <Select
            value={selectedCompany}
            label="Company"
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <MenuItem value="All">All Companies</MenuItem>
            {(mapData?.filters?.companies || []).map(company => (
              <MenuItem key={company} value={company}>{company}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Species</InputLabel>
          <Select
            value={selectedSpecies}
            label="Species"
            onChange={(e) => setSelectedSpecies(e.target.value)}
          >
            <MenuItem value="All">All Species</MenuItem>
            {(mapData?.filters?.species || []).map(species => (
              <MenuItem key={species} value={species}>{species}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={selectedType}
            label="Type"
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <MenuItem value="All">All Types</MenuItem>
            {(mapData?.filters?.species_types || []).map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Showing <strong>{filteredSites.length}</strong> of <strong>{mapData.totalCount}</strong> sites
          </Typography>
        </Box>
      </Paper>

      {/* Map */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {filteredSites.length > 0 ? (
          <Box
            sx={{
              height,
              width: '100%',
              borderRadius: 1,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredSites.map((site, index) => {
                const lat = site.latitude;
                const lon = site.longitude;
                if (!lat || !lon || isNaN(lat) || isNaN(lon)) return null;
                
                const color = getCompanyColor(site.company);
                const hoverText = site.hover_text || '';
                
                return (
                  <CircleMarker
                    key={`${site.site_id || site.location}-${index}`}
                    center={[lat, lon]}
                    radius={10}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.85,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div 
                        dangerouslySetInnerHTML={{ __html: hoverText }}
                        style={{ 
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontSize: '14px',
                          lineHeight: '1.5',
                        }}
                      />
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </Box>
        ) : (
          <Paper
            sx={{
              height,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No sites match your filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filter criteria
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

