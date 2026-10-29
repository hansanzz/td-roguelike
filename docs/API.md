# API REST

Base: `/api`. Formato JSON. La sesión viaja en la cookie `tk` (HttpOnly, SameSite=Strict, 7 días), que el servidor crea en `register` y `login`.
Los errores tienen la forma `{ "error": "mensaje" }`.

| Método | Ruta | Cuerpo | Respuesta OK | Errores |
|---|---|---|---|---|
| POST | `/api/auth/register` | `{ username, password }` | `201 { ok, username, best_score, best_wave }` + cookie | `400` usuario inválido (3-30 letras/números/_), contraseña corta (<6) o usuario existente |
| POST | `/api/auth/login` | `{ username, password }` | `200 { ok, username, best_score, best_wave }` + cookie | `400` usuario o contraseña incorrectos |
| GET | `/api/auth/me` | - | `200 { logged: true, username, best_score, best_wave, runs }` o `{ logged: false }` | - |
| POST | `/api/auth/logout` | - | `200 { ok: true }` | - |
| POST | `/api/scores` | `{ score, wave }` | `200 { best_score, best_wave, runs }` | `400 No logueado` |
| GET | `/api/scores/leaderboard` | - | `200 [ { username, best_score, best_wave } ]` (top 10) | - |

Notas:
- `score` y `wave` se limitan dentro de SQL (`sp_save_score`); solo se actualiza el récord si se supera.
- Cualquier otra ruta bajo `/api` responde `404 { error: "Ruta no encontrada" }`; un fallo inesperado responde `500 { error: "Error del servidor" }`.
- Cada endpoint corresponde a un procedimiento: `sp_register`, `sp_login`, `sp_me`, `sp_logout`, `sp_save_score`, `sp_leaderboard`.
