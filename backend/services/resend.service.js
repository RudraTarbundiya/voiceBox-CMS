import { Resend } from "resend";
import OTP from '../models/OTP.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendOtpService(email) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const html = `
    <div style="margin:0;padding:0;background-color:#0f0a1e;font-family:'Georgia',serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0a1e;padding:48px 16px;">
            <tr>
                <td align="center">
                    <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

                        <!-- Header glow bar -->
                        <tr>
                            <td
                                style="background:linear-gradient(90deg,#6b21a8,#a855f7,#7c3aed);height:4px;border-radius:4px 4px 0 0;">
                            </td>
                        </tr>

                        <!-- Main card -->
                        <tr>
                            <td
                                style="background:linear-gradient(160deg,#1e1033 0%,#150d2b 60%,#1a0f2e 100%);padding:48px 40px 40px;border:1px solid rgba(168,85,247,0.2);border-top:none;border-radius:0 0 16px 16px;">

                                <!-- Icon -->
                                <div style="text-align:center;margin-bottom:28px;">
                                    <div
                                        style="display:inline-block;background:linear-gradient(135deg,#6b21a8,#9333ea);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;box-shadow:0 0 32px rgba(147,51,234,0.5);">
                                        🔐</div>
                                </div>

                                <!-- Title -->
                                <h1
                                    style="color:#f3e8ff;font-family:'Georgia',serif;font-size:26px;font-weight:normal;text-align:center;margin:0 0 8px;letter-spacing:0.5px;">
                                    VOICEBOX-OTP</h1>
                                <p
                                    style="color:#a78bca;font-size:14px;text-align:center;margin:0 0 36px;letter-spacing:1.5px;text-transform:uppercase;">
                                    One-Time Password</p>

                                <!-- OTP Box -->
                                <div
                                    style="background:linear-gradient(135deg,rgba(107,33,168,0.3),rgba(124,58,237,0.15));border:1.5px solid rgba(168,85,247,0.4);border-radius:12px;padding:28px 24px;text-align:center;margin-bottom:28px;box-shadow:0 0 40px rgba(147,51,234,0.15),inset 0 1px 0 rgba(255,255,255,0.05);">
                                    <p
                                        style="color:#c4b5d4;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 14px;">
                                        Your OTP</p>
                                    <p
                                        style="color:#e9d5ff;font-size:42px;font-family:'Courier New',monospace;font-weight:bold;letter-spacing:10px;margin:0;text-shadow:0 0 20px rgba(196,181,253,0.6);">
                                        ${otp}</p>
                                </div>

                                <!-- Validity note -->
                                <div style="text-align:center;margin-bottom:32px;">
                                    <span
                                        style="display:inline-block;background:rgba(107,33,168,0.2);border:1px solid rgba(168,85,247,0.25);border-radius:20px;padding:8px 20px;color:#c084fc;font-size:13px;letter-spacing:0.3px;">⏱
                                        Valid for <strong style="color:#e9d5ff;">10 minutes</strong></span>
                                </div>

                                <!-- Warning -->
                                <p
                                    style="color:#7c5fa0;font-size:13px;text-align:center;margin:0 0 4px;line-height:1.7;">
                                    Never share this code with anyone.</p>
                                <p style="color:#5c4278;font-size:12px;text-align:center;margin:0;">If you didn't
                                    request this, you can safely ignore this email.</p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding:24px 0 0;text-align:center;">
                                <p style="color:#3d2a5c;font-size:11px;margin:0;letter-spacing:0.5px;">© 2026 VOICEBOX ·
                                    Secure Authentication</p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </div>
  `;
    const result = await resend.emails.send({
        from: "VOICEBOX<noreply-otp@rudrasatwara.tech>",
        to: email,
        subject: "VOICEBOX OTP",
        html,
    });
    console.log(`this is sendService log --> ${result}`)

    if (result.error !== null) {
        throw new Error('Failed to send OTP email');
    }
    // Upsert OTP (replace if it already exists)
    await OTP.findOneAndUpdate(
        { email },
        { otp, createdAt: new Date() },
        { upsert: true }
    );
    
    return { success: true, message: `OTP sent successfully on ${email}` };
}