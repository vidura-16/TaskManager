export interface Task {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
    createdAt: Date;
    dueDate?: Date;
  }
  
  export interface CreateTaskRequest {
    title: string;
    description: string;
    dueDate?: Date;
  }
  export interface UpdateTaskRequest {
    id: number;
    title: string;
    description: string;
    isCompleted: boolean;
    createdAt: Date;
    dueDate?: Date;
  }