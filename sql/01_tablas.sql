-- Tablas: usuarios, estadísticas y sesiones. Importar primero.
CREATE DATABASE IF NOT EXISTS td_roguelike CHARACTER SET utf8mb4;
USE td_roguelike;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  salt CHAR(32) NOT NULL,
  pass_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS stats (
  user_id INT PRIMARY KEY,
  best_score INT NOT NULL DEFAULT 0,
  best_wave INT NOT NULL DEFAULT 0,
  runs INT NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS sessions (
  token CHAR(64) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
