## Quick orientation for AI coding agents

This repository is a small two-part starter: a React + Vite frontend (client) and a Django REST backend (server). The goal of these instructions is to highlight project-specific architecture, conventions, and the most common dev workflows so an AI agent can be immediately productive.

- Frontend: `invoice-client-starter/`
  - React + Vite app. See `package.json` for scripts (`dev`, `build`, `lint`).
  - API helper: `src/utils/api.js` — base URL is `http://localhost:8000` and helper functions are `apiGet`, `apiPost`, `apiPut`, `apiDelete`.
  - Person-related components live under `src/persons/` (e.g. `PersonIndex.jsx`, `PersonForm.jsx`, `PersonDetail.jsx`). These components use camelCase property names that mirror the serializer fields from the backend (see below).

- Backend: `invoices-server-starter/`
  - Django project with DRF. Requirements are in `requirements.txt`.
  - App: `invoices/` — models, serializers, viewsets and the `SlashOptionalRouter` live here.
  - Important: `invoices/routers.py` defines `SlashOptionalRouter` (trailing slash optional). API routes are mounted under the `api/` prefix from `invoices/urls.py` (so client calls like `/api/persons/` or `/api/persons` are accepted).

Key patterns and gotchas (explicit, real examples):
- Soft-delete + copy-on-update: `invoices/views/person_views.py` overrides `update` and `destroy` to set `hidden=True` instead of hard-deleting. `update` creates a new Person instance from validated data and returns that new object. This means:
  - PUT is implemented as “mark old record hidden + create new record” (not an in-place update). Do not assume id is preserved across an update.
  - `hidden` is used to filter active rows: `queryset = Person.objects.filter(hidden=False)`.

- Serializer / field naming: `invoices/serializers.py` exposes an `_id` field mapped from the model `id` and fields use camelCase names like `identificationNumber`. The frontend expects the same camelCase names (see `PersonDetail.jsx` which reads `person.identificationNumber`).

- Router/trailing slash: `SlashOptionalRouter` sets `trailing_slash = '/?'`. Client code in `src/utils/api.js` often constructs endpoints without trailing slashes (e.g. `apiGet('/api/persons/${id}')`) and that is intentional and supported by the router.

- CORS / local dev: `invoices_server/settings.py` sets `CORS_ALLOW_ALL_ORIGINS = True` in development. The client runs on Vite (default port 5173) and the Django dev server runs on 8000. Expect cross-origin requests during local development.

Developer workflows (how to run locally):
- Server (from repository root or the `invoices-server-starter/` folder):
  1. Create & activate a Python venv, then install: `pip install -r invoices-server-starter/requirements.txt`.
  2. From `invoices-server-starter/`: `python manage.py migrate` (if you change models) and `python manage.py runserver` to start on `http://127.0.0.1:8000`.
  3. Tests: run `python manage.py test` from `invoices-server-starter/`.

- Client (from `invoice-client-starter/`):
  1. `npm install` (or `pnpm`/`yarn` if preferred but `package.json` expects npm).
  2. `npm run dev` to start Vite (HMR).
  3. `npm run lint` to run ESLint.

Integration points and cross-component contracts:
- API root: `/api/` (see `invoices/urls.py`). The `persons` endpoints are provided by a DRF ModelViewSet (`PersonViewSet`).
- Data shape: the Person serializer fields are authoritative. Relevant files: `invoices/models.py` and `invoices/serializers.py`. Example properties used in UI: `name`, `identificationNumber`, `taxNumber`, `accountNumber`, `bankCode`, `iban`, `telephone`, `mail`, `street`, `zip`, `city`, `country`, `note`, and `_id`.

When editing code, prefer minimal, low-risk changes:
- Follow the existing naming conventions (camelCase for JSON fields).
- Preserve `hidden`-based soft-delete behavior unless a feature explicitly requires different semantics. If you must change it, update both serializer/viewset logic and frontend assumptions.

Files to inspect first when asked to implement/person-fix API-feature:
- `invoice-client-starter/src/utils/api.js` — network layer and error handling.
- `invoice-client-starter/src/persons/*` — UI components.
- `invoices-server-starter/invoices/models.py`, `serializers.py`, `views/person_views.py`, `routers.py`, `urls.py` — backend contract and routing.

If anything here is ambiguous: ask for which side to change (client vs server) and whether preserving backwards compatibility (IDs, hidden flag semantics) is required.

If you'd like, I can iterate this file with additional examples (small request/response JSON snippets) or add quick-run scripts for macOS dev setups.
