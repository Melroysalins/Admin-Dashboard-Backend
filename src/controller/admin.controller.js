import { Admin } from "../models/admin.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import getdataURI from "../utils/getdataURI.js";
import uploadStream from "../utils/uploadStream.js";

const generateAccessTokenandRefreshToken = async (adminID) => {
  try {
    const admin = await Admin.findById(adminID);

    if (!admin) {
      return res.status(406).send({
        message: "No user found!!",
      });
    }

    const accesstoken = admin.generateAccessToken();

    const refreshtoken = admin.generateRefreshToken();

    admin.refreshtoken = refreshtoken;

    await admin.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken };
  } catch (error) {
    console.log("Failed to generate accesstoken and refreshtoken", error);
  }
};

const registerAdmin = asyncHandler(async (req, res) => {
  // accept input from frontend

  // validate the input

  // check if the user already exist in database

  // else bcrypt password

  // if success then return success message to user
  try {
    const { adminname, email, password, phone, image } = req.body;

    if ([adminname, email, password].some((field) => field?.trim() === "")) {
      return res.status(400).send({
        message: "Please enter all the fields",
      });
    }

    const user = await Admin.findOne({
      $or: [{ email }, { password }],
    });

    if (user) {
      return res.status(409).send({
        message: "email or password already exist ! please try to login",
      });
    }
    const userCreated = await Admin.create({
      _id: this?._id,
      adminname: adminname.toLowerCase(),
      password,
      email,
      phone,
      image: null,
    });

    if (!userCreated) {
      return res.status(403).send({
        message: "Failed to register user",
      });
    }

    const admininfo = await Admin.findById(userCreated?._id).select(
      "-password -refreshtoken"
    );

    return res.status(200).send({
      status: 200,
      message: "User registered successfully !",
      admininfo,
    });
  } catch (error) {
    console.log("Failed to register !!", error);
  }
});

const loginAdmin = asyncHandler(async (req, res) => {
  // accept input from frontend - email , password , phone

  // validate them

  // check if the user exist

  // if not return error message

  // if exist check if entered details match details present in database

  // generate accesstoken and refresh token

  const { email, password, phone } = req.body;

  if ([email, password, phone].some((field) => field?.trim === "")) {
    return res.status(400).send({
      message: "Please enter all the fields",
    });
  }

  const user = await Admin.findOne({
    $or: [{ email }, { password }, { phone }],
  });

  if (!user) {
    return res.status(401).send({
      message: "User doesnot exist ! Please register ",
    });
  }

  const ispasswordValid = await user?.isPasswordCorrect(password);

  if (user?.phone !== phone) {
    return res.status(405).send({
      message: "phone number doesn't match",
    });
  }

  if (!ispasswordValid) {
    return res.status(405).send({
      message: "passwords don't match",
    });
  }
  const { accesstoken, refreshtoken } =
    await generateAccessTokenandRefreshToken(user?._id);

  const loggedAdmin = await Admin.findById(user?._id).select(
    "-password -refreshtoken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accesstoken", accesstoken, options)
    .cookie("refreshtoken", refreshtoken, options)
    .send({
      status: 200,
      message: "user logged in successfully",
      loggedAdmin,
      refreshtoken,
      accesstoken,
    });
});

const getuserDetails = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.params;

    const userInfo = await Admin.findById(_id).select("-refreshtoken");

    if (userInfo) {
      return res.status(200).send({
        status: 200,
        message: "User details fetches successfully",
        userInfo,
      });
    }
  } catch (error) {
    console.log("Error! while fetching user details", error);
  }
});

const editUserDetails = asyncHandler(async (req, res) => {
  try {
    const { adminname, email, phone } = req.body;

    const { _id } = req.body;

    let fileUrl = null;

    if (!_id) {
      return res.status(404).send({
        message: "please send id",
      });
    }

    const user = await Admin.findById(_id).select("-password");

    console.log("Request body:", req.body);
    if (!user) {
      return res.status(405).send({
        message: "user doesn't exist",
      });
    }

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

    user.email = email || user.email;
    user.adminname = adminname || user.adminname;
    user.phone = phone || user.phone;
    user.image = fileUrl || user.image;

    await user.save();

    return res.status(200).send({
      status: 200,
      message: "user details updated successfully",
      user,
    });
  } catch (error) {
    console.log("Error while editing user details", error);
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { password, _id } = req.body;

  if (!password.length) {
    return res.status(403).json({
      message: "Password is empty",
    });
  }

  const user = await Admin.findById(_id);

  if (!user) {
    return res.status(405).json({
      message: "User not found!!",
    });
  }

  user.password = password;

  await user.save();

  return res.status(200).json({
    status: 200,
    message: "password changes successfully",
    user,
  });
});

export {
  registerAdmin,
  loginAdmin,
  getuserDetails,
  editUserDetails,
  changePassword,
};
