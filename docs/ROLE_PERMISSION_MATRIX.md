# Role & Permission Matrix

## User Roles

| Role | Description | Self-Register |
|------|-------------|---------------|
| **Student** | College student who can submit complaints | ✅ Yes |
| **Faculty** | College faculty member | ✅ Yes |
| **Coordinator** | Department coordinator (promoted from faculty) | ❌ No |
| **Admin** | System administrator | ❌ No |

---

## Permission Matrix

### Authentication Actions

| Action | Student | Faculty | Coordinator | Admin |
|--------|---------|---------|-------------|-------|
| Register (email) | ✅ | ✅ | ❌ | ❌ |
| Register (Google) | ✅ | ✅ | ❌ | ❌ |
| Login | ✅ | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ | ✅ |
| View Profile | ✅ | ✅ | ✅ | ✅ |

---

### Complaint Actions

| Action | Student | Faculty | Coordinator | Admin |
|--------|---------|---------|-------------|-------|
| Submit Complaint | ✅ | ✅ | ❌ | ❌ |
| View Own Complaints | ✅ | ✅ | ✅ | ✅ |
| View All Complaints | ❌ | ❌ | ❌ | ✅ |
| View Department Complaints | ❌ | ❌ | ✅ | ✅ |
| Edit Complaint | ❌ | ❌ | ❌ | ❌ |
| Delete Complaint | ❌ | ❌ | ❌ | ❌ |
| Upload Attachments | ✅ | ✅ | ❌ | ❌ |
| Download Attachments | ✅* | ✅* | ✅** | ✅ |

`*` Only for own complaints  
`**` Only for department complaints

---

### Status Management

| Action | Student | Faculty | Coordinator | Admin |
|--------|---------|---------|-------------|-------|
| Set to NEW | Auto | Auto | ❌ | ❌ |
| Set to ASSIGNED | ❌ | ❌ | ❌ | ✅ |
| Set to IN_PROGRESS | ❌ | ❌ | ✅ | ❌ |
| Set to RESOLVED | ❌ | ❌ | ✅ | ❌ |
| Set to CLOSED | ❌ | ❌ | ❌ | ✅ |

---

### Feedback Actions

| Action | Student | Faculty | Coordinator | Admin |
|--------|---------|---------|-------------|-------|
| Submit Feedback | ✅* | ✅* | ❌ | ❌ |
| View Feedback | ✅* | ✅* | ✅** | ✅ |

`*` Only for own RESOLVED complaints  
`**` Only for department complaints

---

### Admin Actions

| Action | Student | Faculty | Coordinator | Admin |
|--------|---------|---------|-------------|-------|
| View Dashboard Stats | ❌ | ❌ | ❌ | ✅ |
| Assign Department | ❌ | ❌ | ❌ | ✅ |
| Promote Faculty | ❌ | ❌ | ❌ | ✅ |
| View Faculty List | ❌ | ❌ | ❌ | ✅ |
| View Coordinator List | ❌ | ❌ | ❌ | ✅ |
| Close Complaint | ❌ | ❌ | ❌ | ✅ |

---

## Status Transition Rules

```
┌─────────┐
│   NEW   │ ─────────────────────┐
└────┬────┘                      │
     │ Admin assigns department  │
     ▼                           │
┌──────────┐                     │
│ ASSIGNED │ ◀───────────────────┘
└────┬─────┘         (Only if NEW)
     │ Coordinator starts work
     ▼
┌─────────────┐
│ IN_PROGRESS │
└────┬────────┘
     │ Coordinator resolves
     ▼
┌──────────┐
│ RESOLVED │
└────┬─────┘
     │ User gives feedback
     │ Admin closes
     ▼
┌────────┐
│ CLOSED │
└────────┘
```

---

## Department Scope

| Department | Code | Coordinators |
|------------|------|--------------|
| Computer Engineering | CE | 1 per dept |
| Information Technology | IT | 1 per dept |
| Electronics & Communication | EC | 1 per dept |

- Each coordinator can only view/manage complaints assigned to their department
- Users belong to one department
- Complaints are assigned to one department for resolution

---

## Route Protection

### Backend Middleware

```javascript
// Authentication required
router.use(authenticate);

// Admin only
router.use(requireAdmin);

// Coordinator only
router.use(requireCoordinator);

// Specific roles
router.use(requireRole('student', 'faculty'));
```

### Frontend Protection

```jsx
<ProtectedRoute allowedRoles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>
```
