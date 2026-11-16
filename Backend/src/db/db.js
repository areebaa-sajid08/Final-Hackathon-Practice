import mongoose from "mongoose";

let connectionPromise;

async function connectDB() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI must be set");
    }
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
        .then(connection => {
            console.log("Connected to MongoDB");
            return connection;
        })
        .finally(() => {
            connectionPromise = undefined;
        });
    return connectionPromise;
}

export default connectDB;
