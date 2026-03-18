APP_NAME = liteweb
UI_DIR   = ui
DIST_DIR = pkg/ui/dist

.PHONY: all build ui-build ui-dev build-go fmt test clean

# Full production build: frontend → embed → go compile
all: build

build: ui-build
	go build -ldflags="-s -w" -o $(APP_NAME) .

# Build React frontend and copy dist into the embed location
ui-build:
	cd $(UI_DIR) && pnpm install && pnpm run build
	rm -rf $(DIST_DIR)
	cp -r $(UI_DIR)/dist $(DIST_DIR)

# Start Vite dev server (proxies /api/ to the Go backend)
ui-dev:
	cd $(UI_DIR) && pnpm run dev

# Build Go binary only (assumes dist already built)
build-go:
	go build -o $(APP_NAME) .

fmt:
	gofmt -w .

test:
	go test -v ./...

clean:
	rm -f $(APP_NAME)
	rm -rf $(DIST_DIR)
	rm -rf $(UI_DIR)/dist
	rm -rf $(UI_DIR)/node_modules
