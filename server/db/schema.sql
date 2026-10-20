-- TutaPass PostgreSQL Schema Migration
-- Drops existing tables for clean idempotency during development/reseeding

DROP TABLE IF EXISTS flashcards CASCADE;
DROP TABLE IF EXISTS user_attempts CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS study_plans CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS syllabi CASCADE;

-- 1. Syllabi (AZ-900 Flagship or User-Imported Syllabi)
CREATE TABLE syllabi (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) DEFAULT 'AZ-900',
    description TEXT,
    is_flagship BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Domains (High-level syllabus sections & percentage weights)
CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    syllabus_id INT REFERENCES syllabi(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    weight_min INT NOT NULL,
    weight_max INT NOT NULL,
    description TEXT
);

-- 3. User Study Plans
CREATE TABLE study_plans (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    syllabus_id INT REFERENCES syllabi(id) ON DELETE CASCADE,
    target_exam_date DATE NOT NULL,
    daily_hours NUMERIC(3,1) NOT NULL,
    schedule_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Quiz Questions & Distractor Autopsies
CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    domain_id INT REFERENCES domains(id) ON DELETE CASCADE,
    topic_tag VARCHAR(150),
    scenario TEXT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of { id, text, is_correct, autopsy: { why_wrong, right_scenario, trap } }
    context_translations JSONB, -- { standard, african_context, sheng }
    difficulty VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Quiz Attempts
CREATE TABLE user_attempts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    question_id INT REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_option_id VARCHAR(10) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Weak-Spot Flashcards (Spaced Repetition)
CREATE TABLE flashcards (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    domain_id INT REFERENCES domains(id) ON DELETE CASCADE,
    topic_tag VARCHAR(150),
    front_prompt TEXT NOT NULL,
    back_explanation TEXT NOT NULL,
    context_notes JSONB, -- { standard, african_context, sheng }
    interval_days INT DEFAULT 1,
    repetition_count INT DEFAULT 0,
    ease_factor NUMERIC(3,2) DEFAULT 2.50,
    next_review_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Helpful indexes for rapid querying in dashboard and practice arena
CREATE INDEX idx_domains_syllabus ON domains(syllabus_id);
CREATE INDEX idx_questions_domain ON quiz_questions(domain_id);
CREATE INDEX idx_attempts_user ON user_attempts(user_id);
CREATE INDEX idx_flashcards_user_due ON flashcards(user_id, next_review_at);
