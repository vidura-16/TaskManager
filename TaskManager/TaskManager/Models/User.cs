﻿namespace TaskManager.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<TaskItem> Tasks { get; set; } = new();
    }
}
