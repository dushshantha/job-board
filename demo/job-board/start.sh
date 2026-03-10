#!/usr/bin/env bash
# start.sh — one-command setup and concurrent startup for the Job Board demo.
#
# Usage:
#   bash start.sh           # install deps, seed DB, start both servers
#   bash start.sh --no-seed # skip database seeding (use existing data)
#
# Ports used:
#   3001 — Express API
#   5173 — Vite dev server (React frontend)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NO_SEED=false

for arg in "$@"; do
  case $arg in
    --no-seed) NO_SEED=true ;;
    *) echo "Unknown argument: $arg" && exit 1 ;;
  esac
done

# ---------------------------------------------------------------------------
# 1. Install backend dependencies
# ---------------------------------------------------------------------------
echo "==> Installing backend dependencies..."
(cd "$SCRIPT_DIR" && npm install)

# ---------------------------------------------------------------------------
# 2. Install frontend dependencies
# ---------------------------------------------------------------------------
if [ -d "$SCRIPT_DIR/client" ]; then
  echo "==> Installing frontend dependencies..."
  (cd "$SCRIPT_DIR/client" && npm install)
fi

# ---------------------------------------------------------------------------
# 3. Seed database (unless --no-seed)
# ---------------------------------------------------------------------------
if [ "$NO_SEED" = false ]; then
  echo "==> Seeding database..."
  (cd "$SCRIPT_DIR" && npm run seed)
fi

# ---------------------------------------------------------------------------
# 4. Start servers concurrently
# ---------------------------------------------------------------------------
echo ""
echo "==> Starting servers..."
echo "    API:      http://localhost:3001"
echo "    Frontend: http://localhost:5173"
echo ""
echo "    Press Ctrl+C to stop both servers."
echo ""

# Trap Ctrl+C so both children are killed together.
trap 'kill 0' INT TERM

# Start backend
(cd "$SCRIPT_DIR" && npm run dev) &
BACKEND_PID=$!

# Give the API a moment to bind before the frontend proxy tries to connect.
sleep 1

# Start frontend (only if client dir exists)
if [ -d "$SCRIPT_DIR/client" ]; then
  (cd "$SCRIPT_DIR/client" && npm run dev) &
  FRONTEND_PID=$!
fi

# Wait for both processes
wait
