package schema

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type apiResponse[T any] struct {
	Data T `json:"data"`
}

type apiError struct {
	Error string `json:"error"`
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, apiError{Error: msg})
}

func HandleListTables(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		objects, err := listObjects(db)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		if objects == nil {
			objects = []Object{}
		}
		writeJSON(w, http.StatusOK, apiResponse[[]Object]{Data: objects})
	}
}

func HandleTableSchema(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		name := r.PathValue("name")

		exists, err := TableExists(db, name)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		if !exists {
			writeError(w, http.StatusNotFound, "table not found")
			return
		}

		s, err := tableSchema(db, name)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		writeJSON(w, http.StatusOK, apiResponse[*TableSchema]{Data: s})
	}
}
