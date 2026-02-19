import ResetPasswordContent from '@/components/sections/reset-password-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password - Connect Capitals',
  description: 'Create a new password for your Connect Capitals account',
};

export default function ResetPasswordPage() {
  return <ResetPasswordContent />;
}