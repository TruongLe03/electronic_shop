import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    ward: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema({
  username: { type: String, sparse: true }, // sparse: true allows multiple null values
  name: { type: String },
  phone_number: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  addresses: [addressSchema],
  avatar: { type: String, default: null },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
export default User;
