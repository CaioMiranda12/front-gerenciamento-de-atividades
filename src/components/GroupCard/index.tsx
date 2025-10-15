import { useEffect, useRef, useState } from "react";
import type { ActivityDTO, GroupDTO } from "../../types";
import { ActivityCard } from "../ActivityCard";
import { createActivity } from "../../services/activityService";


interface GroupCardProps {
  group: GroupDTO;
}

export function GroupCard({ group }: GroupCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [newDescription, setNewDescription] = useState("")
  const [activities, setActivities] = useState<ActivityDTO[]>(group.activities);

  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    if (!newDescription.trim()) return;

    const newActivity = await createActivity({
      description: newDescription,
      groupId: group.id,
      dueDate: "",
      completed: false,
    });

    setActivities((prev) => [...prev, newActivity]);

    setNewDescription("");
    setShowModal(false);
  }

  useEffect(() => {
    if (showModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showModal]);

  return (
    <section className="bg-white rounded-xl shadow-md w-80 h-max flex-shrink-0 border border-gray-200">
      <header
        className="p-4 py-2 rounded-t-xl font-semibold text-black"
      >
        {group.name}
      </header>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">
          <div className="bg-white p-4 rounded-lg shadow-lg w-80">
            <h3 className="font-semibold mb-2">Nova Atividade</h3>
            <input
              ref={inputRef}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="border p-2 w-full rounded mb-3"
              placeholder="Descrição da atividade"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:underline cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 flex flex-col gap-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <p className="text-sm text-gray-500 italic">Sem atividades</p>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="text-indigo-600 font-medium hover:underline transition cursor-pointer"
        >
          + Nova Atividade
        </button>
      </div>
    </section>
  );
}
