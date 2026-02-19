import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';

export async function GET() {
  try {
    const allProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          ne(products.category, 'course')
        )
      );

    return NextResponse.json({ products: allProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, stripePriceId, priceAmount, currency, imageUrl, category, metadata } = body;

    if (!id || !name || typeof priceAmount !== 'number') {
      return NextResponse.json(
        { error: 'id, name, and priceAmount are required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const result = await db
      .insert(products)
      .values({
        id,
        name,
        description: description || null,
        stripePriceId: stripePriceId || null,
        priceAmount,
        currency: currency || 'usd',
        imageUrl: imageUrl || null,
        category: category || null,
        isActive: true,
        metadata: metadata || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json({ product: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}