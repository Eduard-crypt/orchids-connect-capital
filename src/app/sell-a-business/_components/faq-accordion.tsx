'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  {
    question: 'How long does the business sale process typically take?',
    answer: 'The average sale process takes 45-90 days from listing to closing, though this can vary based on business size, complexity, and market conditions. Simpler businesses may sell faster, while larger, more complex transactions might take 6-12 months. Our streamlined process and pre-qualified buyer network help accelerate timelines.'
  },
  {
    question: 'What if I\'m not ready to sell immediately?',
    answer: 'No problem! Many owners start with a free valuation to understand their business worth and timeline. We can provide guidance on maximizing value before listing and keep you informed of market conditions. There\'s no obligation to list after receiving a valuation, and we\'re here when you\'re ready.'
  },
  {
    question: 'Will my business sale be confidential?',
    answer: 'Absolutely. Confidentiality is our top priority. We use blind listings (without revealing your business name), require NDAs before sharing sensitive information, carefully screen all buyers, and control access to financial data. Your employees, competitors, and customers won\'t know unless you choose to tell them.'
  },
  {
    question: 'What are your fees and commission structure?',
    answer: 'Our commission is success-based – we only get paid when your business sells. Typical fees range from 8-12% depending on business size and complexity, with larger transactions having lower percentages. We\'ll provide a detailed fee breakdown during your initial consultation. There are no upfront costs or hidden fees.'
  },
    {
    question: 'How do you find qualified buyers for my business?',
    answer: 'We utilize multiple channels to connect sellers with the right buyers: targeted marketing to industry-specific investors, strategic collaborations with private equity firms and family offices, and our proprietary matching tools. All potential buyers are carefully vetted for financial capability and genuine interest before accessing your listing'
  },
    {
      question: 'What documentation do I need to provide?',
      answer: 'To get started, the best approach is to contact us directly for a personalized consultation. We will guide you on what’s needed and help you prepare everything professionally, without stress or unnecessary complications.'
    },
  {
    question: 'Can I still run my business during the sale process?',
    answer: 'Yes, and we encourage it! Maintaining business performance is crucial for maximizing value. We structure the process to minimize disruption – meetings happen outside business hours, we handle all buyer communications, and you stay focused on operations while we manage the sale.'
  },
  {
    question: 'What happens after I accept an offer?',
    answer: 'After accepting an offer, we enter due diligence where the buyer verifies information. We coordinate this process, work with attorneys on legal documents, facilitate escrow setup, manage negotiation of final terms, and plan the transition. We stay with you through closing and beyond to ensure a smooth handover.'
  }
];

export const FAQAccordion = () => {
  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {FAQS.map((faq, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`}
          className="bg-card border border-border rounded-lg px-6 data-[state=open]:shadow-md transition-all"
        >
          <AccordionTrigger className="text-left hover:no-underline py-5">
            <span className="font-semibold text-foreground pr-4">{faq.question}</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
