package config

import (
	"errors"
	"flag"
	"fmt"
	"os"
)

type Config struct {
	FilePath string
	Port     int
	Password string
}

func (c *Config) AuthEnabled() bool {
	return c.Password != ""
}

func ParseFlags() (*Config, error) {
	fs := flag.NewFlagSet("liteweb", flag.ContinueOnError)

	filePath := fs.String("file", "", "path to SQLite database file (required)")
	port := fs.Int("port", 9090, "port to listen on")
	password := fs.String("password", "", "optional password to protect the UI")

	if err := fs.Parse(os.Args[1:]); err != nil {
		return nil, err
	}

	if *filePath == "" {
		return nil, errors.New("--file is required")
	}

	if _, err := os.Stat(*filePath); err != nil {
		return nil, fmt.Errorf("database file not found: %s", *filePath)
	}

	if *port < 1 || *port > 65535 {
		return nil, fmt.Errorf("invalid port: %d", *port)
	}

	return &Config{
		FilePath: *filePath,
		Port:     *port,
		Password: *password,
	}, nil
}
