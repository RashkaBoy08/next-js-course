# TaskFlow

A simple task manager built for the one-week project. It has account sign-in, a personal task board, and a drag-and-drop feature.

## Chosen stack

- **Authentication:** Clerk handles account creation, sign-in, and the signed-in session.
- **Database and ORM:** PostgreSQL stores users and tasks. Prisma connects the app to the tables and keeps task queries organized. Neon can host the PostgreSQL database.
- **Advanced feature:** The board lets you drag a task between To do, In progress, and Done. A status menu is also available for touch screens.
- **App:** Next.js 15 with the App Router and Tailwind CSS.

## What is included

- A landing page, Clerk sign-in and sign-up pages, and a personal dashboard.
- Create, edit, search, move, and delete tasks.
- Optional task descriptions and due dates.
- Server-side checks so each signed-in person can read and change only their own tasks.
- Loading, empty, and error states, plus a responsive layout.
- A PostgreSQL schema and a first database migration.

## Run it on your computer

You will need Node.js 20.9 or later, npm, and your own Clerk and PostgreSQL accounts. The app can show its homepage without those accounts, but sign-in and saved tasks need the setup below.

### 1. Install the packages

Open PowerShell in this `taskflow` folder and run:

```powershell
npm install
Copy-Item .env.example .env.local
```

### 2. Connect Clerk sign-in

1. Create a Clerk account and a new application in its dashboard.
2. Open that application's API keys page.
3. Put the **Publishable Key** after `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=` in `.env.local`.
4. Put the **Secret Key** after `CLERK_SECRET_KEY=` in `.env.local`.

Keep `.env.local` private. Do not commit it or send its secret key in chat.

### 3. Connect PostgreSQL

1. Create a PostgreSQL project with Neon, or use another hosted PostgreSQL database.
2. Copy the **pooled** connection string into `DATABASE_URL` in `.env.local`.
3. Copy the **direct** connection string into `DIRECT_URL` in `.env.local`.

The pooled URL is used by the app. The direct URL is used when Prisma applies database changes. Keep both private.

### 4. Make the tables and start TaskFlow

```powershell
npm run db:generate
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`. Create an account, add a task, and try moving it across the board. The first migration creates the User and Task tables.

If npm asks you to approve package setup scripts, approve the scripts for `prisma`, `@prisma/engines`, and `esbuild`, then rerun `npm run db:generate`.

## Publish it

1. Push the `taskflow` project to a GitHub repository.
2. Import that repository into Vercel.
3. Add the same four variables from `.env.local` in the Vercel project's Environment Variables settings.
4. Apply the database migration with `npm run db:migrate` from a computer where `DIRECT_URL` is configured.
5. Deploy the project from Vercel and open its public link.

Do not put real keys in this README or in GitHub. The `.env.example` file only lists the variable names.

## How to explain the main pieces

These notes are here to help you learn the project. Read the code and explain it in your own words during the presentation.

- **Sign-in:** Clerk checks who is signed in. The server gets that account's user ID before it handles task requests.
- **Database:** The `User` table stores the account ID and email. The `Task` table stores the task details and its owner's ID. A task's `userId` connects it to a user.
- **ORM:** Prisma lets the app create and look up typed database records using TypeScript. The schema is in `prisma/schema.prisma`; the first SQL migration is in `prisma/migrations`.
- **Privacy:** Every task API request includes the signed-in user's ID in its database query. Updating or deleting a task also checks the owner, so knowing another task's ID is not enough to change it.
- **Drag and drop:** Each task card can be dragged onto another status column. The app sends the new status to the API, which saves it in PostgreSQL. The status menu provides another way to move tasks on a phone or tablet.
- **API routes:** `app/api/tasks/route.ts` lists and creates tasks. `app/api/tasks/[taskId]/route.ts` updates and deletes one task.

## Suggested 10-minute demo

1. Introduce TaskFlow and the tools you chose.
2. Sign in and show the task board.
3. Add a task with a short description and due date.
4. Edit the task, search for it, and drag it into another column.
5. Delete a task and show how the counts change.
6. Explain how the app ties tasks to the signed-in account and show the User and Task models in the Prisma schema.

## If something does not connect

- **Sign-in shows a setup message:** Check that both Clerk keys are present in `.env.local`, then restart the development server.
- **Tasks show a database message:** Check that `DATABASE_URL` and `DIRECT_URL` are correct and that `npm run db:migrate` completed.
- **You changed the schema:** Run `npm run db:migrate:dev` while developing, then commit the new migration folder.
