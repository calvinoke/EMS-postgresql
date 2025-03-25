import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto";

dotenv.config();

// Register a new user
export const register = async (req, res) => {
  try {

    console.log("Request body:", req.body);
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into DB
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (user.rows.length === 0) return res.status(400).json({ message: "Invalid credentials" });
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.rows[0].password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  
      // Generate JWT Token
      const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };


  export const updatePassword = async (req, res) => {
    try {
      const { email, oldPassword, newPassword } = req.body;
  
      // Check if user exists
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (user.rows.length === 0) return res.status(400).json({ message: "User not found" });
  
      // Check old password
      const isMatch = await bcrypt.compare(oldPassword, user.rows[0].password);
      if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });
  
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);
  
      // Update password
      await pool.query("UPDATE users SET password = $1 WHERE email = $2", [hashedNewPassword, email]);
  
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error in updatePassword:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };

  
  export const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      // Check if user exists
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (user.rows.length === 0) return res.status(400).json({ message: "User not found" });
  
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiration = new Date(Date.now() + 3600000); // Token expires in 1 hour
  
      // Store token in DB
      await pool.query(
        "UPDATE users SET reset_token = $1, reset_token_expiration = $2 WHERE email = $3",
        [resetToken, expiration, email]
      );
  
      // Construct the reset password link using the frontend URL
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
      // Send email with reset link
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
  
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.`,
      });
  
      res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
  


  export const resetPassword = async (req, res) => {
    try {
      const { token, newPassword } = req.body;
  
      // Check token
      const user = await pool.query("SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiration > NOW()", [
        token,
      ]);
      if (user.rows.length === 0) return res.status(400).json({ message: "Invalid or expired token" });
  
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update password and clear token
      await pool.query("UPDATE users SET password = $1, reset_token = NULL, reset_token_expiration = NULL WHERE id = $2", [
        hashedPassword,
        user.rows[0].id,
      ]);
  
      res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error in resetPassword:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };
  
  

  
