import type { CreateGroupDTO, GroupDTO } from "../types";
import api from "./api";

export async function getAllGroups(): Promise<GroupDTO[]> {
  const response = await api.get<GroupDTO[]>("/groups");
  return response.data;
}

export async function createGroup(data: CreateGroupDTO): Promise<GroupDTO> {
  const response = await api.post<GroupDTO>("/groups", data);
  return response.data;
}

export async function updateGroup(id: number, data: CreateGroupDTO): Promise<GroupDTO> {
  const response = await api.put<GroupDTO>(`/groups/${id}`, data);
  return response.data;
}

export async function deleteGroup(id: number): Promise<void> {
  await api.delete(`/groups/${id}`);
}
