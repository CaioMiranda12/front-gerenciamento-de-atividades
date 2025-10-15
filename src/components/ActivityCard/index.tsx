import { Calendar } from "lucide-react";
import type { ActivityDTO } from "../../types";
import { z } from 'zod'
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateActivity } from "../../services/activityService";
import { toast } from "react-toastify";

const activitySchema = z.object({
  description: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres")
    .max(200, "A descrição é muito longa"),
});

type ActivityFormData = z.infer<typeof activitySchema>;
interface ActivityCardProps {
  activity: ActivityDTO;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [localActivity, setLocalActivity] = useState<ActivityDTO>(activity);

  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: { description: localActivity.description },
  });

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  async function onSubmit(data: ActivityFormData) {
    try {
      const updated = await updateActivity(localActivity.id, {
        ...localActivity,
        description: data.description,
      });
      setLocalActivity(updated);
      toast.success("Atividade atualizada com sucesso!");
      setShowModal(false);
      reset({ description: updated.description });
    } catch (error) {
      console.error(error);
      toast.error("Falha ao atualizar atividade.");
    }
  }

  return (
    <div
      className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-sm transition flex justify-between items-center cursor-pointer"
      onClick={() => setShowModal(true)}
    >
      <div>
        <h4 className="font-medium text-gray-800 hover:underline">{activity.description}</h4>
        {localActivity.description && (
          <div className="flex items-center gap-2">
            <Calendar size={12} />
            <p className="text-sm text-gray-500">{localActivity.dueDate}</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg w-80">
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

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    reset({ description: localActivity.description });
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
                  {isSubmitting ? "Saving..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
