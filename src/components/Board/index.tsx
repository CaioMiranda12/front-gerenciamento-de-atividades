import type { GroupDTO } from "../../types";
import { GroupCard } from "../GroupCard";

const mockGroups: GroupDTO[] = [
  {
    id: 1,
    name: "Em desenvolvimento",
    activities: [
      { id: 1, description: "Desenvolver API", completed: false, dueDate: "2025-10-16" }
    ]
  }
];

export default function Board() {
  return (
    <main className="flex gap-6 overflow-x-auto p-6 bg-gray-100 min-h-screen">
      {mockGroups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </main>
  );
}
