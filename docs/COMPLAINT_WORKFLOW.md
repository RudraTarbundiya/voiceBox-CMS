# Complaint Workflow

## Status Lifecycle

```
                                    ┌─────────────────────────────────────┐
                                    │          COMPLAINT WORKFLOW          │
                                    └─────────────────────────────────────┘

  Student/Faculty                  Admin                      Coordinator
       │                             │                             │
       │  1. Submit Complaint        │                             │
       │─────────────────────────────┼────────────────────────────▶│
       │                             │                             │
       │         ┌───────────────────┴───────────────────┐         │
       │         │               NEW                      │         │
       │         │  (Waiting for admin review)           │         │
       │         └───────────────────┬───────────────────┘         │
       │                             │                             │
       │                             │ 2. Assign Department        │
       │                             │    (Select CE/IT/EC)        │
       │                             │                             │
       │         ┌───────────────────┴───────────────────┐         │
       │         │            ASSIGNED                    │         │
       │         │  (Assigned to department coordinator) │◀────────│
       │         └───────────────────┬───────────────────┘         │
       │                             │                             │
       │                             │                             │ 3. Start Work
       │                             │                             │
       │         ┌───────────────────┴───────────────────┐         │
       │         │           IN_PROGRESS                  │◀────────│
       │         │  (Coordinator is working on it)       │         │
       │         └───────────────────┬───────────────────┘         │
       │                             │                             │
       │                             │                             │ 4. Mark Resolved
       │                             │                             │
       │         ┌───────────────────┴───────────────────┐         │
       │         │            RESOLVED                    │◀────────│
       │         │  (Waiting for user feedback)          │         │
       │         └───────────────────┬───────────────────┘         │
       │                             │                             │
       │ 5. Submit Feedback          │                             │
       │    (Rating 1-10 + Comment)  │                             │
       │─────────────────────────────┼────────────────────────────▶│
       │                             │                             │
       │                             │ 6. Close Complaint          │
       │                             │    (After feedback)         │
       │                             │                             │
       │         ┌───────────────────┴───────────────────┐         │
       │         │             CLOSED                     │         │
       │         │  (Complaint lifecycle complete)       │         │
       │         └───────────────────────────────────────┘         │
```

## Status Descriptions

| Status | Description | Next Steps | Who Can Change |
|--------|-------------|------------|----------------|
| **NEW** | Just submitted, awaiting review | Admin assigns department | Admin → ASSIGNED |
| **ASSIGNED** | Routed to department coordinator | Coordinator starts work | Coordinator → IN_PROGRESS |
| **IN_PROGRESS** | Being actively worked on | Coordinator resolves | Coordinator → RESOLVED |
| **RESOLVED** | Issue resolved, awaiting feedback | User submits feedback | Admin → CLOSED |
| **CLOSED** | Lifecycle complete | None | Terminal state |

## Detailed Workflow Steps

### 1. Complaint Submission (Student/Faculty)

```javascript
// User provides:
{
  title: "WiFi not working in Library",
  description: "The WiFi has been down for 3 days...",
  category: "infrastructure",
  attachments: [file1, file2]  // Optional, max 3 files
}

// System sets:
{
  status: "NEW",
  department: user.department,
  createdBy: user._id,
  createdAt: Date.now()
}
```

### 2. Department Assignment (Admin)

```javascript
// Admin selects:
{
  assignedDepartment: "IT",
  note: "Routing to IT team for network issue"
}

// System updates:
{
  status: "ASSIGNED",
  statusHistory: [{
    from: "NEW",
    to: "ASSIGNED",
    changedBy: admin._id,
    note: "...",
    changedAt: Date.now()
  }]
}
```

### 3. Work Started (Coordinator)

```javascript
// Coordinator updates:
{
  status: "IN_PROGRESS",
  note: "Investigating the issue"
}
```

### 4. Resolution (Coordinator)

```javascript
// Coordinator marks resolved:
{
  status: "RESOLVED",
  note: "Fixed router configuration"
}
```

### 5. Feedback (Student/Faculty)

```javascript
// User provides feedback:
{
  rating: 8,
  comment: "Issue resolved quickly. Thanks!"
}

// System updates:
{
  feedback: {
    rating: 8,
    comment: "...",
    submittedAt: Date.now()
  }
}
```

### 6. Closure (Admin)

```javascript
// Admin closes (requires feedback):
{
  status: "CLOSED",
  note: "Closed with positive feedback"
}
```

## Visual Status Indicators

| Status | Color | Badge |
|--------|-------|-------|
| NEW | Blue | 🔵 New |
| ASSIGNED | Yellow | 🟡 Assigned |
| IN_PROGRESS | Purple | 🟣 In Progress |
| RESOLVED | Green | 🟢 Resolved |
| CLOSED | Gray | ⚫ Closed |

## Business Rules

1. **No Editing**: Complaints cannot be edited after submission
2. **No Deletion**: Complaints cannot be deleted
3. **One Department**: Each complaint is assigned to exactly one department
4. **Feedback Required**: Admin can only close complaints with feedback
5. **Status Flow**: Status can only move forward, never backward
6. **3 Files Max**: Maximum 3 attachments per complaint
7. **5MB Limit**: Each file must be under 5MB
