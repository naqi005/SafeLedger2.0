import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion'

const questions = [
  {
    id: 'item-1',
    title: 'What is SafeLedger?',
    content:
      'SafeLedger is a premium peer-to-peer digital wallet and multi-currency exchange platform. It lets you hold, send, receive, and convert money across 30+ currencies with institutional-grade security and real-time market rates — all from one unified account.',
  },
  {
    id: 'item-2',
    title: 'How secure is SafeLedger?',
    content:
      'Every account is protected by military-grade AES-256 encryption, multi-factor authentication, and a cryptographically timestamped audit trail. All transactions are recorded immutably, giving you a full chain of custody at all times.',
  },
  {
    id: 'item-3',
    title: 'Which currencies does SafeLedger support?',
    content:
      'SafeLedger supports 30+ currencies including PKR, USD, EUR, GBP, AED, SAR, JPY, CAD, AUD, CHF, SGD, HKD, and more. You can create a separate wallet for each currency and switch between them instantly.',
  },
  {
    id: 'item-4',
    title: 'How long do transfers take?',
    content:
      'Peer-to-peer transfers between SafeLedger users are instant — settled in seconds with no intermediaries. Currency exchanges execute at real-time market rates with zero hidden spreads or delay.',
  },
  {
    id: 'item-5',
    title: 'Are there any fees?',
    content:
      'SafeLedger charges no fees for account creation or wallet maintenance. Exchange rates are shown transparently with no hidden spreads. Any applicable transaction costs are displayed clearly before you confirm.',
  },
  {
    id: 'item-6',
    title: 'How do I send money to another user?',
    content:
      'Simply navigate to Send Money, enter the recipient\'s registered email address, choose the source wallet and amount, and confirm. No routing numbers, bank codes, or lengthy processing times — just an email address.',
  },
  {
    id: 'item-7',
    title: 'How do I get support?',
    content:
      'Our support team is available around the clock. You can reach us through the in-app help centre, email, or our community forum. Enterprise accounts are assigned a dedicated customer success manager.',
  },
  {
    id: 'item-8',
    title: 'Do I need to verify my identity (KYC)?',
    content:
      'Basic account features are available immediately after registration. To unlock higher transfer limits and full exchange functionality, a one-time KYC verification is required — typically completed in under 5 minutes using a government-issued ID and a selfie. Your data is encrypted and never shared with third parties.',
  },
  {
    id: 'item-9',
    title: 'Can businesses use SafeLedger?',
    content:
      'Yes. SafeLedger supports both personal and business accounts. Business accounts unlock higher daily transfer limits, multi-user access controls, batch payment capabilities, and detailed transaction exports for accounting. Contact our team to set up a business vault tailored to your operational needs.',
  },
  {
    id: 'item-10',
    title: 'How does SafeLedger compare to Wise or PayPal?',
    content:
      'SafeLedger is purpose-built for the South Asian corridor — particularly PKR-to-USD and PKR-to-AED — with rates that consistently beat Wise and PayPal on these routes. Unlike PayPal, SafeLedger charges no withdrawal fees and offers real-time P2P transfers without a 3–5 business day settlement window. Unlike traditional banks, there are no SWIFT correspondent fees. Your funds move directly, with complete transparency.',
  },
]

export function FaqsSection() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4">

      {/* Header */}
      <div className="space-y-3 text-center">
        <p className="font-display text-gold text-xs tracking-[0.25em] uppercase">Support</p>
        <h2 className="font-display text-3xl font-bold md:text-4xl text-chalk">
          Frequently Asked <span className="gold-text">Questions</span>
        </h2>
        <p className="text-smoke max-w-xl mx-auto text-sm leading-relaxed">
          Everything you need to know about using SafeLedger for P2P transfers, currency exchange, and multi-currency wallets.
          Still have questions?{' '}
          <a href="#" className="text-gold hover:text-gold-light underline underline-offset-4 transition-colors">
            Reach our support team
          </a>
          .
        </p>
      </div>

      {/* Accordion */}
      <Accordion
        type="single"
        collapsible
        defaultValue="item-1"
        className="w-full rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(201,151,58,0.15)' }}
      >
        {questions.map((item, idx) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="relative"
            style={{
              borderBottom: idx < questions.length - 1 ? '1px solid rgba(201,151,58,0.1)' : 'none',
              background: 'transparent',
            }}
          >
            <AccordionTrigger
              className="px-6 py-5 text-[15px] leading-6 text-chalk font-display tracking-wide hover:text-gold data-[state=open]:text-gold transition-colors duration-200 hover:no-underline"
              style={{ background: 'transparent' }}
            >
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="text-smoke px-6 text-sm leading-relaxed">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
