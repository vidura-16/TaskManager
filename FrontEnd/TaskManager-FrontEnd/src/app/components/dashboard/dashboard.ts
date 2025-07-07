import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TaskListComponent } from '../task-list/task-list';
import { TaskFormComponent } from '../task-form/task-form';
import { AuthService } from '../../services/auth.service';
import { User } from '../../Models/user.model';
import { Task } from '../../Models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    TaskListComponent,
    TaskFormComponent
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isMobile = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  // Add these properties to your dashboard component
selectedTask: Task | null = null;

// Add these methods to your dashboard component
onTaskSelected(task: Task): void {
  this.selectedTask = task;
}

onTaskUpdated(): void {
  this.selectedTask = null;
  // Optionally refresh the task list
}
}