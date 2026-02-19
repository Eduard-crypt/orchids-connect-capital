# Legal Compliance Guide - Revolut Payment System

## 🎯 Overview

This document outlines the legal compliance requirements for the Revolut payment system, including GDPR, PSD2, AML/KYC, and consumer protection regulations.

---

## 📋 Compliance Checklist

### Required Legal Documents

- [ ] **Terms of Service** - User agreement for platform use
- [ ] **Privacy Policy** - Data collection and processing disclosure
- [ ] **Refund Policy** - Clear refund and cancellation terms
- [ ] **Payment Disclosure** - Payment processing information
- [ ] **Cookie Policy** - Cookie usage and consent
- [ ] **Data Processing Agreement (DPA)** - For business customers

---

## 1. GDPR Compliance (EU General Data Protection Regulation)

### Data Collection Transparency

**What data do we collect?**
- User account information (name, email)
- Payment information (handled by Revolut - PCI DSS compliant)
- Transaction history
- Order records
- IP addresses (for fraud detection)
- Browser information (User-Agent)

**Legal Basis for Processing:**
- **Contract Performance**: Processing payments for services purchased
- **Legitimate Interest**: Fraud prevention, security, analytics
- **Consent**: Marketing emails (opt-in required)

### User Rights Under GDPR

Users must be able to:
1. ✅ **Access** their data (export functionality)
2. ✅ **Rectify** incorrect data (profile editing)
3. ✅ **Delete** their data (right to be forgotten)
4. ✅ **Port** their data (data export)
5. ✅ **Object** to processing (opt-out options)
6. ✅ **Restrict** processing

### Data Retention Policy

```
- Active user data: Retained while account is active
- Transaction records: 7 years (legal requirement)
- Marketing consent: Until withdrawn
- Audit logs: 3 years
- Inactive accounts: Deleted after 2 years of inactivity (with 30-day notice)
```

### Implementation Requirements

**Privacy Policy Page:**
```typescript
// Create: src/app/privacy-policy/page.tsx
- Clear explanation of data collection
- User rights information
- Contact information for data requests
- Data Protection Officer (DPO) details
```

**Cookie Consent Banner:**
```typescript
// Implement cookie consent banner
- Required cookies (functional)
- Analytics cookies (optional)
- Marketing cookies (optional)
- Allow users to opt-out
```

---

## 2. PSD2 (Payment Services Directive 2)

### Strong Customer Authentication (SCA)

**Automatic with Revolut:**
- ✅ 3D Secure (3DS) enabled by default
- ✅ Two-factor authentication for transactions
- ✅ Biometric authentication support
- ✅ Dynamic linking of transaction amount

**No additional implementation required** - Revolut SDK handles SCA automatically.

### Transaction Monitoring

Required logging:
```typescript
// src/app/api/webhooks/revolut/route.ts
await db.insert(auditLog).values({
  userId,
  action: 'payment_completed',
  ipAddress,
  userAgent,
  metadata: JSON.stringify({
    orderId: payload.order_id,
    amount: payload.order.amount,
    currency: payload.order.currency,
  }),
});
```

---

## 3. AML/KYC Compliance (Anti-Money Laundering / Know Your Customer)

### Customer Verification

**Basic Requirements:**
- Email verification (already implemented via better-auth)
- Identity verification for high-value transactions (>€1,000)

**Enhanced Due Diligence:**
```typescript
// Implement for transactions over threshold
if (amount > 100000) { // $1,000
  // Require additional verification
  - Government-issued ID
  - Proof of address
  - Source of funds declaration
}
```

### Transaction Limits

**Recommended Limits:**
```typescript
// src/lib/revolut.ts
export const TRANSACTION_LIMITS = {
  SINGLE_TRANSACTION_MAX: 1000000, // $10,000
  DAILY_LIMIT: 5000000, // $50,000
  MONTHLY_LIMIT: 20000000, // $200,000
};
```

### Suspicious Activity Monitoring

