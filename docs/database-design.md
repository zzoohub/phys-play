# PhysPlay — Database Design Document

**Status:** Draft
**Date:** 2026-03-02
**Design Doc Reference:** [design-doc.md](./design-doc.md)
**PRD Reference:** [prd.md](./prd.md)

---

## 1. Requirements Summary

### 1.1 Domain Context

PhysPlay is a 3D interactive science simulation platform with 4 tracks (Classical Physics, Chemistry, Space Science, Quantum Mechanics) × 6 modules = 24 modules. Tracks and modules are **static content defined in code** — they are not stored in the database.

Module IDs follow a `{track}-{module}` pattern (e.g., `1-1`, `2-3`). These are TEXT identifiers used as foreign references in progress and learning path tables.

### 1.2 Data Requirements

| Data Domain | Source Requirements | Phase |
|---|---|---|
| User accounts | REQ-027, REQ-028 | Phase 3 |
| Learning progress | REQ-024, REQ-029 | Phase 3 |
| Classes & enrollment | REQ-023 | Phase 3 |
| Custom learning paths | REQ-025 | Phase 3 |
| Class progress dashboard | REQ-024 | Phase 3 |

### 1.3 Access Patterns

| Pattern | Frequency | Type |
|---|---|---|
| Authenticate user (Google OAuth) | Per login | Write (upsert) |
| Record module progress | Per module visit | Write (upsert) |
| Get user's progress (all modules) | Per session | Read |
| Get class progress (teacher dashboard) | Per dashboard view | Read (aggregate) |
| Join class via invite | Occasional | Write |
| Manage learning path | Occasional | Write |

**Read/write ratio:** Read-heavy. Progress writes happen once per module visit; dashboard reads are the dominant query.

### 1.4 Scale Expectations

Phase 3 target: ~10K-50K UV/month. Conservative estimate for DB-backed users:
- **Users:** ~5K accounts (many visitors stay anonymous)
- **Progress records:** ~50K (5K users × ~10 modules average)
- **Classes:** ~100 (10 pilot schools × ~10 classes)
- **Enrollments:** ~3K (100 classes × ~30 students)

This is a small-scale dataset. Partitioning and advanced optimization are unnecessary. Focus on correctness, simplicity, and GDPR/PIPA compliance.

### 1.5 Infrastructure Constraints

- **Database:** Neon PostgreSQL (serverless, scale-to-zero)
- **Backend:** Rust (Axum) with SQLx compile-time query checking
- **Consistency:** Strong (per design doc Section 4.2)
- **Connection pooling:** Neon provides built-in connection pooling (pgbouncer-compatible)

---

## 2. Entity Relationship Diagram

```mermaid
erDiagram
    user_account {
        bigint id PK
        text google_id UK
        text email UK
        text name
        text avatar_url
        user_role role
        text locale
        text theme
        timestamptz created_at
        timestamptz updated_at
    }

    refresh_token {
        bigint id PK
        bigint user_id FK
        text token_hash UK
        timestamptz expires_at
        timestamptz created_at
    }

    module_progress {
        bigint id PK
        bigint user_id FK
        text module_id
        boolean is_completed
        integer total_dwell_seconds
        integer total_interaction_count
        timestamptz first_visited_at
        timestamptz last_visited_at
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
    }

    class {
        bigint id PK
        bigint teacher_id FK
        text name
        text invite_code UK
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    class_enrollment {
        bigint id PK
        bigint class_id FK
        bigint student_id FK
        timestamptz enrolled_at
    }

    learning_path {
        bigint id PK
        bigint teacher_id FK
        text name
        text module_ids
        timestamptz created_at
        timestamptz updated_at
    }

    class_learning_path {
        bigint id PK
        bigint class_id FK
        bigint learning_path_id FK
        timestamptz assigned_at
    }

    user_account ||--o{ refresh_token : "has"
    user_account ||--o{ module_progress : "tracks"
    user_account ||--o{ class : "teaches"
    user_account ||--o{ class_enrollment : "enrolls in"
    user_account ||--o{ learning_path : "creates"
    class ||--o{ class_enrollment : "has"
    class ||--o{ class_learning_path : "assigned"
    learning_path ||--o{ class_learning_path : "assigned to"
```

