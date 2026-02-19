import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sellRequests } from '@/db/schema';
import { auth } from '@/lib/auth';

const VALID_BUSINESS_MODELS = [
  'SaaS',
  'E-commerce',
  'Content Website',
  'Marketplace',
  'Mobile Application',
  'Other'
] as const;

const VALID_PLANS = ['basic', 'featured', 'premium'] as const;

type BusinessModel = typeof VALID_BUSINESS_MODELS[number];
type Plan = typeof VALID_PLANS[number];

interface SellRequestBody {
  businessName: string;
  businessUrl: string;
  businessModel: string;
  annualRevenue: number;
  annualProfit: number;
  employeesCount: number;
    description: string;
    plan: string;
    formData?: any;
  }
  
  export async function POST(request: NextRequest) {
    try {
      // Authentication check
      const session = await auth.api.getSession({ headers: request.headers });
      
      if (!session) {
        return NextResponse.json(
          { error: 'Authentication required', code: 'UNAUTHENTICATED' },
          { status: 401 }
        );
      }
  
      // Parse request body
      const body: SellRequestBody = await request.json();
  
      // Security check: reject if userId or user_id provided
      if ('userId' in body || 'user_id' in body) {
        return NextResponse.json(
          { 
            error: 'User ID cannot be provided in request body',
            code: 'USER_ID_NOT_ALLOWED' 
          },
          { status: 400 }
        );
      }
  
      // Validate required fields
      if (!body.businessName || typeof body.businessName !== 'string' || body.businessName.trim() === '') {
        return NextResponse.json(
          { error: 'Business name is required and must be a non-empty string', code: 'INVALID_BUSINESS_NAME' },
          { status: 400 }
        );
      }
  
      if (!body.businessUrl || typeof body.businessUrl !== 'string' || body.businessUrl.trim() === '') {
        return NextResponse.json(
          { error: 'Business URL is required and must be a non-empty string', code: 'INVALID_BUSINESS_URL' },
          { status: 400 }
        );
      }
  
      if (!body.businessModel || typeof body.businessModel !== 'string') {
        return NextResponse.json(
          { error: 'Business model is required', code: 'MISSING_BUSINESS_MODEL' },
          { status: 400 }
        );
      }
  
      if (!VALID_BUSINESS_MODELS.includes(body.businessModel as BusinessModel)) {
        return NextResponse.json(
          { 
            error: `Business model must be one of: ${VALID_BUSINESS_MODELS.join(', ')}`,
            code: 'INVALID_BUSINESS_MODEL' 
          },
          { status: 400 }
        );
      }
  
      if (typeof body.annualRevenue !== 'number' || body.annualRevenue < 0 || !Number.isInteger(body.annualRevenue)) {
        return NextResponse.json(
          { error: 'Annual revenue must be a positive integer (in cents)', code: 'INVALID_ANNUAL_REVENUE' },
          { status: 400 }
        );
      }
  
      if (typeof body.annualProfit !== 'number' || !Number.isInteger(body.annualProfit)) {
        return NextResponse.json(
          { error: 'Annual profit must be an integer (in cents)', code: 'INVALID_ANNUAL_PROFIT' },
          { status: 400 }
        );
      }
  
      if (typeof body.employeesCount !== 'number' || body.employeesCount < 0 || !Number.isInteger(body.employeesCount)) {
        return NextResponse.json(
          { error: 'Employees count must be a non-negative integer', code: 'INVALID_EMPLOYEES_COUNT' },
          { status: 400 }
        );
      }
  
      if (!body.description || typeof body.description !== 'string' || body.description.trim() === '') {
        return NextResponse.json(
          { error: 'Description is required and must be a non-empty string', code: 'INVALID_DESCRIPTION' },
          { status: 400 }
        );
      }
  
      if (!body.plan || typeof body.plan !== 'string') {
        return NextResponse.json(
          { error: 'Plan is required', code: 'MISSING_PLAN' },
          { status: 400 }
        );
      }
  
      if (!VALID_PLANS.includes(body.plan as Plan)) {
        return NextResponse.json(
          { 
            error: `Plan must be one of: ${VALID_PLANS.join(', ')}`,
            code: 'INVALID_PLAN' 
          },
          { status: 400 }
        );
      }
  
      // Create sell request
      const now = new Date();
      const newSellRequest = await db.insert(sellRequests)
        .values({
          userId: session.user.id,
          businessName: body.businessName.trim(),
          businessUrl: body.businessUrl.trim(),
          businessModel: body.businessModel as BusinessModel,
          annualRevenue: body.annualRevenue,
          annualProfit: body.annualProfit,
          employeesCount: body.employeesCount,
          description: body.description.trim(),
          plan: body.plan as Plan,
          formData: body.formData,
            status: 'under_review',
          createdAt: now,
          updatedAt: now,
        })
        .returning();

    return NextResponse.json(newSellRequest[0], { status: 201 });

  } catch (error) {
    console.error('POST /api/sell-requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}