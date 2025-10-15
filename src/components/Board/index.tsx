import type { GroupDTO } from "../../types";
import { GroupCard } from "../GroupCard";

interface BoardProps {
  groups: GroupDTO[];
}

export default function Board({ groups }: BoardProps) {
  return (
    <main className="flex gap-6 overflow-x-auto p-6 bg-gray-100 min-h-screen">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </main>
  );
}