```typescript
// src/lib/revolut.ts
export function detectFraudulentActivity(
  userId: string,
  amount: number,
  ipAddress: string | null
): { isFraudulent: boolean; reason?: string } {
  
  // Multiple transactions in short time
  // Unusually high amounts
  // Geographic anomalies
  // Pattern matching
  
  if (amount > TRANSACTION_LIMITS.SINGLE_TRANSACTION_MAX) {
    return { 
      isFraudulent: true, 
      reason: 'Amount exceeds single transaction limit' 
    };
  }
  
  return { isFraudulent: false };
}
```

---

## 4. Consumer Rights & Protection

### Right to Refund

**EU Consumer Rights Directive:**
- 14-day cooling-off period for digital services (before access granted)
- Clear refund policy required
- Pro-rata refunds for subscription cancellations

**Refund Policy Template:**

```markdown
# Refund Policy

## Digital Services
- Full refund within 14 days if no service access granted
- Pro-rata refund for subscription cancellations
- No refund after service activation (unless defective)

## Processing Time
- Refund requests processed within 5-10 business days
- Funds returned to original payment method

## How to Request
Email: refunds@yourdomain.com
Subject: Refund Request - Order #[ORDER_ID]
```

### Cancellation Policy

```typescript
// Implement in: src/app/api/memberships/cancel/route.ts
- Allow users to cancel anytime
- Cancel at end of billing period (no immediate termination)
- Send confirmation email
- Calculate pro-rata refund if applicable
```

---

## 5. Payment Disclosure Requirements

### Required Information on Checkout Page

Must display:
1. ✅ **Total Price** - Clear, prominent display
2. ✅ **Currency** - USD, EUR, GBP, etc.
3. ✅ **Billing Interval** - Monthly, yearly
4. ✅ **Auto-renewal Notice** - "Subscription renews automatically"
5. ✅ **Payment Processor** - "Payments processed by Revolut"
6. ✅ **Security Badge** - "Secure payment - PCI DSS compliant"
7. ✅ **Terms Link** - Link to Terms of Service
8. ✅ **Privacy Link** - Link to Privacy Policy

### Payment Receipt

Must include:
```
- Order number
- Date and time
- Items purchased
- Amount paid
- Payment method
- Business name and address
- VAT number (if applicable)
- Invoice download link
```

---

## 6. Data Security Requirements

### PCI DSS Compliance

**Revolut Handles:**
- ✅ Payment card data storage (we never see card numbers)
- ✅ Card tokenization
- ✅ Encryption in transit and at rest
- ✅ PCI DSS Level 1 certification

**Our Responsibilities:**
- ✅ Use HTTPS for all pages
- ✅ Secure webhook signature verification
- ✅ Don't log sensitive payment data
- ✅ Implement proper access controls

### Data Encryption

```typescript
// All sensitive data must be encrypted
- Database credentials (environment variables)
- API keys (environment variables)
- User passwords (hashed with bcrypt via better-auth)
- Session tokens (encrypted)
```

---

## 7. Audit Logging

### Required Logs

```typescript
// src/db/schema.ts - auditLog table
export const auditLog = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});
```

**Actions to Log:**
- `payment_initiated`
- `payment_completed`
- `payment_failed`
- `refund_requested`
- `refund_processed`
- `promo_code_applied`
- `account_created`
- `login`
- `logout`
- `data_export_requested`
- `account_deleted`

---

## 8. Terms of Service Requirements

### Essential Clauses

**1. Service Description**
```markdown
We provide [description of service]. Access is granted upon payment and 
subject to these Terms.
```

**2. Payment Terms**
```markdown
- Prices in USD/EUR/GBP
- Payments processed by Revolut
- Subscriptions renew automatically
- Cancellation allowed anytime
- Refunds subject to Refund Policy
```

**3. Prohibited Uses**
```markdown
You may not:
- Use service for illegal purposes
- Attempt to breach security
- Reverse engineer the platform
- Share account credentials
- Abuse promo codes
```

**4. Limitation of Liability**
```markdown
We are not liable for:
- Service interruptions
- Data loss (maintain your backups)
- Third-party payment processor issues
Maximum liability: Amount paid in last 12 months
```

**5. Termination**
```markdown
We may terminate accounts for:
- Terms violations
- Fraudulent activity
- Non-payment
Notice: 30 days for non-urgent terminations
```

