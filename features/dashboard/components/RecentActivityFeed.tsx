'use client';

import type { RecentActivity } from '../dashboardApi';

interface Props {
  activities: RecentActivity[];
  maxItems?: number;
}

export function RecentActivityFeed({ activities, maxItems = 10 }: Props) {
  const items = (activities ?? []).slice(0, maxItems);

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">No recent activity to display.</p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/40 border border-white/30">
          <div>
            <p className="text-sm font-medium text-gray-700">{item.description}</p>
            <p className="text-xs text-gray-500">{item.user}</p>
          </div>
          <p className="text-xs text-gray-400 whitespace-nowrap ml-4">
            {new Date(item.timestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
