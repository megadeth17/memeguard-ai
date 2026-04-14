import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/feed';

export function useTokenData() {
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveToken, setLiveToken] = useState(null);
  const wsRef = useRef(null);
  const pingRef = useRef(null);

  const fetchTokens = useCallback(async (sortBy = 'overall_score') => {
    try {
      const { data } = await axios.get(`${API}/api/tokens?limit=100&sort_by=${sortBy}`);
      setTokens(data.tokens || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tokens');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/stats`);
      setStats(data);
    } catch {
      // non-critical
    }
  }, []);

  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        pingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('ping');
        }, 30000);
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'new_token') {
            const merged = { ...msg.token, ...msg.score };
            setLiveToken(merged);
            setTokens((prev) => {
              const existing = prev.findIndex((t) => t.address === merged.address);
              if (existing >= 0) {
                const copy = [...prev];
                copy[existing] = merged;
                return copy;
              }
              return [merged, ...prev];
            });
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        clearInterval(pingRef.current);
        setTimeout(connectWS, 5000); // reconnect
      };

      ws.onerror = () => ws.close();
    } catch {
      setTimeout(connectWS, 5000);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
    fetchStats();
    connectWS();

    const statsInterval = setInterval(fetchStats, 30000);
    return () => {
      clearInterval(statsInterval);
      clearInterval(pingRef.current);
      wsRef.current?.close();
    };
  }, [fetchTokens, fetchStats, connectWS]);

  return { tokens, stats, loading, error, liveToken, refetch: fetchTokens };
}
