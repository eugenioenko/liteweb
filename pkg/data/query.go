package data

import (
	"database/sql"
	"fmt"
)

func countRows(db *sql.DB, table string) (int64, error) {
	var count int64
	err := db.QueryRow(fmt.Sprintf(`SELECT COUNT(*) FROM "%s"`, table)).Scan(&count)
	return count, err
}

func fetchRows(db *sql.DB, table string, page, pageSize int) ([]string, [][]any, error) {
	offset := (page - 1) * pageSize
	query := fmt.Sprintf(`SELECT * FROM "%s" LIMIT %d OFFSET %d`, table, pageSize, offset)

	rows, err := db.Query(query)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, nil, err
	}

	var result [][]any
	for rows.Next() {
		scanArgs := make([]any, len(cols))
		vals := make([]any, len(cols))
		for i := range vals {
			scanArgs[i] = &vals[i]
		}
		if err := rows.Scan(scanArgs...); err != nil {
			return nil, nil, err
		}
		// Convert []byte to string so json.Marshal doesn't base64-encode blobs.
		row := make([]any, len(cols))
		for i, v := range vals {
			if b, ok := v.([]byte); ok {
				row[i] = string(b)
			} else {
				row[i] = v
			}
		}
		result = append(result, row)
	}
	return cols, result, rows.Err()
}
