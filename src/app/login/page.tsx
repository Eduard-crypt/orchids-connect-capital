import LoginContent from '@/components/sections/login-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In - Connect Capitals',
  description: 'Log in to your Connect Capitals account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <LoginContent />
    </div>
  );
}