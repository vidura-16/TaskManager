import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../Models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = 'https://localhost:7004/api/tasks';

  constructor(private http: HttpClient) {}

  getTasks(userId: number, sortBy?: string, isCompleted?: boolean): Observable<Task[]> {
    let params = new HttpParams().set('userId', userId.toString());
    
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    
    if (isCompleted !== undefined) {
      params = params.set('isCompleted', isCompleted.toString());
    }

    return this.http.get<Task[]>(this.baseUrl, { params });
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  createTask(task: CreateTaskRequest, userId: number): Observable<Task> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<Task>(this.baseUrl, task, { params });
  }

  updateTask(id: number, task: UpdateTaskRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, task);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleTaskCompletion(task: Task): Observable<void> {
    const updatedTask: UpdateTaskRequest = {
      ...task,
      isCompleted: !task.isCompleted
    };
    return this.updateTask(task.id, updatedTask);
  }
}