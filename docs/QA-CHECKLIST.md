# REHAB Store Admin — Manual QA Checklist

End-to-end smoke + regression test plan for the admin panel
(`apps/web/src/app/[locale]/admin/…`) talking to Medusa 2.x
(`MEDUSA_BACKEND_URL=http://localhost:9000`).

## Conventions

- **Auth cookies** written by the admin panel:
  - `rehab_admin_token` (JWT, 8 h, httpOnly)
  - `rehab_admin_email` (plain, for self-protection in Users)
- **Self-protection rule**: the user whose email matches the
  `rehab_admin_email` cookie cannot change their own role and cannot
  delete their own account.
- **Toast behaviour**: success toasts auto-dismiss after 4 s, error
  toasts are sticky until clicked.
- **DB verification**: open Medusa Admin UI at
  http://localhost:9000/app, log in as super-admin, or hit the REST
  API with the same `Authorization: Bearer <token>`. Some metadata
  fields (Arabic title, admin_status, admin_notes, free-shipping
  threshold, min cart amount) are only visible via API or DB, not
  the Medusa UI.

### Cross-cutting error paths (re-use for every section)

| Error | How to reproduce | Expected result |
|---|---|---|
| 401 (token expired / removed) | Delete `rehab_admin_token` cookie mid-session, then perform any mutation | Server action returns `{ error: 'Admin session expired' }`, client shows error toast, user is bounced to `/admin/login` on the next server-rendered nav |
| 401 from Medusa during fetch | In Medusa admin, manually delete the user, then open any admin page | Page renders `error.tsx` with "Try again" + "Back to dashboard" buttons |
| Network off | Stop the Medusa server (`taskkill /F /IM node.exe` for the Medusa process, or set `MEDUSA_BACKEND_URL` to a bad host), then submit any form | Server action returns `{ error: 'fetch failed' }` or a 5xx message, error toast appears, form stays filled |
| Bad data (validation) | Submit form with missing required field, or pass values that fail Medusa validation (e.g. duplicate discount code) | Server action returns `{ error: '…' }`, error banner shows, toast shows, no DB write |

---

## 1. Login

**Pre-condition**
- Medusa is running on `http://localhost:9000`
- An admin user exists (created via `medusa user -e admin@rehab.store -p password` or seed)

**Happy path**
1. Navigate to `http://localhost:3000/en/admin/login`
2. Enter valid email + password
3. Click "Sign in"
4. Expect: redirect to `/en/admin/dashboard`, `rehab_admin_token` and `rehab_admin_email` cookies set, 8 h expiry
5. Reload — still on dashboard, no re-login

**Error paths**
- Wrong password: red error message under the form, no cookies written
- Empty fields: native HTML `required` validation, no API call
- Backend down: error message "Cannot connect to server", no cookies
- 401 from Medusa: red error message, no cookies

**Verify**
- In DevTools → Application → Cookies, confirm `rehab_admin_token` (httpOnly) and `rehab_admin_email` (plain) are present for `localhost`
- `curl -H "Cookie: rehab_admin_token=<token>" http://localhost:9000/admin/orders?limit=1` returns 200

---

## 2. Dashboard

**Pre-condition**
- Logged in
- At least 1 published product, 1 order, 1 customer exist in Medusa
- At least one variant with `inventory_quantity < 10` to trigger the low-stock panel

**Happy path**
1. Open `/en/admin/dashboard`
2. Expect: 4 stat cards (Revenue MTD, Orders This Month, Active Products, Low Stock Alerts)
3. Recent orders table shows the 5 most recent orders with status badges
4. Low stock side panel lists any variant with `inventory_quantity < 10` (or `≤ reorder_at` if `metadata.reorder_at` is set)

**Error paths**
- Stop Medusa → page shows the global `error.tsx` boundary
- Delete all products in Medusa → "All healthy" appears in low-stock panel
- Create a variant with `inventory_quantity = 0` → critical badge (red)

