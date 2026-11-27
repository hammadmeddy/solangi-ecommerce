import { sendMail, smtpConfigured } from "@/lib/mail";

/**
 * Emails sellers when an admin approves, rejects, suspends or reinstates
 * their store, or approves or rejects one of their listings.
 *
 * Sending is best effort: the admin's action is already saved, so a mail
 * problem is reported back (as `emailed: false` + reason) but never undoes it.
 */

export type EmailResult = { emailed: boolean; reason?: "no-email" | "smtp-off" | "failed" };

type Recipient = { name: string; email: string | null };

function siteUrl() {
  return (process.env.SOLANGI_SITE_URL || "https://solangiecommerce.com").replace(/\/+$/, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Message = {
  subject: string;
  heading: string;
  lines: string[];
  /** Admin's reason or note, shown in its own box */
  note?: string | null;
  cta?: { label: string; path: string };
};

function render(to: Recipient, m: Message) {
  const url = m.cta ? `${siteUrl()}${m.cta.path}` : null;
  const greeting = `Assalam-o-Alaikum ${to.name},`;

  const text = [
    greeting,
    "",
    ...m.lines,
    ...(m.note ? ["", `Note from Solangi: ${m.note}`] : []),
    ...(url && m.cta ? ["", `${m.cta.label}: ${url}`] : []),
    "",
    "Solangi Ecommerce · YOUR TRUST IS OUR WEALTH",
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;line-height:1.55;color:#1a1a1a;max-width:560px">
      <p>${escapeHtml(greeting)}</p>
      <h2 style="font-size:20px;margin:16px 0 8px">${escapeHtml(m.heading)}</h2>
      ${m.lines.map((l) => `<p style="margin:0 0 10px">${escapeHtml(l)}</p>`).join("")}
      ${
        m.note
          ? `<div style="margin:16px 0;padding:12px 14px;border-left:3px solid #b8892d;background:#faf6ee">
               <strong>Note from Solangi:</strong><br>${escapeHtml(m.note)}
             </div>`
          : ""
      }
      ${
        url && m.cta
          ? `<p style="margin:20px 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#0c2421;color:#f7f2e8;padding:10px 18px;border-radius:999px;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:600">${escapeHtml(m.cta.label)}</a></p>`
          : ""
      }
      <p style="color:#666;font-size:12px;margin-top:24px">YOUR TRUST IS OUR WEALTH · solangiecommerce.com</p>
    </div>`;

  return { text, html };
}

async function deliver(to: Recipient, m: Message): Promise<EmailResult> {
  const email = to.email?.trim();
  if (!email) return { emailed: false, reason: "no-email" };
  if (!smtpConfigured()) {
    console.info(`[decision-mail] SMTP not configured; would email ${email}: ${m.subject}`);
    return { emailed: false, reason: "smtp-off" };
  }
  try {
    const { text, html } = render(to, m);
    await sendMail({ to: email, subject: m.subject, text, html });
    return { emailed: true };
  } catch (err) {
    console.error("[decision-mail] send failed", err);
    return { emailed: false, reason: "failed" };
  }
}

export type StoreDecision = "approved" | "rejected" | "suspended" | "reinstated";

export function notifyStoreDecision(
  to: Recipient,
  storeName: string,
  decision: StoreDecision,
  reason?: string | null,
): Promise<EmailResult> {
  const messages: Record<StoreDecision, Message> = {
    approved: {
      subject: `Your Solangi store "${storeName}" is approved`,
      heading: "Your store is approved",
      lines: [
        `Good news: "${storeName}" is now approved to sell on Solangi.`,
        "Sign in to add your products. Each new listing is checked by our team before it goes live.",
      ],
      cta: { label: "Open your seller panel", path: "/en/seller" },
    },
    rejected: {
      subject: `Your Solangi seller application for "${storeName}"`,
      heading: "Your application was not approved",
      lines: [
        `We could not approve "${storeName}" yet.`,
        "Please fix the points below and send your application again from the seller page.",
      ],
      note: reason,
      cta: { label: "Update your application", path: "/en/seller" },
    },
    suspended: {
      subject: `Your Solangi store "${storeName}" is suspended`,
      heading: "Your store is suspended",
      lines: [
        `"${storeName}" has been suspended and its listings are hidden from the shop.`,
        "Reply to this email or contact Solangi support if you have questions.",
      ],
      note: reason,
    },
    reinstated: {
      subject: `Your Solangi store "${storeName}" is active again`,
      heading: "Your store is active again",
      lines: [
        `"${storeName}" has been reinstated.`,
        "Your listings were saved as drafts while the store was suspended. Submit them again to put them back on sale.",
      ],
      cta: { label: "Open your listings", path: "/en/seller/listings" },
    },
  };
  return deliver(to, messages[decision]);
}

export function notifyListingDecision(
  to: Recipient,
  productName: string,
  decision: "approved" | "rejected",
  note?: string | null,
): Promise<EmailResult> {
  const message: Message =
    decision === "approved"
      ? {
          subject: `"${productName}" is now live on Solangi`,
          heading: "Your listing is live",
          lines: [`"${productName}" was approved and is now visible to buyers on Solangi.`],
          cta: { label: "View your listings", path: "/en/seller/listings" },
        }
      : {
          subject: `"${productName}" needs changes`,
          heading: "Your listing needs changes",
          lines: [
            `We could not publish "${productName}" yet.`,
            "Edit the listing using the note below and submit it again.",
          ],
          note,
          cta: { label: "Edit your listing", path: "/en/seller/listings" },
        };
  return deliver(to, message);
}
