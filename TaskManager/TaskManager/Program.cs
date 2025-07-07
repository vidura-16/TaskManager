using Microsoft.EntityFrameworkCore;
using TaskManager;
using TaskManager.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer(); // Required for Swagger
builder.Services.AddSwaggerGen();           // Required for Swagger

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200") // Added HTTPS option
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Add this for localStorage/cookies
    });
});

var app = builder.Build();

// Developer exception page (optional but helpful)
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// Enable Swagger (for all environments; change if needed)
app.UseSwagger();
app.UseSwaggerUI();

// Enable CORS
app.UseCors("AllowAngular");

// Redirect HTTP to HTTPS
app.UseHttpsRedirection();

// Use Authorization middleware
app.UseAuthorization();

// Map controller routes (API endpoints)
app.MapControllers();

// Run the application
app.Run();
