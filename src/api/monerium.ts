import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function getMoneriumToken() {
  try {
    const response = await axios.post("https://api.monerium.dev/auth/token", {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "client_credentials",
    });

    console.log("Token:", response.data);
  } catch (error) {
    console.error("Error fetching token:", error);
  }
}
