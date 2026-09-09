# default / backend-build — teq-platform (v4 / v5 API)

Implement the approved backend plan. Follow `openflow-rule-details/stages/implement.md`.
Canonical: `teq-platform/AGENTS.md`.

## teqapi — `BaseAPIView`

`teq.common.helpers.v4.base_api_view`. Mixins **left**, `BaseAPIView` **right**.
Never subclass raw `APIView`.

- `self.domain` for every `.using()` — never `get_request_domain` inline.
- Success only via `ok` / `created` / `no_content` / `list_response`.
- Detail: `ObjectScopeMixin` + `check_object` first. List: `ScopedQuerysetMixin`
  (+ `PaginatedListMixin`); `sort_whitelist`; unknown sort → default, never 500.
- Files: `S3UploadClaimMixin` + `dest_folder`; `claim_attachment_uploads`; persist
  URLs yourself. Payload: top-level `attachments` with `field`, `file_key`, `file_name`.

## v4papi — `BaseProxyAPIView`

`teq.common.helpers.v4.base_proxy_view`. Always `self.proxy()`. Default target is
teqapi (`method_prefix` only). Other services: set `app_name` + `root_url_attr`.
Override `transform_*` only when SPA shape ≠ upstream.

## Helpers

Business logic in `teq/common/helpers/v4/<Entity>Helper`. View calls **one** helper
method. Constructor `(request=None, domain=None)`. `<Entity>Service` only if ≥2
helpers write that entity. Never `QuerySet.update()` for order/trip **state**
(bypasses `save()` — see context-docs order-state-management).

## List API

GET only. Missing filter = no restriction. Absent `sort_field` ⇒ silent
`default_sort` (+ `id`) for stable pages — do not invent UI sort metadata.
Group by: `list_response(..., grouped=True, groupBy=…, groups=…)`.

On bugs use `systematic-debugging`. Before the gate: `verification-before-completion`
and `openflow-code-review`. Still wait for `openflow approve`.
