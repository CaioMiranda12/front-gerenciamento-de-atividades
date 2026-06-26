import { useEffect, useRef, useState } from "react";
import type { ActivityDTO, GroupDTO } from "../../types";
import { ActivityCard } from "../ActivityCard";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { deleteGroup, updateGroup } from "../../services/groupService";
import { Droppable } from "react-beautiful-dnd";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";

const activitySchema = z.object({
  description: z
    .string()
    .min(3, "Mínimo de 3 caracteres")
    .max(200, "Descrição muito longa"),
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
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: { description: "" },
  });

  useEffect(() => {
    if (showModal && inputRef.current) inputRef.current.focus();
  }, [showModal]);

  useEffect(() => {
    if (editingGroup && inputRef.current) inputRef.current.focus();
  }, [editingGroup]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  async function handleUpdateGroup() {
    if (!groupName.trim() || groupName === group.name) {
      setEditingGroup(false);
      return;
    }
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
    const confirmed = window.confirm(`Excluir o grupo "${group.name}"?`);
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

  return (
    <section className="bg-[var(--color-bg)] rounded-[var(--radius-lg)] w-72 flex-shrink-0 border border-[var(--color-border)] flex flex-col">

      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        {editingGroup ? (
          <input
            ref={inputRef}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onBlur={handleUpdateGroup}
            onKeyDown={(e) => e.key === "Enter" && handleUpdateGroup()}
            className="text-sm font-semibold border border-[var(--color-primary)] rounded-[var(--radius-sm)] px-2 py-0.5 outline-none w-full"
          />
        ) : (
          <span
            onClick={() => setEditingGroup(true)}
            className="text-sm font-semibold text-[var(--color-text-primary)] cursor-pointer hover:text-[var(--color-primary)] transition-colors truncate"
          >
            {groupName}
          </span>
        )}

        <div className="relative ml-2 shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowMenu(prev => !prev)}
            className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--color-border)] transition-colors cursor-pointer"
          >
            <MoreHorizontal size={16} className="text-[var(--color-text-muted)]" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-[var(--shadow-md)] w-36 z-10 overflow-hidden">
              <button
                onClick={() => { setEditingGroup(true); setShowMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors cursor-pointer"
              >
                Renomear
              </button>
              <button
                onClick={() => { handleDeleteGroup(); setShowMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors cursor-pointer flex items-center gap-2"
              >
                <Trash2 size={13} />
                Excluir grupo
              </button>
            </div>
          )}
        </div>
      </header>

      <Droppable droppableId={String(group.id)} direction="vertical" isCombineEnabled={false} isDropDisabled={false} ignoreContainerClipping={false}>
        {(provided) => (
          <div
            className="p-3 flex flex-col gap-2 flex-1 min-h-[40px]"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {group.activities.length > 0 ? (
              group.activities.map((activity, index) => (
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
              <p className="text-xs text-[var(--color-text-muted)] italic text-center py-2">
                Nenhuma atividade
              </p>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="px-3 pb-3">
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-white rounded-[var(--radius-sm)] px-2 py-1.5 transition-all cursor-pointer"
        >
          <Plus size={14} />
          Adicionar atividade
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] w-96 p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Nova atividade</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <input
                  {...register("description")}
                  ref={(element) => {
                    register("description").ref(element);
                    inputRef.current = element;
                  }}
                  className={`w-full border rounded-[var(--radius-sm)] px-3 py-2 text-sm outline-none transition-colors
                    ${errors.description
                      ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
                      : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
                    }`}
                  placeholder="Descrição da atividade"
                />
                {errors.description && (
                  <p className="text-[var(--color-danger)] text-xs mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { reset(); setShowModal(false); }}
                  className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Salvando..." : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}