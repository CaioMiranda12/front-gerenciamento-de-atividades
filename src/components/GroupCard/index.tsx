import { useEffect, useRef, useState } from "react";
import type { ActivityDTO, GroupDTO } from "../../types";
import { ActivityCard } from "../ActivityCard";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { deleteGroup, updateGroup } from "../../services/groupService";
import { Droppable } from "react-beautiful-dnd";

const activitySchema = z.object({
  description: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres")
    .max(200, "A descrição é muito longa"),
});

type ActivityFormData = z.infer<typeof activitySchema>;
interface GroupCardProps {
  group: GroupDTO;
  onGroupDeleted?: (id: number) => void;

  onCreateActivity: (groupId: number, data: { description: string }) => void;
  onUpdateActivity: (updated: ActivityDTO) => void;
  onDeleteActivity: (activityId: number) => void;

  lateActivities: ActivityDTO[];

}

export function GroupCard({ group, onGroupDeleted, onCreateActivity, onUpdateActivity, onDeleteActivity, lateActivities }: GroupCardProps) {
  const [showModal, setShowModal] = useState(false);

  const [editingGroup, setEditingGroup] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: { description: "" },
  });

  const activities = group.activities;

  async function onSubmit(data: ActivityFormData) {
    try {
      onCreateActivity(group.id, data);

      toast.success("Atividade criada com sucesso!");
      reset();
      setShowModal(false);
    } catch (err) {
      toast.error("Falha ao criar atividade.");
      console.error(err);
    }
  }

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  useEffect(() => {
    if (editingGroup && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingGroup]);

  async function handleUpdateGroup() {
    if (!groupName.trim()) return;

    if (groupName === group.name) return;

    try {
      const updated = await updateGroup(group.id, { name: groupName });
      setGroupName(updated.name);
      setEditingGroup(false);
      toast.success("Grupo atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao atualizar grupo.");
    }
  }

  async function handleDeleteGroup() {
    const confirmed = window.confirm(`Tem certeza que deseja excluir o grupo ${(group.name)}?`);
    if (!confirmed) return;

    try {
      await deleteGroup(group.id);
      toast.success("Grupo excluído com sucesso!");
      if (onGroupDeleted) onGroupDeleted(group.id);
    } catch (err) {
      console.error(err);
      toast.error("Falha ao excluir grupo.");
    }
  }


  function handleGroupKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleUpdateGroup();
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-md w-80 h-max flex-shrink-0 border border-gray-200">
      <header className="p-4 py-2 rounded-t-xl font-semibold text-black flex justify-between items-center">
        {editingGroup ? (
          <input
            ref={inputRef}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onBlur={handleUpdateGroup}
            onKeyDown={handleGroupKeyDown}
            className="border border-gray-300 rounded p-1 w-full"
          />
        ) : (
          <span
            onClick={() => setEditingGroup(true)}
            className="cursor-pointer hover:underline"
          >
            {groupName}
          </span>
        )}

        <button
          onClick={handleDeleteGroup}
          className="text-red-600 hover:underline text-sm ml-2 cursor-pointer"
        >
          Excluir
        </button>
      </header>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg w-80">
            <h3 className="font-semibold mb-3">Nova Atividade</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <input
                  {...register("description")}
                  ref={(element) => {
                    register("description").ref(element);
                    inputRef.current = element;
                  }}
                  className={`border p-2 w-full rounded ${errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                  placeholder="Descrição da atividade"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setShowModal(false);
                  }}
                  className="text-gray-500 hover:underline cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Droppable droppableId={String(group.id)} direction="vertical" isCombineEnabled={false} isDropDisabled={false} ignoreContainerClipping={false}>
        {(provided) => (
          <div
            className="p-3 flex flex-col gap-3"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  index={index}
                  onUpdateActivity={onUpdateActivity}
                  onDeleteActivity={onDeleteActivity}
                  lateActivities={lateActivities}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">Sem atividades</p>
            )}

            {provided.placeholder}
          </div>

        )}

      </Droppable>

      <div className="flex items-center justify-center p-3">
        <button
          onClick={() => setShowModal(true)}
          className="text-indigo-600 font-medium hover:underline transition cursor-pointer"
        >
          + Novo Card
        </button>
      </div>

    </section>
  );
}
