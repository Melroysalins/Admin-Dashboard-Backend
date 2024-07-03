import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Types;

const dashboardOrder = asyncHandler(async (req, res) => {
  try {
    const { storeID } = req.body;

    let orderDetails = await mongoose.connection.db
      .collection("orders")
      .aggregate([
        {
          $match: { storeID: new ObjectId(storeID) },
        },
        {
          $sort: { createdAt: -1 }, // Sort by createdAt in descending order
        },
      ])
      .toArray();

    if (!orderDetails) {
      return res.status(400).send({
        status: 400,
        message: "No Orders found",
      });
    }

    return res.status(200).send({
      status: 200,
      orderDetails,
    });
  } catch (error) {
    console.log("Error while fetching the order details", error);
  }
});

const orderedProductList = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.body;

    let productDetails = await mongoose.connection.db
      .collection("orders")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(_id),
          },
        },
      ])
      .toArray();

    if (!productDetails) {
      return res.status(400).send({
        message: "No Products found",
      });
    }

    return res.status(200).send({
      status: 200,
      productDetails,
    });
  } catch (error) {
    console.log("Error while fetching product list", error);
  }
});

const changeOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { _id, message } = req.body;
    let newStatus;

    if (message === 1) {
      newStatus = "accepted";
    } else if (message === 0) {
      newStatus = "delivered";
    } else if (message === -1) {
      newStatus = "rejected";
    } else {
      return res.status(400).send({
        message: "Invalid message value",
      });
    }

    const changeStatus = await mongoose.connection.db
      .collection("orders")
      .updateOne(
        { _id: new ObjectId(_id) },
        { $set: { orderStatus: newStatus } }
      );

    if (changeStatus.matchedCount === 0) {
      return res.status(400).send({
        message: "Failed to change the status",
      });
    }

    return res.status(200).send({
      status: 200,
      message: "Order status changed successfully",
    });
  } catch (error) {
    console.log("Error while changing order status", error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

const orderFilter = asyncHandler(async (req, res) => {
  try {
    const { storeID, message } = req.body;

    let newStatus;

    if (message === 1) {
      newStatus = "accepted";
    } else if (message === 0) {
      newStatus = "delivered";
    } else if (message === -1) {
      newStatus = "pending";
    } else {
      return res.status(400).send({
        message: "Invalid message value",
      });
    }

    let orderDetails = await mongoose.connection.db
      .collection("orders")
      .aggregate([
        {
          $match: { storeID: new ObjectId(storeID) },
        },
        {
          $match: { orderStatus: newStatus },
        },
        {
          $sort: { createdAt: -1 }, // Sort by createdAt in descending order
        },
      ])
      .toArray();

    if (!orderDetails) {
      return res.status(200).send({
        status: 200,
        message: "No orders found",
      });
    }

    return res.status(200).send({
      status: 200,
      orderDetails,
    });
  } catch (error) {
    console.log("Error filtering order list", error);
  }
});

export { dashboardOrder, orderedProductList, changeOrderStatus, orderFilter };
