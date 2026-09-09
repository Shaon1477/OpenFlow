# default / integrate — TEQ v5

Wire SPA to v4papi against the real contract. Follow
`openflow-rule-details/stages/integrate.md`.

## Contract

1. Diff frontend `design.md` vs backend `design.md` vs Swagger
   `http://127.0.0.1:8000/swagger/v4/` (v4papi may rename write fields).
2. SPA calls **only** `/papi/v4/…` via `apiClient`. Never teqapi / scheduler /
   companysettings from the browser.
3. snake_case stays in `api/` (`toSnakeKeys` out, `toCamelKeys` in).
4. Lists: `{ items, pagination: { page, perPage, total, totalPages } }`. Frontend
   omits default sort; backend may still sort silently for stable pages.
5. Permission keys in the SPA must match the proxy view’s `url_name@METHOD`.
6. Uploads: same `dest_folder` on both sides; `attachments[]` shape.
7. Datetime: new endpoints UTC `…Z`. Do not send UTC into a cookie/`TzConverter`
   legacy view.

Fix the mismatch in the owning repo; do not paper over it in the other layer.

On a contract mismatch: `systematic-debugging` (which layer?). Before the gate:
`verification-before-completion` and `openflow-code-review`.
