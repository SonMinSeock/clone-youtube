import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import session from "express-session";
import { localMiddleware } from "./middlewares";
import MongoStore from "connect-mongo";
import apiRouter from "./routers/apiRouter";
import flash from "express-flash";

// application settings ...
const app = express();
// view engine pug setting.
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

const logger = morgan("dev");
app.use(logger);
// form의 데이터를 이해 힐수있도록 도와준다.
app.use(express.urlencoded({ extended: true }));

// 서버가 string을 이해 할수있도록 도와준다.
//app.use(express.text());

// 서버가 JSON을 이해하고 JS Object로 바꿔주도록 도와준다.
app.use(express.json());

// 세션미들웨어
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

// flash
app.use(flash());

// 로컬 미들웨어
app.use(localMiddleware);

// Static files serving
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));

// SharedArrayBuffer
// app.use((req, res, next) => {
//   res.header("Cross-Origin-Embedder-Policy", "require-corp");
//   res.header("Cross-Origin-Opener-Policy", "same-origin");
//   next();
// });
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Routers
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
