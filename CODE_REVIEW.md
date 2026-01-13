# Code Review - Prologistix Backend

## 🔴 CRITICAL ISSUES

### 1. **Login Authentication Bug** (CRITICAL)
**Location:** `index.js:46-49`

**Issue:** Password is hashed on every request, causing login to always fail.

```javascript
// ❌ BROKEN - Creates new hash each time
const match = await bcrypt.compare(
  password,
  await bcrypt.hash(process.env.ADMIN_PASS, 10)
);
```

**Fix:**
```javascript
// Hash once at startup
const ADMIN_PASS_HASH = await bcrypt.hash(process.env.ADMIN_PASS || "", 10);

// Then compare
const match = await bcrypt.compare(password, ADMIN_PASS_HASH);
```

**Impact:** Login functionality is completely broken.

---

### 2. **SQL Injection Vulnerability** (CRITICAL)
**Location:** `controllers/applicationsController.js`

**Issue:** Direct string interpolation in SQL queries without proper validation.

```javascript
// ❌ VULNERABLE - No input validation
export const createApplication = (req, res) => {
  const { name, steam, reason } = req.body;
  db.prepare(`INSERT INTO applications (name, steam, reason) VALUES (?, ?, ?)`)
    .run(name, steam, reason); // Values not validated
};
```

**Issues:**
- No input validation
- No length limits
- No sanitization
- No error handling

**Fix:** Add validation middleware and error handling:
```javascript
import { body, validationResult } from 'express-validator';

const validateApplication = [
  body('name').trim().isLength({ min: 1, max: 100 }).escape(),
  body('steam').trim().isLength({ min: 1, max: 100 }),
  body('reason').trim().isLength({ min: 1, max: 1000 }).escape(),
];

export const createApplication = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { name, steam, reason } = req.body;
    const result = db.prepare(`
      INSERT INTO applications (name, steam, reason)
      VALUES (?, ?, ?)
    `).run(name.trim(), steam.trim(), reason.trim());
    
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
};
```

**Impact:** Potential SQL injection attacks, data corruption.

---

### 3. **CORS Configuration Too Permissive** (HIGH)
**Location:** `index.js:18`

**Issue:** CORS allows all origins, which is a security risk.

```javascript
// ❌ Allows all origins
app.use(cors());
```

**Fix:**
```javascript
// ✅ Restrict to specific origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));
```

**Impact:** Any website can make requests to your API.

---

### 4. **Frontend/Backend API Mismatch** (HIGH)
**Location:** `public/index.html` vs `routes/applications.js`

**Issue:** Frontend expects different endpoints and data structure.

**Frontend calls:**
- `GET /api/applications` - expects `discord`, `truckersmp` fields
- `POST /api/applications/${id}/approve`
- `POST /api/applications/${id}/reject`

**Backend provides:**
- `GET /api/applications` - returns `steam`, `reason` fields
- `PUT /api/applications/:id` - expects `status` in body

**Fix:** Align frontend and backend:
```javascript
// Update routes
router.post("/:id/approve", updateStatus);
router.post("/:id/reject", updateStatus);

// Update controller to handle approve/reject
export const updateStatus = (req, res) => {
  const { id } = req.params;
  const status = req.path.includes('approve') ? 'approved' : 'rejected';
  // ... rest of logic
};
```

**Impact:** Frontend won't work correctly.

---

## 🟡 HIGH PRIORITY ISSUES

### 5. **No Error Handling**
**Location:** All controller functions

**Issue:** No try-catch blocks, no error responses.

**Fix:** Add comprehensive error handling:
```javascript
export const getApplications = (req, res) => {
  try {
    const apps = db.prepare(`
      SELECT * FROM applications ORDER BY created_at DESC
    `).all();
    res.json(apps);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};
```

---

### 6. **Session Security Issues**
**Location:** `index.js:22-26`

**Issues:**
- No `cookie.secure` flag (should be `true` in production with HTTPS)
- No `cookie.sameSite` protection
- No session expiration timeout
- Sessions stored in memory (lost on restart)

**Fix:**
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  }
}));
```

---

### 7. **Missing Input Validation**
**Location:** All endpoints

**Issues:**
- No validation on `updateStatus` - status could be any string
- No ID validation (could be negative, non-numeric, etc.)
- No required field checks

**Fix:** Add validation middleware:
```javascript
import { param, body } from 'express-validator';

const validateStatus = [
  param('id').isInt({ min: 1 }),
  body('status').isIn(['pending', 'approved', 'rejected'])
];
```

---

### 8. **No Rate Limiting**
**Location:** `index.js`

**Issue:** No protection against brute force attacks or API abuse.

**Fix:** Add express-rate-limit:
```javascript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later.'
});

