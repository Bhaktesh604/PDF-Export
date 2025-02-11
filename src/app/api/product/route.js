import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Counter from "@/models/Counter";

async function getNextSequence(name) {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `OD${counter.seq}`;
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body.products || !Array.isArray(body.products)) {
      return NextResponse.json(
        { success: false, message: "Invalid product data" },
        { status: 400 }
      );
    }

    const productsWithIds = [];
    for (const product of body.products) {
      const id = await getNextSequence("productId");
      productsWithIds.push({ ...product, id });
    }

    const product = new Product({
      products: productsWithIds,
      totalPrice: body.totalPrice,
      logoImage: body.logoImage,
      bankDetails: body.bankDetails,
      shipping: body.shipping,
    });

    const savedProduct = await product.save();

    return NextResponse.json(
      {
        success: true,
        message: "Product(s) created successfully",
        data: savedProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product(s):", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({}).sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: products },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
