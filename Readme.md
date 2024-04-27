# Node.js Book Management System

This is a simple Node.js project for managing users and books using a basic HTTP server. Users and books are stored in JSON files in the working directory.

## Features

- Create new users
- Authenticate users
- Get all users
- Create new books
- Delete books
- Loan out books
- Return books
- Update book information
- Get book by ID
- Get all books

## Setup

1. Clone the repository:


2. Install dependencies:


3. Run the server:


The server will start running at `http://localhost:3000`.

## API Endpoints

- **Create User**: `POST /users`
- **Authenticate User**: `POST /users/authenticate`
- **Get All Users**: `GET /users`
- **Create Book**: `POST /books`
- **Delete Book**: `DELETE /books/:id`
- **Loan Out Book**: `POST /books/loan/:id`
- **Return Book**: `POST /books/return/:id`
- **Update Book**: `PUT /books/:id`
- **Get Book by ID**: `GET /books/:id`
- **Get All Books**: `GET /books`

Replace `:id` with the actual ID when making requests to routes that require an ID parameter.

## Sample Data

Sample user and book data is stored in JSON files (`users.json` and `books.json`) in the working directory.

