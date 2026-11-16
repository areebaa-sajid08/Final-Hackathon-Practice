import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/db/db.js";

const port = Number(process.env.PORT) || 3000;

async function startServer() {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must be set to at least 32 characters");
    }

    await connectDB();
    app.listen(port, () => {
        console.log(`Clinic appointment API listening on port ${port}`);
    });
}

startServer().catch(error => {
    console.error("Could not start the clinic appointment API:", error.message);
    process.exitCode = 1;
});
