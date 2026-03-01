-- PhysPlay: Initial Schema (Phase 3)
-- All tables for user accounts, learning progress, and B2B class features.

-- =============================================================================
-- 1. USER ACCOUNTS & AUTH
-- =============================================================================

CREATE TABLE user_account (
    -- 8-byte columns first
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- variable-length columns
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

CREATE UNIQUE INDEX uq_user_account_google_id ON user_account (google_id);
CREATE UNIQUE INDEX uq_user_account_email ON user_account (email);

COMMENT ON TABLE user_account IS 'Authenticated user profiles (Google OAuth). Anonymous visitors have no record.';
COMMENT ON COLUMN user_account.google_id IS 'Unique identifier from Google OAuth (sub claim)';
COMMENT ON COLUMN user_account.role IS 'RBAC role: student (default) or teacher';
COMMENT ON COLUMN user_account.locale IS 'User language preference, synced from localStorage on login';
COMMENT ON COLUMN user_account.theme IS 'UI theme preference: light, dark, or system';


CREATE TABLE refresh_token (
    -- 8-byte columns first
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ NOT NULL,
    user_id         BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
    -- variable-length columns
    token_hash      TEXT NOT NULL
);

CREATE UNIQUE INDEX uq_refresh_token_hash ON refresh_token (token_hash);
CREATE INDEX idx_refresh_token_user_id ON refresh_token (user_id);
CREATE INDEX idx_refresh_token_expires_at ON refresh_token (expires_at);

COMMENT ON TABLE refresh_token IS 'Hashed JWT refresh tokens. 7-day TTL.';
COMMENT ON COLUMN refresh_token.token_hash IS 'SHA-256 hash of the refresh token. Raw token never stored.';

-- =============================================================================
-- 2. LEARNING PROGRESS
-- =============================================================================

CREATE TABLE module_progress (
    -- 8-byte columns first
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id                 BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
    first_visited_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_visited_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at            TIMESTAMPTZ,
    -- 4-byte columns
    total_dwell_seconds     INTEGER NOT NULL DEFAULT 0
                            CHECK (total_dwell_seconds >= 0),
    total_interaction_count INTEGER NOT NULL DEFAULT 0
                            CHECK (total_interaction_count >= 0),
    -- 1-byte columns
    is_completed            BOOLEAN NOT NULL DEFAULT false,
    -- variable-length columns
    module_id               TEXT NOT NULL
                            CHECK (module_id ~ '^\d-\d$')
);

CREATE UNIQUE INDEX uq_module_progress_user_module ON module_progress (user_id, module_id);
CREATE INDEX idx_module_progress_user_id ON module_progress (user_id);

COMMENT ON TABLE module_progress IS 'Per-user, per-module learning progress. Aggregated counters.';
COMMENT ON COLUMN module_progress.module_id IS 'Code-defined module ID in {track}-{module} format (e.g., 1-1, 2-3)';
COMMENT ON COLUMN module_progress.total_dwell_seconds IS 'Cumulative time spent in the module across all sessions';
COMMENT ON COLUMN module_progress.total_interaction_count IS 'Cumulative slider/toggle/drag operations across all sessions';

-- =============================================================================
-- 3. B2B: CLASSES & ENROLLMENT
-- =============================================================================

CREATE TABLE class (
    -- 8-byte columns first
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    teacher_id      BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
    -- 1-byte columns
    is_active       BOOLEAN NOT NULL DEFAULT true,
    -- variable-length columns
    name            TEXT NOT NULL
                    CHECK (char_length(name) BETWEEN 1 AND 100),
    invite_code     TEXT NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex')
);

CREATE UNIQUE INDEX uq_class_invite_code ON class (invite_code);
CREATE INDEX idx_class_teacher_id ON class (teacher_id);
CREATE INDEX idx_class_teacher_active ON class (teacher_id) WHERE is_active = true;

COMMENT ON TABLE class IS 'Teacher-created class for B2B features. Students join via invite_code.';
COMMENT ON COLUMN class.invite_code IS '12-char hex invite code. Regenerable by the teacher.';


CREATE TABLE class_enrollment (
    -- 8-byte columns first
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    class_id        BIGINT NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    student_id      BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX uq_class_enrollment_class_student ON class_enrollment (class_id, student_id);
CREATE INDEX idx_class_enrollment_class_id ON class_enrollment (class_id);
CREATE INDEX idx_class_enrollment_student_id ON class_enrollment (student_id);

COMMENT ON TABLE class_enrollment IS 'Student membership in a class.';

-- =============================================================================
-- 4. B2B: LEARNING PATHS
-- =============================================================================

CREATE TABLE learning_path (
    -- 8-byte columns first
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    teacher_id      BIGINT NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
    -- variable-length columns
    name            TEXT NOT NULL
                    CHECK (char_length(name) BETWEEN 1 AND 100),
    module_ids      TEXT[] NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_learning_path_teacher_id ON learning_path (teacher_id);

COMMENT ON TABLE learning_path IS 'Teacher-composed ordered list of modules.';
COMMENT ON COLUMN learning_path.module_ids IS 'Ordered array of module IDs (e.g., {1-1, 1-2, 1-3})';


CREATE TABLE class_learning_path (
    -- 8-byte columns first
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    assigned_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    class_id            BIGINT NOT NULL REFERENCES class(id) ON DELETE CASCADE,
    learning_path_id    BIGINT NOT NULL REFERENCES learning_path(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX uq_class_learning_path ON class_learning_path (class_id, learning_path_id);
CREATE INDEX idx_class_learning_path_class_id ON class_learning_path (class_id);
CREATE INDEX idx_class_learning_path_learning_path_id ON class_learning_path (learning_path_id);

COMMENT ON TABLE class_learning_path IS 'Assignment of a learning path to a class.';
