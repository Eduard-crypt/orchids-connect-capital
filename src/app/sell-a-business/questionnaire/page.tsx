import SellQuestionnaireContent from '@/components/sections/sell-questionnaire-content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell Your Business - Questionnaire',
  description: 'Complete our questionnaire to list your business for sale on Connect Capitals.',
};

export default function SellQuestionnairePage() {
  return (
    <div className="min-h-screen bg-background">
      <SellQuestionnaireContent />
    </div>
  );
}
