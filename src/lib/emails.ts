import { resend, FROM_EMAIL, APP_URL } from "./resend";

// ─── Shared helpers ──────────────────────────────────────────────────────────

function base(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BookIt</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:#e11d48;border-radius:16px 16px 0 0;padding:24px 32px;text-align:center;">
              <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">BookIt</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;border-top:none;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} BookIt. All rights reserved.<br/>
                <a href="${APP_URL}" style="color:#e11d48;text-decoration:none;">Visit our website</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 28px;background:#e11d48;color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;border-radius:8px;">${label}</a>`;
}

function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;font-size:14px;color:#6b7280;width:40%;">${label}</td>
      <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">${value}</td>
    </tr>`;
}

// ─── Booking Confirmed (to customer) ─────────────────────────────────────────

interface BookingConfirmedParams {
  to: string;
  guestName: string;
  listingTitle: string;
  bookingId: string;
  startDate: string;
  startTime?: string;
  totalAmount: string;
}

export async function sendBookingConfirmedEmail(params: BookingConfirmedParams) {
  const { to, guestName, listingTitle, bookingId, startDate, startTime, totalAmount } = params;
  const ref = bookingId.slice(-8).toUpperCase();
  const bookingUrl = `${APP_URL}/bookings/${bookingId}`;

  const html = base(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:#dcfce7;border-radius:50%;margin-bottom:16px;">
        <span style="font-size:24px;">&#10003;</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Booking Confirmed!</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;">Your booking is all set, ${guestName}.</p>
    </div>

    <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.05em;">Booking Summary</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Reference", `#${ref}`)}
        ${infoRow("Listing", listingTitle)}
        ${infoRow("Date", startDate)}
        ${startTime ? infoRow("Time", startTime) : ""}
        ${infoRow("Total Paid", totalAmount)}
      </table>
    </div>

    <div style="text-align:center;margin-bottom:24px;">
      ${btn(bookingUrl, "View Booking Details")}
    </div>

    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
      If you have any questions, reply to this email and we'll be happy to help.
    </p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Booking Confirmed — #${ref}`,
    html,
  });
}

// ─── Booking Cancelled (to customer) ─────────────────────────────────────────

interface BookingCancelledParams {
  to: string;
  guestName: string;
  listingTitle: string;
  bookingId: string;
  isPaid: boolean;
}

export async function sendBookingCancelledEmail(params: BookingCancelledParams) {
  const { to, guestName, listingTitle, bookingId, isPaid } = params;
  const ref = bookingId.slice(-8).toUpperCase();
  const bookingsUrl = `${APP_URL}/bookings`;

  const html = base(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:#fee2e2;border-radius:50%;margin-bottom:16px;">
        <span style="font-size:24px;color:#dc2626;">&#10005;</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">Booking Cancelled</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;">Hi ${guestName}, your booking has been cancelled.</p>
    </div>

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#991b1b;">Cancelled Booking: #${ref}</p>
      <p style="margin:0;font-size:14px;color:#b91c1c;">${listingTitle}</p>
    </div>

    ${isPaid ? `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#15803d;">
        <strong>Refund initiated</strong> — Your payment will be returned to the original payment method within 5–10 business days.
      </p>
    </div>
    ` : ""}

    <div style="text-align:center;margin-bottom:24px;">
      ${btn(bookingsUrl, "View My Bookings")}
    </div>

    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
      Ready to book again? <a href="${APP_URL}" style="color:#e11d48;">Explore listings</a>
    </p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Booking Cancelled — #${ref}`,
    html,
  });
}

// ─── New Booking (to provider) ────────────────────────────────────────────────

interface NewBookingProviderParams {
  to: string;
  providerName: string;
  listingTitle: string;
  bookingId: string;
  customerName: string;
  startDate: string;
  startTime?: string;
  totalAmount: string;
}

export async function sendNewBookingProviderEmail(params: NewBookingProviderParams) {
  const { to, providerName, listingTitle, bookingId, customerName, startDate, startTime, totalAmount } = params;
  const ref = bookingId.slice(-8).toUpperCase();
  const dashboardUrl = `${APP_URL}/dashboard/bookings`;

  const html = base(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:#fef3c7;border-radius:50%;margin-bottom:16px;">
        <span style="font-size:24px;">&#128176;</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">New Booking Received!</h1>
      <p style="margin:0;font-size:15px;color:#6b7280;">Hi ${providerName}, you have a new booking.</p>
    </div>

    <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.05em;">Booking Details</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Reference", `#${ref}`)}
        ${infoRow("Listing", listingTitle)}
        ${infoRow("Customer", customerName)}
        ${infoRow("Date", startDate)}
        ${startTime ? infoRow("Time", startTime) : ""}
        ${infoRow("Amount", totalAmount)}
      </table>
    </div>

    <div style="text-align:center;margin-bottom:24px;">
      ${btn(dashboardUrl, "View in Dashboard")}
    </div>

    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
      Make sure to confirm this booking promptly to give your guest a great experience.
    </p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New Booking — #${ref} for ${listingTitle}`,
    html,
  });
}
