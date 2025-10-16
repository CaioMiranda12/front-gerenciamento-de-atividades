export interface ActivityDTO {
  id: number;
  description: string;
  completed: boolean;
  dueDate?: string;
}

export interface GroupDTO {
  id: number;
  name: string;
  activities: ActivityDTO[];
}

export interface CreateGroupDTO {
  name: string;
}

export interface CreateActivityDTO {
  description: string;
  dueDate: string;
  completed: boolean;
  groupId: number;
}
