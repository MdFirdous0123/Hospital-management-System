import { useState, useEffect } from 'react';
import API from '../services/api';

// Generic hook for fetching data from any API endpoint
// Returns data, loading state, and a setter to update data locally
export function useData(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(endpoint)
      .then(res => setData(res.data))
      .catch(err => console.error(`Failed to fetch ${endpoint}:`, err))
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, setData, loading };
}
