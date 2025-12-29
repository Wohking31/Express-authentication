import express from "express";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
// middleware:software that seats betwween you sending a request and getting a response
app.use(express.json());
const PORT = 4000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const authenticationToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "access denied, token missing", success: false });
  }
  const secretKey = "mysecretkey12345";
  Jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.log("Token verification error:", err.message);
      return res
        .status(403)
        .json({ message: "invalid or expired token", success: false });
    }
    req.user = user;
    next();
  });
};

// REGITRATION ENDPOINT

app.post("/register", async (req, res) => {
  // get the user data from the request body
  const { username, email, password } = req.body;
  console.log({ username, email, password });

  //   processing the data
  if (!username || !email || !password) {
    return res.status(400).json({
      message: "please provide username, email, password",
      success: false,
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`hashed pasword is: ${hashedPassword}`);

  const { data, error } = await supabase
    .from("users")
    .insert({
      name: username,
      email: email,
      password: hashedPassword,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: error.message, success: false });
  }

  res.status(201).json({ message: "user registered ✅", user: data });
});

// LOGIN ENDPOINT

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "username and password required", success: false });
  }
  // find the user in the database
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return res.status(404).json({ message: "user not found" });
  }

  console.log(`user is ${JSON.stringify(user)}`);

  const comparePassword = await bcrypt.compare(password, user.password);
  console.log(`compare password value is: ${comparePassword}`);

  if (comparePassword) {
    const payload = { id: user.id, email: user.email };

    // // signature secret key
    const secretKey = "mysecretkey12345";

    // sign the token
    const token = Jwt.sign(payload, secretKey, {
      expiresIn: "1h",
    });
    res
      .status(200)
      .json({ message: "user logged in successfully", token: token });
  } else {
    res.status(404).json({ message: "user not found" });
  }
});
app.get("/dashboard", authenticationToken, (req, res) => {
  console.log("you can access this route");
  res.json({
    message: `welcome to your dashboard, ${req.user.email}`,
    user: req.user,
  });
});
// middleware function to authenticate token

app.listen(PORT, () => {
  console.log(`APP IS RUNNING ON http://localhost:${PORT}`);
});
