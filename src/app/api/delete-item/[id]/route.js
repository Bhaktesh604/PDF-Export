import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function DELETE(_request, { params }) {
    try {
      await connectDB();
  
      const updatedProduct = await Product.findByIdAndDelete(
        params.id,
      );
  
      if (!updatedProduct) {
        return NextResponse.json(
          { success: false, message: "Product not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { success: true, message: "Product deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }