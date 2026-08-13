import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from '@react-email/components';

interface IshraqEmailLayoutProps {
  previewText: string;
  title: string;
  children: React.ReactNode;
}

export const IshraqEmailLayout: React.FC<IshraqEmailLayoutProps> = ({
  previewText,
  title,
  children,
}) => {
  return (
    <Html lang="en">
      <Head />
      <Body
        style={{
          backgroundColor: '#F2EEE6',
          fontFamily: "'Inter', Arial, sans-serif",
          margin: 0,
          padding: '24px 0',
        }}
      >
        <Container
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E5DDD0',
            maxWidth: '560px',
            margin: '0 auto',
            padding: '32px 24px',
            boxShadow: '0 2px 8px rgba(84, 53, 32, 0.08)',
          }}
        >
          {/* Header */}
          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Heading
              style={{
                color: '#B5822E',
                fontSize: '24px',
                fontWeight: '700',
                margin: 0,
                letterSpacing: '0.5px',
              }}
            >
              Ishraq Hub
            </Heading>
            <Text
              style={{
                color: '#8A7B6C',
                fontSize: '13px',
                marginTop: '4px',
                marginBottom: 0,
              }}
            >
              Islamic Knowledge & Apologetics Platform
            </Text>
          </Section>

          <Hr style={{ borderColor: '#E5DDD0', margin: '20px 0' }} />

          {/* Title */}
          <Heading
            as="h2"
            style={{
              color: '#543520',
              fontSize: '20px',
              fontWeight: '600',
              marginTop: 0,
              marginBottom: '16px',
            }}
          >
            {title}
          </Heading>

          {/* Body Content */}
          {children}

          <Hr style={{ borderColor: '#E5DDD0', margin: '28px 0 20px 0' }} />

          {/* Footer */}
          <Section style={{ textAlign: 'center' }}>
            <Text
              style={{
                color: '#8A7B6C',
                fontSize: '12px',
                lineHeight: '1.5',
                margin: 0,
              }}
            >
              © {new Date().getFullYear()} Ishraq Hub. All rights reserved.
              <br />
              This is an automated operational email sent to your registered account.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default IshraqEmailLayout;
