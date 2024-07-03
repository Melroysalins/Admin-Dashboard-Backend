import { asyncHandler } from "../utils/asyncHandler.js";
import { Store } from "../models/admin.storeDetails.js";
import getdataURI from "../utils/getdataURI.js";
import { Product } from "../models/products.model.js";
import uploadStream from "../utils/uploadStream.js";
import mongoose from "mongoose";

const normalizeCategoryName = (name) => {
  const normalized = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const ProductController = asyncHandler(async (req, res) => {
  try {
    const { categoryname, storeID, productname, price, quantity, description } =
      req.body;

    let fileUrl = null;

    // Normalize category name
    const normalizedCategoryName = normalizeCategoryName(categoryname);

    // Check if the store exists
    const storeExist = await Store.findOne({ storeID: storeID });
    if (!storeExist) {
      return res.status(409).send({
        message: "Store ID doesn't exist",
      });
    }

    // Handle file upload if exists
    if (req.files && req.files.Pimage) {
      const fileURI = getdataURI(req.files.Pimage[0]);
      if (fileURI) {
        const mycloud = await uploadStream(fileURI);
        fileUrl = {
          public_id: mycloud.public_id,
          url: mycloud.secure_url,
        };
      }
    }

    // Check if the category already exists for the given storeID
    let product = await Product.findOne({
      storeID: storeID,
      "categoryname.name": normalizedCategoryName,
    });

    if (product) {
      // Check if the product already exists in the category
      const existingProduct = product.categoryname
        .find((category) => category.name === normalizedCategoryName)
        .product.find((prod) => prod.productname === productname);

      if (existingProduct) {
        return res.status(409).send({
          message: "Product already exists in this category",
        });
      }

      // If the category exists and no duplicate product is found, push the new product
      product = await Product.findOneAndUpdate(
        { storeID: storeID, "categoryname.name": normalizedCategoryName },
        {
          $push: {
            "categoryname.$.product": {
              productname,
              image: fileUrl,
              description,
              quantity,
              price,
            },
          },
        },
        { new: true }
      );
    } else {
      // If the category does not exist, add the new category with the product to the document
      product = await Product.findOneAndUpdate(
        { storeID: storeID },
        {
          $push: {
            categoryname: {
              name: normalizedCategoryName,
              product: [
                { productname, image: fileUrl, description, quantity, price },
              ],
            },
          },
        },
        { new: true, upsert: true }
      );
    }

    if (!product) {
      return res.status(402).send({
        message: "Error Failed to upload products",
      });
    }

    return res.status(200).send({
      status: 200,
      message: "Product uploaded successfully",
    });
  } catch (error) {
    console.log("Error !! while uploading product to database", error);
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

const getallProducts = asyncHandler(async (req, res) => {
  try {
    const { storeID } = req.body;

    const store = await Store?.findOne({ storeID: storeID });

    const productList = [];

    if (!store) {
      return res.status(406).send({
        message: "Store doesn't exist",
      });
    }

    const product = await Product.findOne({ storeID: storeID });

    if (!product) {
      return res.status(406).send({
        message: "No products created with current store",
      });
    }
    product?.categoryname?.map((list) =>
      list?.product?.map((ele) => productList.push(ele))
    );

    return res.status(200).send({
      status: 200,
      productList,
    });
  } catch (error) {
    console.log("Error while fetching product from backend", error);
  }
});

const updateParticularProdcut = asyncHandler(async (req, res) => {
  try {
    const {
      quantity,
      productname,
      price,
      description,
      _id,
      available,
      storeID,
    } = req.body;

    let fileUrl = null;

    const parsedQuantity = Array.isArray(quantity)
      ? parseInt(quantity[0], 10)
      : parseInt(quantity, 10);

    const store = await Store.findOne({ storeID });

    if (!store) {
      return res.status(403).send({
        message: "Store doesn't exist",
      });
    }

    const products = await Product.findOne({ storeID });

    if (!products) {
      return res.status(409).send({
        message: "No products found for particular store",
      });
    }

    // Handle file upload if exists
    if (req.files && req.files.Pimage) {
      const fileURI = getdataURI(req.files.Pimage[0]);
      if (fileURI) {
        try {
          const mycloud = await uploadStream(fileURI);
          fileUrl = {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
          };
        } catch (uploadError) {
          return res.status(500).send({
            message: "Error uploading image",
            error: uploadError.message,
          });
        }
      }
    }

    let productToUpdate = null;

    products.categoryname.forEach((category) => {
      const product = category.product.find(
        (prod) => prod._id.toString() === _id.toString()
      );
      if (product) {
        productToUpdate = product;
      }
    });

    if (!productToUpdate) {
      return res.status(402).send({
        message: "No product found!",
      });
    }

    // Update fields only if provided
    productToUpdate.productname = productname || productToUpdate.productname;
    productToUpdate.quantity = parsedQuantity || productToUpdate.quantity;
    productToUpdate.price = Number(price) || productToUpdate.price;
    productToUpdate.description = description || productToUpdate.description;
    productToUpdate.available =
      available !== undefined ? available : productToUpdate.available;
    productToUpdate.image = fileUrl || productToUpdate.image;

    await products.save();

    return res.status(200).send({
      status: 200,
      message: "Product updated successfully",
      productToUpdate,
    });
  } catch (error) {
    console.log("Error while updating product", error);
    return res.status(500).send({
      message: "Error while updating product",
      error: error.message,
    });
  }
});

const getParticularProduct = asyncHandler(async (req, res) => {
  try {
    const { _id, storeID } = req.body;

    const store = await Store.findOne({ storeID: storeID });

    let requestProductInfo = null;

    if (!store) {
      return res.status(407).send({
        message: "Store not found",
      });
    }

    const products = await Product.findOne({ storeID: storeID });

    if (!products) {
      return res.status(408).send({
        message: "No products found in store",
      });
    }

    products.categoryname.forEach((category) => {
      const product = category.product.find(
        (prod) => prod._id.toString() === _id.toString()
      );
      if (product) {
        requestProductInfo = product;
      }
    });

    if (!requestProductInfo) {
      return res.status(402).send({
        message: "No product found for particular product id",
      });
    }

    return res.status(200).send({
      status: 200,
      message: "product fetched successfully",
      requestProductInfo,
    });
  } catch (error) {
    console.log("Error while fetching the product", error);
  }
});

const setDeleteProduct = asyncHandler(async (req, res) => {
  try {
    const { storeID, _id } = req.body;

    const product = await Product.findOne({ storeID: storeID });

    if (!product) {
      return res.status(403).send({
        message: "No store found, Invalid store credentials",
      });
    }

    const success = await Product.updateOne(
      { storeID },
      { $pull: { "categoryname.$[].product": { _id } } }
    );

    console.log("success", success);

    if (success.modifiedCount > 0) {
      return res.status(200).send({
        message: "Product deleted successfully",
        status: 200,
        success,
      });
    }

    return res.status(200).send({
      message: "No store found , Invalid store credentials",
      success,
    });
  } catch (error) {
    console.log("Error while deleting the product", error);
  }
});

export {
  ProductController,
  getallProducts,
  updateParticularProdcut,
  getParticularProduct,
  setDeleteProduct,
};
