# 🚀 CodeXa - Full-Stack Competitive Programming & Interview Practice Platform

A full-stack, enterprise-grade coding practice platform built based on the provided MySQL database schema and page designs.


---

## 💻 Tech Stack

### Backend
- **Framework**: Spring Boot 4.x / Spring 6 (Java 25)
- **Security**: Spring Security 6 with stateless JWT Bearer token authentication & role-based access control (`ADMIN`, `STUDENT`)
- **Database / ORM**: Spring Data JPA & Hibernate with MySQL compatibility mode and full DDL matching the schema:
  - `users`
  - `problems`
  - `test_cases`
  - `submissions`
  - `submission_results`
  - `leaderboard_entries`
- **Judge Engine**: Multi-language real-time code evaluation engine (executing JavaScript via Node.js 24, Java via JDK 25, Python, and C++) with input redirection, execution timing, memory measurement, output normalization, and hidden judge test case evaluation.

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Dark Theme (LeetCode-inspired UI)
- **Icons**: Lucide React
- **Routing**: React Router DOM v6 with protected Student and Admin routes
- **Networking**: Axios with JWT request interceptors and auto-token management

---

## 📱 Implemented Pages & Features

### 1. Public Pages
- **Home Page (`/`)**:
  - Hero section with live platform metrics
  - Features section (Automated Judge, Multi-Language, Global Rankings, Personal Analytics)
  - About section (Mission, Topic focus, Learning pathways)
  - Code Editor visual showcase
  - Call to action with 1-click test login
- **Login Page (`/login`)**:
  - Email/Password form
  - **1-Click Instant Demo Login** buttons for Student and Admin
- **Register Page (`/register`)**:
  - Account creation with role selection (Student or Admin)

### 2. Student Experience
- **User Dashboard (`/dashboard`)**:
  - Key metrics: Solved problems, Global Rank, Total Points, Acceptance Rate
  - Difficulty Mastery bars: Easy, Medium, Hard breakdown
  - Topics Conquered tags (Arrays, Strings, Dynamic Programming, Two Pointers, etc.)
  - Recent Submissions table
  - Direct link to continue practicing
- **Problem Catalog (`/problems`)**:
  - Real-time search by title or keyword
  - Difficulty filter pills (`Easy`, `Medium`, `Hard`)
  - Topic dropdown selector
  - Status filter pills (`Solved`, `Attempted`, `Unsolved`)
  - Responsive table with solve buttons
- **Problem Detail & Interactive IDE (`/problems/:id`)**:
  - Split-pane layout (Problem details on left, Code editor & console on right)
  - Left panel: Description, Example I/O with **1-click Copy buttons**, Constraints, Hints & Submissions history
  - Right panel:
    - Language switcher: **JavaScript (Node.js)**, **Java**, **Python 3**, **C++**
    - Code editor with starter boilerplate code
    - Sample test cases tabs and Custom Input runner
    - **"Run Code"**: Tests against public sample cases
    - **"Submit Solution"**: Evaluates against all hidden test cases, updates points, and calculates leaderboard position
    - Real-time console with verdict badge, execution time (ms), memory (MB), and output diff
- **My Submissions (`/submissions`)**:
  - Complete history of submissions with verdict status badges (`ACCEPTED`, `WRONG_ANSWER`, `TIME_LIMIT_EXCEEDED`, etc.)
  - **"View Code"** modal with formatted code viewer and copy button
- **Global Leaderboard (`/leaderboard`)**:
  - Top 3 Podium (Gold, Silver, Bronze badges)
  - Full ranking table highlighting the logged-in user
  - Points system: Easy (10 pts), Medium (20 pts), Hard (30 pts)

### 3. Admin Experience
- **Admin Dashboard (`/admin`)**:
  - Platform health overview: Total Users, Total Students, Total Admins, Total Problems, Submissions count, Platform Acceptance %
  - Problems breakdown by difficulty
  - Live feed of all platform submissions
- **Manage Problems (`/admin/problems`)**:
  - Full table of challenges with Edit, Delete, and Test Case management links
- **Create / Update Problem (`/admin/problems/new`, `/admin/problems/edit/:id`)**:
  - Form for Title, Difficulty, Topic, Description, Constraints, Sample Input, Sample Output
- **Manage Test Cases (`/admin/problems/:id/test-cases`)**:
  - Inspect, Add, Edit, and Delete test cases
  - Toggle between **Public Sample Cases** and **Hidden Judge Cases**

---

## 🛠 Running the Project

### Start Backend
```bash
cd backend
./mvnw.cmd spring-boot:run
```

### Start Frontend
```bash
cd frontend
npm.cmd run dev
```

### Switching to MySQL (Optional)
To use a local MySQL 8.0 server:
1. Ensure MySQL is running on `localhost:3306` with database `codepractice`.
2. Activate the `mysql` profile:
```bash
./mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=mysql
```
