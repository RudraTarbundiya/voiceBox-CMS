# Database ER Diagram

## Entity Relationship Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                 │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────┐         ┌─────────────┐         ┌─────────────────┐
│    USER     │         │   SESSION   │         │    COMPLAINT    │
├─────────────┤         ├─────────────┤         ├─────────────────┤
│ _id (PK)    │◀────┐   │ _id (PK)    │         │ _id (PK)        │
│ name        │     │   │ sessionId   │         │ title           │
│ email       │     └───│ userId (FK) │         │ description     │
│ password    │         │ userAgent   │         │ category        │
│ role        │         │ ipAddress   │         │ department      │
│ department  │         │ createdAt   │    ┌────│ createdBy (FK)  │
│ googleId    │         │ expiresAt   │    │    │ assignedDept    │
│ createdAt   │         └─────────────┘    │    │ status          │
│ updatedAt   │                            │    │ attachments[]   │
└─────────────┘◀───────────────────────────┘    │ feedback{}      │
                                                │ statusHistory[] │
                                                │ createdAt       │
                                                │ updatedAt       │
                                                └─────────────────┘
```

## User Collection

```javascript
{
  _id: ObjectId,
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    // Not required for Google OAuth users
    minLength: 6
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'coordinator', 'admin'],
    default: 'student'
  },
  department: {
    type: String,
    enum: ['CE', 'IT', 'EC'],
    required: true
  },
  googleId: {
    type: String,
    sparse: true  // Unique index, allows null
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - email: unique
// - googleId: sparse unique
```

## Session Collection

```javascript
{
  _id: ObjectId,
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  ipAddress: {
    type: String,
    default: 'Unknown'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0  // TTL index
  }
}

// Indexes:
// - sessionId: unique
// - userId: regular index (for querying user sessions)
// - expiresAt: TTL index (auto-delete)
```

## Complaint Collection

```javascript
{
  _id: ObjectId,
  title: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    minLength: 20,
    maxLength: 5000
  },
  category: {
    type: String,
    enum: ['academic', 'infrastructure', 'hostel', 'library', 'it/portal'],
    required: true
  },
  department: {
    type: String,
    enum: ['CE', 'IT', 'EC'],
    required: true
  },
  createdBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  assignedDepartment: {
    type: String,
    enum: ['CE', 'IT', 'EC']
  },
  status: {
    type: String,
    enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'NEW'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedAt: Date
  }],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 10
    },
    comment: String,
    submittedAt: Date
  },
  statusHistory: [{
    from: String,
    to: String,
    changedBy: ObjectId,  // ref: User
    note: String,
    changedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - createdBy: regular index
// - assignedDepartment: regular index
// - status: regular index
// - createdAt: descending index
```

## Relationships

| From | To | Type | Description |
|------|-----|------|-------------|
| Session | User | Many-to-One | Each session belongs to one user |
| Complaint | User | Many-to-One | Each complaint is created by one user |
| StatusHistory | User | Many-to-One | Each status change is made by one user |

## Constraints

### User Constraints
- Email must be unique
- GoogleId must be unique (sparse - allows null)
- Password required for non-Google users
- Role restricted to enum values
- Department required

### Session Constraints
- Max 2 sessions per user
- Auto-expires after 7 days (TTL index)
- SessionId is UUID v4

### Complaint Constraints
- Max 3 attachments
- Max 5MB per attachment
- Feedback only after RESOLVED status
- Status transitions follow defined flow
