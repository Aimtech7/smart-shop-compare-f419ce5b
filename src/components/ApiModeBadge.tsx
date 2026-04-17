import { API_CONFIG } from '@/services/apiConfig';
import { Database, Server } from 'lucide-react';

/**
 * Dev-only badge showing whether the app is using mocks or the Django API.
 * Hidden in production builds.
 */
export function ApiModeBadge() {
  if (import.meta.env.PROD) return null;

  const isDjango = API_CONFIG.useDjango;
  const Icon = isDjango ? Server : Database;
  const label = isDjango ? 'Django API' : 'Mock Data';
  const colorClass = isDjango
    ? 'bg-success/15 text-success border-success/30'
    : 'bg-warning/15 text-warning border-warning/30';

  return (
    <div
      className={`fixed bottom-3 right-3 z-[100] flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-mono font-semibold backdrop-blur-md shadow-lg ${colorClass}`}
      title={`API mode — base: ${API_CONFIG.baseUrl}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </div>
  );
}
