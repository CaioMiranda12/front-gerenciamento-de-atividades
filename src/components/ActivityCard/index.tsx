import { Calendar, Trash2 } from "lucide-react";
import type { ActivityDTO } from "../../types";
import { z } from 'zod'
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { formatDateToBR } from "../../utils/formatDateToBR";
import { Draggable } from "react-beautiful-dnd";

const activitySchema = z.object({
  description: z
    .string()
    .min(1, "A descrição deve ter pelo menos 1 caracteres")
    .max(200, "A descrição é muito longa"),
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
  const [isLateActivity, setIsLateActivity] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      description: activity?.description ?? "",
      dueDate: activity?.dueDate ?? "",
      completed: activity?.completed ?? false,
    },
  });

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  useEffect(() => {
    if (lateActivities.includes(activity)) {
      setIsLateActivity(true);
    } else {
      setIsLateActivity(false);
    }
  }, [activity, lateActivities])

  if (!activity) return null;

  async function onSubmit(data: ActivityFormData) {
    if (!activity?.id) {
      toast.error("ID da atividade inválido.");
      return;
    }

    try {
      await onUpdateActivity({ ...activity, ...data });

      toast.success("Atividade atualizada com sucesso!");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Falha ao atualizar atividade.");
    }
  }

  async function handleDelete() {
    if (!activity) return;

    const confirmed = window.confirm("Tem certeza que deseja excluir esta atividade?");
    if (!confirmed) return;

    try {
      await onDeleteActivity(activity.id);
      toast.success("Atividade excluída com sucesso!");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Falha ao excluir atividade.");
    }
  }

  function getBgColor() {
    if (activity.completed) return 'bg-green-50';
    return isLateActivity ? 'bg-red-50' : 'bg-gray-50';
  }

  return (
    <div
      className={`
        border border-gray-200 rounded-lg p-3 hover:shadow-sm transition flex justify-between items-center cursor-pointer
        ${getBgColor()}
        `}
      onClick={() => setShowModal(true)}
    >
      <Draggable draggableId={String(activity.id)} index={index}>
        {(provided) => (
          <div
            className="w-full overflow-hidden"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <h4 className="font-medium text-gray-800 hover:underline break-words whitespace-pre-wrap">{activity.description}</h4>

            {activity.description && (
              <div className="flex items-center gap-2 mt-1 flex-wrap text-sm text-gray-500">
                <Calendar size={12} />
                <p className="text-sm text-gray-500">{activity.dueDate && formatDateToBR(activity.dueDate)}</p>
              </div>
            )}
          </div>
        )}
      </Draggable>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-10">
          <div
            className="bg-white p-4 rounded-lg shadow-lg w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-3">Editar atividade</h3>

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
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Prazo de entrega</label>
                <input
                  type="date"
                  {...register("dueDate")}
                  className="border p-2 w-full rounded border-gray-300"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="completed"
                  {...register("completed")}
                  className="cursor-pointer"
                />
                <label htmlFor="completed" className="text-sm text-gray-700">
                  Concluída
                </label>
              </div>

              <div className="flex justify-between items-center pt-3">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center text-red-600 hover:underline text-sm cursor-pointer"
                >
                  <Trash2 size={16} className="mr-1" />
                  Excluir
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      reset({ description: activity.description, dueDate: activity.dueDate || "" });
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
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
