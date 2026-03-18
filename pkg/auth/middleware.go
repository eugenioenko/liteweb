package auth

import (
	"encoding/json"
	"net/http"

	"github.com/eugenioenko/liteweb/pkg/config"
)

// RequireAuth returns a middleware that enforces authentication when --password is set.
// When auth is disabled it is a transparent passthrough.
func RequireAuth(cfg *config.Config, store *SessionStore) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		if !cfg.AuthEnabled() {
			return next
		}
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(cookieName)
			if err != nil || !store.Valid(cookie.Value) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(map[string]string{"error": "unauthorized"})
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
