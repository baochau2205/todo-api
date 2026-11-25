-- database.sql: schema cho app Jobs (PostgreSQL)

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  company VARCHAR(100),
  salary INTEGER,
  remote BOOLEAN DEFAULT false,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dữ liệu mẫu
INSERT INTO users (email, password_hash)
VALUES ('chau@test.com', 'hash-tam'),
       ('lan@test.com', 'hash-tam');

INSERT INTO jobs (title, company, salary, remote, created_by)
VALUES ('Frontend Intern', 'Acme', 40000, true, 1),
       ('Backend Intern', 'Beta', 45000, false, 1),
       ('Fullstack Junior', 'Acme', 60000, true, 2),
       ('React Developer', 'Gamma', 70000, false, 2);