**6. Governing Law**
```markdown
These Terms are governed by [Your jurisdiction] law.
Disputes resolved in [Your jurisdiction] courts.
```

---

## 9. Privacy Policy Requirements

### Essential Sections

**1. What Data We Collect**
- Account information
- Payment information (via Revolut)
- Usage data
- Cookies

**2. How We Use Data**
- Provide services
- Process payments
- Fraud prevention
- Customer support
- Marketing (with consent)

**3. Data Sharing**
- Payment processor (Revolut)
- Email service provider
- Analytics providers
- Law enforcement (when required)

**4. Data Security**
- Encryption
- Access controls
- Regular security audits
- PCI DSS compliance

**5. Your Rights**
- Access your data
- Correct inaccuracies
- Delete your account
- Export your data
- Withdraw consent

**6. Contact Information**
```
Data Protection Officer (DPO):
Email: privacy@yourdomain.com
Address: [Your business address]
```

---

## 10. Implementation Checklist

### Immediate Actions

- [ ] Create `/privacy-policy` page
- [ ] Create `/terms-of-service` page
- [ ] Create `/refund-policy` page
- [ ] Add links to footer
- [ ] Add checkboxes to registration form
- [ ] Implement cookie consent banner
- [ ] Add payment disclosure text to checkout
- [ ] Set up audit logging
- [ ] Configure data retention policies

### Development Actions

- [ ] Implement data export feature
- [ ] Implement account deletion feature
- [ ] Add email unsubscribe links
- [ ] Create admin panel for refunds
- [ ] Set up transaction monitoring alerts
- [ ] Implement fraud detection rules

### Business Actions

- [ ] Consult with legal counsel
- [ ] Register as data controller (GDPR)
- [ ] Obtain business insurance
- [ ] Set up accounting for VAT (if applicable)
- [ ] Create customer support process
- [ ] Train staff on data protection

---

## 11. Promo Code ES108 - Legal Considerations

### Promotion Terms

Must clearly state:
```markdown
**Promo Code ES108 Terms:**
- Valid for [specify period or "limited time"]
- One use per customer
- Cannot be combined with other offers
- No cash value
- Company reserves right to modify or cancel
- Subject to fraud detection
```

### Anti-Fraud Measures

```typescript
// Prevent abuse of ES108
- Limit to one use per email
- Track IP addresses
- Block disposable email services
- Implement CAPTCHA for multiple attempts
- Monitor for patterns of abuse
```

---

## 12. Email Communications

### Required Elements

**Transactional Emails:**
- Order confirmations
- Payment receipts
- Refund notifications
- Account changes

**Marketing Emails:**
- Must have opt-in consent
- Unsubscribe link in every email
- Honor opt-out within 48 hours
- Include physical business address

---

## 13. Accessibility Compliance

### WCAG 2.1 Level AA

**Payment Flow:**
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios
- Error messages clearly announced
- Form labels properly associated

---

## 14. International Considerations

### Currency and Tax

**VAT/GST:**
```typescript
// Add to checkout calculation
const vatRate = userCountry === 'GB' ? 0.20 : 0; // 20% UK VAT
const totalWithVat = amount * (1 + vatRate);
```

**Currency Conversion:**
- Display prices in user's local currency
- Show conversion rates
- State final charge currency

---

## 15. Incident Response Plan

### Data Breach Protocol

1. **Immediate Actions** (within 24 hours)
   - Contain the breach
   - Assess impact
   - Preserve evidence
   - Notify leadership

2. **Notification** (within 72 hours)
   - Notify supervisory authority (GDPR)
   - Notify affected users
   - Provide mitigation advice

3. **Remediation**
   - Fix vulnerabilities
   - Update security measures
   - Document lessons learned

---

## Support Contacts

**Legal Compliance Questions:**
- Email: legal@yourdomain.com

**Data Protection Inquiries:**
- Email: privacy@yourdomain.com

**Payment Disputes:**
- Email: payments@yourdomain.com

---

**Last Updated:** December 2025  
**Version:** 1.0.0  
**Review Schedule:** Quarterly
