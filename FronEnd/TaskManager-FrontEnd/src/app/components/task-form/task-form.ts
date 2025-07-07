import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../Models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.scss']
})
export class TaskFormComponent implements OnInit, OnChanges {
  @Input() selectedTask: Task | null = null;
  @Output() taskUpdated = new EventEmitter<void>();

  taskForm: FormGroup;
  isLoading = false;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      dueDate: ['']
    });
  }

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("came here!!");
    console.log("=====>" + JSON.stringify(changes));
    console.log("------>" + JSON.stringify(this.selectedTask));

    if (this.selectedTask) {
      
      
      console.log(JSON.stringify(this.selectedTask));
      this.isEditing = true;
      this.taskForm.patchValue({
        title: this.selectedTask.title,
        description: this.selectedTask.description,
        dueDate: this.selectedTask.dueDate ? new Date(this.selectedTask.dueDate) : null
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.showMessage('User not authenticated');
      return;
    }

    this.isLoading = true;
    const formValue = this.taskForm.value;

    if (this.isEditing && this.selectedTask) {
      const updateRequest = {
        id: this.selectedTask.id,
        title: formValue.title,
        description: formValue.description,
        isCompleted: this.selectedTask.isCompleted,
        createdAt: this.selectedTask.createdAt,
        dueDate: formValue.dueDate
      };

      this.taskService.updateTask(this.selectedTask.id, updateRequest).subscribe({
        next: () => {
          this.showMessage('Task updated successfully');
          this.resetForm();
          this.taskUpdated.emit();
          this.isLoading = false;
        },
        error: () => {
          this.showMessage('Error updating task');
          this.isLoading = false;
        }
      });
    } else {
      const createRequest = {
        title: formValue.title,
        description: formValue.description,
        dueDate: formValue.dueDate
      };

      this.taskService.createTask(createRequest, currentUser.userId).subscribe({
        next: () => {
          this.showMessage('Task created successfully');
          this.resetForm();
          this.taskUpdated.emit();
          this.isLoading = false;
        },
        error: () => {
          this.showMessage('Error creating task');
          this.isLoading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.taskForm.reset();
    this.isEditing = false;
    this.selectedTask = null;
  }

  cancelEdit(): void {
    this.resetForm();
    this.taskUpdated.emit();
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }
}