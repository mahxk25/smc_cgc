# SMC Career Connect – Steps to Run

## Prerequisites

- **Node.js** (v18 or later)
- **MySQL** (server running locally or remotely)
- **npm** (comes with Node.js)

---

## Step 1: Set up the database

1. Start **MySQL** (e.g. MySQL Workbench, XAMPP, or `mysql` service).

2. **Teammates:** For a full step-by-step guide on connecting the database in MySQL Workbench (connection setup, running schema, migrations), see **[database/DATABASE_WORKBENCH.md](database/DATABASE_WORKBENCH.md)**.

3. Create the database and tables by running the schema:
   - Open **MySQL Workbench** (or your MySQL client).
   - Connect to your MySQL server.
   - Open the file: **`database/schema.sql`**  
     (path: `smc-career-connect/database/schema.sql`)
   - Execute the script (Run SQL Script / Execute).
   - This creates the database `smc_career_connect` and all required tables (including **chat** tables for company chats).

4. **If you already had the database** and are adding the chat or other features, run the migrations instead:
   - Open **`database/migrations/001_chat_tables.sql`** in MySQL and execute it (with `USE smc_career_connect;` first). This adds chat tables.
   - If the project has **`database/migrations/003_admin_features.sql`**, run that too (adds company notes, min CGPA on drives). See **database/DATABASE_WORKBENCH.md** for the full migration order.

5. **(Optional)** Add sample data:
   - From the project root, run:
     ```bash
     cd smc-career-connect/server
     npm run seed
     ```
   - This uses `server/src/db/seedRunner.js` and seed data to insert test students, admins, companies, etc.

6. **Chat:** When an admin adds a company, a chat room for that company is created automatically. Students who apply to any drive of that company can access the company chat; admins can open any company chat from **Chat** in the sidebar.

---

## Step 2: Configure the server (backend)

1. Go to the server folder:
   ```bash
   cd smc-career-connect/server
   ```

2. Create or edit the **`.env`** file in the `server` folder with your MySQL details:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=smc_career_connect
   ```
   Replace `your_mysql_password` with your actual MySQL password.

3. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```
   - You should see: **SMC Career Connect server running on port 5000**.
   - Keep this terminal open.

---

## Step 3: Run the client (frontend)

1. Open a **new terminal**.

2. Go to the client folder and start the app:
   ```bash
   cd smc-career-connect/client
   npm install
   npm run dev
   ```

3. When Vite is ready, it will show something like:
   ```text
   Local:   http://localhost:3000/
   ```

---

## Step 4: Open the app

1. In your browser go to: **http://localhost:3000**

2. From the landing page you can:
   - **Student login:** use the student portal (e.g. Department Number and DOB if you ran the seed).
   - **Placement Officer / Admin login:** use the admin portal (username/password from seed or your own admin record).

---

## Quick reference

| What              | Command / URL                                      |
|-------------------|----------------------------------------------------|
| Backend (API)     | `cd server` → `npm run dev` → runs on **port 5000** |
| Frontend          | `cd client` → `npm run dev` → runs on **port 3000** |
| Open app          | **http://localhost:3000**                          |
| Database schema   | `database/schema.sql`                              |
| Seed data         | `cd server` → `npm run seed`                       |

---

## Troubleshooting

- **“Cannot connect to database”**  
  Check MySQL is running and that `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `server/.env` are correct.

- **“Cannot GET /api/…” or network errors in browser**  
  Make sure the server is running on port 5000. The client (port 3000) proxies `/api` to the server.

- **“http proxy error” or ECONNREFUSED in the terminal (Vite)**  
  The backend is not running. In a separate terminal run: `cd smc-career-connect/server` then `npm run dev`. Keep that terminal open.

- **Blank or broken page**  
  Confirm you are visiting **http://localhost:3000** (client), not 5000 (API only).
