# Clinic Appointment API

Express and MongoDB API for patient registration, doctor appointments, and clinic administration.

## Setup

1. Install Node.js 20 or later and MongoDB.
2. From this directory, run `npm install`.
3. Copy `.env.example` to `.env` and set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and the admin account values.
4. Create the first admin with `npm run seed:admin`.
5. Start the API with `npm start`. It listens on port 3000 by default.

For same-site browser deployments, send requests with credentials enabled. Cookies use `SameSite=Lax`; cross-site clients can use the returned JWT as a bearer token. The hosted frontend origin is allowlisted by default. `CORS_ORIGINS` can add other trusted origins as a comma-separated list.

### Vercel deployment

Deploy the latest backend source to the Vercel project serving the API. In that project's Environment Variables, set `MONGODB_URI` and `JWT_SECRET`; Vercel does not read the local `.env` file. Set `CORS_ORIGINS` to include `https://final-hackathon-practice-q631.vercel.app`, then redeploy. The checked-in default also includes this frontend origin. Database connections are opened on demand as well as during server startup, so the API works in serverless deployments.

## API

All responses are JSON. Login and registration set an HTTP-only `token` cookie and return a JWT for clients that prefer an `Authorization: Bearer <token>` header. Passwords are never returned.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Register a patient (`name`, `email`, `password`) |
| POST | `/api/auth/login` | Public | Log in with `email` and `password` |
| POST | `/api/auth/logout` | Public | Clear the login cookie |
| GET | `/api/auth/me` | Any signed-in user | Return the current profile |
| GET | `/api/doctors` | Public | List doctors and their availability; optional `search` and `specialization` filters |
| GET | `/api/doctors/:id` | Public | Get a doctor's profile and availability |
| POST | `/api/appointments` | Patient | Request an appointment (`doctorId`, `appointmentDate` as `YYYY-MM-DD`, `appointmentTime` as `HH:mm`, `reason`) |
| GET | `/api/appointments/my` | Patient | List the signed-in patient's appointments |
| PATCH | `/api/appointments/:id/cancel` | Patient | Cancel a pending appointment |
| GET | `/api/appointments/doctor` | Doctor | List appointments assigned to the signed-in doctor |
| PATCH | `/api/appointments/:id/status` | Assigned doctor | Set a pending appointment to `approved`, or `rejected` with a required `rejectionReason` (for example, `{ "status": "rejected", "rejectionReason": "Unavailable at the requested time" }`) |
| GET | `/api/admin/users` | Admin | List users; optional `role`, `search`, `page`, and `limit` filters |
| POST | `/api/admin/doctors` | Admin | Create a doctor (`name`, `email`, `password`, `specialization`, `experience`, and `availability: { availableDays, startTime, endTime }`) |
| DELETE | `/api/admin/users/:id` | Admin | Deactivate a doctor or patient while retaining appointment history; pending/approved doctor appointments are cancelled |
| PATCH | `/api/admin/users/:id/activate` | Admin | Reactivate a deactivated doctor or patient |
| GET | `/api/admin/appointments` | Admin | List appointments; optional `search`, `status`, `page`, and `limit` filters |
| GET | `/api/admin/stats` | Admin | Get patient, doctor, and appointment totals |
| GET | `/api/health` | Public | Health check |

Public registration always creates a patient; doctor accounts are created by admins, and admin accounts are provisioned with the seed command. Doctor availability uses weekday names and 24-hour times, for example `{ "availableDays": ["Monday", "Wednesday"], "startTime": "09:00", "endTime": "17:00" }`. Existing doctors and older create requests default to Monday-Friday, 09:00-17:00. Booking requests outside a doctor's schedule are rejected by the API. Helmet adds standard security headers to API responses. Patients can only access their own appointments, and doctors can only update appointments assigned to them. Pending and approved appointments reserve a doctor's date/time slot. Doctors must provide a decline reason; patients can see it on their appointment. Deactivated doctors remain visible in the directory as unavailable; their pending and approved appointments are cancelled with a cancellation reason. Reactivating a doctor does not restore previously cancelled appointments.
