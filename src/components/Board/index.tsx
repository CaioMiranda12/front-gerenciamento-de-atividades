import { useEffect, useState } from "react";
import type { ActivityDTO, GroupDTO } from "../../types";
import { GroupCard } from "../GroupCard";
import { createGroup, getAllGroups } from "../../services/groupService";
import { createActivity, deleteActivity, reorderActivities, updateActivity } from "../../services/activityService";
import { DragDropContext, type DropResult } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { Header } from "../Header";
import { Plus } from "lucide-react";

export default function Board() {
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [lateActivities, setLateActivities] = useState<ActivityDTO[]>([]);

  function handleSearch(search: string) {
    setSearchTerm(search.toLowerCase());
  }

  function getFilteredActivities(group: GroupDTO) {
    if (!searchTerm) return group.activities;
    return group.activities.filter(activity =>
      activity.description.toLowerCase().includes(searchTerm)
    );
  }

  async function handleDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceGroupId = Number(source.droppableId);
    const destGroupId = Number(destination.droppableId);
    const newGroups = [...groups];
    const sourceGroup = newGroups.find(group => group.id === sourceGroupId)!;
    const destGroup = newGroups.find(group => group.id === destGroupId)!;
    const [movedActivity] = sourceGroup.activities.splice(source.index, 1);
    const updatedActivity: ActivityDTO = { ...movedActivity, groupId: destGroup.id };
    destGroup.activities.splice(destination.index, 0, updatedActivity);
    setGroups(newGroups);

    try {
      await reorderActivities(
        destGroup.activities.map((activity, index) => ({
          id: activity.id,
          groupId: destGroup.id,
          position: index,
        }))
      );
      toast.success("Atividade movida com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Falha ao mover atividade");
    }
  }

  useEffect(() => {
    const late: ActivityDTO[] = [];
    groups.forEach(group => {
      group.activities.forEach(activity => {
        if (activity.dueDate && new Date(activity.dueDate) < new Date() && !activity.completed) {
          late.push(activity);
        }
      });
    });
    setLateActivities(late);
  }, [groups]);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const data = await getAllGroups();
    setGroups(data);
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const created = await createGroup({ name: newGroupName });
    setGroups([...groups, created]);
    toast.success("Grupo criado com sucesso!");
    setNewGroupName("");
    setCreating(false);
  }

  async function handleCreateActivity(groupId: number, data: { description: string }) {
    const newActivity = await createActivity({
      description: data.description,
      groupId: groupId,
      dueDate: "",
      completed: false,
    });
    setGroups(groups =>
      groups.map(group =>
        group.id === groupId
          ? { ...group, activities: [...group.activities, newActivity] }
          : group
      )
    );
  }

  async function handleUpdateActivity(updated: ActivityDTO) {
    const saved = await updateActivity(updated.id, updated);
    setGroups(groups =>
      groups.map(group => ({
        ...group,
        activities: group.activities.map(activity =>
          activity.id === saved.id ? saved : activity
        ),
      }))
    );
  }

  async function handleDeleteActivity(activityId: number) {
    await deleteActivity(activityId);
    setGroups(groups =>
      groups.map(group => ({
        ...group,
        activities: group.activities.filter(activity => activity.id !== activityId),
      }))
    );
  }

  return (
    <>
      <Header onSearch={handleSearch} lateActivities={lateActivities} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <main className="p-6 flex gap-4 overflow-x-auto min-h-[calc(100vh-56px)] items-start">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={{ ...group, activities: getFilteredActivities(group) }}
              onGroupDeleted={(id) => setGroups(groups.filter(group => group.id !== id))}
              onCreateActivity={handleCreateActivity}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
              lateActivities={lateActivities}
            />
          ))}

          <section className="min-w-72 flex-shrink-0">
            {creating ? (
              <form
                onSubmit={handleCreateGroup}
                className="bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3 shadow-[var(--shadow-sm)]"
              >
                <input
                  className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Nome do grupo..."
                  autoFocus
                  onBlur={() => {
                    if (!newGroupName.trim()) setCreating(false);
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[var(--color-primary)] text-white text-sm font-medium rounded-[var(--radius-sm)] py-1.5 hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer"
                  >
                    Criar
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    className="flex-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full flex items-center gap-2 text-sm text-[var(--color-text-secondary)] bg-white/60 hover:bg-white border border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] rounded-[var(--radius-lg)] px-4 py-3 transition-all cursor-pointer"
              >
                <Plus size={15} />
                Novo grupo
              </button>
            )}
          </section>
        </main>
      </DragDropContext>
    </>
  );
}