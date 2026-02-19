import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { savedSearches, user, listings } from '@/db/schema';
import { eq, and, gte, lte, like, desc, or } from 'drizzle-orm';

// This endpoint would be called by a cron job daily
export async function POST(request: NextRequest) {
  try {
    // In production, verify this is called from your cron service
    const authHeader = request.headers.get('authorization');
    // Add your cron secret validation here
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get all saved searches with email alerts enabled
    const activeSearches = await db
      .select({
        search: savedSearches,
        userEmail: user.email,
        userName: user.name,
      })
      .from(savedSearches)
      .innerJoin(user, eq(savedSearches.userId, user.id))
      .where(eq(savedSearches.emailAlertsEnabled, true));

    const emailsSent: string[] = [];
    const errors: string[] = [];

    // Process each saved search
    for (const { search, userEmail, userName } of activeSearches) {
      try {
        // Fetch matching listings
        const searchCriteria = search.searchCriteria as Record<string, any>;
        const conditions: any[] = [eq(listings.status, 'approved')];

        // Build query based on criteria (same logic as matches endpoint)
        if (searchCriteria.type) {
          conditions.push(eq(listings.businessType, searchCriteria.type));
        }
        if (searchCriteria.minPrice) {
          conditions.push(gte(listings.askingPrice, searchCriteria.minPrice));
        }
        if (searchCriteria.maxPrice) {
          conditions.push(lte(listings.askingPrice, searchCriteria.maxPrice));
        }
        if (searchCriteria.minRevenue) {
          conditions.push(gte(listings.ttmRevenue, searchCriteria.minRevenue));
        }
        if (searchCriteria.maxRevenue) {
          conditions.push(lte(listings.ttmRevenue, searchCriteria.maxRevenue));
        }
        if (searchCriteria.minProfit) {
          conditions.push(gte(listings.ttmProfit, searchCriteria.minProfit));
        }
        if (searchCriteria.maxProfit) {
          conditions.push(lte(listings.ttmProfit, searchCriteria.maxProfit));
        }
        if (searchCriteria.geography) {
          conditions.push(like(listings.geography, `%${searchCriteria.geography}%`));
        }
        if (searchCriteria.niche) {
          conditions.push(like(listings.niche, `%${searchCriteria.niche}%`));
        }
        if (searchCriteria.verifiedOnly === true) {
          conditions.push(eq(listings.isVerified, true));
        }
        if (searchCriteria.search) {
          const searchTerm = searchCriteria.search;
          conditions.push(
            or(
              like(listings.title, `%${searchTerm}%`),
              like(listings.niche, `%${searchTerm}%`),
              like(listings.businessModel, `%${searchTerm}%`)
            )
          );
        }

        // Get recent listings (last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        conditions.push(gte(listings.createdAt, oneDayAgo));

        const matchingListings = await db
          .select()
          .from(listings)
          .where(and(...conditions))
          .orderBy(desc(listings.createdAt))
          .limit(5);

        // Only send email if there are new matches
        if (matchingListings.length > 0) {
          const emailHtml = generateEmailHtml({
            userName: userName || 'there',
            searchName: search.name,
            listings: matchingListings,
            searchId: search.id,
          });

          // In production, send email via your email service (Resend, SendGrid, etc.)
          // Example with Resend:
          // await resend.emails.send({
          //   from: 'OptiFirm <notifications@optifirm.com>',
          //   to: userEmail,
          //   subject: `${matchingListings.length} new listing${matchingListings.length !== 1 ? 's' : ''} match your saved search: ${search.name}`,
          //   html: emailHtml,
          // });

          console.log(`Would send email to ${userEmail} for search "${search.name}"`);
          console.log(`Matches found: ${matchingListings.length}`);
          emailsSent.push(userEmail);
        }
      } catch (error) {
        console.error(`Error processing search ${search.id}:`, error);
        errors.push(`Search ${search.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent: emailsSent.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Processed ${activeSearches.length} saved searches, sent ${emailsSent.length} emails`,
    });
  } catch (error) {
    console.error('Daily digest error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

function generateEmailHtml({
  userName,
  searchName,
  listings,
  searchId,
}: {
  userName: string;
  searchName: string;
  listings: any[];
  searchId: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://connectcapitals.com';
  const listingRows = listings
    .map(
      (listing) => `
    <tr style="border-bottom: 1px solid #E8EEF5;">
      <td style="padding: 20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <h3 style="margin: 0 0 8px 0; color: #1A3E6D; font-size: 18px; font-weight: 600;">
                ${listing.title}
              </h3>
              <div style="margin-bottom: 12px;">
                ${listing.businessType ? `<span style="display: inline-block; padding: 4px 12px; background: #E8EEF5; border-radius: 4px; font-size: 12px; color: #4A4A4A; margin-right: 8px;">${listing.businessType}</span>` : ''}
                ${listing.isVerified ? '<span style="display: inline-block; padding: 4px 12px; background: #28a745; border-radius: 4px; font-size: 12px; color: white;">✓ Verified</span>' : ''}
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 12px 0;">
                <tr>
                  <td style="padding: 8px 16px 8px 0; width: 25%;">
                    <div style="color: #6B7280; font-size: 12px;">Asking Price</div>
                    <div style="color: #1A3E6D; font-size: 16px; font-weight: 700;">$${listing.askingPrice ? (listing.askingPrice / 1000).toFixed(0) : 'N/A'}K</div>
                  </td>
                  <td style="padding: 8px 16px 8px 0; width: 25%;">
                    <div style="color: #6B7280; font-size: 12px;">TTM Revenue</div>
                    <div style="color: #4A4A4A; font-size: 14px; font-weight: 600;">$${listing.ttmRevenue ? (listing.ttmRevenue / 1000).toFixed(0) : 'N/A'}K</div>
                  </td>
                  <td style="padding: 8px 16px 8px 0; width: 25%;">
                    <div style="color: #6B7280; font-size: 12px;">TTM Profit</div>
                    <div style="color: #4A4A4A; font-size: 14px; font-weight: 600;">$${listing.ttmProfit ? (listing.ttmProfit / 1000).toFixed(0) : 'N/A'}K</div>
                  </td>
                  <td style="padding: 8px 0; width: 25%;">
                    <div style="color: #6B7280; font-size: 12px;">Multiple</div>
                    <div style="color: #4A4A4A; font-size: 14px; font-weight: 600;">${listing.revenueMultiple ? listing.revenueMultiple.toFixed(1) : 'N/A'}x</div>
                  </td>
                </tr>
              </table>
              <a href="${baseUrl}/listing/${listing.id}" style="display: inline-block; margin-top: 12px; padding: 10px 24px; background: #F18F01; color: #1A1A1A; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                View Details →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Listings Match Your Saved Search</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Poppins', 'Inter', Arial, sans-serif; background-color: #F2F4F7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F2F4F7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1A3E6D 0%, #3F5F8B 100%); padding: 40px 30px; text-align: center;">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Connect Capitals</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Daily Business Digest</p>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 16px 0; color: #1A3E6D; font-size: 24px; font-weight: 700;">
                Hi ${userName}! 👋
              </h2>
              <p style="margin: 0 0 24px 0; color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                We found <strong>${listings.length} new listing${listings.length !== 1 ? 's' : ''}</strong> that match your saved search:
                <strong>"${searchName}"</strong>
              </p>
              
              <!-- Listings -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                ${listingRows}
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${baseUrl}/listings" style="display: inline-block; padding: 16px 40px; background: #1A3E6D; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">
                      Browse All Listings →
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #E8EEF5; color: #6B7280; font-size: 13px; line-height: 1.6;">
                You're receiving this email because you have email alerts enabled for "${searchName}". 
                <a href="${baseUrl}/dashboard?tab=saved-searches" style="color: #1A3E6D; text-decoration: none;">Manage your saved searches</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F2F4F7; padding: 30px; text-align: center;">
              <div class="footer">
                <p style="margin: 0 0 10px 0;">&copy; 2024 Connect Capitals. All rights reserved.</p>
                <p style="margin: 0;">
                  <a href="${siteUrl}" style="color: #1A3E6D; text-decoration: none;">Visit Connect Capitals</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}