# CampusHub — College Clubs & Events Platform

Full-stack platform with Next.js frontend, Express backend, MongoDB, and Cloudinary.

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev            # runs on :5000
```

### Frontend
```bash
cd frontend
npm install
# .env.local already has NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev            # runs on :3000
```

## Create Super Admin
After starting the backend, run this in MongoDB shell or Compass:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "super_admin" } })
```

## Environment Variables

### Backend `.env`
| Key | Description |
|-----|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `CLOUDINARY_*` | Cloudinary credentials |
| `EMAIL_*` | SMTP credentials for notifications |
| `CLIENT_URL` | Frontend URL for CORS |

## Roles
| Role | Access |
|------|--------|
| `user` | Browse clubs/events, register for events, submit club requests |
| `club_admin` | Manage own club, create/edit/delete events, view participants |
| `super_admin` | Full access — manage all users, clubs, events, approve requests |

## API Endpoints
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/clubs` — List clubs (search, filter, paginate)
- `GET /api/events` — List events
- `POST /api/events` — Create event (club_admin)
- `POST /api/club-requests` — Submit club request
- `PATCH /api/club-requests/:id/review` — Approve/reject (super_admin)
- `GET /api/users` — List users (super_admin)
- `GET /api/users/analytics` — Dashboard stats (super_admin)