Full ERD also available at [erd.mermaid](./erd.mermaid).

---

## 3. Schema Design

### 3.1 user_account [Phase 3]

Stores authenticated users. Anonymous visitors do not have records.

```sql
CREATE TABLE user_account (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    google_id       TEXT NOT NULL,
    email           TEXT NOT NULL,
    name            TEXT NOT NULL,
    avatar_url      TEXT,
    role            TEXT NOT NULL DEFAULT 'student'
                    CHECK (role IN ('student', 'teacher')),
    locale          TEXT NOT NULL DEFAULT 'ko'
                    CHECK (locale IN ('ko', 'en', 'es', 'pt-BR', 'id', 'ja')),
    theme           TEXT NOT NULL DEFAULT 'system'
                    CHECK (theme IN ('light', 'dark', 'system'))
);
```

**Design decisions:**
- `role` as TEXT with CHECK instead of ENUM: only 2 values, but adding roles (e.g., `admin`) must be easy without ALTER TYPE.
- `locale` and `theme`: synced from localStorage on login, persisted for cross-device consistency (design doc Section 8, step 3).
- `google_id`: unique identifier from Google OAuth. Separate from email because users can change their Google email.
- No soft delete: GDPR/PIPA requires hard delete capability. When a user requests deletion, CASCADE removes all related data.

### 3.2 refresh_token [Phase 3]

Stores hashed refresh tokens for JWT auth.

```sql
CREATE TABLE refresh_token (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ NOT NULL,
    user_id         BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
    token_hash      TEXT NOT NULL
);
```

**Design decisions:**
- Store hash only (SHA-256). Never store raw tokens.
- ON DELETE CASCADE: user deletion removes all tokens.
- `expires_at`: 7-day TTL per design doc Section 6.1. Application-side cleanup via scheduled task.

### 3.3 module_progress [Phase 3]

Tracks per-user, per-module learning progress. One row per (user, module) pair.

```sql
CREATE TABLE module_progress (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id                 BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
    module_id               TEXT NOT NULL
                            CHECK (module_id ~ '^\d-\d$'),
    is_completed            BOOLEAN NOT NULL DEFAULT false,
    total_dwell_seconds     INTEGER NOT NULL DEFAULT 0
                            CHECK (total_dwell_seconds >= 0),
    total_interaction_count INTEGER NOT NULL DEFAULT 0
                            CHECK (total_interaction_count >= 0),
    first_visited_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_visited_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at            TIMESTAMPTZ
);
```

**Design decisions:**
- `module_id` is a TEXT reference to code-defined modules (e.g., `'1-1'`, `'2-3'`). No FK to a modules table — modules are static content.
- CHECK constraint `^\d-\d$` validates the `{track}-{module}` format.
- Aggregated counters (`total_dwell_seconds`, `total_interaction_count`) instead of per-session rows. At PhysPlay's scale, per-session granularity belongs in PostHog, not the DB. The DB stores the progress summary needed for the teacher dashboard (REQ-024).
- `is_completed` + `completed_at`: explicit completion flag. `completed_at` is NULL until marked complete.
- Upsert pattern: `INSERT ... ON CONFLICT (user_id, module_id) DO UPDATE` to accumulate dwell time and interaction count.

**Deviation from design doc:** The design doc (Section 4.1, User Data Flow) mentions storing "interaction logs" per module. We store only aggregated counts in PostgreSQL. Detailed interaction logs (slider positions, timestamps) belong in PostHog's event stream, which already captures this data (design doc Section 7, PostHog integration). Storing raw interaction logs in PostgreSQL would be redundant and expensive for the teacher dashboard use case, which only needs totals.

### 3.4 class [Phase 3]

Teacher-created classes for B2B features.

```sql
CREATE TABLE class (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    teacher_id      BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
    name            TEXT NOT NULL
                    CHECK (char_length(name) BETWEEN 1 AND 100),
    invite_code     TEXT NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
    is_active       BOOLEAN NOT NULL DEFAULT true
);
```

