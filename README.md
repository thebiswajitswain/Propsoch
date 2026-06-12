# Propsoch
# Splitwise MVP - Expense Sharing & Balance Tracking

## Overview

This project is a simplified MVP (Minimum Viable Product) inspired by Splitwise.

The application allows users to:

* Create and manage user accounts
* Create and manage shared expenses
* Automatically calculate balances between users
* View activity logs
* View net balances with other users
* Receive monthly balance reports via email

The project is built using:

* Node.js
* Express.js
* MySQL
* Sequelize ORM
* Nodemailer

---

# Features

## User Management

* Register a new user using email and password
* View user profile
* Update email and preferred currency
* Soft delete user account

### Supported Currencies

* INR
* USD
* EUR
* CHF

---

## Expense Management

Users can:

* Create an expense
* View all expenses
* View a single expense
* Update an expense
* Delete an expense

Each expense contains:

| Field       | Description                   |
| ----------- | ----------------------------- |
| Name        | Expense name                  |
| Amount      | Total expense amount          |
| Currency    | Expense currency              |
| PaidBy      | User who paid the expense     |
| Members     | Users involved in the expense |
| ExpenseDate | Expense date                  |

### Expense Split Logic

The total amount is divided equally among all members.

Example:

```json
{
    "name": "Restaurant",
    "amount": 3000,
    "paidBy": 2,
    "members": [2, 3, 4]
}
```

Calculation:

```text
3000 / 3 = 1000
```

Generated balances:

```text
User 3 owes User 2 => 1000
User 4 owes User 2 => 1000
```

The payer does not owe themselves.

---

## Balance Management

Balances are automatically generated whenever an expense is created or updated.

### Balance Structure

```text
userId  -> Person who owes money
paidTo  -> Person who should receive money
amount  -> Amount owed
reason  -> Expense name
```

Example:

```text
3 owes 2 => 1000
```

Stored as:

```text
userId = 3
paidTo = 2
amount = 1000
```

### Balance Summary

Users can view their balances with all other users.

Example:

```json
{
    "userId": 3,
    "email": "user3@example.com",
    "amount": "30000.00",
    "type": "YOU_OWE"
}
```

Balance Types:

| Type     | Meaning                        |
| -------- | ------------------------------ |
| YOU_OWE  | You owe money to another user  |
| OWES_YOU | Another user owes money to you |

---

## Activity Logs

Users can view all expenses they are involved in.

Includes:

* Expenses created by them
* Expenses created by other users where they are a participant

Supports:

* Current Month
* Last Month
* Custom Date Range

---

## Monthly Email Reports

A scheduled cron job generates monthly balance reports.

Process:

```text
Cron Job
    ↓
Fetch Users
    ↓
Calculate Net Balances
    ↓
Generate HTML Report
    ↓
Send Email via Nodemailer
```

Reports are sent automatically on the first day of every month.

---

# Project Structure

```text
src
│
├── config
│   └── database.js
│
├── controllers
│   ├── userController.js
│   ├── expenseController.js
│   └── balanceController.js
│
├── models
│   ├── userModel.js
│   ├── expenseModel.js
│   └── balanceModel.js
│
├── routes
│   ├── userRoute.js
│   ├── expenseRoute.js
│   └── balanceRoute.js
│
├── helpers
│   └── balanceHelper.js
│
├── jobs
│   └── monthlyBalanceCron.js
│
└── services
    └── mailer.js
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
cd splitwise-mvp
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file.

```env
PORT=4000

DATABASE_URL=localhost

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

## Start Application

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

---

# Database Setup

Create a MySQL database:

```sql
CREATE DATABASE splitwise;
```

The application automatically creates tables during startup.

---

# API Endpoints

## User APIs

### Register User

```http
POST /users/register
```

### Get User Profile

```http
GET /users/:userId
```

### Update User

```http
PUT /users/:userId
```

### Delete User

```http
DELETE /users/:userId
```

---

## Expense APIs

### Create Expense

```http
POST /expenses/createExpense
```

### Get All Expenses

```http
GET /expenses/getAllExpenses
```

### Get Expense By ID

```http
GET /expenses/:expenseId
```

### Update Expense

```http
PUT /expenses/:expenseId
```

### Delete Expense

```http
DELETE /expenses/:expenseId
```

---

## Activity APIs

### Current Month Activity

```http
GET /expenses/activity?userId=1&type=currentMonth
```

### Last Month Activity

```http
GET /expenses/activity?userId=1&type=lastMonth
```

### Custom Date Range Activity

```http
GET /expenses/activity?userId=1&startDate=2026-01-01&endDate=2026-06-30
```

---

## Balance APIs

### View Balances

```http
GET /balances/getBalances/:userId
```

Returns net balances with all users.

---

# Design Decisions

### Why Store Members as JSON?

For this MVP, members are stored as a JSON array inside the Expense table.

Example:

```json
{
    "members": [2,3,4]
}
```

This keeps the implementation simple and reduces the number of tables required.

In a production-grade application, a separate ExpenseMembers junction table would be preferable.

---

### Why Recalculate Balances on Update?

Whenever an expense is updated:

1. Existing balance records for the expense are removed.
2. New balances are generated from the updated expense.

This approach:

* Handles member additions/removals
* Handles amount changes
* Handles payer changes
* Prevents stale balances
* Simplifies maintenance

---

### Why Use Soft Delete?

Users and expenses use Sequelize's `paranoid` mode.

Deleted records are not physically removed from the database.

Benefits:

* Data recovery
* Audit history
* Safer operations

---

# Future Improvements

* Authentication & Authorization
* JWT-based login
* Expense categories
* Settlement APIs
* Currency conversion support
* Pagination
* Email templates
* Notifications
* Expense comments
* Group expenses
* Real-time updates

---

# Author

Developed as a Splitwise MVP assignment using Node.js, Express, Sequelize, and MySQL.

All application logic, balance calculations, expense management workflows, and API implementations were designed and implemented specifically for this project.
