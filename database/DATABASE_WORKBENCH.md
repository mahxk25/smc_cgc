# How to Connect the Database to MySQL Workbench

This guide is for teammates who need to set up the **SMC Career Connect** database using MySQL Workbench.

---

## Prerequisites

- **MySQL Server** installed and running (e.g. from [MySQL Installer](https://dev.mysql.com/downloads/installer/), XAMPP, or Homebrew).
- **MySQL Workbench** installed ([download](https://dev.mysql.com/downloads/workbench/)).

Make sure the MySQL service is started (e.g. from Services on Windows, or `brew services start mysql` on macOS).

---

## Step 1: Create a connection in MySQL Workbench

1. Open **MySQL Workbench**.
2. On the home screen, under **MySQL Connections**, click **“+”** (or **Add new connection**).
3. Fill in the connection details:

   | Field | Value | Notes |
   |-------|--------|--------|
   | **Connection Name** | `SMC Career Connect` (or any name you like) | Label for this connection |
   | **Connection Method** | `Standard (TCP/IP)` | Default |
   | **Hostname** | `127.0.0.1` or `localhost` | Use this for local MySQL |
   | **Port** | `3306` | Default MySQL port |
   | **Username** | `root` | Or your MySQL user |
   | **Password** | *(your MySQL password)* | Click **“Store in Keychain…”** / **“Store in Vault…”** to save it |

4. (Optional) Under **Default Schema**, you can leave it blank for now; we’ll create/select the database when running the script.
5. Click **“Test Connection”**. You should see **“Successfully made the MySQL connection”**.
6. Click **OK** to save the connection.

---

## Step 2: Connect to the server

1. On the MySQL Workbench home screen, double‑click your **SMC Career Connect** (or whatever you named it) connection.
2. A new SQL tab opens and you are connected to your MySQL server.

---

## Step 3: Create the database and tables (fresh setup)

If this is the **first time** setting up the project (no existing `smc_career_connect` database):

1. In MySQL Workbench, go to **File → Open SQL Script** (or press `Ctrl+O` / `Cmd+O`).
2. Navigate to the project folder and open:
   ```
   smc-career-connect/database/schema.sql
   ```
3. Click the **lightning bolt** icon (Execute) or press `Ctrl+Shift+Enter` / `Cmd+Shift+Enter` to run the entire script.
4. The script will:
   - Create the database `smc_career_connect`
   - Create all tables (students, admins, companies, drives, applications, offers, events, notifications, audit_logs, chat tables, etc.).
5. In the **Schemas** panel on the left, click the **refresh** icon. You should see **`smc_career_connect`**.
6. Expand it and confirm tables like `students`, `admins`, `companies`, `drives`, etc., are listed.

You’re done with the database setup. You can skip to **Step 5** to configure the app.

---

## Step 4: Run migrations (if the database already exists)

If the database **already exists** (e.g. you pulled the project after others set it up) and you only need to add **new** features (chat, company notes, min CGPA, etc.):

1. In MySQL Workbench, make sure you’re using the right database:
   - In the **Schemas** panel, double‑click **`smc_career_connect`** to set it as default, **or**
   - In the SQL tab, run:
     ```sql
     USE smc_career_connect;
     ```
2. Run each migration file **in order** (only the ones you don’t have yet):
   - **File → Open SQL Script** → open `database/migrations/001_chat_tables.sql` → Execute.
   - **File → Open SQL Script** → open `database/migrations/002_student_resume.sql` (if present) → Execute.
   - **File → Open SQL Script** → open `database/migrations/003_admin_features.sql` → Execute.
3. If a migration fails with “table already exists” or “duplicate column”, that part is already applied; you can ignore that error and continue.

---

## Step 5: Use the same settings in the app

So the **backend** can connect to the same database:

1. In the project, go to the **server** folder and create or edit **`.env`**:
   ```
   smc-career-connect/server/.env
   ```
2. Set these to **match** the connection you use in Workbench:

   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=smc_career_connect
   ```

   Replace `your_mysql_password` with the same password you used in Workbench.

3. Save the file. When you run the server (`npm run dev` in `server`), it will connect to the same database you see in Workbench.

---

## Quick reference

| Item | Value |
|------|--------|
| Database name | `smc_career_connect` |
| Default port | `3306` |
| Main schema file | `database/schema.sql` |
| Migrations | `database/migrations/001_chat_tables.sql`, `003_admin_features.sql`, etc. |
| App config | `server/.env` (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) |

---

## Troubleshooting

- **“Cannot connect to MySQL server”**  
  Check that the MySQL service is running. In Workbench, confirm Hostname (e.g. `127.0.0.1`), Port (`3306`), Username, and Password.

- **“Access denied for user”**  
  Wrong username or password. Use the same credentials that work when you log in to MySQL from the command line or another tool.

- **“Unknown database 'smc_career_connect'”**  
  Run the full **schema.sql** (Step 3) once to create the database and tables.

- **Server says “Cannot connect to database”**  
  Ensure `server/.env` has the same `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` as the connection you use in Workbench.

For running the app (backend + frontend) and seeding data, see the main **RUN_STEPS.md** in the project root.