**Design decisions:**
- `invite_code`: 12-char hex string (6 random bytes). Used for class enrollment links. Regenerable by the teacher.
- `is_active`: soft deactivation for classes (not deletion). Teachers may want to view historical class data.
- ON DELETE CASCADE from teacher: if the teacher account is deleted, classes and enrollments are removed (GDPR/PIPA).

### 3.5 class_enrollment [Phase 3]

Maps students to classes. A student can be in multiple classes.

```sql
CREATE TABLE class_enrollment (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    class_id        BIGINT NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    student_id      BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE
);
```

**Design decisions:**
- Simple join table. No additional metadata needed for Phase 3.
- ON DELETE CASCADE from both sides: class deletion or student deletion removes the enrollment.

### 3.6 learning_path [Phase 3]

Teacher-composed ordered list of modules for a class.

```sql
CREATE TABLE learning_path (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    teacher_id      BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
    name            TEXT NOT NULL
                    CHECK (char_length(name) BETWEEN 1 AND 100),
    module_ids      TEXT[] NOT NULL DEFAULT '{}'
);
```

**Design decisions:**
- `module_ids` as TEXT ARRAY: an ordered list of module IDs (e.g., `{'1-1', '1-2', '1-3', '2-1'}`). Arrays preserve order naturally. At 24 max modules, this is always a small array.
- No separate `learning_path_module` join table: ordering is the core requirement, and the list is small and atomic (always read/written as a whole). A join table would add complexity for no benefit at this scale.

### 3.7 class_learning_path [Phase 3]

Assigns a learning path to a class.

```sql
CREATE TABLE class_learning_path (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    assigned_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    class_id            BIGINT NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    learning_path_id    BIGINT NOT NULL REFERENCES learning_path(id) ON DELETE CASCADE
);
```

**Design decisions:**
- A class can have multiple assigned learning paths (e.g., "beginner path" and "advanced path").
- A learning path can be reused across multiple classes.

---

## 4. Constraints & Indexes

### 4.1 Unique Constraints

```sql
-- user_account
CREATE UNIQUE INDEX uq_user_account_google_id ON user_account (google_id);
CREATE UNIQUE INDEX uq_user_account_email ON user_account (email);

-- refresh_token
CREATE UNIQUE INDEX uq_refresh_token_hash ON refresh_token (token_hash);

-- module_progress: one row per (user, module)
CREATE UNIQUE INDEX uq_module_progress_user_module ON module_progress (user_id, module_id);

-- class
CREATE UNIQUE INDEX uq_class_invite_code ON class (invite_code);

-- class_enrollment: prevent duplicate enrollment
CREATE UNIQUE INDEX uq_class_enrollment_class_student ON class_enrollment (class_id, student_id);

-- class_learning_path: prevent duplicate assignment
CREATE UNIQUE INDEX uq_class_learning_path ON class_learning_path (class_id, learning_path_id);
```

### 4.2 Foreign Key Indexes

PostgreSQL does not auto-index FK columns. All FK columns need explicit indexes.

```sql
-- refresh_token
CREATE INDEX idx_refresh_token_user_id ON refresh_token (user_id);

-- module_progress
CREATE INDEX idx_module_progress_user_id ON module_progress (user_id);

-- class
CREATE INDEX idx_class_teacher_id ON class (teacher_id);

-- class_enrollment
CREATE INDEX idx_class_enrollment_class_id ON class_enrollment (class_id);
CREATE INDEX idx_class_enrollment_student_id ON class_enrollment (student_id);

-- class_learning_path
CREATE INDEX idx_class_learning_path_class_id ON class_learning_path (class_id);
CREATE INDEX idx_class_learning_path_learning_path_id ON class_learning_path (learning_path_id);

-- learning_path
CREATE INDEX idx_learning_path_teacher_id ON learning_path (teacher_id);
```

### 4.3 Query-Specific Indexes

```sql
-- Expired token cleanup
CREATE INDEX idx_refresh_token_expires_at ON refresh_token (expires_at);

-- Teacher dashboard: class progress query
-- Query: SELECT mp.* FROM module_progress mp JOIN class_enrollment ce ON ce.student_id = mp.user_id WHERE ce.class_id = ?
-- uq_module_progress_user_module covers the user_id lookup
-- idx_class_enrollment_class_id covers the class_id filter

-- Active classes for a teacher
CREATE INDEX idx_class_teacher_active ON class (teacher_id) WHERE is_active = true;
```

