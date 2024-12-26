import express from "express";
const app = express();
import env from "./utils/env";
import logger from "./middlewares/logger";
import setupPostRoute from './features/post/post.router';
import authRouter from './features/auth/auth.router';
import userRouter from './features/user/user.router';
import searchRouter from './features/search/search.router';
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import { createServer } from "http";
import { Server } from "socket.io";
import User from '../../internal/database/mongodb/model/user';

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const createHttpServer = (redisClient: any) => {
  const server = createServer(app);

  const isProd = !env.DEV;
  if (isProd) {
    app.use(logger);
  }
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  
  const ONLINE_USER_TO_SOCKET_ID_MAP = new Map<string, string>();
  
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
    },
  });
  
  io.on("connection", (socket) => {
    console.log("a user connected with id : ", socket.id);
    socket.on("start", ({ userId }) => {
      ONLINE_USER_TO_SOCKET_ID_MAP.set(userId, socket.id);
    });
    socket.on("notify", ({ userId }) => {
      const room = ONLINE_USER_TO_SOCKET_ID_MAP.get(userId);
      socket.to(room!).emit("haveNotifications", true);
    });
    socket.on("checkNotifications", async ({ userId }) => {
      const test = await User.findOne({
        _id: userId,
      });
      let count = 0;
      test?.notifications.forEach((item) => {
        if (!item.read) count++;
      });
      socket.emit("notificationsCount", { count });
    });
    socket.on("readAll", async ({ userId }) => {
      await User.updateOne(
        { _id: userId },
        { $set: { "notifications.$[].read": true } },
        { multi: true }
      );
    });
    socket.on("disconnect", (reason) => {
      console.log(reason, socket.id);
    });
  });
  
  app.get("/test", (req, res) => {
    res.send("Hello from server side");
  });
  
  app.use("/post", setupPostRoute(redisClient));
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/search", searchRouter);
  
  app.use(errorHandler);

  return server;
};

export {
  createHttpServer,
};
