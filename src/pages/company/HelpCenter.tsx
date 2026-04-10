import { HelpCircle, Mail, Phone, MessageSquare } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function HelpCenter() {
  return (
    <div className="container-main py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <HelpCircle className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="font-display text-3xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground">Find answers to common questions or contact our support team.</p>
        </div>

        <h2 className="font-display text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="mb-12">
          {[
            { q: 'How does price comparison work?', a: 'The Buyer aggregates listings from hundreds of stores and shows you the prices side-by-side. The lowest price is automatically highlighted so you can make the best choice.' },
            { q: 'Is my payment secure?', a: 'Yes! All transactions are processed through secure, encrypted payment gateways. We support credit cards and mobile money.' },
            { q: 'How do I become a seller?', a: 'Register as a seller, provide your business details, accept our commission policy, and start listing your products. It takes less than 5 minutes.' },
            { q: 'Can I return a product?', a: 'Returns are handled by individual sellers. Check the seller return policy before purchasing.' },
            { q: 'What is the AI Best Value feature?', a: 'Our AI analyzes price, seller rating, stock availability, and price history to recommend the best overall value — not just the cheapest option.' },
          ].map(({ q, a }, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <h2 className="font-display text-xl font-semibold mb-4">Contact Support</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Mail, label: 'Email', value: 'support@thebuyer.com' },
            { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
            { icon: MessageSquare, label: 'Live Chat', value: 'Available 9am–6pm' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-5 text-center">
              <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