---

## 5. Transaction Design

### 5.1 User Registration (Google OAuth callback)

Upsert user on first login. Low contention.

```sql
-- Isolation: Read Committed (default)
BEGIN;
INSERT INTO user_account (google_id, email, name, avatar_url)
VALUES ($1, $2, $3, $4)
ON CONFLICT (google_id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now()
RETURNING id, role;
COMMIT;
```

No special locking needed. The UNIQUE constraint on `google_id` handles concurrency.

### 5.2 Record Module Progress

Upsert progress counters. Low contention (one user per module at a time).

```sql
-- Isolation: Read Committed (default)
BEGIN;
INSERT INTO module_progress (user_id, module_id, total_dwell_seconds, total_interaction_count)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id, module_id) DO UPDATE SET
    total_dwell_seconds = module_progress.total_dwell_seconds + EXCLUDED.total_dwell_seconds,
    total_interaction_count = module_progress.total_interaction_count + EXCLUDED.total_interaction_count,
    last_visited_at = now(),
    updated_at = now();
COMMIT;
```

### 5.3 Mark Module Complete

```sql
-- Isolation: Read Committed (default)
UPDATE module_progress
SET is_completed = true,
    completed_at = now(),
    updated_at = now()
WHERE user_id = $1 AND module_id = $2 AND is_completed = false;
```

Single-row update, no transaction wrapper needed beyond auto-commit.

### 5.4 Join Class via Invite Code

```sql
-- Isolation: Read Committed (default)
BEGIN;
-- Verify invite code and get class_id
SELECT id FROM class WHERE invite_code = $1 AND is_active = true;
-- Insert enrollment (UNIQUE constraint prevents duplicates)
INSERT INTO class_enrollment (class_id, student_id)
VALUES ($2, $3)
ON CONFLICT (class_id, student_id) DO NOTHING;
COMMIT;
```

### 5.5 Teacher Dashboard: Class Progress

Read-only aggregate query. No transaction design needed.

```sql
SELECT
    mp.module_id,
    COUNT(*) FILTER (WHERE mp.is_completed) AS completed_count,
    COUNT(*) AS total_students,
    AVG(mp.total_dwell_seconds) AS avg_dwell_seconds,
    AVG(mp.total_interaction_count) AS avg_interactions
FROM class_enrollment ce
JOIN module_progress mp ON mp.user_id = ce.student_id
WHERE ce.class_id = $1
GROUP BY mp.module_id
ORDER BY mp.module_id;
```

At ~30 students per class × 24 modules = ~720 rows scanned. No performance concern.

---

## 6. Performance Notes

### 6.1 Scale Assessment

With ~5K users, ~50K progress records, and ~100 classes, all tables fit comfortably in memory. No partitioning, materialized views, or read replicas needed.

### 6.2 Neon-Specific Considerations

- **Scale-to-zero:** Neon hibernates after inactivity. First query after hibernation incurs cold start (~500ms-1s). Acceptable for Phase 3 since the API is also on Cloud Run with cold start.
- **Connection pooling:** Neon provides built-in pgbouncer. Configure Axum's SQLx pool to `max_connections = 5` (Neon free tier limit).
- **Branching:** Use Neon branches for preview environments (one DB branch per PR preview).

### 6.3 SQLx Compile-Time Checking

All queries must be written as SQLx macros (`sqlx::query!` / `sqlx::query_as!`) for compile-time SQL validation against the schema. This eliminates runtime SQL errors and is a key reason for choosing SQLx with Axum.

---

## 7. GDPR/PIPA Compliance

### 7.1 Data Deletion

All tables use `ON DELETE CASCADE` from `user_account`. A single `DELETE FROM user_account WHERE id = $1` removes:
- All refresh tokens
- All module progress records
- All class enrollments
- All classes (if teacher) and their enrollments
- All learning paths (if teacher) and their assignments

### 7.2 Data Export

For data portability (GDPR Article 20), provide an endpoint that exports:
- User profile (user_account)
- Learning progress (module_progress)
- Class memberships (class_enrollment)

