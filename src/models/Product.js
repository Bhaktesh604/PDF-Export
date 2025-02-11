import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  products: { type: Array },
  createdAt: { type: Date, default: Date.now },
  totalPrice: { type: Number, required: true },
  logoImage: { type: String, required: true },
  bankDetails: { type: Array, required: true },
  shipping: { type: Number, required: true },
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);