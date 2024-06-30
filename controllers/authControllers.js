const formidable = require("formidable");
const validator = require("validator");
const fs = require("fs");
const path = require("path");
const User = require("../models/userRegister");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { log } = require("console");
const secret_key = process.env.SECRET_KEY;
const userRegister = (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res
        .status(500)
        .send("An error occurred while processing the form.");
    }

    // Extract data from fields
    const username = fields.username ? fields.username[0] : "";
    const email = fields.email ? fields.email[0] : "";
    const password = fields.password ? fields.password[0] : "";
    const confirmPassword = fields.confirmPassword
      ? fields.confirmPassword[0]
      : "";

    // Extract data from files
    const image = files.image ? files.image[0] : null;

    const errors = [];

    if (!username) {
      errors.push("Please provide your username");
    }
    if (!email) {
      errors.push("Please provide your email");
    }
    if (email && !validator.isEmail(email)) {
      errors.push("Please provide a valid email");
    }
    if (!password) {
      errors.push("Please provide your password");
    }
    if (!confirmPassword) {
      errors.push("Please provide your confirm password");
    }
    if (password && confirmPassword && password !== confirmPassword) {
      errors.push("Your password and confirm password do not match");
    }
    if (password && password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }
    if (!image) {
      errors.push("Please provide a user image");
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    } else {
      const getImageName = image.originalFilename;
      const randNumber = Math.floor(Math.random() * 99999);
      const newImgName = randNumber + getImageName;
      const newpath = path.join(
        __dirname,
        `../../frontend/public/image/${newImgName}`
      );

      image.originalFilename = newImgName;

      try {
        const checkUser = await User.findOne({ email: email });
        if (checkUser) {
          return res.status(409).json({
            errors: ["Your email already exists"],
          });
        } else {
          fs.copyFile(image.filepath, newpath, async (fsErr) => {
            if (fsErr) {
              return res
                .status(500)
                .json({ errors: "Error saving the image file" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
              username,
              email,
              password: hashedPassword,
              image: newImgName,
            });

            await newUser.save();
            const token = jwt.sign(
              {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                image: newUser.image,
                registerTime: newUser.createdAt,
              },
              secret_key,
              { expiresIn: "7d" }
            );
            return res
              .status(201)
              .cookie("authToken", token)
              .json({ msg: "User registered successfully", token });
          });
        }
      } catch (dbErr) {
        return res.status(500).json({ errors: "Database error" });
      }
    }
  });
};

console.log();
const userLogin = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  const errors = [];
  if (!email) {
    errors.push("Please enter your email");
  }
  if (email && !validator.isEmail(email)) {
    errors.push("Please provide a valid email");
  }
  if (!password) {
    errors.push("Please provide your password");
  }
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  } else {
    try {
      const checkUser = await User.findOne({ email: email });
      if (!checkUser) {
        return res.status(404).json({ errors: "User not found" });
      }
      const isMatch = await bcrypt.compare(password, checkUser.password);
      if (!isMatch) {
        return res.status(401).json({ errors: "Incorrect Password" });
      }
      const token = jwt.sign(
        {
          id: checkUser._id,
          username: checkUser.username,
          email: checkUser.email,
          image: checkUser.image,
          registerTime: checkUser.createdAt,
        },
        secret_key,
        { expiresIn: "7d" }
      );
      return res
        .status(201)
        .cookie("authToken", token, {
          // httpOnly: true,
          sameSite: "strict",
          secure: true,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        })
        .json({ msg: "User registered successfully", token });
    } catch (error) {
      return res.status(500).json({ errors: "Database error" });
    }
  }
};

const userLogout = async (req, res) => {
  const userId = req.body.id;

  try {
    const findUser = await User.findById(userId);
    if (findUser) {
      res.cookie("authToken", null, { httpOnly: true, secure: true });
      res.status(200).json({ message: "User logged out successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { userRegister, userLogin, userLogout };
