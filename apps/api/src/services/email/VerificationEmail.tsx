import React from 'react';
import { Section, Text, Button } from '@react-email/components';
import { IshraqEmailLayout } from './IshraqEmailLayout.js';

interface VerificationEmailProps {
  name: string;
  verificationUrl: string;
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({
  name,
  verificationUrl,
}) => {
  return (
    <IshraqEmailLayout
      previewText="Verify your email address for Ishraq Hub"
      title="Verify Your Email Address"
    >
      <Text style={{ color: '#3D2516', fontSize: '15px', lineHeight: '1.6' }}>
        Assalamu Alaikum {name},
      </Text>

      <Text style={{ color: '#3D2516', fontSize: '15px', lineHeight: '1.6' }}>
        Welcome to Ishraq Hub! Please click the button below to verify your email address and complete your account setup.
      </Text>

      <Section style={{ textAlign: 'center', margin: '28px 0' }}>
        <Button
          href={verificationUrl}
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
          Verify Email Address
        </Button>
      </Section>

      <Text style={{ color: '#8A7B6C', fontSize: '13px', lineHeight: '1.5' }}>
        This link will expire in <strong>30 minutes</strong>. If you did not create an account on Ishraq Hub, you can safely ignore this email.
      </Text>
    </IshraqEmailLayout>
  );
};

export default VerificationEmail;
