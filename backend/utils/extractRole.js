import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const extractRoleFromToken = (authorization, key) => {
  try {
    const token = authorization.split(" ")[1];
    if (!token) {
      throw new Error("No token provided");
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (key === "id") {
      return decoded.id || null;
    } else {
      return decoded.role || null;
    }
  } catch (error) {
    console.error("Error extracting role:", error.message);
    return null;
  }
};
