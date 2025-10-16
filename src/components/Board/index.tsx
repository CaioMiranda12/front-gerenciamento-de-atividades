import { useEffect, useState } from "react";
import type { ActivityDTO, GroupDTO } from "../../types";
import { GroupCard } from "../GroupCard";
import { createGroup, getAllGroups } from "../../services/groupService";
import { createActivity, deleteActivity, reorderActivities, updateActivity } from "../../services/activityService";
import { DragDropContext, type DropResult } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { Header } from "../Header";

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

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;

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
      console.error(err)
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
        <main className="p-6 flex gap-4 overflow-x-auto">
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
      </DragDropContext>
    </>

  );
}