**Verify**
- Revenue MTD = sum of `total` for orders with `payment_status='captured'` AND `created_at` in the current month (verifiable in Medusa Admin → Orders)
- Low stock count = number of variants where `inventory_quantity < 10` AND product status is `published`

---

## 3. Products CRUD (incl. image upload)

### 3a. List

**Pre-condition** — at least 3 products exist with mixed `published`/`draft` status

**Happy path**
1. Open `/en/admin/products`
2. Expect: table with thumbnail (or color swatch fallback), name, collection, price, total stock, status badge, edit/delete actions
3. Type in search → table filters client-side by `title` and `metadata.title_ar`
4. Click a category chip → filters by `type.value`

**Error paths**
- 0 products: empty state with 👗 icon
- Backend down: error state with "Failed to load products"
- All products lack thumbnails: only color swatches render (no broken `<img>` icons)

**Verify**
- The expand query sent to Medusa includes `variants,collection,type,thumbnail` (check Network tab)
- Total stock column = sum of all variant `inventory_quantity` values for that product

### 3b. Create

**Pre-condition** — at least 1 collection and 1 product type exist

**Happy path**
1. Click "New product" → `/en/admin/products/new`
2. Fill Title (EN), Title (AR), select Type, Collection
3. Set Base price (AED), Compare at price (AED)
4. Add 1+ variant rows (color name, hex, size, stock)
5. Drop or browse 1–8 images (JPEG/PNG/WebP, ≤ 5 MB each)
6. Click Save
7. Expect: success toast, redirect to product list, new row appears

**Error paths**
- Submit with empty Title → error banner "Please fill in all required fields", no API call
- Submit with no variants → same
- Add a 6 MB image → inline error "File exceeds 5MB limit", no upload
- Add 9 images → only 8 accepted, inline error "Maximum 8 images"
- Drop a `.gif` file → inline error "Unsupported file type (JPEG/PNG/WebP only)"
- Medusa down on Save → error toast, form stays filled
- 401 mid-save (delete cookie, submit) → "Admin session expired" toast, redirect to login

**Verify**
- In Medusa Admin → Products, the new product is visible with all variants
- `GET /admin/products/<id>?expand=images` returns the uploaded images in `images[]`
- `GET /admin/products/<id>` returns `thumbnail` (Medusa auto-picks the first image as thumbnail)
- `metadata.title_ar` and `metadata.compare_at_price` are populated

### 3c. Edit

**Pre-condition** — a product exists with at least 1 image and 2 variants

**Happy path**
1. Click ✏️ on a product → `/en/admin/products/<id>/edit`
2. Existing data pre-fills
3. Change title, add a new variant, change a price
4. Add 2 new images (they upload immediately and show "Saved" only after the form is re-submitted; the dot in the corner says "Uploading…" while in flight)
5. Hover an existing image → click ✕ → image removed from product immediately, toast "Deleted", product refreshes
6. Click Save → success toast, back to list

**Error paths**
- Remove last variant on a product that has linked orders → Medusa may reject (422); expect error toast
- Save with empty title → banner error
- Backend 401 → "Admin session expired" toast

**Verify**
- After remove: `GET /admin/products/<id>?expand=images` no longer returns the deleted image
- After Save: `metadata` updated, variant list reflects additions/deletions, prices updated in `product.variants[].prices[]`
- Deleted variants actually gone: `GET /admin/products/<id>/variants/<deletedId>` returns 404

### 3d. Delete

**Happy path**
1. From the list, click 🗑 → confirm modal → success toast, row removed
2. The product is no longer in the list or Medusa admin

**Error paths**
- Try to delete a product that has order history → Medusa returns an error → toast shows the message
- Backend 401 → bounced to login

**Verify** — `GET /admin/products/<id>` returns 404; product not in `GET /admin/products?limit=100`

---

## 4. Inventory — adjust stock + reorder threshold

**Pre-condition** — at least 1 product with 1 variant that has an `inventory_item` linked to a stock location

