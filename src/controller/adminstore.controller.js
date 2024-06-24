import { Admin } from "../models/admin.model.js";
import { Store } from "../models/admin.storeDetails.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import getdataURI from "../utils/getdataURI.js";
import uploadStream from "../utils/uploadStream.js";
import nodemailer from "nodemailer";
import randomize from "randomatic";
// Adjust the path as necessary

const adminStore = asyncHandler(async (req, res) => {
  try {
    const {
      storename,
      address,
      deliveryTime,
      openTime,
      closeTime,
      storeID,
      offer,
      restauranttype,
      cuisine,
    } = req.body;

    const parsedAddress = JSON.parse(address);

    let fileUrl = null;
    let logoUrl = null;

    const storepresent = await Store.find({ storeID: storeID });

    console.log("the Store--->", storepresent);

    if (storepresent.length) {
      return res.status(403).send({
        message: "Store is created for current store ID",
      });
    }

    if (req.files) {
      const uploadPromises = [];

      if (req.files.file) {
        const fileURI = getdataURI(req.files.file[0]);
        if (fileURI) {
          uploadPromises.push(
            uploadStream(fileURI).then((mycloud) => {
              fileUrl = {
                public_id: mycloud.public_id,
                url: mycloud.secure_url,
              };
            })
          );
        }
      }

      if (req.files.logo) {
        const logoURI = getdataURI(req.files.logo[0]);
        if (logoURI) {
          uploadPromises.push(
            uploadStream(logoURI).then((mycloudLogo) => {
              logoUrl = {
                public_id: mycloudLogo.public_id,
                url: mycloudLogo.secure_url,
              };
            })
          );
        }
      }

      await Promise.all(uploadPromises);
    }

    if (
      [storename, deliveryTime, openTime, closeTime].some(
        (field) => field?.trim() === ""
      )
    ) {
      return res.status(403).send({
        message: "Please enter all the fields",
      });
    }

    const store = await Store.create({
      storename,
      storeID,
      address: parsedAddress,
      deliveryTime,
      closeTime,
      openTime,
      offer,
      file: fileUrl, // This will be null if no image is provided
      logo: logoUrl,
      restauranttype,
      cuisine,
      // This will be null if no logo is provided
    });

    if (!store) {
      return res.status(401).send({
        message: "Failed to setup store",
      });
    }

    return res.status(200).send({
      status: 200,
      message: "Store has been setup successfully!",
      store,
    });
  } catch (error) {
    console.log("Error While registering store details", error);
    res.status(500).send({
      message: "Server error",
      error: error.message,
    });
  }
});

const getStoreDetails = asyncHandler(async (req, res) => {
  try {
    let { storeID } = req.params;

    const checkStoreExist = await Store.findOne({ storeID: storeID });

    if (checkStoreExist) {
      return res.status(200).send({
        status: 200,
        checkStoreExist,
      });
    } else {
      return res.status(403).send({
        message: "store doesnot exist",
      });
    }
  } catch (error) {
    console.log("Error! while fetching store details", error);
  }
});

const updateStore = asyncHandler(async (req, res) => {
  try {
    const {
      storename,
      address,
      rating,
      deliveryTime,
      openTime,
      closeTime,
      storeID,
      offer,
      restauranttype,
      cuisine,
    } = req.body;

    let fileUrl = null;
    let logoUrl = null;
    let offerUrl = null;

    if (req.files) {
      const uploadPromises = [];

      if (req.files.file) {
        const fileURI = getdataURI(req.files.file[0]);
        if (fileURI) {
          uploadPromises.push(
            uploadStream(fileURI).then((mycloud) => {
              fileUrl = {
                public_id: mycloud.public_id,
                url: mycloud.secure_url,
              };
            })
          );
        }
      }

      if (req.files.logo) {
        const logoURI = getdataURI(req.files.logo[0]);
        if (logoURI) {
          uploadPromises.push(
            uploadStream(logoURI).then((mycloudLogo) => {
              logoUrl = {
                public_id: mycloudLogo.public_id,
                url: mycloudLogo.secure_url,
              };
            })
          );
        }
      }
      if (req.files.OfferBanner) {
        const logoURI = getdataURI(req.files.OfferBanner[0]);
        if (logoURI) {
          uploadPromises.push(
            uploadStream(logoURI).then((mycloudLogo) => {
              offerUrl = {
                public_id: mycloudLogo.public_id,
                url: mycloudLogo.secure_url,
              };
            })
          );
        }
      }

      await Promise.all(uploadPromises);
    }

    const storeExist = await Store.findOne({ storeID: storeID });

    console.log("the Logo URl--->", logoUrl);

    if (storeExist) {
      storeExist.storename = storename || storeExist.storename;
      storeExist.address = address || storeExist.address;
      storeExist.deliveryTime = deliveryTime || storeExist.deliveryTime;
      storeExist.openTime = openTime || storeExist.openTime;
      storeExist.closeTime = closeTime || storeExist.closeTime;
      storeExist.offer = offer || storeExist.offer;
      storeExist.file = fileUrl || storeExist.file;
      storeExist.logo = logoUrl || storeExist.logo;
      storeExist.restauranttype = restauranttype || storeExist.restauranttype;
      storeExist.cuisine = cuisine || storeExist.cuisine;

      await storeExist.save();
    }

    return res.status(200).send({
      status: 200,
      message: "store has been updated succesfully",
      storeExist,
    });
  } catch (error) {
    console.log("Error while updating store", error);
  }
});

const verifyStore = asyncHandler(async (req, res) => {
  try {
    const { email, _id } = req.body;
    console.log("entered email", email);
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
    });

    const otp = randomize("0", 4); // Generate 4-digit OTP

    const user = await Admin.findById(_id);

    if (!user) {
      return res.status(400).send({
        message: "user not found !!",
      });
    }

    user.otp = otp;

    await user.save();

    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Your OTP for Verification",
      text: `Your OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending OTP via email:", error);
        res.status(500).send("Error sending OTP");
      } else {
        console.log("OTP sent:", info.response);
        res.status(200).send("OTP sent successfully");
      }
    });
  } catch (error) {
    console.log("Error while verifing store", error);
  }
});

const goStoreLive = asyncHandler(async (req, res) => {
  try {
    const { storeID } = req.body;

    const store = await Store.findOne({ storeID: storeID });

    if (!store) {
      return res.status(405).send({
        message: "Invalid store credentials or please setup your store first",
      });
    }
    store.availability.open = true;

    await store.save();

    return res.status(200).send({
      status: 200,
      message: "Your Store is Live now!",
      store,
    });
  } catch (error) {
    console.log("Failed to set the store live. Please try again later.", error);
  }
});

const goStoreOffline = asyncHandler(async (req, res) => {
  try {
    const { storeID } = req.body;

    const store = await Store.findOne({ storeID: storeID });

    if (!store) {
      return res.status(405).send({
        message: "Invalid store credentials or please setup your store first",
      });
    }

    store.availability.open = false;

    await store.save();

    return res.status(200).send({
      status: 200,
      message: "Your store is now offline",
      store,
    });
  } catch (error) {
    console.log(
      "Failed to set the store offline. Please try again later.",
      error
    );
  }
});

export {
  adminStore,
  getStoreDetails,
  updateStore,
  verifyStore,
  goStoreLive,
  goStoreOffline,
};