Output format: JSON.

### 7.3 Data Retention

- Refresh tokens: auto-expire after 7 days. Cleanup via scheduled task.
- No other data has a retention policy — users control their data via deletion.

---

## 8. Migration Plan

### 8.1 Initial Migration

File: `db/migrations/001_initial_schema.sql`

Covers all Phase 3 tables. Since PhysPlay has no existing database (greenfield), the initial migration creates the entire schema.

### 8.2 Migration Strategy

- Migrations are version-controlled in `db/migrations/`.
- Each migration has a matching rollback file (`*.rollback.sql`).
- Migrations run via SQLx CLI (`sqlx migrate run`) integrated into the CI/CD pipeline.
- Neon branches are used for testing migrations before applying to production.

### 8.3 Future Migration Considerations

- **Session replay storage** (Phase 3 Discovery): if needed, likely a separate append-only table or external storage (S3/R2). Not PostgreSQL — high-volume event data doesn't fit the relational model.
- **Additional OAuth providers**: add nullable columns to `user_account` (e.g., `apple_id`, `kakao_id`) with unique indexes.

---

## 9. Phase Implementation Summary

### Phase 1-2 (No Database)

No database. All data in client memory + localStorage (theme, locale). Analytics in PostHog.

### Phase 3 (All tables)

**Tables:**
- `user_account` — user profiles, Google OAuth
- `refresh_token` — JWT refresh token storage
- `module_progress` — per-user module completion, dwell time, interactions
- `class` — teacher-created classes with invite codes
- `class_enrollment` — student-class memberships
- `learning_path` — teacher-composed module orderings
- `class_learning_path` — path-to-class assignments

**Key indexes:**
- `uq_user_account_google_id`, `uq_user_account_email`
- `uq_module_progress_user_module`
- `uq_class_invite_code`
- FK indexes on all foreign key columns

**Infrastructure:**
- Neon PostgreSQL (us-east-1, matching Cloud Run us-east4)
- SQLx CLI for migrations
- Neon branching for preview environments

### Phase 4-5 (No schema changes expected)

Space Science and Quantum Mechanics tracks add new module IDs (`3-1` through `4-6`) but these are code-defined. No database schema changes needed — `module_progress.module_id` already accepts any valid `{track}-{module}` pattern.

---

## 10. Table Comments

```sql
COMMENT ON TABLE user_account IS 'Authenticated user profiles (Google OAuth). Anonymous visitors have no record.';
COMMENT ON COLUMN user_account.google_id IS 'Unique identifier from Google OAuth (sub claim)';
COMMENT ON COLUMN user_account.role IS 'RBAC role: student (default) or teacher';
COMMENT ON COLUMN user_account.locale IS 'User language preference, synced from localStorage on login';
COMMENT ON COLUMN user_account.theme IS 'UI theme preference: light, dark, or system';

COMMENT ON TABLE refresh_token IS 'Hashed JWT refresh tokens. 7-day TTL.';
COMMENT ON COLUMN refresh_token.token_hash IS 'SHA-256 hash of the refresh token. Raw token never stored.';

COMMENT ON TABLE module_progress IS 'Per-user, per-module learning progress. Aggregated counters.';
COMMENT ON COLUMN module_progress.module_id IS 'Code-defined module ID in {track}-{module} format (e.g., 1-1, 2-3)';
COMMENT ON COLUMN module_progress.total_dwell_seconds IS 'Cumulative time spent in the module across all sessions';
COMMENT ON COLUMN module_progress.total_interaction_count IS 'Cumulative slider/toggle/drag operations across all sessions';

COMMENT ON TABLE class IS 'Teacher-created class for B2B features. Students join via invite_code.';
COMMENT ON COLUMN class.invite_code IS '12-char hex invite code. Regenerable by the teacher.';

COMMENT ON TABLE class_enrollment IS 'Student membership in a class.';

COMMENT ON TABLE learning_path IS 'Teacher-composed ordered list of modules.';
COMMENT ON COLUMN learning_path.module_ids IS 'Ordered array of module IDs (e.g., {1-1, 1-2, 1-3})';

COMMENT ON TABLE class_learning_path IS 'Assignment of a learning path to a class.';
```
