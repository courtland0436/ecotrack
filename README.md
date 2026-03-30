# EcoTrack: Smart Home Maintenance

EcoTrack is a full-stack productivity application built with React and Flask. It allows users to track and manage the maintenance of complex household systems to ensure long-term efficiency and reliability.

The application includes a "Smart Tips" system that provides specific DIY advice upon task completion, helping users save on maintenance costs.

---

## Key Features
* **Secure Authentication:** User signup and login powered by Flask-Bcrypt with session-based persistence.
* **System & Task Management:** Full CRUD for household systems and associated tasks.
* **Server-Side Pagination & Search:** Optimized data fetching across the entire database.
* **Interactive Dashboard:** Responsive UI featuring loading states and real-time notifications.
* **Ownership Control:** Backend authorization ensuring users can only access their own records.

---

## Tech Stack

### Frontend
* **React 18** (Vite)
* **Tailwind CSS** (Styling)
* **React Router Dom** (Navigation)
* **React Hot Toast** (Notifications)

### Backend
* **Python / Flask** (RESTful API)
* **SQLAlchemy** (ORM)
* **Flask-Bcrypt** (Security)
* **SQLite** (Database)

---

## Setup and Launch

To install dependencies, seed the database, and launch both the frontend and backend automatically, run the following command from the root directory:
```
bash setup.sh
```
### Important Notes:
* The script will install all necessary packages and seed a test user.
* Both servers will run within this single terminal session.
* **To Stop:** Press **Ctrl+C** to safely shut down both the Flask and Vite processes.

---

## Test Credentials
To view the pre-loaded HVAC and Kitchen cards immediately, use the following credentials:
* **Email:** test@example.com
* **Password:** password123

---

## API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | /login | Authenticates user and starts session |
| GET | /check_session | Verifies current user status |
| GET | /systems?page=1&search= | Returns paginated systems for the user |
| POST | /tasks | Creates a new maintenance task |
| PATCH | /tasks/<id> | Toggles task completion and returns DIY advice |
| DELETE | /systems/<id> | Removes a system and its associated tasks |

---

## Design Reflections
A core focus of this project was implementing Server-Side Pagination and Search. By handling filtering on the backend via SQLAlchemy, the application remains scalable and ensures that the search functionality remains accurate even as the user's list of systems grows across multiple pages.