**Happy path**
1. Open `/en/admin/inventory`
2. 3 summary cards: Total SKUs, Low stock, Out of stock
3. Click "Adjust" on a row → modal opens with current stock
4. Switch Set/Adjust toggle, enter new value → preview shows new stocked quantity
5. Submit → success toast, row updates optimistically, summary counts update
6. Click "Set Reorder" → modal opens, enter threshold (e.g. 20) → submit → toast, row updated

**Error paths**
- Adjust a variant with no `inventory_item` linked → error "No inventory item linked to this variant"
- Stop Medusa → toast error, no DB change
- Backend returns 401 → "Admin session expired" toast
- Negative number → HTML `min="0"` blocks it

**Verify**
- `GET /admin/inventory-items/<id>/location-levels/<locationId>` shows the new `stocked_quantity`
- Reorder threshold saved to `product.variants[].metadata.reorder_at` (visible only via API; in Medusa Admin → Product → Variant → Metadata)
- Re-fetching the inventory page reflects the new value in the row + level bar

---

## 5. Pricing — save prices + create discount

### 5a. Save prices (Prices tab)

**Pre-condition** — products with AED base prices exist; the page was opened at least once to load data

**Happy path**
1. Open `/en/admin/pricing` → Prices tab
2. Click the currency pills (AED / SAR / KWD / EGP / USD) — only AED is saved to Medusa, others are display-only
3. Edit a base price (the value in the input is AED; other currencies recompute live via `FX_RATES`)
4. Mark "On sale" if not already, set sale price
5. Sticky "Save" bar appears → click Save
6. Expect: success toast with count, save bar clears

**Error paths**
- Edit a price to empty or negative → HTML validation + server rejects 0
- Save with no dirty changes → toast "Nothing to save" (or the action returns early)
- Backend 401 → "Admin session expired" toast
- Variant with no `priceId` yet → POST creates a new price row (verify in Medusa Admin → Product → Variant → Prices)

**Verify**
- `GET /admin/products/<id>/variants/<vid>?expand=prices` shows the new `amount` in cents (e.g. 25000 = 250 AED)
- A new `price_preference`/`price` row is created if there was no AED price yet
- `revalidatePath` triggers the next page load to show the saved values

### 5b. Create discount (Discounts tab)

**Pre-condition** — at least 1 product exists

**Happy path**
1. Switch to Discounts tab
2. Click "New discount" → modal opens
3. Enter code (uppercased automatically), rule type (percentage/fixed/free_shipping), value, min cart, usage limit, start/end dates, active toggle
4. Submit → success toast, modal closes, new row in discount table
5. Click toggle on a discount → it flips active/inactive

**Error paths**
- Submit empty code → error "Discount code is required"
- Percentage rule with value 0 or negative → "Discount value must be greater than zero"
- Duplicate code → Medusa returns an error → toast shows message
- End date before start date → Medusa validation fails
- Backend down → error toast

**Verify**
- `GET /admin/discounts/<id>` returns the new discount
- `metadata.min_cart_amount` is set when min cart > 0
- `is_disabled` mirrors the active toggle
- Usage limit and counts visible via API

### 5c. Delete discount

**Happy path** — click 🗑 on a discount row → confirm → toast, row gone
**Error paths** — backend down → error toast
**Verify** — `GET /admin/discounts/<id>` returns 404

---

## 6. Orders — fulfillment flow

**Pre-condition** — at least 1 order in `payment_status='captured'` AND `fulfillment_status='not_fulfilled'`

### 6a. List

1. Open `/en/admin/orders`
2. Status tabs: All / Pending / Processing / Shipped / Delivered / Cancelled
3. Click a tab → list filters (server-side query with `payment_status` / `fulfillment_status` / `status` params)
4. Pagination at the bottom (20 per page)

**Error paths**
- No orders → empty state
- Backend down → "Failed to load orders"
- Click tab with no matches → empty list

**Verify** — the request URL in Network tab shows the right `payment_status`/`fulfillment_status` query

### 6b. Detail — mark processing

**Happy path**
1. Click an order → `/en/admin/orders/<id>`
2. Click "Mark processing" → button state changes, timeline shows "Processing" step active
3. Status badge updates to "Processing"

