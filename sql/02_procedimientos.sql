-- Lógica de negocio en SQL (procedimientos almacenados). Importar después de 01_tablas.sql.
USE td_roguelike;

DROP PROCEDURE IF EXISTS sp_register;
DROP PROCEDURE IF EXISTS sp_login;
DROP PROCEDURE IF EXISTS sp_me;
DROP PROCEDURE IF EXISTS sp_logout;
DROP PROCEDURE IF EXISTS sp_save_score;
DROP PROCEDURE IF EXISTS sp_leaderboard;

DELIMITER $$

CREATE PROCEDURE sp_register(IN p_user VARCHAR(30), IN p_pass VARCHAR(100), IN p_token CHAR(64))
BEGIN
  DECLARE v_id INT;
  DECLARE v_salt CHAR(32);
  IF p_user NOT REGEXP '^[A-Za-z0-9_]{3,30}$' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario: 3-30 letras/números/_';
  END IF;
  IF CHAR_LENGTH(p_pass) < 6 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Contraseña de al menos 6 caracteres';
  END IF;
  IF EXISTS (SELECT 1 FROM users WHERE username = p_user) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ese usuario ya existe';
  END IF;
  SET v_salt = REPLACE(UUID(), '-', '');
  INSERT INTO users(username, salt, pass_hash) VALUES (p_user, v_salt, SHA2(CONCAT(v_salt, p_pass), 256));
  SET v_id = LAST_INSERT_ID();
  INSERT INTO stats(user_id) VALUES (v_id);
  INSERT INTO sessions(token, user_id, expires_at) VALUES (p_token, v_id, DATE_ADD(NOW(), INTERVAL 7 DAY));
  SELECT p_user AS username, 0 AS best_score, 0 AS best_wave;
END$$

CREATE PROCEDURE sp_login(IN p_user VARCHAR(30), IN p_pass VARCHAR(100), IN p_token CHAR(64))
BEGIN
  DECLARE v_id INT;
  DECLARE v_salt CHAR(32);
  DECLARE v_hash CHAR(64);
  SELECT id, salt, pass_hash INTO v_id, v_salt, v_hash FROM users WHERE username = p_user;
  IF v_id IS NULL OR SHA2(CONCAT(v_salt, p_pass), 256) <> v_hash THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario o contraseña incorrectos';
  END IF;
  DELETE FROM sessions WHERE expires_at < NOW();
  INSERT INTO sessions(token, user_id, expires_at) VALUES (p_token, v_id, DATE_ADD(NOW(), INTERVAL 7 DAY));
  SELECT u.username, s.best_score, s.best_wave FROM users u JOIN stats s ON s.user_id = u.id WHERE u.id = v_id;
END$$

CREATE PROCEDURE sp_me(IN p_token CHAR(64))
BEGIN
  SELECT u.username, s.best_score, s.best_wave, s.runs
  FROM sessions se JOIN users u ON u.id = se.user_id JOIN stats s ON s.user_id = u.id
  WHERE se.token = p_token AND se.expires_at > NOW();
END$$

CREATE PROCEDURE sp_logout(IN p_token CHAR(64))
BEGIN
  DELETE FROM sessions WHERE token = p_token;
  SELECT 1 AS ok;
END$$

CREATE PROCEDURE sp_save_score(IN p_token CHAR(64), IN p_score INT, IN p_wave INT)
BEGIN
  DECLARE v_uid INT;
  SELECT user_id INTO v_uid FROM sessions WHERE token = p_token AND expires_at > NOW();
  IF v_uid IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No logueado';
  END IF;
  UPDATE stats SET
    best_score = GREATEST(best_score, LEAST(GREATEST(p_score, 0), 10000000)),
    best_wave  = GREATEST(best_wave,  LEAST(GREATEST(p_wave, 0), 1000)),
    runs = runs + 1
  WHERE user_id = v_uid;
  SELECT best_score, best_wave, runs FROM stats WHERE user_id = v_uid;
END$$

CREATE PROCEDURE sp_leaderboard()
BEGIN
  SELECT u.username, s.best_score, s.best_wave
  FROM stats s JOIN users u ON u.id = s.user_id
  ORDER BY s.best_score DESC LIMIT 10;
END$$

DELIMITER ;
