import { registerUser, loginUser } from "../services/userService.js";

export const handleRegister = async (req, res) => {
  try {
    const { userName, email, password, confirmPassword } = req.body;

    if (!userName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const newUser = await registerUser(userName, email, password);
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } 
  catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check data input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // call service to handle
    const user = await loginUser(email, password);

    return res.status(200).json({
      message: "Login successful",
      user,
    });
  } 
  catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
