#!/usr/bin/env bash
set -e
npm run lint
npm run clean
npm run dev-db
sleep 10
npx mikro-orm schema:fresh --run --seed
npm run dev