app.post("/login", loginLimiter, async (req, res) => {
  // ... login logic
});
```

---

## 🟢 MEDIUM PRIORITY ISSUES

### 9. **Missing Environment Variable Validation**
**Location:** `index.js`

**Issue:** App starts even if required env vars are missing.

**Fix:** Add startup validation:
```javascript
const requiredEnvVars = ['SESSION_SECRET', 'ADMIN_USER', 'ADMIN_PASS'];
const missing = requiredEnvVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
}
```

---

### 10. **No Logging**
**Location:** Entire application

**Issue:** No logging for debugging, monitoring, or security auditing.

**Fix:** Add logging middleware:
```javascript
import morgan from 'morgan';

app.use(morgan('combined')); // Or 'dev' for development
```

---

### 11. **Database Schema Issues**
**Location:** `models/db.js`

**Issues:**
- No indexes on frequently queried fields (`status`, `created_at`)
- No constraints on `status` field (could be any string)
- `steam` field name doesn't match frontend expectations

**Fix:**
```javascript
db.prepare(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    steam TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Add indexes
db.prepare(`CREATE INDEX IF NOT EXISTS idx_status ON applications(status)`).run();
db.prepare(`CREATE INDEX IF NOT EXISTS idx_created_at ON applications(created_at DESC)`).run();
```

---

### 12. **API Response Inconsistency**
**Location:** `controllers/applicationsController.js`

**Issue:** Some endpoints return `{ success: true }`, others return data directly.

**Fix:** Standardize responses:
```javascript
// Success responses
res.status(200).json({ success: true, data: apps });
res.status(201).json({ success: true, id: result.lastInsertRowid });

// Error responses
res.status(400).json({ success: false, error: 'Validation failed' });
```

---

### 13. **Missing HTTP Status Codes**
**Location:** Controllers

**Issues:**
- `createApplication` returns 200 instead of 201 (Created)
- No 404 for non-existent resources
- No proper error status codes

---

### 14. **No Request Timeout**
**Location:** `index.js`

**Issue:** Long-running requests could hang the server.

**Fix:** Add timeout middleware or configure at server level.

---

## 🔵 LOW PRIORITY / CODE QUALITY

### 15. **Inconsistent Code Style**
- Mix of async/await and callbacks
- Inconsistent error handling patterns

### 16. **Missing Type Safety**
Consider using TypeScript or JSDoc for better type safety.

### 17. **No Tests**
Add unit tests and integration tests.

### 18. **Hardcoded Values**
- Port default (3000) could be configurable
- Status values should be constants

### 19. **Missing API Documentation**
Consider adding Swagger/OpenAPI documentation.

### 20. **No Health Check Endpoint**
Add `/health` endpoint for monitoring.

---

## 📋 RECOMMENDED FIXES PRIORITY

### Before Deployment (MUST FIX):
1. ✅ Fix login authentication bug
2. ✅ Add input validation and SQL injection protection
3. ✅ Fix CORS configuration
4. ✅ Fix frontend/backend API mismatch
5. ✅ Add error handling
6. ✅ Add environment variable validation

### Before Production (SHOULD FIX):
7. ✅ Improve session security
8. ✅ Add rate limiting
9. ✅ Add logging
10. ✅ Fix database schema constraints

### Nice to Have:
11. Add tests
12. Add API documentation
13. Add monitoring/health checks
14. Improve code organization

---

## 🔧 QUICK FIXES SUMMARY

1. **Fix login:** Hash password once at startup
2. **Add validation:** Use express-validator
3. **Fix CORS:** Restrict origins
4. **Add error handling:** Wrap all DB operations in try-catch
5. **Fix API routes:** Match frontend expectations
6. **Add rate limiting:** Protect login endpoint
7. **Improve sessions:** Add secure cookie flags

---

## 📚 Recommended Dependencies to Add

```json
{
  "express-validator": "^7.0.1",
  "express-rate-limit": "^7.1.5",
  "morgan": "^1.10.0",
  "helmet": "^7.1.0"
}
```

---

## 🛡️ Security Checklist

- [ ] Fix login authentication
- [ ] Add input validation
- [ ] Restrict CORS
- [ ] Add rate limiting
- [ ] Secure session cookies
- [ ] Add HTTPS enforcement
- [ ] Validate environment variables
- [ ] Add error handling (don't leak sensitive info)
- [ ] Add logging for security events
- [ ] Review and update dependencies regularly
