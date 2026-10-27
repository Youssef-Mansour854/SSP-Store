import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId?: mongoose.Types.ObjectId;
  name: string;
  color?: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ICustomerInfo {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user?: mongoose.Types.ObjectId;
  customerInfo: ICustomerInfo;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  paymentMethod: "cod" | "card" | "wallet";
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    color: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String, required: true },
  },
  { _id: false }
);

const CustomerInfoSchema = new Schema<ICustomerInfo>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    customerInfo: {
      type: CustomerInfoSchema,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "card", "wallet"],
      default: "cod",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
