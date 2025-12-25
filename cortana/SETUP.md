# Cortana AI Assistant - Setup Guide

## Prerequisites
- Python 3.11 or higher
- PostgreSQL installed and running
- pip (Python package manager)

## Step 1: PostgreSQL Database Setup

### Create a new database for Cortana:

1. Open your PostgreSQL terminal or pgAdmin
2. Create a new database:
```sql
CREATE DATABASE cortana_db;
```

3. Create a user (optional, or use your existing PostgreSQL user):
```sql
CREATE USER cortana_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE cortana_db TO cortana_user;
```

4. Note your connection details:
   - Host: usually `localhost`
   - Port: usually `5432`
   - Database name: `cortana_db`
   - Username: your PostgreSQL username
   - Password: your PostgreSQL password

## Step 2: Python Environment Setup

### Windows:
```bash
# Navigate to the cortana directory
cd cortana

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Linux/Mac:
```bash
# Navigate to the cortana directory
cd cortana

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your actual database credentials:
```
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/cortana_db
```

Replace:
- `your_username` with your PostgreSQL username
- `your_password` with your PostgreSQL password
- `localhost` with your database host if different
- `5432` with your PostgreSQL port if different
- `cortana_db` with your database name if different

3. (Optional) Change the SECRET_KEY for security:
```
SECRET_KEY=generate-a-random-secret-key-here
```

## Step 4: Run the Application

```bash
# Make sure you're in the cortana directory with venv activated
python main.py
```

The server will start at: **http://localhost:8000**

## Step 5: Test the API

1. Open your browser and go to: **http://localhost:8000/docs**
   - This will show the interactive API documentation (Swagger UI)

2. Try the health check endpoint: **http://localhost:8000/health**

3. Test user registration:
   - Go to `/docs`
   - Find the `POST /users/register` endpoint
   - Click "Try it out"
   - Enter test user data
   - Click "Execute"

## Available Endpoints

### Users
- `POST /users/register` - Register a new user
- `GET /users/{user_id}` - Get user by ID
- `GET /users/` - List all users
- `DELETE /users/{user_id}` - Delete a user

### Finance
- `POST /finance/` - Create a finance record
- `GET /finance/user/{user_id}` - Get user's finance records
- `GET /finance/summary/{user_id}` - Get financial summary
- `GET /finance/{record_id}` - Get specific record
- `DELETE /finance/{record_id}` - Delete a record

### News Preferences
- `POST /news/preferences` - Create/update news preferences
- `GET /news/preferences/{user_id}` - Get user's news preferences
- `DELETE /news/preferences/{user_id}` - Delete preferences

### Workout Plans
- `POST /workout/` - Create a workout plan
- `GET /workout/user/{user_id}` - Get user's workout plans
- `GET /workout/{plan_id}` - Get specific plan
- `PATCH /workout/{plan_id}/complete` - Mark workout as completed
- `DELETE /workout/{plan_id}` - Delete a plan

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check your DATABASE_URL in `.env` is correct
- Ensure the database exists and you have permissions

### Module Import Errors
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt` again

### Port Already in Use
- Change the port in `main.py` (line with `port=8000`)
- Or stop the process using port 8000

## Next Steps

Now that Stage 1 is complete, you can:
1. Test all endpoints using the Swagger UI at `/docs`
2. Use Postman or Thunder Client for more advanced testing
3. Move on to Stage 2: Finance Agent implementation

---

## What is venv?

**venv** (virtual environment) is Python's built-in tool for creating isolated Python environments. Think of it as a separate workspace for this project that:

- Keeps this project's dependencies separate from other Python projects
- Prevents version conflicts between different projects
- Makes it easy to share exact dependency versions with others

When you see `(venv)` in your terminal, it means the virtual environment is active and you're using the project's isolated Python environment.
