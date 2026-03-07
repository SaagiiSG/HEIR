import { Resend } from "resend";

// TODO: Replace with real Resend API key in .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "HEIR <noreply@heir.mn>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://heir.mn";

export async function sendOrderConfirmation(params: {
  to: string;
  name: string;
  orderId: string;
  items: Array<{ name: string; size: string; quantity: number; price: number }>;
  total: number;
  locale: "mn" | "en";
}) {
  const { to, name, orderId, items, total, locale } = params;
  const isMn = locale === "mn";

  const subject = isMn
    ? `Захиалга баталгаажлаа — #${orderId.slice(0, 8).toUpperCase()}`
    : `Order Confirmed — #${orderId.slice(0, 8).toUpperCase()}`;

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">${item.name} / ${item.size}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;">₮${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family:sans-serif;color:#000;max-width:560px;margin:0 auto;padding:40px 20px;">
      <h1 style="font-size:20px;font-weight:normal;margin-bottom:32px;">HEIR</h1>
      <p style="font-size:14px;margin-bottom:24px;">
        ${isMn ? `${name} танд баярлалаа. Таны захиалга баталгаажлаа.` : `Thank you, ${name}. Your order has been confirmed.`}
      </p>
      <p style="font-size:12px;color:#666;margin-bottom:16px;">
        ${isMn ? "Захиалгын дугаар" : "Order"}: <strong>#${orderId.slice(0, 8).toUpperCase()}</strong>
      </p>
      <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="border-bottom:2px solid #000;">
            <th style="text-align:left;padding-bottom:8px;">${isMn ? "Бараа" : "Item"}</th>
            <th style="text-align:center;padding-bottom:8px;">${isMn ? "Тоо" : "Qty"}</th>
            <th style="text-align:right;padding-bottom:8px;">${isMn ? "Үнэ" : "Price"}</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="font-size:14px;text-align:right;font-weight:500;margin-bottom:32px;">
        ${isMn ? "Нийт" : "Total"}: ₮${total.toLocaleString()}
      </p>
      <a href="${SITE_URL}/mn/account/orders/${orderId}"
         style="display:inline-block;border:1px solid #000;border-radius:99px;padding:10px 24px;font-size:12px;text-decoration:none;color:#000;">
        ${isMn ? "Захиалга харах" : "View Order"}
      </a>
      <p style="font-size:11px;color:#999;margin-top:40px;">© 2026 HEIR</p>
    </body>
    </html>
  `;

  return resend.emails.send({ from: FROM_EMAIL, to, subject, html });
}

export async function sendPasswordReset(params: {
  to: string;
  resetUrl: string;
  locale: "mn" | "en";
}) {
  const { to, resetUrl, locale } = params;
  const isMn = locale === "mn";

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: isMn ? "Нууц үг сэргээх" : "Reset your password",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:sans-serif;color:#000;max-width:560px;margin:0 auto;padding:40px 20px;">
        <h1 style="font-size:20px;font-weight:normal;margin-bottom:32px;">HEIR</h1>
        <p style="font-size:14px;margin-bottom:24px;">
          ${isMn ? "Нууц үг сэргээх хүсэлт ирлээ. Доорх товчийг дарна уу:" : "Click the link below to reset your password:"}
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;border:1px solid #000;border-radius:99px;padding:10px 24px;font-size:12px;text-decoration:none;color:#000;margin-bottom:24px;">
          ${isMn ? "Нууц үг сэргээх" : "Reset Password"}
        </a>
        <p style="font-size:11px;color:#999;">
          ${isMn ? "Хэрэв та хүсэлт явуулаагүй бол энэ захидлыг үл тоомсорлоно уу." : "If you didn't request this, please ignore this email."}
        </p>
        <p style="font-size:11px;color:#999;margin-top:40px;">© 2026 HEIR</p>
      </body>
      </html>
    `,
  });
}
