export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  PLATFORMS: `${API_BASE_URL}/sales/platforms`,
  MONTHS: `${API_BASE_URL}/sales/months`,
  REGIONS: `${API_BASE_URL}/sales/regions`,
  AGGREGATED: `${API_BASE_URL}/sales/aggregated`,
  DETAILED: `${API_BASE_URL}/sales/detailed`,
  EXPORT: `${API_BASE_URL}/sales/export`,
};
