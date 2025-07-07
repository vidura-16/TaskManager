import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../Models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.scss']
})
export class TaskListComponent implements OnInit {
  @Output() taskSelected = new EventEmitter<Task>();
  @Output() taskUpdated = new EventEmitter<void>();

  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  isLoading = false;
  searchTerm = '';
  sortBy = 'createdAt';
  filterCompleted: boolean | undefined = undefined;
  
  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    this.isLoading = true;
    this.taskService.getTasks(currentUser.userId, this.sortBy, this.filterCompleted)
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          this.showMessage('Error loading tasks');
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesSearch;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.loadTasks();
  }

  onFilterChange(): void {
    this.loadTasks();
  }

  toggleTaskCompletion(task: Task): void {
    this.taskService.toggleTaskCompletion(task).subscribe({
      next: () => {
        this.loadTasks();
        this.showMessage(`Task ${!task.isCompleted ? 'completed' : 'reopened'}`);
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.showMessage('Error updating task');
      }
    });
  }

  editTask(task: Task): void {
    console.log("The value of task" + JSON.stringify(task));
    // Emit the selected task to parent component
    this.taskSelected.emit({ ...task });
  }

  deleteTask(task: Task): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.loadTasks();
          this.showMessage('Task deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.showMessage('Error deleting task');
        }
      });
    }
  }

  onTaskUpdated(): void {
    this.loadTasks(); 
    this.taskUpdated.emit();
  }

  refreshTasks(): void {
    this.loadTasks();
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}