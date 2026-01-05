'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Paper, Chip } from '@mui/material';
import { AquacultureSite, FilterOptions, MapData } from '../types/site';
import { createCompanyColorIndex, getCompanyColor } from '../data/processing';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 1,
      }}
    >
      <Typography>Loading map...</Typography>
    </Box>
  ),
});

interface AquacultureMapProps {
  height?: number | string;
}

export default function AquacultureMap({ height = 600 }: AquacultureMapProps) {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedWatertype, setSelectedWatertype] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Fetch map data
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/sites');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setMapData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter sites based on selected filters
  const filteredSites = useMemo(() => {
    if (!mapData) return [];
    
    let filtered = mapData.sites;

    if (selectedSpecies !== 'All') {
      filtered = filtered.filter(s => s.species === selectedSpecies);
    }

    if (selectedCompany !== 'All') {
      filtered = filtered.filter(s => s.company === selectedCompany);
    }

    if (selectedWatertype !== 'All') {
      filtered = filtered.filter(s => s.watertype === selectedWatertype);
    }

    if (selectedRegion !== 'All') {
      filtered = filtered.filter(s => s.region === selectedRegion);
    }

    return filtered;
  }, [mapData, selectedSpecies, selectedCompany, selectedWatertype, selectedRegion]);

  // Create company color index
  const companyColorIndex = useMemo(() => {
    if (!mapData) return new Map<string, number>();
    return createCompanyColorIndex(mapData.filters.companies);
  }, [mapData]);

  // Reset filters
  const resetFilters = () => {
    setSelectedSpecies('All');
    setSelectedCompany('All');
    setSelectedWatertype('All');
    setSelectedRegion('All');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedSpecies !== 'All' || 
                          selectedCompany !== 'All' || 
                          selectedWatertype !== 'All' || 
                          selectedRegion !== 'All';

  // Prepare data for Plotly
  const plotData = useMemo(() => {
    if (filteredSites.length === 0) return [];

    const lats = filteredSites.map(s => s.latitude || 0);
    const lons = filteredSites.map(s => s.longitude || 0);
    const textArray = filteredSites.map((s) => {
      return `Site: ${s.site_name}<br>Company: ${s.company}<br>Species: ${s.species}<br>Type: ${s.aquaculture_type}<br>Water: ${s.watertype}`;
    });

    return [{
      type: 'scattergeo' as const,
      mode: 'markers' as const,
      lat: lats,
      lon: lons,
      marker: {
        size: 12,
        color: filteredSites.map(s => getCompanyColor(s.company, companyColorIndex)),
        opacity: 0.85,
        line: {
          color: 'white',
          width: 1,
        },
      },
      text: textArray,
      hoverinfo: 'text' as const,
    }];
  }, [filteredSites, companyColorIndex]);

  // Calculate center of filtered data
  const mapCenter = useMemo(() => {
    if (filteredSites.length === 0) {
      return { lat: 57.5, lon: -4.5 }; // Center of Scotland
    }

    const validSites = filteredSites.filter(s => s.latitude && s.longitude);
    if (validSites.length === 0) {
      return { lat: 57.5, lon: -4.5 };
    }

    const avgLat = validSites.reduce((sum, s) => sum + (s.latitude || 0), 0) / validSites.length;
    const avgLon = validSites.reduce((sum, s) => sum + (s.longitude || 0), 0) / validSites.length;

    return { lat: avgLat, lon: avgLon };
  }, [filteredSites]);

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
        <Typography>Loading aquaculture data...</Typography>
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
          No aquaculture site data was found.
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
          <Typography variant="h6">Filter Options</Typography>
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

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Species</InputLabel>
          <Select
            value={selectedSpecies}
            label="Species"
            onChange={(e) => setSelectedSpecies(e.target.value)}
          >
            <MenuItem value="All">All Species</MenuItem>
            {mapData.filters.species.map(species => (
              <MenuItem key={species} value={species}>{species}</MenuItem>
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
            {mapData.filters.companies.map(company => (
              <MenuItem key={company} value={company}>{company}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Water Type</InputLabel>
          <Select
            value={selectedWatertype}
            label="Water Type"
            onChange={(e) => setSelectedWatertype(e.target.value)}
          >
            <MenuItem value="All">All Water Types</MenuItem>
            {mapData.filters.watertypes.map(watertype => (
              <MenuItem key={watertype} value={watertype}>{watertype}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Region</InputLabel>
          <Select
            value={selectedRegion}
            label="Region"
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <MenuItem value="All">All Regions</MenuItem>
            {mapData.filters.regions.map(region => (
              <MenuItem key={region} value={region}>{region}</MenuItem>
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
          <Plot
            data={plotData}
            layout={{
              autosize: true,
              geo: {
                scope: 'europe',
                resolution: 50,
                showland: true,
                landcolor: 'rgb(230, 230, 230)',
                showlakes: true,
                lakecolor: 'rgb(180, 210, 230)',
                showsubunits: true,
                subunitcolor: 'rgb(150, 150, 150)',
                subunitwidth: 1,
                countrycolor: 'rgb(100, 100, 100)',
                countrywidth: 1.5,
                showocean: true,
                oceancolor: 'rgb(200, 220, 240)',
                showcoastlines: true,
                coastlinecolor: 'rgb(80, 80, 80)',
                coastlinewidth: 1.5,
                showcountries: true,
                framecolor: 'rgb(100, 100, 100)',
                framewidth: 1,
                center: {
                  lat: mapCenter.lat,
                  lon: mapCenter.lon,
                },
                projection: {
                  type: 'mercator',
                },
              },
              margin: { t: 0, b: 0, l: 0, r: 0 },
              showlegend: true,
              legend: {
                title: {
                  text: 'Operating Companies',
                },
                orientation: 'v',
                x: 1.02,
                y: 1,
                itemclick: 'toggleothers',
                itemdoubleclick: 'toggle',
              },
            }}
            useResizeHandler={true}
            style={{ width: '100%', height }}
            config={{
              displayModeBar: true,
              responsive: true,
            }}
          />
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

