'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { NorwegianSite, NorwegianMapData } from '../types/site';
import { createCompanyColorIndex, getCompanyColor } from '../data/processing';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography>Loading Norwegian map...</Typography>
    </Box>
  ),
});

interface NorwegianMapProps {
  height?: number | string;
}

export default function NorwegianMap({ height = 600 }: NorwegianMapProps) {
  const [mapData, setMapData] = useState<NorwegianMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('All');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('All');
  const [selectedCounty, setSelectedCounty] = useState<string>('All');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/norwegian-sites');
        if (!response.ok) throw new Error('Failed to fetch data');
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

  const filteredSites = useMemo(() => {
    if (!mapData) return [];
    return mapData.sites.filter(site => {
      if (selectedCompany !== 'All' && site.company !== selectedCompany) return false;
      if (selectedSpecies !== 'All' && !site.species.includes(selectedSpecies)) return false;
      if (selectedCounty !== 'All' && site.county !== selectedCounty) return false;
      return true;
    });
  }, [mapData, selectedCompany, selectedSpecies, selectedCounty]);

  const companyColorIndex = useMemo(() => {
    if (!mapData) return new Map<string, number>();
    return createCompanyColorIndex(mapData.filters.companies);
  }, [mapData]);

  const plotData = useMemo(() => {
    if (filteredSites.length === 0) return [];
    return [{
      type: 'scattergeo' as const,
      mode: 'markers' as const,
      lat: filteredSites.map(s => s.latitude || 0),
      lon: filteredSites.map(s => s.longitude || 0),
      marker: {
        size: 12,
        color: filteredSites.map(s => getCompanyColor(s.company, companyColorIndex)),
        opacity: 0.85,
        line: { color: 'white', width: 1 },
      },
      text: filteredSites.map(s => s.hover_text || `${s.site_name} - ${s.company}`),
      hoverinfo: 'text' as const,
    }];
  }, [filteredSites, companyColorIndex]);

  if (loading) return (
    <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 1 }}>
      <Typography>Loading Norwegian aquaculture data...</Typography>
    </Box>
  );

  if (error) return (
    <Paper sx={{ p: 3, backgroundColor: '#fee', color: '#c00', textAlign: 'center' }}>
      <Typography variant="h6">Error Loading Data</Typography>
      <Typography>{error}</Typography>
    </Paper>
  );

  if (!mapData) return (
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6">No Data Available</Typography>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Paper sx={{ flex: '0 0 250px', p: 2, height: 'fit-content', position: 'sticky', top: 16 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Filter Options</Typography>
        
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Company</InputLabel>
          <Select value={selectedCompany} label="Company" onChange={(e) => setSelectedCompany(e.target.value)}>
            <MenuItem value="All">All Companies</MenuItem>
            {(mapData.filters.companies || []).map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Species</InputLabel>
          <Select value={selectedSpecies} label="Species" onChange={(e) => setSelectedSpecies(e.target.value)}>
            <MenuItem value="All">All Species</MenuItem>
            {(mapData.filters.species || []).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>County</InputLabel>
          <Select value={selectedCounty} label="County" onChange={(e) => setSelectedCounty(e.target.value)}>
            <MenuItem value="All">All Counties</MenuItem>
            {(mapData.filters.regions || []).map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Showing <strong>{filteredSites.length}</strong> of <strong>{mapData.totalCount}</strong> sites
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {filteredSites.length > 0 ? (
          <Plot
            data={plotData}
            layout={{
              autosize: true,
              geo: {
                scope: 'europe',
                showland: true,
                landcolor: 'rgb(243, 243, 243)',
                showocean: true,
                oceancolor: 'rgb(204, 229, 255)',
                showcoastlines: true,
                coastlinecolor: 'rgb(100, 100, 100)',
                projection: { type: 'mercator' },
                center: { lat: 64, lon: 11 },
              },
              margin: { t: 0, b: 0, l: 0, r: 0 },
              showlegend: true,
              legend: { title: { text: 'Companies' }, orientation: 'v', x: 1.02, y: 1 },
            }}
            useResizeHandler={true}
            style={{ width: '100%', height }}
            config={{ displayModeBar: true, responsive: true }}
          />
        ) : (
          <Paper sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">No sites match your filters</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

