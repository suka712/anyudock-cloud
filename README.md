# AnyuDock (暗语-S3)

Pronounced *anyu* (ahn-yoo)

Simple S3 file storage for sharing files and env configs between machines. Brutalist by design, minimal by nature.

Live at [anyudock.cloud](https://anyudock.cloud)

## Stack

- **API** — [Hono](https://hono.dev) + [Bun](https://bun.sh), Drizzle ORM, PostgreSQL
- **Client** — React, TanStack Router/Query, Tailwind CSS, Vite
- **Storage** — Any S3-compatible provider
- **Auth** — Email OTP via [Resend](https://resend.com), JWT session cookies

## Setup

### 1. API

```bash
cd api
cp .env.example .env
```

Fill in `api/.env`:

```
PORT=8080
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgres://user:password@localhost:5432/anyudock
RESEND_API_KEY=re_xxxxxxxxxxxx
ALLOWED_ORIGINS=http://localhost:5173
S3_ENDPOINT=https://your-s3-endpoint.com
S3_BUCKET_NAME=your-bucket
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
```

Run migrations and start:

```bash
bun install
bun run db:migrate
bun run dev
```

### 2. Client

```bash
cd client
cp .env.example .env
```

Fill in `client/.env`:

```
VITE_API_URL="http://localhost:8080"
```

```bash
bun install
bun run dev
```

## API Routes

All file routes are under `/file`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/file` | Yes | Upload a file |
| `GET` | `/file` | Yes | List user's files |
| `GET` | `/file/:key/view` | Yes | Preview a file (redirect to S3) |
| `GET` | `/file/:key/download` | No | Download a public file (redirect to S3) |
| `PATCH` | `/file/:key/privacy` | Yes | Toggle file privacy |
| `DELETE` | `/file/:key` | Yes | Delete a file |
| `POST` | `/file/:key/share` | Yes | Generate a share link (public files only) |
| `GET` | `/file/shared/:token` | No | Access a file via share link |

Auth routes are under `/auth`:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/send-otp` | Send OTP to email |
| `POST` | `/auth/verify-otp` | Verify OTP and set session cookie |
| `POST` | `/auth/signout` | Clear session |
| `GET` | `/auth/me` | Get current user |

## File Privacy

- Files are **private by default** on upload
- Private files can only be previewed/managed by the owner
- Public files can be downloaded by anyone with the file ID
- Only public files can have share links generated

## Contributors

Anh D Tran, Bush, khiem, suka712, Thai, Trinh Thu
