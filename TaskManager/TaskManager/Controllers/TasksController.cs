using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManager.Data;
using TaskManager.DTOs;
using TaskManager.Models;

namespace TaskManager.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TasksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/tasks?userId=1&sortBy=title&isCompleted=false
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskDto>>> GetTasks(
            [FromQuery] int userId,
            [FromQuery] string? sortBy = "createdAt",
            [FromQuery] bool? isCompleted = null)
        {
            if (userId <= 0)
            {
                return BadRequest("Valid userId is required");
            }

            var query = _context.Tasks.Where(t => t.UserId == userId);

            // Apply filtering
            if (isCompleted.HasValue)
            {
                query = query.Where(t => t.IsCompleted == isCompleted.Value);
            }

            // Apply sorting
            query = sortBy?.ToLower() switch
            {
                "title" => query.OrderBy(t => t.Title),
                "duedate" => query.OrderBy(t => t.DueDate ?? DateTime.MaxValue),
                "completed" => query.OrderBy(t => t.IsCompleted),
                _ => query.OrderByDescending(t => t.CreatedAt)
            };

            var tasks = await query.Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                IsCompleted = t.IsCompleted,
                CreatedAt = t.CreatedAt,
                DueDate = t.DueDate
            }).ToListAsync();

            return Ok(tasks);
        }

        // GET: api/tasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskDto>> GetTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);

            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            var taskDto = new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                IsCompleted = task.IsCompleted,
                CreatedAt = task.CreatedAt,
                DueDate = task.DueDate
            };

            return Ok(taskDto);
        }

        // POST: api/tasks?userId=1
        [HttpPost]
        public async Task<ActionResult<TaskDto>> CreateTask(TaskDto taskDto, [FromQuery] int userId)
        {
            if (userId <= 0)
            {
                return BadRequest("Valid userId is required");
            }

            if (string.IsNullOrWhiteSpace(taskDto.Title))
            {
                return BadRequest("Task title is required");
            }

            // Check if user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
            {
                return BadRequest("User not found");
            }

            var task = new TaskItem
            {
                Title = taskDto.Title.Trim(),
                Description = taskDto.Description?.Trim() ?? string.Empty,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                DueDate = taskDto.DueDate,
                IsCompleted = false // New tasks are always incomplete
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            var responseDto = new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                IsCompleted = task.IsCompleted,
                CreatedAt = task.CreatedAt,
                DueDate = task.DueDate
            };

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, responseDto);
        }

        // PUT: api/tasks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, TaskDto taskDto)
        {
            if (id != taskDto.Id)
            {
                return BadRequest("Task ID mismatch");
            }

            if (string.IsNullOrWhiteSpace(taskDto.Title))
            {
                return BadRequest("Task title is required");
            }

            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            // Update task properties
            task.Title = taskDto.Title.Trim();
            task.Description = taskDto.Description?.Trim() ?? string.Empty;
            task.IsCompleted = taskDto.IsCompleted;
            task.DueDate = taskDto.DueDate;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await TaskExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // PATCH: api/tasks/5/toggle - Toggle completion status
        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> ToggleTaskCompletion(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            task.IsCompleted = !task.IsCompleted;
            await _context.SaveChangesAsync();

            return Ok(new { id = task.Id, isCompleted = task.IsCompleted });
        }

        // DELETE: api/tasks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Helper method to check if task exists
        private async Task<bool> TaskExists(int id)
        {
            return await _context.Tasks.AnyAsync(e => e.Id == id);
        }

        // GET: api/tasks/user/1/count - Get task count for user
        [HttpGet("user/{userId}/count")]
        public async Task<ActionResult<object>> GetTaskCount(int userId)
        {
            if (userId <= 0)
            {
                return BadRequest("Valid userId is required");
            }

            var totalTasks = await _context.Tasks.CountAsync(t => t.UserId == userId);
            var completedTasks = await _context.Tasks.CountAsync(t => t.UserId == userId && t.IsCompleted);
            var pendingTasks = totalTasks - completedTasks;

            return Ok(new
            {
                totalTasks,
                completedTasks,
                pendingTasks
            });
        }
    }
}