Task Manager App - Setup & Features Guide
Prerequisites
Ensure the following are installed:
- .NET SDK 7.0+
- SQL Server / SQL Server Express
- Node.js (18+)
- Angular CLI - npm install -g @angular/cli
How to Run the App
1. Backend (.NET Web API)
Path: TaskManager-Backend
Step-by-Step:
1. Open the folder in VS Code or Visual Studio.
2. Create DB (if not already):
- Check appsettings.json for "DefaultConnection".
- Run in Package Manager Console:
Update-Database
- OR using CLI:
dotnet ef database update
3. Run the API:
dotnet run

4. The API will run at https://localhost:5001 or http://localhost:5000
2. Frontend (Angular)
Path: TaskManager-FrontEnd
Step-by-Step:
1. Navigate to frontend folder:
cd TaskManager-FrontEnd
2. Install dependencies:
npm install
3. Start the Angular app:
ng serve
4. Open browser:
http://localhost:4200
Features Overview
Task Management
- Create new tasks with title, description, due date, status
- View all tasks in a list with filtering
- Edit existing tasks
- Delete tasks
UI/UX

- Angular Material for styling
- Responsive design
- Real-time form switching between Create and Edit
Backend API (C# + EF Core)
- RESTful endpoints for CRUD
- SQL Server integration
- CORS enabled for frontend
Robustness
- Display relevant messages to users
- Proper error handling and validation of incoming requests
Notes
- If DB isn't updating, verify connection string and ensure SQL Server is running.
- CORS policy allows Angular (http://localhost:4200) to call the backend.
