import ForgotPasswordContent from '@/components/sections/forgot-password-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password - Connect Capitals',
  description: 'Reset your Connect Capitals account password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}