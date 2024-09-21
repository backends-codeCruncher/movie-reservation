<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

---

# **Movie Reservation System API**

This project is a backend API for a **Movie Reservation System** built with **NestJS** and **PostgreSQL** using **TypeORM**. It allows users to authenticate, browse movies, manage showtimes, reserve seats, and admins to manage the system and view reports.

## **Features**
- User authentication (JWT-based).
- Role-based access control (Admin/User).
- Movie management (CRUD operations).
- Showtime scheduling and seat reservation.
- Reservation reporting for admins.
- PostgreSQL database integration using TypeORM.

## **Technologies**
- **NestJS** - Backend framework.
- **PostgreSQL** - Relational database.
- **TypeORM** - ORM for database interaction.
- **Docker** (for the PostgreSQL database).

## **Prerequisites**
Ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/) (For running the **PostgreSQL** database).
- [Node.js](https://nodejs.org/) (For running the **NestJS** application).

## **Project Setup**

### 1. **Clone the repository**
```bash
git clone https://github.com/your-username/movie-reservation-system.git
cd movie-reservation-system
```

### 2. **Environment Variables**

You need to create an `.env` file in the root directory of the project to configure the application. The file should contain the following environment variables:

```bash
# .env file

# Application
NODE_ENV=development
PORT=3000

# JWT Secret
JWT_SECRET=your_jwt_secret

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=movie_reservation_db


### 3. **Docker Setup (PostgreSQL)**

You will run **PostgreSQL** in a Docker container using **Docker Compose**. The application will connect to this container to store its data.

#### 3.1 **Run the PostgreSQL Database**

To run the PostgreSQL container, use **Docker Compose**:

```bash
docker-compose up -d
```

This will start a **PostgreSQL** container with the credentials defined in the `.env` file. The container will be available at `localhost:5432`.

#### 3.2 **Stop the Database**
To stop the database, run:
```bash
docker-compose down
```

### 4. **Run the Application**

Since the application itself will be run **outside** Docker, you'll need to run the following commands on your host machine:

#### 4.1 Install Dependencies
```bash
npm install
```

#### 4.2 Run Migrations (If you have database migrations)
```bash
npm run typeorm migration:run
```

#### 4.3 Start the Application
```bash
npm run start:dev
```

The application will start in development mode and connect to the **PostgreSQL** database running in Docker. It will be available at `http://localhost:3000`.

---

## **Database Configuration**

The `docker-compose.yml` file configures the **PostgreSQL** database container. You do not need to run any separate commands for the database if you follow the steps mentioned above.

### **Docker Compose File (`docker-compose.yml`)**

```yaml
version: '3.8'
services:
  database:
    image: postgres:13
    container_name: postgres-db
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## **Seeding Admin User**

To seed the admin user into the database (only accessible in **development mode** or by admins in production), you can use the following API endpoint:

- **POST `/seed/admin`** (Dev Mode Only)

---

## **API Endpoints**

- **Auth Endpoints**:
  - `POST /auth/signup`: Register a new user.
  - `POST /auth/login`: Login to receive a JWT.

- **Movies Endpoints** (Admin Only):
  - `POST /movies`: Create a movie.
  - `PUT /movies/:id`: Update a movie.
  - `DELETE /movies/:id`: Delete a movie.
  - `GET /movies`: Get all movies.

- **Showtime Endpoints**:
  - `GET /showtimes`: Get available showtimes.
  - `POST /showtimes`: Create showtime (Admin Only).

- **Reservation Endpoints**:
  - `POST /reservations`: Create a reservation.
  - `GET /reservations`: Get user's reservations.
  - `DELETE /reservations/:id`: Cancel a reservation.

---

## **Available Scripts**

- **`npm run start`**: Starts the application.
- **`npm run start:dev`**: Starts the application in development mode with hot-reload.
- **`npm run build`**: Builds the app for production.
- **`npm run lint`**: Runs the linter for code quality.
- **`npm run test`**: Runs the unit tests.

---

## **Contributing**

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/awesome-feature`).
3. Commit your changes (`git commit -m 'Add awesome feature'`).
4. Push to the branch (`git push origin feature/awesome-feature`).
5. Open a Pull Request.
