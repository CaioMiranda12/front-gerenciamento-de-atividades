import type { ActivityDTO, CreateActivityDTO } from "../types";
import api from "./api";

export async function getAllActivities(): Promise<ActivityDTO[]> {
  const response = await api.get<ActivityDTO[]>("/activities");
  return response.data;
}

export async function createActivity(data: CreateActivityDTO): Promise<ActivityDTO> {
  const response = await api.post<ActivityDTO>("/activities", data);
  return response.data;
}

export async function updateActivity(id: number, data: ActivityDTO): Promise<ActivityDTO> {
  const response = await api.put<ActivityDTO>(`/activities/${id}`, data);
  return response.data;
}

export async function deleteActivity(id: number): Promise<void> {
  await api.delete(`/activities/${id}`);
}

export async function reorderActivities(reordered: { id: number; groupId: number; position: number }[]): Promise<void> {
  await api.put("/activities/reorder", reordered);
}
