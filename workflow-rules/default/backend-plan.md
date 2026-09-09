# default / backend-plan — teq-platform (v4 / v5 API)

Implementation docs for Django. Follow `openflow-rule-details/stages/plan.md`.
Canonical: `teq-platform/AGENTS.md`, `docs/architecture/service-layer.md`,
`docs/architecture/list-api.md`. Read the frontend plan first.

## Scope

v5 HTTP: SPA → **v4papi** (`BaseProxyAPIView`) → **teqapi** (`BaseAPIView`) or
another `APP_LIST` service. Business logic in `teq-package`
`helpers/v4/<Entity>Helper`. Views stay thin.

## What to decide in this plan

1. Grep v4papi / teqapi — extend an existing route if it already owns the data.
2. Which service owns writes (usually teqapi). v4papi is forward-only unless
   transform is required.
3. List vs detail vs write. List contract: GET query string, omit-empty filters,
   silent default sort (not echoed to the UI), envelope
   `{ items, pagination: { page, perPage, total, totalPages } }`.
   Params: `page`, `per_page`, `search`, `sort_field`/`sort_order`, `group_by`,
   `active`, `department_ids`.
4. Helper method = one use case (validate → mutate → one flush, `transaction.atomic(using=domain)`).
5. Permission `url_name` + HTTP method (frontend will use `<url_name>@<METHOD>`).
6. Files: presigned S3 + `S3UploadClaimMixin` / `dest_folder`. No new multipart
   through Django. No `POST /papi/v4/common/upload/` for new work.
7. Match v3 business rules unless the ticket says otherwise.

## Artifacts

`proposal.md`, `specs/`, `design.md` (service, helper, routes, envelope, permissions),
`tasks.md` in the backend repo. Swagger v4 is the contract the SPA will call.
