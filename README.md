# Hardware Hub Booksy

![Hardware Hub](https://img.shields.io/badge/Status-Active-brightgreen)
![Django](https://img.shields.io/badge/Backend-Django_&_DRF-092E20?logo=django)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)

## Deployed at

!!! NOTE: First request may take up to 1 minute to load because of the free hosting plan which puts backend to sleep after 15 minutes of inactivity.
<https://hardware-hub-mondel.vercel.app>

---

## Fully Implemented Features

- **Secure Authentication:** Custom User model implementing secure, HTTP-only cookie-based authentication via `djangorestframework-simplejwt`.
- **Hardware Management:** Complete lifecycle management for hardware: statuses explicitly separate into `Available`, `In Use`, and `Repair`.
- **Rental Tracking:** Keeps track of active and transactions, connecting physical equipment directly to the users responsible for them.
- **AI Semantic Search:** AI will filter for you. Ask the **Intelligent Search** (powered by Google Gemini) using natural language: *"I need a powerful laptop for graphic design"* and strictly available matching equipment is returned.
- **Admin Interface:** Administrators can update equipment states, flag for repair without renting, add, edit hardware information, and delete retired equipment.
- **Data Import Utility:** Ships with a custom Django management command (`load_seed_data.py`) to easily ingest initial or bulk hardware sets from JSON.

---

## Shortcuts & Hacks

### 1. Auto-creating users from imported JSON

**Shortcut:**  
If the initial JSON dataset contains hardware assigned to a user (`assignedTo`), and that user does not exist in the system, the application automatically creates a new user using their email and assigns a default password sourced from an environment variable.

**The Why:**  
For demo purposes, this approach is acceptable because the system does not implement a "Forgot password?" feature on the login screen. Without this shortcut, newly created users would not be able to access their accounts.

**The Future:**  
In a production environment, I would use Django’s built-in `set_unusable_password()` method. This would allow creating users without a valid password, forcing them to set one securely via a proper "Forgot password" flow.

---

### 2. Incomplete PostgreSQL handling in production

**Shortcut:**  
The PostgreSQL integration is not fully stable. During early development, some operations (e.g., equipment rental) caused unpredictable behavior, such as records appearing to “jump” in tables.

**The Why:**  
This was acceptable because the application was originally designed to work with SQLite, as per initial project assumptions. PostgreSQL was only introduced at the deployment stage due to limitations of free hosting solutions and data volume considerations.

**The Future:**  
In a production setup, I would fully migrate away from SQLite and adapt the application entirely for PostgreSQL, ensuring proper transaction handling, consistency, and scalability.

---

### 3. Partially functional Django admin panel (FIXED)

**Shortcut:**  
The Django admin panel does not fully support creating new users due to the use of a custom user model.

**The Why:**  
This was acceptable because user creation is handled within the application itself, making the admin panel less critical for this functionality during development.

**The Future:**  
I would extend and properly configure the Django admin panel to fully support the custom user model, including user creation and management.

---

## Partial / Missing

### 1. AI-powered semantic search works end-to-end but needs to be fully optimized for production
In current setup it processes the entire dataset as input and does not validate the AI-generated output (it trusts the AI 100% so it's either HTTP500 or it works). This approach negatively impacts scalability and significantly increases token usage.

Missing improvements:
- embeddings + vector search instead of full dataset prompting
- structured validation of output instead of being 100% reliable on AI
- fallback mechanism when AI fails or returns invalid data

---

## The 24H Roadmap
If I had 24 hours to improve this project, besides everything listed in "Partial / Missing" and "Shortcuts & Hacks" sections, I would:
- Implement pagination for scalability (Partially fixed - frontend only)
- Improve frontend error handling in some cases
- Implement "Forgot Password" feature on the Login page
- Added rental logs for an Administrator (which hardware was rented by whom and when)
- Implement notes for hardware, if user damaged it, he should be able to add notes about it (and admin should be able to see it)

## Tech Stack

### Frontend
- **Framework:** Next.js (TypeScript)
- **Styling:** Tailwind CSS (v4)
- **Data Fetching:** Axios & `@tanstack/react-query`
- **UI Icons:** Lucide React

### Backend
- **Framework:** Django & Django Rest Framework (DRF)
- **Database:** SQLite (Local) & PostgreSQL (Production)
- **Authentication:** JWT via HTTP-only Cookies (`access_token` and `refresh_token`, SameSite=Lax)
- **Semantic Search AI Engine:** Google AI / Gemini API (`gemini-2.5-flash-lite`)

---

## Local Setup & Installation

Follow these instructions to run the project locally.

### 1. Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the Python dependencies (I used Python 3.13.12):
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend root directory and add the necessary variables, e.g.:
   ```env
   SECRET_KEY=your-django-secret-key
   DEBUG=True
   GEMINI_API_KEY=your-google-gemini-api-key
   SEED_USER_PASSWORD=your-seed-user-password
   ```

5. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create a Django superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Ensure proper equipment ordering locally by loading seed data (optional):
   ```bash
   python manage.py load_seed_data seed_data.json
   ```

8. Start the development server:
   ```bash
   python manage.py runserver
   ```
   *The backend will be available at `http://127.0.0.1:8000/`*

### 2. Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the necessary node modules:
   ```bash
   npm install
   ```

3. Ensure you have the proper API rewrite setup in `next.config.ts`. In development, requests to the backend are already rewritten to `http://127.0.0.1:8000` to prevent CORS issues.

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:3000/`*

---

## Production Deployment

- **Backend:** Configured for deployment on **Render**. Requires environment variables for PostgreSQL (`DATABASE_URL`), `SECRET_KEY`, `DEBUG=False`, and the `GEMINI_API_KEY`. Static files are served using Whitenoise. Ensure `secure=True` is enabled in `views.py` for cookies.
- **Frontend:** Next.js app is ideally deployed to platforms like **Vercel** or **Render**. Ensure the `NEXT_PUBLIC_BACKEND_URL` points to the hosted backend URL (e.g., your Render domain).

## Security Notes
- JWT access and refresh tokens are securely embedded in `HttpOnly`, `Secure`, and `Strict` cookies, preventing XSS-based token exfiltration.
- Guard clauses and atomic DB transactions limit race-conditions when multiple users attempt to rent single-quantity hardware simultaneously.

---
