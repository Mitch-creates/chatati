# Chatati

The project was made with the following tools and techs:

- **Node.js** - JavaScript runtime environment
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container Docker orchestration
- **Prisma** - Database ORM and migration tool
- **PostgreSQL** - Database (implied by Docker Compose usage)
- **Zod** - For form validation
- **next-intl** - Internationalization and localization
- **Better Auth** - Authentication solution

## Setup

### Prerequisites

- Node.js
- Docker
- Docker Compose

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd chatati
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `DATABASE_URL`: Already configured for the Docker setup (matches docker-compose.yml)
- `BETTER_AUTH_SECRET`: Generate a secure random string (e.g., `openssl rand -base64 32`)
- `BETTER_AUTH_URL`: Your application URL (default: `http://localhost:3000`)
- `RESEND_API_KEY`: (Optional) Get from [Resend](https://resend.com/api-keys) if you need email functionality
- `EMAIL_FROM`: (Optional) Defaults to `noreply@chatati.de` if not set

4. Start the database with Docker. Make sure to first already launch Docker

```bash
docker-compose up -d
```

5. Run Prisma migrations

```bash
npx prisma migrate dev
```

6. Generate Prisma client

```bash
npx prisma generate
```

7. Start the development server

```bash
npm run dev
```

## Useful Commands

### Prisma

#### Full code to create a migration:

1. Stop Dev server with Ctrl + C
2. run either the following command to update

```bash
npx prisma migrate dev --name update_auth_schema
```

3. Or the following to completely reset the database

```bash
npx prisma migrate reset
```

4. Generate the Prisma Client.

```bash
npx prisma migrate reset
```

#### Other Prisma commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

### Docker

```bash
# Start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs

# Rebuild containers
docker-compose up --build
```

## Decisions that were made

_1. E-mail verification_
I was considering demanding email verification right from the start. Showing a message after sign up that a mail was sent and guiding the user back to sign in page after clicking the verify link in their mail. Not allowing the user to log in before clicking on that verify link.
I read on several blog posts how this can really throw off users from the very start and reduce 'conversion rate'. I don't want to lose potential users, while still maintaining safety (real users).
Another reason is that the ideal onboarding consists of signing up and immediately being guided to profile creation. Which would still be possible with email verification in between, but it wouldn't be as smooth.
So I've decided to instead;
**- Allow users to log in to the application directly after sign up and use the application EXCEPT for adding users to their favorites, sending a meet-request or accepting a meet-request.**
**- Get a captcha on the sign up form instead to reduce fake users(bots)**
