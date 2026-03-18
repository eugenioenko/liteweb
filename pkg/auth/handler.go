package auth

import (
	"crypto/subtle"
	"encoding/json"
	"net/http"
	"time"

	"github.com/eugenioenko/liteweb/pkg/config"
)

const cookieName = "liteweb_session"

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func HandleMe(cfg *config.Config, store *SessionStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(cookieName)
		authenticated := err == nil && store.Valid(cookie.Value)
		writeJSON(w, http.StatusOK, map[string]any{
			"authenticated": authenticated,
			"auth_enabled":  true,
		})
	}
}

func HandleLogin(cfg *config.Config, store *SessionStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
			return
		}

		if subtle.ConstantTimeCompare([]byte(cfg.Password), []byte(body.Password)) != 1 {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid password"})
			return
		}

		token, err := store.Create()
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal error"})
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    token,
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteStrictMode,
		})
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	}
}

func HandleLogout(store *SessionStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if cookie, err := r.Cookie(cookieName); err == nil {
			store.Delete(cookie.Value)
		}
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    "",
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteStrictMode,
			Expires:  time.Unix(0, 0),
			MaxAge:   -1,
		})
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	}
}
