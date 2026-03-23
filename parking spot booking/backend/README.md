# Parking Spot Finder Backend

Spring Boot backend for the Parking Spot Finder frontend.

## Tech stack
- Java 25
- Spring Boot 3
- Spring Web
- Spring Security (JWT)
- Spring Data JPA / Hibernate
- MySQL
- Maven

## Prerequisites
- JDK 25
- Maven 3.9.11 or newer

## Local run
1. Set DB env vars before start:
   - `DB_URL=jdbc:mysql://localhost:3306/parking_spot_finder_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Kolkata&characterEncoding=UTF-8`
   - `DB_USERNAME=root`
   - `DB_PASSWORD=123456789`
2. Start backend:
   - `mvn spring-boot:run`
3. Start frontend separately from `../frontend`:
   - `npm run dev`

Backend runs on `http://localhost:8080`.
Frontend should call `http://localhost:8080/api`.

## Demo credentials
Available only when `APP_SEED_ENABLED=true`.

Password for all demo users: `Password@123`

- Admin: `admin@example.com`
- Lender: `lender@example.com`
- Driver/User: `user@example.com`

## API base
All APIs are under `/api`.
Swagger UI: `/swagger-ui.html`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### User
- `GET /api/user/profile`
- `PUT /api/user/profile`
- `PUT /api/user/profile/password`

### Vehicle
- `POST /api/vehicles`
- `GET /api/vehicles`
- `PUT /api/vehicles/{id}`
- `DELETE /api/vehicles/{id}`

### Wallet
- `GET /api/wallet`
- `GET /api/wallet/transactions`
- `POST /api/wallet/top-up`
- `POST /api/wallet/withdraw` (lender only)

### Parking search
- `GET /api/parking/featured`
- `GET /api/parking/search`
- `GET /api/parking/spots/{id}`

### Lender
- `GET /api/lender/dashboard`
- `GET /api/lender/spots`
- `POST /api/lender/spots`
- `PUT /api/lender/spots/{id}`
- `GET /api/lender/bookings`
- `GET /api/lender/earnings`

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/approvals/pending`
- `GET /api/admin/approvals/{spotId}`
- `POST /api/admin/approvals/{spotId}/approve`
- `POST /api/admin/approvals/{spotId}/reject`
- `GET /api/admin/spots`
- `GET /api/admin/users`
- `GET /api/admin/reports`

### Booking/payment/review
- `POST /api/bookings/holds`
- `POST /api/bookings/confirm`
- `POST /api/bookings/{id}/cancel`
- `POST /api/bookings/{id}/checkout`
- `GET /api/bookings/me`
- `GET /api/bookings/{id}`
- `GET /api/bookings/{id}/history`
- `POST /api/payments`
- `GET /api/payments/booking/{bookingId}`
- `POST /api/reviews`
- `GET /api/reviews/spot/{spotId}`
- `GET /api/reviews/me`

## Notes
- Schema auto-updates with `spring.jpa.hibernate.ddl-auto=update`.
- Seed data is disabled by default. Set `APP_SEED_ENABLED=true` to load demo data.
- CORS origin patterns are configurable via `CORS_ALLOWED_ORIGIN_PATTERNS` (default allows localhost/127.0.0.1 on any port).
