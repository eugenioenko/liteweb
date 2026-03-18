package schema

import (
	"database/sql"
	"fmt"
)

type Object struct {
	Name string `json:"name"`
	Type string `json:"type"` // "table" or "view"
}

type Column struct {
	CID          int     `json:"cid"`
	Name         string  `json:"name"`
	Type         string  `json:"type"`
	NotNull      bool    `json:"notnull"`
	DefaultValue *string `json:"default_value"`
	PrimaryKey   int     `json:"primary_key"`
}

type Index struct {
	Name    string   `json:"name"`
	Unique  bool     `json:"unique"`
	Columns []string `json:"columns"`
}

type TableSchema struct {
	Name    string   `json:"name"`
	Columns []Column `json:"columns"`
	Indexes []Index  `json:"indexes"`
}

func listObjects(db *sql.DB) ([]Object, error) {
	rows, err := db.Query(`
		SELECT name, type FROM sqlite_master
		WHERE type IN ('table', 'view')
		AND name NOT LIKE 'sqlite_%'
		ORDER BY type, name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var objects []Object
	for rows.Next() {
		var o Object
		if err := rows.Scan(&o.Name, &o.Type); err != nil {
			return nil, err
		}
		objects = append(objects, o)
	}
	return objects, rows.Err()
}

// TableExists checks whether a table or view with the given name exists.
func TableExists(db *sql.DB, name string) (bool, error) {
	var count int
	err := db.QueryRow(`
		SELECT COUNT(*) FROM sqlite_master
		WHERE type IN ('table', 'view')
		AND name = ?
		AND name NOT LIKE 'sqlite_%'
	`, name).Scan(&count)
	return count > 0, err
}

func tableSchema(db *sql.DB, name string) (*TableSchema, error) {
	// PRAGMA table_info returns: cid, name, type, notnull, dflt_value, pk
	rows, err := db.Query(fmt.Sprintf(`PRAGMA table_info("%s")`, name))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var columns []Column
	for rows.Next() {
		var c Column
		if err := rows.Scan(&c.CID, &c.Name, &c.Type, &c.NotNull, &c.DefaultValue, &c.PrimaryKey); err != nil {
			return nil, err
		}
		columns = append(columns, c)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	indexes, err := tableIndexes(db, name)
	if err != nil {
		return nil, err
	}

	return &TableSchema{
		Name:    name,
		Columns: columns,
		Indexes: indexes,
	}, nil
}

func tableIndexes(db *sql.DB, name string) ([]Index, error) {
	rows, err := db.Query(fmt.Sprintf(`PRAGMA index_list("%s")`, name))
	if err != nil {
		return nil, err
	}

	type indexMeta struct {
		seq     int
		name    string
		unique  bool
		origin  string
		partial bool
	}

	var metas []indexMeta
	for rows.Next() {
		var m indexMeta
		if err := rows.Scan(&m.seq, &m.name, &m.unique, &m.origin, &m.partial); err != nil {
			rows.Close()
			return nil, err
		}
		metas = append(metas, m)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return nil, err
	}

	var indexes []Index
	for _, m := range metas {
		cols, err := indexColumns(db, m.name)
		if err != nil {
			return nil, err
		}
		indexes = append(indexes, Index{
			Name:    m.name,
			Unique:  m.unique,
			Columns: cols,
		})
	}
	return indexes, nil
}

func indexColumns(db *sql.DB, indexName string) ([]string, error) {
	rows, err := db.Query(fmt.Sprintf(`PRAGMA index_info("%s")`, indexName))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cols []string
	for rows.Next() {
		var seqno, cid int
		var name string
		if err := rows.Scan(&seqno, &cid, &name); err != nil {
			return nil, err
		}
		cols = append(cols, name)
	}
	return cols, rows.Err()
}
