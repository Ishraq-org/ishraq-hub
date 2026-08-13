import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { IshraqEmailLayout } from './IshraqEmailLayout.js';

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  name,
  resetUrl,
}) => {
  return (
    <IshraqEmailLayout
      previewText="Reset your Ishraq Hub account password"
      title="Password Reset Request"
    >
      <Text style={{ color: '#3D2516', fontSize: '15px', lineHeight: '1.6' }}>
        Assalamu Alaikum {name},
      </Text>

      <Text style={{ color: '#3D2516', fontSize: '15px', lineHeight: '1.6' }}>
        We received a request to reset your password for your Ishraq Hub account. Click the button below to choose a new password.
      </Text>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <Button
          href={resetUrl}
          style={{
            backgroundColor: '#B5822E',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: '600',
            textDecoration: 'none',
            padding: '12px 24px',
            display: 'inline-block',
          }}
        >
          Reset Password
        </Button>
      </Section>

      <Text style={{ color: '#8A7B6C', fontSize: '13px', lineHeight: '1.5' }}>
        This link is security-sensitive and will expire in <strong>15 minutes</strong>. If you did not request a password reset, no action is required and your password will remain unchanged.
      </Text>
    </IshraqEmailLayout>
  );
};

export default PasswordResetEmail;
