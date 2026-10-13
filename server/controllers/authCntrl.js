import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prismaConfig.js";

const signToken = (user) =>
  jwt.sign({ email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const userExists = await prisma.user.findUnique({ where: { email } });

  const hashed = await bcrypt.hash(password, 10);

  let user;
  if (userExists) {
    if (userExists.password) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Allow setting a password for users created without one (e.g. seeded)
    user = await prisma.user.update({
      where: { email },
      data: { password: hashed, name: name || userExists.name },
    });
  } else {
    user = await prisma.user.create({
      data: { email, name: name || email.split("@")[0], password: hashed },
    });
  }

  res.status(201).json({
    token: signToken(user),
    user: { email: user.email, name: user.name },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    token: signToken(user),
    user: { email: user.email, name: user.name },
  });
});
