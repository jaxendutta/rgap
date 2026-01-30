'use server';

import { getSession, getCurrentUser, sessionOptions } from '@/lib/session';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { headers } from 'next/headers';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const emailSender = 'RGAP <rgap@contact.anirban.ca>';
function emailTemplate(title: string, subtitle: string, footer: string, content: string) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rgap.anirban.ca';
    const logoUrl = `${baseUrl}/logo.png`;

    return `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 24px;">
    
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; margin-bottom: 20px;">
        <tr>
            <td style="vertical-align: middle; padding-right: 12px;">
                <img 
                    src="${logoUrl}" 
                    alt="RGAP Logo" 
                    width="48" 
                    height="48"
                    style="display: block; width: 48px; height: 48px; border: 0;" 
                />
            </td>
            <td style="vertical-align: middle;">
                <span style="font-family: 'Segoe UI', sans-serif; font-size: 40px; font-weight: bold; color: #111827; line-height: 1;">
                    [ RGAP ]
                </span>
            </td>
        </tr>
    </table>

    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #111827; font-size: 24px; margin-bottom: 10px;">${title}</h1>
        <p style="color: #6b7280; font-size: 16px;">${subtitle}</p>
    </div>
    
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 24px; text-align: center;">
        ${content}
    </div>

    <div style="margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
        <p style="font-size: 12px; color: #9ca3af;">${footer}</p>
    </div>
</div>
    `;
}

interface ActionState {
    message: string;
    success?: boolean;
}

// Helper: Password Rules
function validatePassword(password: string): string | null {
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    return null;
}

// Helper: Estimate Location
async function getLocationFromIP(ip: string): Promise<string> {
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('::ffff:') || ip.startsWith('172.') || ip.startsWith('192.168.')) {
        return 'Local Network (Dev)';
    }

    try {
        // ipinfo.io/json works without token for low volume, supports HTTPS
        const response = await fetch(`https://ipinfo.io/${ip}/json`);
        const data = await response.json();

        if (data.city && data.country) {
            return `${data.city}, ${data.country}`;
        }
        return 'Unknown Location';
    } catch (error) {
        return 'Unknown Location';
    }
}

export async function authAction(prevState: any, formData: FormData): Promise<ActionState> {
    const mode = formData.get('mode') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'on';
    const callbackUrl = (formData.get('callbackUrl') as string) || '/account?welcome=true';

    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown Device';
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';

    try {
        // ======================== LOGIN ========================
        if (mode === 'login') {
            const result = await db.query(
                'SELECT id, name, email, password_hash, email_verified_at FROM users WHERE email = $1',
                [email]
            );
            const user = result.rows[0];

            if (!user) return { message: 'We could not find an account with that email.' };

            if (!(await bcrypt.compare(password, user.password_hash))) {
                return { message: 'Incorrect password. Please try again.' };
            }

            // Friendly Verification Check
            if (!user.email_verified_at) {
                // Optional: Trigger a new verification email here if you want
                return { message: 'Your email hasn\'t been verified yet! Please check your inbox for the verification link.' };
            }

            // Create Session
            const sessionId = crypto.randomUUID();
            const location = await getLocationFromIP(ip.split(',')[0]);

            await db.query(
                `INSERT INTO sessions (session_id, user_id, user_agent, ip_address, location) VALUES ($1, $2, $3, $4, $5)`,
                [sessionId, user.id, userAgent, ip, location]
            );

            const session = await getSession();
            session.user = { id: user.id, name: user.name, email: user.email };
            session.sessionId = sessionId;
            session.isLoggedIn = true;

            if (rememberMe) {
                const thirtyDays = 60 * 60 * 24 * 30;
                session.updateConfig({
                    ...sessionOptions,
                    cookieOptions: { ...sessionOptions.cookieOptions, maxAge: thirtyDays }
                });
            }

            await session.save();
        }
        // ======================== REGISTER ========================
        else {
            const name = formData.get('name') as string;
            const confirmPassword = formData.get('confirmPassword') as string;

            if (password !== confirmPassword) return { message: "Passwords do not match." };

            const passwordError = validatePassword(password);
            if (passwordError) return { message: passwordError };

            const check = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (check.rows.length > 0) return { message: "This email is already registered. Try logging in instead!" };

            const hash = await bcrypt.hash(password, 10);

            // Insert User (email_verified_at is NULL)
            await db.query(
                'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
                [name, email, hash]
            );

            // Generate Token
            const token = crypto.randomUUID();
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await db.query(
                'INSERT INTO verification_tokens (token, identifier, expires) VALUES ($1, $2, $3)',
                [token, email, expires]
            );

            const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

            // Professional Email Template
            await resend.emails.send({
                from: emailSender,
                to: email,
                subject: 'Verify your RGAP Account',
                html: emailTemplate(
                    "Welcome to RGAP!",
                    "We're excited to have you on board.",
                    "If you didn't create an account, you can safely ignore this email.",
                    `<p style="color: #374151; margin-bottom: 20px;">Please verify your email address to get started with your research grant search.</p>
                    <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: black; color: white; text-decoration: none; border-radius: 24px; font-weight: 600; font-size: 16px;">Verify Email Address</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">Link expires in 24 hours.</p>`
                )
            });

            return { message: 'Check your email for a verification link to continue.', success: true };
        }

    } catch (error) {
        console.error('Auth error:', error);
        return { message: 'Something went wrong. Please try again later.' };
    }

    redirect(callbackUrl);
}

