import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductColor {
  name: string;
  hex: string;
  image: string;
}

export interface IProductSpecs {
  battery?: string;
  driver?: string;
  bluetooth?: string;
  anc?: string;
  weight?: string;
  charging?: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  brand: string;
  category: "headphones" | "earbuds";
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  images: string[];
  colors: IProductColor[];
  features: string[];
  specs: IProductSpecs;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stockCount: number;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductColorSchema = new Schema<IProductColor>(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "اسم المنتج مطلوب"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "الماركة مطلوبة"],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "القسم مطلوب"],
      enum: ["headphones", "earbuds"],
      index: true,
    },
    price: {
      type: Number,
      required: [true, "السعر مطلوب"],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      required: [true, "الوصف مطلوب"],
    },
    image: {
      type: String,
      required: [true, "الصورة الرئيسية مطلوبة"],
    },
    images: {
      type: [String],
      default: [],
    },
    colors: {
      type: [ProductColorSchema],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    specs: {
      battery: { type: String, default: "" },
      driver: { type: String, default: "" },
      bluetooth: { type: String, default: "5.3" },
      anc: { type: String, default: "" },
      weight: { type: String, default: "" },
      charging: { type: String, default: "Type-C" },
    },
    rating: {
      type: Number,
      default: 4.9,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 120,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockCount: {
      type: Number,
      default: 50,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
