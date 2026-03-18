package data

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/eugenioenko/liteweb/pkg/schema"
)

type tableDataResponse struct {
	Columns  []string `json:"columns"`
	Rows     [][]any  `json:"rows"`
	Total    int64    `json:"total"`
	Page     int      `json:"page"`
	PageSize int      `json:"page_size"`
}

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

var validPageSizes = map[int]bool{25: true, 50: true, 100: true}

func HandleTableData(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		name := r.PathValue("name")

		exists, err := schema.TableExists(db, name)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err.Error())
			return
		}
		if !exists {
			writeError(w, http.StatusNotFound, "table not found")
			return
		}

		page := 1
		pageSize := 25

		if p := r.URL.Query().Get("page"); p != "" {
			if v, err := strconv.Atoi(p); err == nil && v > 0 {
				page = v
			}
		}
		if ps := r.URL.Query().Get("page_size"); ps != "" {
			if v, err := strconv.Atoi(ps); err == nil && validPageSizes[v] {
				pageSize = v
			}
		}

		total, err := countRows(db, name)
		if err != nil {
			writeError(w, http.StatusInternalServerError, fmt.Sprintf("count rows: %v", err))
			return
		}

		cols, rows, err := fetchRows(db, name, page, pageSize)
		if err != nil {
			writeError(w, http.StatusInternalServerError, fmt.Sprintf("fetch rows: %v", err))
			return
		}

		if rows == nil {
			rows = [][]any{}
		}

		writeJSON(w, http.StatusOK, apiResponse[tableDataResponse]{
			Data: tableDataResponse{
				Columns:  cols,
				Rows:     rows,
				Total:    total,
				Page:     page,
				PageSize: pageSize,
			},
		})
	}
}
