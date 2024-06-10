import mongoose, { Schema } from "mongoose";

const storeSchema = new mongoose.Schema(
  {
    storename: {
      type: String,
      required: true,
    },
    storeID: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    file: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    address: {
      type: String,
      required: true,
    },
    rating: {
      type: String,
    },
    deliveryTime: {
      type: String,
      required: true,
    },
    openTime: {
      type: String,
      required: true,
    },
    closeTime: {
      type: String,
      required: true,
    },
    offer: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    logo: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  },

  { timestamps: true }
);

export const Store = mongoose.model("Store", storeSchema);