// ======================== CHANGE PASSWORD ========================
export async function changePasswordAction(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session.user) redirect('/login');

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmNewPassword = formData.get('confirmNewPassword') as string;

    if (newPassword !== confirmNewPassword) return { message: "New passwords do not match.", success: false };

    const passwordError = validatePassword(newPassword);
    if (passwordError) return { message: passwordError, success: false };

    try {
        // 1. Verify old password
        const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [session.user.id]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
            return { message: "Incorrect current password.", success: false };
        }

        // 2. Update Password
        const newHash = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, session.user.id]);

        // 3. Log Event
        await db.query(
            `INSERT INTO user_audit_logs (user_id, event_type, new_value) VALUES ($1, 'PASSWORD_CHANGE', 'Password updated')`,
            [session.user.id]
        );

        return { message: "Password changed successfully!", success: true };
    } catch (e) {
        return { message: "Failed to update password.", success: false };
    }
}

export async function logoutAction() {
    const session = await getSession();
    if (session.sessionId) {
        await db.query('UPDATE sessions SET is_revoked = TRUE WHERE session_id = $1', [session.sessionId]);
    }
    session.destroy();
    redirect('/login');
}

// Revoke a specific session
export async function revokeSessionAction(sessionId: string) {
    const session = await getSession();
    if (!session.user) return { success: false, message: "Unauthorized" };

    try {
        // Ensure user owns the session
        await db.query(
            'UPDATE sessions SET is_revoked = TRUE, last_active_at = NOW() WHERE session_id = $1 AND user_id = $2',
            [sessionId, session.user.id]
        );
        return { success: true, message: "Session logged out." };
    } catch (error) {
        return { success: false, message: "Failed to revoke session." };
    }
}

// Delete Account
export async function deleteAccountAction(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session.user) redirect('/login');

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmation = formData.get('confirmation') as string;

    if (confirmation !== 'I AGREE') {
        return { success: false, message: "You must type 'I AGREE' to confirm." };
    }

    if (email !== session.user.email) {
        return { success: false, message: "Email does not match." };
    }

    try {
        const result = await db.query('SELECT password_hash FROM users WHERE id = $1', [session.user.id]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return { success: false, message: "Incorrect password." };
        }

        // Delete User (Cascades to sessions, bookmarks, etc.)
        await db.query('DELETE FROM users WHERE id = $1', [session.user.id]);

        // Send Goodbye Email
        await resend.emails.send({
            from: emailSender,
            to: email,
            subject: 'Your RGAP Account has been deleted',
            html: emailTemplate(
                "Goodbye from RGAP",
                "We're sorry to see you go.",
                "If you change your mind, you're always welcome back.",
                `<p style="color: #374151; margin-bottom: 20px;">Your account and all associated data have been successfully deleted. If you have any feedback or questions, feel free to reach out to us.</p>`
            )
        });

        session.destroy();
    } catch (error) {
        return { success: false, message: "Failed to delete account." };
    }

    redirect('/login?deleted=true');
}

export async function checkAuth() {
    const user = await getCurrentUser();
    return { user };
}

