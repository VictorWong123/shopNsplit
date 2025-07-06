# Supabase Email Template Setup

To customize the email templates for your ShopNSplit app, follow these steps:

## 1. Access Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Email Templates**

## 2. Customize Email Templates

### Confirmation Email Template

**Subject:** `Confirm your email for ShopNSplit`

**Body:**
```html
<h2>Welcome to ShopNSplit! 🛒</h2>

<p>Hi there,</p>

<p>Thanks for signing up for ShopNSplit - your smart grocery splitting companion!</p>

<p>Please confirm your email address by clicking the button below:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Confirm Email Address
  </a>
</div>

<p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours.</p>

<p>Best regards,<br>
The ShopNSplit Team</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">
  If you didn't create an account with ShopNSplit, you can safely ignore this email.
</p>
```

### Reset Password Email Template

**Subject:** `Reset your ShopNSplit password`

**Body:**
```html
<h2>Reset Your Password 🔐</h2>

<p>Hi there,</p>

<p>We received a request to reset your password for your ShopNSplit account.</p>

<p>Click the button below to create a new password:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Reset Password
  </a>
</div>

<p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>

<p>Best regards,<br>
The ShopNSplit Team</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">
  For security reasons, this link will expire in 1 hour.
</p>
```

### Magic Link Email Template

**Subject:** `Sign in to ShopNSplit`

**Body:**
```html
<h2>Sign In to ShopNSplit 🛒</h2>

<p>Hi there,</p>

<p>Click the button below to sign in to your ShopNSplit account:</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #14b8a6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Sign In
  </a>
</div>

<p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 1 hour.</p>

<p>Best regards,<br>
The ShopNSplit Team</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
<p style="color: #6b7280; font-size: 14px;">
  If you didn't request this sign-in link, you can safely ignore this email.
</p>
```

## 3. Save Changes

After updating each template, click **Save** to apply the changes.

## 4. Test the Templates

1. Try registering a new user to test the confirmation email
2. Try the "Forgot Password" feature to test the reset password email
3. Check that the emails are properly formatted and branded

## Notes

- The `{{ .ConfirmationURL }}` variable will be automatically replaced with the actual confirmation/reset link
- You can customize the colors, fonts, and styling to match your brand
- The templates support HTML formatting
- Make sure to test the templates in both desktop and mobile email clients 