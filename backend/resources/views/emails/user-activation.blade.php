<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activar cuenta</title>
</head>
<body style="margin:0; padding:24px; font-family:Arial, sans-serif; background:#f5f7fb; color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; border:1px solid #e5e7eb;">
        <tr>
            <td>
                <h2 style="margin:0 0 12px;">Hola {{ $userName }},</h2>
                <p style="margin:0 0 16px; line-height:1.6;">
                    Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente boton:
                </p>
                <p style="margin:0 0 24px;">
                    <a href="{{ $activationUrl }}" style="display:inline-block; background:#0f766e; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:8px; font-weight:600;">
                        Activar cuenta
                    </a>
                </p>
                <p style="margin:0 0 8px; line-height:1.6;">
                    Si el boton no funciona, copia y pega este enlace en tu navegador:
                </p>
                <p style="margin:0 0 8px; word-break:break-all;">
                    <a href="{{ $activationUrl }}">{{ $activationUrl }}</a>
                </p>
                <p style="margin:16px 0 0; color:#6b7280; font-size:14px;">
                    Este enlace expira en 24 horas.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
