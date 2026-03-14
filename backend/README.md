# Notes API — Backend

A simple REST API for managing notes, built with Flask, SQLAlchemy, and PostgreSQL.

## Stack

- **Flask** — web framework
- **Flask-SQLAlchemy** — ORM
- **Flask-CORS** — cross-origin resource sharing
- **PostgreSQL** — database
- **python-dotenv** — environment configuration

## Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL running locally (or update `DATABASE_URL` in `.env`)

### Setup

```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment (edit as needed)
cp .env .env.local
```

### Configure `.env`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/notes
```

Create the database if it doesn't exist:

```bash
psql -U postgres -c "CREATE DATABASE notes;"
```

### Run

```bash
python app.py
```

The API will be available at `http://localhost:5000`.

Tables are created automatically on first run.

## API Endpoints

| Method | Endpoint             | Description        |
|--------|----------------------|--------------------|
| GET    | `/api/notes`         | List all notes     |
| POST   | `/api/notes`         | Create a note      |
| GET    | `/api/notes/<id>`    | Get a note         |
| PUT    | `/api/notes/<id>`    | Update a note      |
| DELETE | `/api/notes/<id>`    | Delete a note      |

### Request/Response Examples

**POST /api/notes**
```json
{
  "title": "My Note",
  "body": "Note content here"
}
```

**Response**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "My Note",
  "body": "Note content here",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

## Data Model

| Field        | Type     | Description              |
|--------------|----------|--------------------------|
| `id`         | UUID     | Primary key              |
| `title`      | String   | Note title (required)    |
| `body`       | Text     | Note body content        |
| `created_at` | DateTime | Creation timestamp       |
| `updated_at` | DateTime | Last update timestamp    |
