# Manual Testing Guide

## Prerequisites

1. MongoDB running on `localhost:27017`
2. Backend running on `http://localhost:5000`
3. Frontend running on `http://localhost:5173`

---

## Test Cases

### 1. Authentication Tests

#### 1.1 Student Registration
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to `/register` | Registration form displayed |
| 2 | Fill: Name, Email, Password, Department=CE, Role=Student | All fields filled |
| 3 | Click Register | Redirect to `/dashboard` |
| 4 | Check navbar | Shows user name and "student" role |

#### 1.2 Login
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Logout if logged in | Redirect to `/login` |
| 2 | Enter registered email/password | Form filled |
| 3 | Click Sign In | Redirect to dashboard |

#### 1.3 Google OAuth
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to `/login` | Login page with Google button |
| 2 | Click "Continue with Google" | Google popup opens |
| 3 | Login with Google account | Popup closes |
| 4 | If new user, select department | Modal appears |
| 5 | Select CE, Student | Redirect to dashboard |

#### 1.4 Logout
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click user avatar in navbar | Dropdown opens |
| 2 | Click "Sign out" | Redirect to `/login` |
| 3 | Try accessing `/dashboard` directly | Redirect to `/login` |

---

### 2. Complaint Submission Tests

#### 2.1 Submit Basic Complaint
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as student | Dashboard shown |
| 2 | Click "Submit Complaint" | Form page opens |
| 3 | Enter Title: "Test Complaint" | Title filled |
| 4 | Select Category: "Academic" | Category selected |
| 5 | Enter Description (20+ chars) | Description filled |
| 6 | Click Submit | Success message, redirect to My Complaints |
| 7 | Check complaint in list | Shows "NEW" status |

#### 2.2 Submit with Attachments
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to Submit Complaint | Form shown |
| 2 | Fill form | Form valid |
| 3 | Click file upload area | File picker opens |
| 4 | Select 2 files (under 5MB each) | Files listed |
| 5 | Submit | Success, files attached |
| 6 | View complaint details | Attachment links visible |

#### 2.3 Validation Errors
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Submit with empty title | Error: "Title is required" |
| 2 | Submit with title < 5 chars | Error: "Title must be at least 5 characters" |
| 3 | Submit without category | Error: "Category is required" |
| 4 | Submit description < 20 chars | Error: "Description must be at least 20 characters" |
| 5 | Try uploading 4 files | Error: "Maximum 3 files allowed" |
| 6 | Try uploading file > 5MB | Error: "File exceeds 5MB limit" |

---

### 3. Admin Tests

#### 3.1 Create Admin User (Manual)
```javascript
// In MongoDB shell or Compass
db.users.insertOne({
  name: "Admin User",
  email: "admin@college.edu",
  password: "<bcrypt hash of password>",
  role: "admin",
  department: "CE",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use bcrypt to hash password first:
```javascript
// Node.js script
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('admin123', 12);
console.log(hash);
```

#### 3.2 Admin Dashboard
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as admin | Redirect to `/admin` |
| 2 | View dashboard | Stats cards visible |
| 3 | See coordinator list | List shows all coordinators |
| 4 | Filter by status | Complaints filtered |

#### 3.3 Assign Department
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find complaint with NEW status | Card visible |
| 2 | Click "Take Action" | Assign modal opens |
| 3 | Select department (IT) | Department selected |
| 4 | Click Assign | Success message |
| 5 | Verify status | Status changed to ASSIGNED |

#### 3.4 Promote Faculty
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Register as faculty user first | Faculty user exists |
| 2 | Login as admin | Admin dashboard |
| 3 | Click "Promote Faculty" | Modal opens |
| 4 | Select faculty from list | Faculty selected |
| 5 | Click Promote | Success message |
| 6 | Verify coordinators list | New coordinator shown |

#### 3.5 Close Complaint
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find RESOLVED complaint with feedback | Card visible |
| 2 | Click "Take Action" | Close modal opens |
| 3 | Add optional note | Note entered |
| 4 | Click Close | Success message |
| 5 | Verify status | Status is CLOSED |

---

### 4. Coordinator Tests

#### 4.1 Coordinator Dashboard
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as coordinator | Redirect to `/coordinator` |
| 2 | View dashboard | Shows department info |
| 3 | See assigned complaints | Only department complaints |

#### 4.2 Update Status to IN_PROGRESS
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find ASSIGNED complaint | Card visible |
| 2 | Click "Update Status" | Modal opens |
| 3 | Status shows IN_PROGRESS | Dropdown correct |
| 4 | Add note (optional) | Note entered |
| 5 | Click Update | Success message |
| 6 | Verify status | IN_PROGRESS shown |

#### 4.3 Mark as RESOLVED
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find IN_PROGRESS complaint | Card visible |
| 2 | Click "Update Status" | Modal opens |
| 3 | Status shows RESOLVED | Dropdown correct |
| 4 | Click Update | Success message |
| 5 | Verify status | RESOLVED shown |

---

### 5. Feedback Tests

#### 5.1 Submit Feedback
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login as complaint owner | Dashboard shown |
| 2 | Go to My Complaints | List shown |
| 3 | Find RESOLVED complaint | Shows feedback button |
| 4 | Click "Submit Feedback" | Modal opens |
| 5 | Set rating (1-10) | Slider works |
| 6 | Enter comment | Comment entered |
| 7 | Submit | Success message |
| 8 | Verify | Feedback shown on card |

---

### 6. Session Tests

#### 6.1 Session Persistence
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login | Session created |
| 2 | Close browser | Session in cookie |
| 3 | Open browser, go to `/dashboard` | Still logged in |

#### 6.2 Multiple Sessions
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login in browser 1 | Session 1 created |
| 2 | Login in browser 2 (same user) | Session 2 created |
| 3 | Login in browser 3 (same user) | Session 3 created, Session 1 deleted |
| 4 | Refresh browser 1 | Logged out (session gone) |

---

### 7. Role-Based Access Tests

| Route | Student | Faculty | Coordinator | Admin |
|-------|---------|---------|-------------|-------|
| `/dashboard` | ✅ | ✅ | ❌ (redirect) | ❌ (redirect) |
| `/complaints/new` | ✅ | ✅ | ❌ | ❌ |
| `/admin` | ❌ | ❌ | ❌ | ✅ |
| `/coordinator` | ❌ | ❌ | ✅ | ❌ |

Test each route with each role and verify correct redirect behavior.

---

## API Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123","department":"CE","role":"student"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Get Current User
```bash
curl http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### Submit Complaint
```bash
curl -X POST http://localhost:5000/api/complaints \
  -b cookies.txt \
  -F "title=Test Complaint" \
  -F "description=This is a test complaint description with enough characters." \
  -F "category=academic"
```
