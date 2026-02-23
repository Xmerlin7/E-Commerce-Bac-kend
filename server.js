import dotenv from "dotenv";
import server from "./app.js";
import { connectDB } from "./config/database.js";
dotenv.config();
connectDB();
server.listen(process.env.PORT, () => {
	console.log(`Server listening on port ${process.env.PORT}`);
});
