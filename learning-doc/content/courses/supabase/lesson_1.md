# 🎓 **Lesson 1: Introduction to Supabase and Backend-as-a-Service**

## 🎯 Learning Objectives

- Clearly understand the concept of **Backend-as-a-Service (BaaS)**
- Understand **what Supabase is**
- Know how to **install Supabase on a personal computer using Docker**.

## 📝 Detailed Content

### 🔹 1. What is Backend-as-a-Service (BaaS)?

**BaaS** is a model for providing ready-to-use backend services over the Internet.

💡 Example:
Instead of manually setting up a database and writing user registration APIs, you only need to:

- Configure the `users` table in Supabase
- Call the provided APIs via Postman or your frontend

### 🔹 2. What is Supabase?

Supabase is an **open-source BaaS platform** built on **PostgreSQL**, providing:

- Relational Database (PostgreSQL)
- Auto-generated APIs (RESTful)
- Authentication
- Storage (file management)
- Real-time updates

### 🔹 3. Comparing Supabase with Firebase and other BaaS platforms

| Criteria       | Supabase               | Firebase          | AWS Amplify    |
| -------------- | ---------------------- | ----------------- | -------------- |
| Source Code    | ✅ Open-source         | ❌ Proprietary    | ❌ Proprietary |
| Database       | PostgreSQL             | Firestore         | DynamoDB       |
| Real-time      | ✅ Yes                 | ✅ Yes            | ✅ Yes         |
| Self-hosting   | ✅ Yes                 | ❌ No             | ✅ Yes         |
| Learning Curve | ✅ Familiar PostgreSQL | ❌ Custom Queries | ❌ Complex     |

### 🔹 4. Overall Architecture of Supabase

```
┌────────────┐        ┌───────────────┐        ┌──────────────┐
│ Client App │──────▶│ Supabase API  │──────▶│ PostgreSQL DB │
└────────────┘        └───────────────┘        └──────────────┘

```

### 🔹 5. What Makes Supabase Stand Out?

- **Auto-generated APIs**:
- **Real-time**:
- **Native PostgreSQL**:

## 💻 Practice: Creating the `users` table and testing the API with Postman

### 🔧 Step 1: Installing Supabase with Docker

```bash
git clone https://github.com/supabase/supabase.git
cd supabase/docker
docker compose up
```

Wait a few minutes and access:
👉 [http://localhost:8000](http://localhost:8000)
(Supabase Studio UI)

### 🔧 Step 2: Creating the `users` table

Go to **Supabase Studio > Table Editor > New Table**
Table Information:

| Column     | Type      | Options               |
| ---------- | --------- | --------------------- |
| id         | uuid      | Primary key, auto-gen |
| email      | text      | Unique, not null      |
| name       | text      |                       |
| created_at | timestamp | Default: now()        |

### 🔧 Step 3: Testing the `users` API with Postman

🔑 API URL:

```
http://localhost:8000/rest/v1/users
```

✅ **How to create a policy:**

```sql
-- Allow SELECT for all data for everyone
create policy "Allow all select"
on users
for select
using (true);
```

## 🔑 Key Points to Remember

| Objective             | Note                                                |
| --------------------- | --------------------------------------------------- |
| What is Supabase      | Open-source BaaS using PostgreSQL                   |
| How APIs work         | Each table automatically generates a RESTful API    |
| Don't forget API Keys | Each request needs `apikey` + `Authorization`       |
| Note on UUID          | The `id` field usually uses auto-gen UUID           |
| Docker                | Supabase can be installed locally or used via cloud |

## 📝 Homework

### 🧠 Task

**Create a `products` table** with the following columns:

| Column     | Type      | Notes                  |
| ---------- | --------- | ---------------------- |
| id         | uuid      | Primary key, auto-gen  |
| name       | text      | Product name, not null |
| price      | numeric   | Price, not null        |
| created_at | timestamp | Default: now()         |

**Requirements:**

1. Use the Table Editor to create the `products` table.
2. Use Postman to:

   - Retrieve the list of products

**Hint:**

- Use the API headers as shown in the practice section.
- Verify the returned JSON in Postman.
