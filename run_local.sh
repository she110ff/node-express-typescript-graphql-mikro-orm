#!/usr/bin/env bash
set -e
npm run lint
npm run dev-db
sleep 10
npm run dev
