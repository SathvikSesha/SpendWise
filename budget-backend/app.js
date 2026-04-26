import express from "express";
import cors from "cors";
import spaceRoutes from "./routes/space.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import authRoutes from "./routes/auth.routes.js";
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/spaces", spaceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/auth", authRoutes);
export default app;
