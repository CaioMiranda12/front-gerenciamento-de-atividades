import { Calendar, Trash2, CheckCircle2 } from "lucide-react";
import type { ActivityDTO } from "../../types";
import { z } from 'zod';
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { formatDateToBR } from "../../utils/formatDateToBR";
import { Draggable } from "react-beautiful-dnd";

const activitySchema = z.object({
  description: z.string().min(1, "Mínimo de 1 caractere").max(200, "Descrição muito longa"),
  dueDate: z.string().optional(),
  completed: z.boolean().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface ActivityCardProps {
  activity: ActivityDTO;
  index: number;
  onUpdateActivity: (updated: ActivityDTO) => void;
  onDeleteActivity: (activityId: number) => void;
  lateActivities: ActivityDTO[];
}

export function ActivityCard({ activity, index, onUpdateActivity, onDeleteActivity, lateActivities }: ActivityCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [isLate, setIsLate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      description: activity?.description ?? "",
      dueDate: activity?.dueDate ?? "",
      completed: activity?.completed ?? false,
    },
  });

  useEffect(() => {
    if (showModal && inputRef.current) inputRef.current.focus();
  }, [showModal]);

  useEffect(() => {
    setIsLate(lateActivities.includes(activity));
  }, [activity, lateActivities]);

  if (!activity) return null;

  async function onSubmit(data: ActivityFormData) {
    if (!activity?.id) { toast.error("ID inválido."); return; }
    try {
      await onUpdateActivity({ ...activity, ...data });
      toast.success("Atividade atualizada!");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Falha ao atualizar.");
    }
  }

  async function handleDelete() {
    if (!activity) return;
    const confirmed = window.confirm("Excluir esta atividade?");
    if (!confirmed) return;
    try {
      await onDeleteActivity(activity.id);
      toast.success("Atividade excluída!");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Falha ao excluir.");
    }
  }

  function getCardStyle() {
    if (activity.completed) return "bg-[var(--color-success-light)] border-[var(--color-success)]/30";
    if (isLate) return "bg-[var(--color-danger-light)] border-[var(--color-danger)]/30";
    return "bg-white border-[var(--color-border)]";
  }

  return (
    <>
      <Draggable draggableId={String(activity.id)} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setShowModal(true)}
            className={`
              border rounded-[var(--radius-md)] p-3 cursor-pointer transition-shadow
              ${getCardStyle()}
              ${snapshot.isDragging ? "shadow-[var(--shadow-md)] rotate-1" : "hover:shadow-[var(--shadow-sm)]"}
            `}
          >
            <div className="flex items-start gap-2">
              {activity.completed && (
                <CheckCircle2 size={14} className="text-[var(--color-success)] mt-0.5 shrink-0" />
              )}
              <p className={`text-sm break-words whitespace-pre-wrap leading-snug flex-1
                ${activity.completed ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text-primary)]"}
              `}>
                {activity.description}
              </p>
            </div>

            {activity.dueDate && (
              <div className={`flex items-center gap-1.5 mt-2 text-xs
                ${isLate && !activity.completed ? "text-[var(--color-danger)]" : "text-[var(--color-text-muted)]"}
              `}>
                <Calendar size={11} />
                <span>{formatDateToBR(activity.dueDate)}</span>
              </div>
            )}
          </div>
        )}
      </Draggable>

      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] w-96 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Editar atividade</h3>

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
                      ? "border-[var(--color-danger)]"
                      : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
                    }`}
                  placeholder="Descrição da atividade"
                />
                {errors.description && (
                  <p className="text-[var(--color-danger)] text-xs mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                  Prazo de entrega
                </label>
                <input
                  type="date"
                  {...register("dueDate")}
                  className="w-full border border-[var(--color-border)] rounded-[var(--radius-sm)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="completed"
                  {...register("completed")}
                  className="cursor-pointer accent-[var(--color-primary)] w-4 h-4"
                />
                <label htmlFor="completed" className="text-sm text-[var(--color-text-secondary)] cursor-pointer">
                  Marcar como concluída
                </label>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border)] mt-4">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-sm text-[var(--color-danger)] hover:text-[var(--color-danger)]/80 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  Excluir
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      reset({ description: activity.description, dueDate: activity.dueDate || "" });
                      setShowModal(false);
                    }}
                    className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-[var(--radius-sm)] hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}