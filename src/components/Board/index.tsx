import { useEffect, useState } from "react";
import type { GroupDTO } from "../../types";
import { GroupCard } from "../GroupCard";
import { createGroup, getAllGroups } from "../../services/groupService";

export default function Board() {
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [])

  async function loadGroups() {
    const data = await getAllGroups();
    setGroups(data);
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const created = await createGroup({ name: newGroupName });
    setGroups([...groups, created]);
    setNewGroupName("");
    setCreating(false);
  }

  return (
    <main className="p-6 flex gap-4 overflow-x-auto">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          onGroupDeleted={(id) => setGroups(groups.filter(group => group.id !== id))}
        />
      ))}

      <section className="min-w-80 bg-gray-100 rounded-xl p-4 flex items-center justify-center h-20">
        {creating ? (
          <form onSubmit={handleCreateGroup}>
            <input
              className="border border-gray-400 rounded p-2"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Nome do grupo..."
              autoFocus
              onBlur={() => setCreating(false)}
            />
          </form>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            + Novo Grupo
          </button>
        )}
      </section>
    </main>
  );
}
