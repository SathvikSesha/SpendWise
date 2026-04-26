import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
dotenv.config();
const server = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Backend is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Budget API is running smoothly." });
});

server();
