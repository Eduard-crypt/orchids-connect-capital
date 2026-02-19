import JoinUsContent from '@/components/sections/join-us-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join Us - Connect Capitals',
  description: 'Join Connect Capitals to buy or sell online businesses',
};

export default function JoinUsPage() {
  return (
    <div className="min-h-screen bg-background">
      <JoinUsContent />
    </div>
  );
}