import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    storeID: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    categoryname: [
      {
        name: String,
        product: [
          {
            productname: {
              type: String,
              required: true,
              unique: true,
              lowercase: true,
            },

            image: {
              public_id: {
                type: String,
              },
              url: {
                type: String,
              },
            },
            description: {
              type: String,
            },
            quantity: {
              type: Number,
              required: true,
            },
            price: {
              type: String,
              required: true,
            },
            available: {
              type: Boolean,
              default: true,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
