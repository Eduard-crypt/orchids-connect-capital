# Contact Form Email System - Complete Setup Guide

## ✅ What Has Been Fixed

### 1. **Database Table Fixed**
- Fixed `contact_messages` table with proper autoincrement and default timestamps
- Table now correctly handles inserts without requiring manual ID or timestamp values

### 2. **Email System Configured**
- Created proper SMTP email sending for contact form notifications
- Set up two email types:
  - **Support Team Notification** → Sent to `support@connectcapitals.com`
  - **Customer Auto-Reply** → Sent to the customer who submitted the form

### 3. **Form Validation**
- ✅ Required fields: First Name, Last Name, Email, Interest Type, Message
- ✅ Email format validation
- ✅ Message length validation (minimum 10 characters)
- ✅ Interest type validation

### 4. **User Experience**
- ✅ Loading states during submission
- ✅ Success toast: "Thank you! Your message has been sent successfully. Our support team will contact you shortly."
- ✅ Error toast: "We couldn't send your message at the moment. Please try again later or email us directly at support@connectcapitals.com."

---

## 🔑 Required Environment Variables

Add the following to your `.env` file:

```env
# Contact Form SMTP Configuration
# Use the support@connectcapitals.com mailbox credentials
CONTACT_SMTP_USER=support@connectcapitals.com
CONTACT_SMTP_PASSWORD=your_support_mailbox_password_here
CONTACT_FROM_EMAIL=support@connectcapitals.com

# These should already exist from password reset setup:
SMTP_HOST=mail.privateemail.com
SMTP_PORT=465
SMTP_SECURE=true
```

### Important Notes:
1. **CONTACT_SMTP_USER** must be `support@connectcapitals.com`
2. **CONTACT_SMTP_PASSWORD** is the password for the `support@connectcapitals.com` mailbox
3. **CONTACT_FROM_EMAIL** must match the authenticated user (support@connectcapitals.com)
4. The SMTP server will reject emails if the FROM address doesn't match the authenticated user

---

## 📧 Email Flow

### When a user submits the contact form:

1. **Form Data Saved to Database**
   - All contact information is stored in `contact_messages` table
   - Status: `new`
   - Timestamps automatically generated

2. **Email #1: Support Team Notification**
   - **From:** support@connectcapitals.com
   - **To:** support@connectcapitals.com
   - **Subject:** 🔔 New Contact: [Interest Type] - [Customer Name]
   - **Content:** 
     - Submission ID
     - Date & Time
     - Customer contact info
     - Selected interest type
     - Message content
     - Action required notice

3. **Email #2: Customer Auto-Reply**
   - **From:** support@connectcapitals.com
   - **To:** [Customer's Email]
   - **Subject:** Thank you for contacting Connect Capitals
   - **Content:**
     - Personalized greeting
     - Confirmation of receipt
     - Expected response time (24 hours)
     - What happens next
     - Link to website

---

## 🧪 Testing Checklist

### ✅ Test Case 1: Valid Submission with All Fields
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1 (555) 123-4567",
    "interestType": "buying-online",
    "message": "I am interested in purchasing an e-commerce business."
  }'
```
**Expected:**
- ✅ 201 status code
- ✅ Message saved to database
- ✅ Email sent to support@connectcapitals.com
- ✅ Auto-reply sent to john@example.com

### ✅ Test Case 2: Valid Submission without Phone
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "interestType": "selling-online",
    "message": "I want to sell my SaaS business. What is your evaluation process?"
  }'
```
**Expected:**
- ✅ 201 status code
- ✅ Message saved with phone = null
- ✅ Emails sent successfully

### ✅ Test Case 3: Invalid Submission - Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "",
    "lastName": "Test",
    "email": "invalid-email",
    "interestType": "general",
    "message": "Short"
  }'
```
**Expected:**
- ✅ 400 status code
- ✅ Error: "Missing required fields"
- ✅ No database entry
- ✅ No emails sent

---

## 🔍 Troubleshooting

### Issue: "Sender address rejected: not owned by user"
**Cause:** SMTP FROM address doesn't match authenticated user  
**Solution:** Make sure `CONTACT_SMTP_USER` and `CONTACT_FROM_EMAIL` are both `support@connectcapitals.com`

### Issue: "Authentication failed"
**Cause:** Incorrect password  
**Solution:** Verify `CONTACT_SMTP_PASSWORD` is correct for support@connectcapitals.com mailbox

### Issue: "Connection timeout"
**Cause:** SMTP server not reachable  
**Solution:** Verify `SMTP_HOST=mail.privateemail.com` and `SMTP_PORT=465`

### Issue: Form saves but emails don't send
**Cause:** SMTP credentials not configured or incorrect  
**Solution:** 
1. Check server logs: `bun run check-logs` or check the console
2. Verify all CONTACT_* environment variables are set
3. Test SMTP connection manually

---

## 📁 Files Modified/Created

### Created:
- `scripts/fix-contact-messages-table.ts` - Database table fix script
- `CONTACT_FORM_EMAIL_SETUP.md` - This documentation

### Modified:
- `src/app/api/contact/route.ts` - Fixed database insert, added email integration
- `src/app/api/email/contact-notification/route.ts` - Complete SMTP email implementation
- `src/app/api/email/contact-auto-reply/route.ts` - Complete SMTP email implementation  
- `src/app/reach-us/page.tsx` - Updated toast messages and error handling

---

## 🎯 Summary

The contact form on the "Reach Us" page is now fully functional and will:

✅ **Validate all required fields** before submission  
✅ **Save contact messages** to the database  
✅ **Send notifications** to support@connectcapitals.com  
✅ **Send auto-reply** to customers  
✅ **Show appropriate toasts** for success/error states  
✅ **Use correct SMTP credentials** (support@connectcapitals.com)  

### ⚠️ **ACTION REQUIRED:**
You must add the `support@connectcapitals.com` SMTP credentials to your `.env` file for emails to be delivered successfully.

---

## 📞 Contact Form Fields

- **First Name*** (required)
- **Last Name*** (required)  
- **Email Address*** (required, validated)
- **Phone Number** (optional)
- **I'm Interested In*** (required, dropdown):
  - Buying an Online Business
  - Selling an Online Business
  - Rent an AI Agent
  - TrustBridge Services
  - Educational Programs
  - General Inquiry
- **Message*** (required, min 10 characters)

---

**Setup Date:** November 29, 2025  
**Status:** ✅ Complete (Awaiting SMTP Credentials)
