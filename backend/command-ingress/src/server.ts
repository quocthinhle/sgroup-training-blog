import { config } from "dotenv";
config();
import { createHttpServer } from "./app";
import {connectRedis} from '../../lib/redis';
import mongoose from "mongoose";
import env from "./utils/env";

async function start() {
  await mongoose.connect(env.MONGO_URI);
  const redisClient = await connectRedis();
  const server = createHttpServer(redisClient);

  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });

  process.on("SIGINT", () => {
    redisClient.quit();
    mongoose.connection.close();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});