import blacklistSchema from "../models/blacklistSchema.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
        success: false,
      });
    }

    // check existing user
    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    // create user
    const user = await userModel.create({
      username,
      email,
      password,
      verified: true, // optional: always true now
    });

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.log("Register error:", error.message);

    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
}


/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // generate token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
    });

    res.status(200).json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.log("Login error:", error.message);

    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
}


/**
 * @desc Get current user
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      success: true,
      user,
    });

  } catch (error) {
    console.log("GetMe error:", error.message);

    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
}

export async function logout(req, res){
  try{
    const token = req.cookies.token

    if(!token){
      return res.status(400).json({
        message: "No token found",
        success: false,
      })
    }

    const decoded = jwt.decode(token)

    await blacklistModel.create({
      token,
      expiresAt: new Date(decoded.exp * 1000)
    })

    //clear cookie
    res.clearCookie("token")

    res.status(200).json({
      message: "Logout successfully",
      success: true,
    })
  }catch(err){
     console.log("Logout error:", error.message);

    res.status(500).json({
      message: "Internal server error",
      success: false,
   
  })
}
}