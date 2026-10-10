
def get_registration_email_template(otp):
    return f"""
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
            <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
                
                <!-- Header -->
                <tr>
                    <td style="background:linear-gradient(135deg,#6d28d9,#4f46e5);padding:32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">StashD</h1>
                    <p style="margin:6px 0 0;color:#c4b5fd;font-size:13px;">Your personal link vault</p>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:36px 40px;">
                    <h2 style="margin:0 0 8px;color:#f5f5f5;font-size:20px;font-weight:600;">Verify your email</h2>
                    <p style="margin:0 0 28px;color:#a0a0a0;font-size:14px;line-height:1.6;">
                        Thanks for signing up! Use the code below to verify your email address and activate your StashD account.
                    </p>

                    <!-- OTP Box -->
                    <div style="background:#111111;border:1px dashed #6d28d9;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 6px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your verification code</p>
                        <p style="margin:0;color:#a78bfa;font-size:42px;font-weight:700;letter-spacing:12px;">{otp}</p>
                    </div>

                    <p style="margin:0 0 6px;color:#a0a0a0;font-size:13px;line-height:1.6;">
                        ⏱ This code expires in <strong style="color:#f5f5f5;">10 minutes</strong>.
                    </p>
                    <p style="margin:0;color:#a0a0a0;font-size:13px;line-height:1.6;">
                        If you didn't create a StashD account, you can safely ignore this email.
                    </p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
                    <p style="margin:0;color:#555;font-size:12px;">© 2025 StashD · <a href="https://mystashd.link" style="color:#6d28d9;text-decoration:none;">mystashd.link</a></p>
                    </td>
                </tr>

                </table>
            </td>
            </tr>
        </table>
        </body>
        </html>
        """

def get_login_email_template(otp):
    return f"""
            <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
            <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
                
                <!-- Header -->
                <tr>
                    <td style="background:linear-gradient(135deg,#6d28d9,#4f46e5);padding:32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">StashD</h1>
                    <p style="margin:6px 0 0;color:#c4b5fd;font-size:13px;">Your personal link vault</p>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:36px 40px;">
                    <h2 style="margin:0 0 8px;color:#f5f5f5;font-size:20px;font-weight:600;">Login request</h2>
                    <p style="margin:0 0 28px;color:#a0a0a0;font-size:14px;line-height:1.6;">
                        We received a login request for your StashD account. Use the code below to sign in.
                    </p>

                    <!-- OTP Box -->
                    <div style="background:#111111;border:1px dashed #6d28d9;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 6px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your login code</p>
                        <p style="margin:0;color:#a78bfa;font-size:42px;font-weight:700;letter-spacing:12px;">{otp}</p>
                    </div>

                    <p style="margin:0 0 6px;color:#a0a0a0;font-size:13px;line-height:1.6;">
                        ⏱ This code expires in <strong style="color:#f5f5f5;">10 minutes</strong>.
                    </p>
                    <p style="margin:0;color:#a0a0a0;font-size:13px;line-height:1.6;">
                        🔒 If you didn't request this, your account is safe — just ignore this email.
                    </p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
                    <p style="margin:0;color:#555;font-size:12px;">© 2025 StashD · <a href="https://mystashd.link" style="color:#6d28d9;text-decoration:none;">mystashd.link</a></p>
                    </td>
                </tr>

                </table>
            </td>
            </tr>
        </table>
        </body>
        </html>
    """

def get_password_reset_email_template(otp):
    return f"""
            <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
        <body style="margin:0;padding:0;background:#0f0f0f;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 0;">
            <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
                
                <!-- Header -->
                <tr>
                    <td style="background:linear-gradient(135deg,#6d28d9,#4f46e5);padding:32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">StashD</h1>
                    <p style="margin:6px 0 0;color:#c4b5fd;font-size:13px;">Your personal link vault</p>
                    </td>
                </tr>

                <!-- Body -->
                <tr>
                    <td style="padding:36px 40px;">
                    <h2 style="margin:0 0 8px;color:#f5f5f5;font-size:20px;font-weight:600;">Reset your password</h2>
                    <p style="margin:0 0 28px;color:#a0a0a0;font-size:14px;line-height:1.6;">
                        We received a request to reset the password of your StashD account. Use the code below to continue.
                    </p>

                    <!-- OTP Box -->
                    <div style="background:#111111;border:1px dashed #6d28d9;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 6px;color:#a0a0a0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your password reset code</p>
                        <p style="margin:0;color:#a78bfa;font-size:42px;font-weight:700;letter-spacing:12px;">{otp}</p>
                    </div>

                    <p style="margin:0 0 6px;color:#a0a0a0;font-size:13px;line-height:1.6;">
                        ⏱ This code expires in <strong style="color:#f5f5f5;">3 minutes</strong>.
                    </p>
                    <p style="margin:0;color:#a0a0a0;font-size:13px;line-height:1.6;">
                        🔒 If you didn't request this, ignore this email. Your password will not change.
                    </p>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
                    <p style="margin:0;color:#555;font-size:12px;">© 2025 StashD · <a href="https://mystashd.link" style="color:#6d28d9;text-decoration:none;">mystashd.link</a></p>
                    </td>
                </tr>

                </table>
            </td>
            </tr>
        </table>
        </body>
        </html>
    """
