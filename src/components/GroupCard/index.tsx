import type { GroupDTO } from "../../types";
import { ActivityCard } from "../ActivityCard";


interface GroupCardProps {
  group: GroupDTO;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <section className="bg-white rounded-xl shadow-md w-80 h-max flex-shrink-0 border border-gray-200">
      <header
        className="p-4 py-2 rounded-t-xl font-semibold text-black"
      >
        {group.name}
      </header>

      <div className="p-3 flex flex-col gap-3">
        {group.activities.length > 0 ? (
          group.activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">Sem atividades</p>
        )}

        <button className="text-indigo-600 font-medium hover:underline transition cursor-pointer">
          + Nova Atividade
        </button>
      </div>
    </section>
  );
}
