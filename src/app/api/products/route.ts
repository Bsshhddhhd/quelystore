import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let products = await dataStore.getProducts();

    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const product = await dataStore.createProduct({
      name: body.name,
      description: body.description,
      price: body.price,
      category: body.category,
      image: body.image,
      features: body.features || [],
      stock: body.stock || 1,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const product = await dataStore.updateProduct(body.id, {
      name: body.name,
      description: body.description,
      price: body.price,
      category: body.category,
      image: body.image,
      features: body.features || [],
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
