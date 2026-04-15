import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: "Mundial Prode <onboarding@resend.dev>",
    to,
    subject: "Restablecer contraseña — Mundial Prode 2026",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1e3799;">Mundial Prode 2026</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Hacé click en el botón para crear una nueva contraseña. El enlace expira en <strong>1 hora</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#1e3799;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Restablecer contraseña
        </a>
        <p style="color:#888;font-size:13px;">Si no solicitaste esto, podés ignorar este mail.</p>
        <hr style="border:none;border-top:1px solid #eee;margin-top:24px;" />
        <p style="color:#aaa;font-size:12px;">Mundial Prode · FIFA World Cup 2026</p>
      </div>
    `,
  });
}
