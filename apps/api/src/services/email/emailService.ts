import { Resend } from 'resend';
import { render } from '@react-email/render';
import React from 'react';
import { VerificationEmail } from './VerificationEmail.js';
import { PasswordResetEmail } from './PasswordResetEmail.js';
import { IUserDocument } from '../../models/User.js';

const getResendClient = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes('123456789')) {
    return null;
  }
  return new Resend(apiKey);
};

const getBaseUrl = (): string => {
  return process.env.CLIENT_URL || 'http://localhost:3000';
};

export const sendVerificationEmail = async (
  user: IUserDocument | { name: string; email: string },
  rawToken: string
): Promise<void> => {
  const verificationUrl = `${getBaseUrl()}/verify-email?token=${rawToken}`;
  const resend = getResendClient();

  const html = await render(
    React.createElement(VerificationEmail, {
      name: user.name,
      verificationUrl,
    })
  );

  if (!resend) {
    console.log(`[Email Service - DEV LOG] Verification Email for ${user.email}:`);
    console.log(`[Email Service - DEV LOG] Verification URL: ${verificationUrl}`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'no-reply@ishraqhub.com',
      to: user.email,
      subject: 'Verify your email address — Ishraq Hub',
      html,
    });
    console.log(`[Email Service] Sent verification email to ${user.email}`);
  } catch (error) {
    console.error(`[Email Service] Failed to send verification email: ${(error as Error).message}`);
    // Log URL fallback so developer is never stranded
    console.log(`[Email Service - FALLBACK] Verification URL: ${verificationUrl}`);
  }
};

export const sendPasswordResetEmail = async (
  user: IUserDocument | { name: string; email: string },
  rawToken: string
): Promise<void> => {
  const resetUrl = `${getBaseUrl()}/reset-password?token=${rawToken}`;
  const resend = getResendClient();

  const html = await render(
    React.createElement(PasswordResetEmail, {
      name: user.name,
      resetUrl,
    })
  );

  if (!resend) {
    console.log(`[Email Service - DEV LOG] Password Reset Email for ${user.email}:`);
    console.log(`[Email Service - DEV LOG] Reset URL: ${resetUrl}`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'no-reply@ishraqhub.com',
      to: user.email,
      subject: 'Reset your password — Ishraq Hub',
      html,
    });
    console.log(`[Email Service] Sent password reset email to ${user.email}`);
  } catch (error) {
    console.error(`[Email Service] Failed to send password reset email: ${(error as Error).message}`);
    console.log(`[Email Service - FALLBACK] Reset URL: ${resetUrl}`);
  }
};
