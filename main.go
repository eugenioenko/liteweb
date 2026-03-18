package main

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/eugenioenko/liteweb/pkg/auth"
	"github.com/eugenioenko/liteweb/pkg/config"
	"github.com/eugenioenko/liteweb/pkg/data"
	"github.com/eugenioenko/liteweb/pkg/db"
	"github.com/eugenioenko/liteweb/pkg/middleware"
	"github.com/eugenioenko/liteweb/pkg/schema"
	"github.com/eugenioenko/liteweb/pkg/ui"
)

func printHelp() {
	fmt.Print(`
  liteweb — SQLite Viewer

  A fast, single-binary SQLite database viewer with a web UI.

  Usage:
    liteweb --file <path> [options]
    liteweb help

  Options:
    --file      <path>    Path to the SQLite database file (required)
    --port      <number>  Port to listen on (default: 9090)
    --password  <string>  Password to protect the UI (optional)

  Examples:
    liteweb --file ./mydb.sqlite
    liteweb --file ./mydb.sqlite --port 8080
    liteweb --file ./mydb.sqlite --password secret

`)
}

func main() {
	if len(os.Args) < 2 || os.Args[1] == "help" || os.Args[1] == "--help" || os.Args[1] == "-h" {
		printHelp()
		os.Exit(0)
	}

	cfg, err := config.ParseFlags()
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		fmt.Fprintf(os.Stderr, "run 'liteweb help' for usage\n")
		os.Exit(1)
	}

	database, err := db.Open(cfg.FilePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error opening database: %v\n", err)
		os.Exit(1)
	}
	defer database.Close()

	sessionStore := auth.NewSessionStore()
	mux := http.NewServeMux()

	// Auth routes (only registered when --password is set)
	if cfg.AuthEnabled() {
		mux.HandleFunc("GET /api/me", auth.HandleMe(cfg, sessionStore))
		mux.HandleFunc("POST /api/login", auth.HandleLogin(cfg, sessionStore))
		mux.HandleFunc("POST /api/logout", auth.HandleLogout(sessionStore))
	}

	requireAuth := auth.RequireAuth(cfg, sessionStore)

	mux.Handle("GET /api/tables", requireAuth(schema.HandleListTables(database)))
	mux.Handle("GET /api/tables/{name}/schema", requireAuth(schema.HandleTableSchema(database)))
	mux.Handle("GET /api/tables/{name}/data", requireAuth(data.HandleTableData(database)))

	mux.Handle("/", ui.Handler())

	combined := middleware.CombineMiddlewares([]func(http.Handler) http.Handler{
		middleware.LoggingMiddleware,
	})

	addr := fmt.Sprintf(":%d", cfg.Port)
	srv := &http.Server{
		Addr:    addr,
		Handler: combined(mux),
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	go func() {
		<-ctx.Done()
		if err := srv.Shutdown(context.Background()); err != nil {
			log.Printf("shutdown error: %v", err)
		}
	}()

	url := fmt.Sprintf("http://localhost:%d", cfg.Port)
	fmt.Printf("\n  liteweb — SQLite Viewer\n\n")
	fmt.Printf("  File:   %s\n", cfg.FilePath)
	fmt.Printf("  Server: %s\n", url)
	if cfg.AuthEnabled() {
		fmt.Printf("  Auth:   enabled\n")
	}
	fmt.Println()

	go func() {
		time.Sleep(300 * time.Millisecond)
		openBrowser(url)
	}()

	slog.Info("server started", "addr", addr)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server error: %v", err)
	}
}

func openBrowser(url string) {
	var cmd string
	var args []string
	switch runtime.GOOS {
	case "darwin":
		cmd = "open"
		args = []string{url}
	case "windows":
		cmd = "rundll32"
		args = []string{"url.dll,FileProtocolHandler", url}
	default:
		cmd = "xdg-open"
		args = []string{url}
	}
	if err := exec.Command(cmd, args...).Start(); err != nil {
		slog.Warn("could not open browser", "error", err)
	}
}
