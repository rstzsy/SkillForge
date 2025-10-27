import { registerUser, loginUser, loginWithGoogle, updateUserById } from "../services/userService.js";

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


export const handleGoogleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Missing Google ID token" });
    }

    const user = await loginWithGoogle(idToken);

    return res.status(200).json({
      message: "Google login successful",
      user,
    });
  } catch (error) {
    console.error("Google login failed:", error);
    return res.status(400).json({ message: error.message });
  }
};

// update information(user)
export const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    const updatedUser = await updateUserById(id, userData);

    return res.status(200).json({
      message: "User updated successfully",
      updatedUser,
    });
  } 
  catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({ message: error.message });
  }
};

