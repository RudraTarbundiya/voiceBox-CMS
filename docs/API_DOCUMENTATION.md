# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected routes require a valid session cookie. The cookie is automatically set on login/register.

---

## Auth Endpoints

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "password123",
  "department": "CE",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@college.edu",
    "role": "student",
    "department": "CE"
  }
}
```

---

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@college.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": { ... }
}
```

---

### Google OAuth
```http
POST /auth/google
```

**Request Body:**
```json
{
  "credential": "google_access_token",
  "department": "CE",
  "role": "student"
}
```

---

### Logout
```http
POST /auth/logout
```
*Requires authentication*

---

### Get Current User
```http
GET /auth/me
```
*Requires authentication*

---

## Complaint Endpoints

### Create Complaint
```http
POST /complaints
```
*Requires: student or faculty*

**Request:** `multipart/form-data`
- `title` (string, required)
- `description` (string, required)
- `category` (string, required): academic|infrastructure|hostel|library|it/portal
- `attachments` (files, optional): max 3 files, 5MB each

---

### Get My Complaints
```http
GET /complaints/my
```
*Requires authentication*

---

### Get All Complaints (Admin)
```http
GET /complaints/all?status=NEW&page=1&limit=20
```
*Requires: admin*

---

### Get Department Complaints (Coordinator)
```http
GET /complaints/department?status=ASSIGNED
```
*Requires: coordinator*

---

### Get Complaint by ID
```http
GET /complaints/:id
```
*Requires: owner, coordinator (same dept), or admin*

---

### Update Status (Coordinator)
```http
PATCH /complaints/:id/status
```
*Requires: coordinator*

**Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "note": "Working on it"
}
```

**Valid Transitions:**
- ASSIGNED → IN_PROGRESS
- IN_PROGRESS → RESOLVED

---

### Submit Feedback
```http
POST /complaints/:id/feedback
```
*Requires: complaint owner, status must be RESOLVED*

**Request Body:**
```json
{
  "rating": 8,
  "comment": "Great resolution!"
}
```

---

### Download Attachment
```http
GET /complaints/:id/attachments/:filename
```

---

## Admin Endpoints

### Get Admin Stats
```http
GET /admin/stats
```
*Requires: admin*

---

### Get Faculty List
```http
GET /admin/users/faculty?department=CE
```
*Requires: admin*

---

### Get Coordinators
```http
GET /admin/users/coordinators
```
*Requires: admin*

---

### Promote Faculty to Coordinator
```http
PATCH /admin/users/:id/promote
```
*Requires: admin*

---

### Assign Department
```http
PATCH /admin/complaints/:id/assign
```
*Requires: admin*

**Request Body:**
```json
{
  "department": "CE",
  "note": "Assigned to CE department"
}
```

---

### Close Complaint
```http
PATCH /admin/complaints/:id/close
```
*Requires: admin, complaint must have feedback*

**Request Body:**
```json
{
  "note": "Closed after successful resolution"
}
```

---

## Error Responses

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error