**Verify** — `GET /admin/orders/<id>` shows `metadata.admin_status = "processing"` (visible via API, not Medusa Admin UI)

### 6c. Fulfillment

**Happy path**
1. On the order detail page, click "Create fulfillment"
2. All unfulfilled line items get a fulfillment row
3. Timeline shows "Fulfilled" step active
4. A new section appears with the carrier/tracking inputs

**Error paths**
- Order already fully fulfilled → "No items to fulfill" error toast
- Backend 401 → "Admin session expired"

**Verify** — `GET /admin/orders/<id>?expand=fulfillments` shows the new fulfillment with items
`fulfillment_status` flips to `partially_fulfilled` or `fulfilled`

### 6d. Ship

**Happy path**
1. After fulfillment, click "Mark shipped" → modal opens
2. Enter tracking number, select carrier (DHL / FedEx / UPS / Aramex / Other)
3. Submit → toast, modal closes, timeline shows "Shipped" step active, carrier + tracking shown next to the fulfillment

**Error paths**
- Empty tracking number → "Tracking number is required"
- Backend 401 → "Admin session expired"

**Verify**
- `GET /admin/orders/<id>?expand=shipments` shows the shipment with `tracking_numbers[]`
- `metadata.admin_status = "shipped"`
- `fulfillment_status = "shipped"`

### 6e. Mark delivered

**Happy path** — click "Mark delivered" → timeline advances, status badge updates
**Verify** — `metadata.admin_status = "delivered"`, `fulfillment_status = "delivered"`

### 6f. Refund

**Pre-condition** — order has a successful payment (`payment_status='captured'`)

**Happy path**
1. Click "Refund" → modal opens
2. Enter amount (in fils/cents, max = order total - already refunded)
3. Select reason (discount/return/fraud/other), add note
4. Submit → toast, refund row appears in the timeline

**Error paths**
- Amount 0 or negative → "Refund amount must be greater than zero"
- Amount > available → Medusa returns an error
- Backend 401 → "Admin session expired"

**Verify** — `GET /admin/orders/<id>?expand=payments,refunds` shows the refund with the right `amount` and `reason`

### 6g. Notes

**Happy path**
1. Type a note in the notes textarea → "Add note" button enables
2. Submit → note appears in the timeline with author email + timestamp, most-recent first
3. Reload page → note still there

**Error paths**
- Empty note → "Add note" stays disabled
- Backend 401 → "Admin session expired"

**Verify** — `GET /admin/orders/<id>` shows `metadata.admin_notes` as an array of `{ text, author, createdAt }`

---

## 7. Collections

**Pre-condition** — at least 1 collection exists (or none, for empty state)

### 7a. List

1. Open `/en/admin/collections`
2. Search box filters by EN title client-side
3. Each row shows the EN title, AR title (if any), and product count

### 7b. Create

**Happy path**
1. Click "New collection" → form opens
2. Enter EN title (slug auto-fills from title), AR title (optional), descriptions (both)
3. Save → success toast, back to list, new row visible

**Error paths**
- Empty EN title → required validation
- Backend 401 → "Admin session expired"

**Verify** — `GET /admin/collections/<id>` shows the collection; `metadata.title_ar` and `metadata.description_ar` populated

### 7c. Edit

**Happy path** — change EN/AR title, save → list updates
**Verify** — `metadata` updated

### 7d. Delete

**Happy path** — confirm modal → success toast, row gone
**Error paths** — collection still has products linked → Medusa returns an error
**Verify** — `GET /admin/collections/<id>` returns 404

---

## 8. Customers

**Pre-condition** — at least 1 customer exists, ideally with ≥ 1 order

### 8a. List

1. Open `/en/admin/customers`
2. Columns: name, email, phone, orders count, total spent, joined date
3. Search by name/email client-side

**Verify** — `GET /admin/customers?limit=...&fields=email,first_name,last_name,phone,created_at,orders` (or via expand)

### 8b. Detail

1. Click a customer → `/en/admin/customers/<id>`
2. Sections: contact, billing address, shipping address, order history
3. Order history rows link to `/admin/orders/<orderId>`