export async function updateProfileAction(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session.user) redirect('/login');

    const newName = formData.get('name') as string;
    const newEmail = formData.get('email') as string;

    try {
        // 1. Handle Name Change (Immediate)
        if (newName !== session.user.name) {
            await db.query(
                `INSERT INTO user_audit_logs (user_id, event_type, old_value, new_value) VALUES ($1, 'NAME_CHANGE', $2, $3)`,
                [session.user.id, session.user.name, newName]
            );
            await db.query('UPDATE users SET name = $1 WHERE id = $2', [newName, session.user.id]);
            session.user.name = newName;
        }

        // 2. Handle Email Change (Pending)
        let message = 'Profile updated successfully!';

        if (newEmail !== session.user.email) {
            // Check if taken
            const check = await db.query('SELECT id FROM users WHERE email = $1', [newEmail]);
            if (check.rows.length > 0) return { message: "That email is already in use.", success: false };

            // Set Pending Email
            await db.query('UPDATE users SET pending_email = $1 WHERE id = $2', [newEmail, session.user.id]);

            // Generate Verification Token (Identifier = NEW EMAIL)
            const token = crypto.randomUUID();
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await db.query(
                'INSERT INTO verification_tokens (token, identifier, expires) VALUES ($1, $2, $3)',
                [token, newEmail, expires]
            );

            // Send Email to NEW address
            const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

            await resend.emails.send({
                from: emailSender,
                to: newEmail,
                subject: 'Verify your new email address',
                html: emailTemplate(
                    "Verify your new email address",
                    "We've received a request to change your email address.",
                    "If you didn't request this change, please secure your account immediately. Make sure to go through your account settings to review any recent activity.",
                    `<p>You requested to change your email to this address.</p>
                    <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: black; color: white; text-decoration: none; border-radius: 24px; font-weight: 600; font-size: 16px;">Verify New Email Address</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">Link expires in 24 hours.</p>`
                )
            });

            message = 'Profile updated! Check your new email to verify the change.';
        }

        await session.save();
        return { message, success: true };

    } catch (e) {
        console.error(e);
        return { message: 'Failed to update profile', success: false };
    }
}

// ======================== FORGOT PASSWORD ========================
export async function forgotPasswordAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;

    try {
        // 1. Check if user exists
        const result = await db.query('SELECT id, name FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        // Security: Always return success to prevent email enumeration, 
        // but only send the email if the user actually exists.
        if (user) {
            // Generate Token
            const token = crypto.randomUUID();
            const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 Hour

            // Store Token
            await db.query(
                'INSERT INTO password_reset_tokens (token, email, expires_at) VALUES ($1, $2, $3)',
                [token, email, expires]
            );

            const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

            // Send Email
            await resend.emails.send({
                from: emailSender,
                to: email,
                subject: 'Reset your RGAP Password',
                html: emailTemplate(
                    "Reset Your Password",
                    `Hi ${user.name}, you requested to reset your password.`,
                    "If you didn't request a password reset, you can safely ignore this email.",
                    `<p style="color: #374151; margin-bottom: 20px;">Click the button below to reset your password. This link expires in 1 hour.</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: black; color: white; text-decoration: none; border-radius: 24px; font-weight: 600; font-size: 16px;">Reset Password</a>`
                )
            });
        }

        return { success: true, message: "If an account exists with that email, we've sent password reset instructions." };

    } catch (error) {
        console.error('Forgot password error:', error);
        return { success: false, message: "Something went wrong. Please try again." };
    }
}

// ======================== RESET PASSWORD ========================
export async function resetPasswordAction(prevState: any, formData: FormData) {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
        return { success: false, message: "Passwords do not match." };
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        return { success: false, message: passwordError };
    }

    try {
        // 1. Verify Token
        const tokenResult = await db.query(
            'SELECT email FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()',
            [token]
        );

        if (tokenResult.rows.length === 0) {
            return { success: false, message: "Invalid or expired reset link. Please request a new one." };
        }

        const email = tokenResult.rows[0].email;

        // 2. Hash New Password
        const hash = await bcrypt.hash(password, 10);

        // 3. Update User
        await db.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, email]);

        // 4. Cleanup (Delete all reset tokens for this email to prevent reuse)
        await db.query('DELETE FROM password_reset_tokens WHERE email = $1', [email]);

        // 5. Audit Log
        const userResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userResult.rows[0]) {
            await db.query(
                `INSERT INTO user_audit_logs (user_id, event_type, new_value) VALUES ($1, 'PASSWORD_RESET', 'Password reset via email')`,
                [userResult.rows[0].id]
            );
        }

        return { success: true, message: "Password reset successfully! You can now log in." };

    } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, message: "Failed to reset password. Please try again." };
    }
}
