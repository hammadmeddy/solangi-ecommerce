# Solangi Ecommerce — live QA guide

Site: https://solangiecommerce.com/en  
Start only after a deployment is **Completed** and https://solangiecommerce.com/api/health returns `"db":"up"`.

Use two inboxes and two phone numbers: one customer, one admin. The admin phone must already have role `admin` in the database (seeded admin, or promote the user under Admin → People).

## Before you start

1. Open https://solangiecommerce.com/api/health
2. Pass: `"ok": true` and `"db": "up"`
3. Fail: `"db": "down"` — stop. The database is not connected. Do not file shop bugs until this passes.

## 1. Homepage and catalog

1. Open https://solangiecommerce.com/en
2. Confirm the title Solangi Ecommerce, the line YOUR TRUST IS OUR WEALTH, category tiles, a hero, flash-sale products, featured products, and trending products.
3. Open a category, for example Fashion. Products in that category should appear.
4. Open a product. Name, price, and description should show. Add it to the cart.
5. Header search: type `kurta`, submit. A matching product should appear. Clear filters and confirm the list returns.

## 2. Language and currency

1. Open Lang and choose UR. Text should switch to Urdu and the page should read right to left.
2. Switch back to EN.
3. Open Currency and choose USD, then back to PKR. The currency label and displayed prices should change. This is display only. Checkout totals are still stored in PKR.

## 3. Email login

1. Open https://solangiecommerce.com/en/auth/login
2. Enter a Pakistan mobile number and an email inbox you can open.
3. Submit. A 6-digit code should arrive from `admin@solangiecommerce.com`.
4. Enter the code. You should land on the account page.
5. Enter a wrong code. The page should reject it.
6. Request a new code, wait until the old one expires (10 minutes), and confirm the expired code is rejected.

## 4. Register

1. Open https://solangiecommerce.com/en/auth/register
2. Register as a customer with a new phone and email.
3. Complete the email code. The new account should open.

## 5. Cart and cash on delivery

1. While signed in, add two products and change quantities in the cart. The total should follow the quantities.
2. Open checkout. The only payment method is cash on delivery.
3. Choose or add an address and place the order.
4. The success page should show an order id starting with `SE-`.
5. Open Account → Orders. That order should be listed as Placed.

## 6. Addresses and wishlist

1. Account → Addresses. Add an address, refresh, and confirm it is still there.
2. Edit it, refresh, and confirm the edit stuck. Delete it and confirm it is gone.
3. On a product, add it to the wishlist. Open Account → Wishlist, refresh, and confirm it remains. Remove it and confirm it is gone.

## 7. Admin

Sign in at https://solangiecommerce.com/en/auth/admin with an admin account. A customer who opens `/admin` should be sent away.

1. Orders: find the test order. Move it Placed → Packed → Shipped → Delivered. Sign back in as the customer and confirm Account → Orders shows the same status.
2. Products: add a product with name, category, price, and stock. Find it on the shop. Edit the price. Set status to Draft and confirm the shop no longer shows it.
3. People: change a test customer to Seller. Sign in as that person and confirm `/en/seller` opens.
4. Photos: upload one hero or category image under 1.5 MB. Refresh the homepage or category and confirm the new image is used.
5. Reviews: publish a review. Confirm it appears on the homepage. Reject or delete it and confirm it leaves the homepage.
6. Settings: change the announcement text, save, and confirm the top bar updates.

## 8. Seller

Use the account promoted to seller.

1. Open https://solangiecommerce.com/en/seller
2. Save the store name and city. Refresh and confirm they stuck.
3. Create a listing with price and stock. Confirm it appears on the shop.
4. Edit the price, then delete the listing and confirm the shop no longer shows it.
5. A normal customer who opens `/en/seller` should be sent to their account.

## 9. Holding pages

Open these and confirm each page only explains the program. There should be no signup, payout, rank, or investment form that saves data.

- https://solangiecommerce.com/en/affiliate
- https://solangiecommerce.com/en/mlm
- https://solangiecommerce.com/en/investor

## Not built — do not file these as bugs

- JazzCash, EasyPaisa, card, and bank checkout
- SMS one-time codes (email only)
- Affiliate commission engine
- MLM ranks, referrals, and payouts
- Investor accounts or returns
- Automatic “order shipped” email or SMS to the customer