**Error paths**
- 0 customers → empty state
- Customer with no orders → "No orders yet" in the history section

**Verify** — order count + total spent match `GET /admin/orders?customer_id=<id>&fields=total`

---

## 9. Settings

**Pre-condition** — logged in. Note: settings are **file-backed**, not stored in Medusa.

File path: `apps/web/src/app/[locale]/admin/_lib/store-settings.json`

**Happy path**
1. Open `/en/admin/settings`
2. Edit store name, email, phone, default currency/locale, free-shipping threshold, Instagram, TikTok
3. Click Save → success toast, form reflects saved values
4. Reload page → values persist (they were written to the JSON file)

**Error paths**
- Empty store name → "Store name is required" (server)
- Negative free-shipping threshold → "Free shipping threshold must be a non-negative number"
- File write fails (e.g. read-only FS) → error toast

**Verify**
- `cat apps/web/src/app/\[locale\]/admin/_lib/store-settings.json` shows the new values
- `defaults` are merged in if any field is missing on disk (compare with the `DEFAULT_SETTINGS` constant in `settings/actions.ts`)
- Reloading the page after editing shows the saved values; opening a different locale (e.g. `/ar/admin/settings`) shows the same persisted values

---

## 10. Admin Users — invite + role + delete

**Pre-condition** — at least 1 admin user exists (the one used to log in)

### 10a. List

1. Open `/en/admin/users`
2. Each row: avatar (initial), name + email, role badge (admin/member/developer), inline role select, delete button
3. The current user's row has the role select + delete button **disabled** (self-protection)

### 10b. Invite

**Happy path**
1. Click "Invite user" → modal opens
2. Enter email, first name, last name, select role
3. Submit → success toast, modal closes, new row appears
4. The invited user receives an email (verify in MailHog/Mailpit if local) with a password-setup link

**Error paths**
- Empty email → "Email is required"
- Email already exists → Medusa returns an error → toast
- Backend 401 → "Admin session expired"

**Verify** — `GET /admin/users` returns the new user with the right `role`; the user can complete password setup via the link and log in

### 10c. Change role

**Happy path**
1. On another user's row, change the role select
2. The select briefly disables (optimistic state), then toast, then the badge updates

**Error paths**
- Try to change own role → select is disabled in the UI; even if forced via API, the cookie-based check should also block
- Backend 401 → toast, role reverts to previous value

**Verify** — `GET /admin/users/<id>` shows the new `role`

### 10d. Delete

**Happy path**
1. Click 🗑 on a user row → confirm modal → toast, row removed
2. The deleted user can no longer log in

**Error paths**
- Try to delete self → button is disabled in the UI
- Try to delete the only admin user → Medusa may reject
- Backend 401 → "Admin session expired"

**Verify** — `GET /admin/users/<id>` returns 404; deleted user can no longer log in

---

## Cross-section regression checks

After running through the above, do these end-to-end sweeps:

1. **Locale flip**: switch between `/en/admin/...` and `/ar/admin/...` while staying logged in. All admin pages should render in the chosen language; RTL layout should mirror properly. No mixed strings.
2. **Cookie expiry**: in DevTools, set `rehab_admin_token` to an expired value (or remove it). The next server-rendered nav should bounce to `/admin/login`. Mutations should return `Admin session expired`.
3. **Network failure on image upload**: drop in a 5 MB image, then immediately stop Medusa. The image should stay in "Uploading…" state or show an error overlay; the form should not block.
4. **Toast concurrency**: trigger 3 toasts in quick succession (e.g. delete 3 products fast). They should stack at the bottom-`inline-end`, FIFO dismiss.
5. **Error boundary**: stop Medusa, then hard-navigate to `/en/admin/products`. The page should render the global `error.tsx` (not a blank page or unhandled error).
6. **Loading skeletons**: with Medusa slow (`MEDUSA_BACKEND_URL` pointed at a slow mock), the per-section `loading.tsx` should show a shimmer skeleton that matches the page shape.
