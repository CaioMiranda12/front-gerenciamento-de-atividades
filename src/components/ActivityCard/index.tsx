import { Calendar } from "lucide-react";
import type { ActivityDTO } from "../../types";

interface ActivityCardProps {
  activity: ActivityDTO;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-sm transition flex justify-between items-center">
      <div>
        <h4 className="font-medium text-gray-800">{activity.description}</h4>
        {activity.description && (
          <div className="flex items-center gap-2">
            <Calendar size={12} />
            <p className="text-sm text-gray-500">{activity.dueDate}</p>
          </div>
        )}
      </div>
    </div>
  );
}
