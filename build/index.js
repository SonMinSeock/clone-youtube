"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _morgan = _interopRequireDefault(require("morgan"));
var _rootRouter = _interopRequireDefault(require("./routers/rootRouter"));
var _videoRouter = _interopRequireDefault(require("./routers/videoRouter"));
var _userRouter = _interopRequireDefault(require("./routers/userRouter"));
var _expressSession = _interopRequireDefault(require("express-session"));
var _middlewares = require("./middlewares");
var _connectMongo = _interopRequireDefault(require("connect-mongo"));
var _apiRouter = _interopRequireDefault(require("./routers/apiRouter"));
var _expressFlash = _interopRequireDefault(require("express-flash"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
// application settings ...
var app = (0, _express["default"])();
// view engine pug setting.
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
var logger = (0, _morgan["default"])("dev");
app.use(logger);
// form의 데이터를 이해 힐수있도록 도와준다.
app.use(_express["default"].urlencoded({
  extended: true
}));

// 서버가 string을 이해 할수있도록 도와준다.
//app.use(express.text());

// 서버가 JSON을 이해하고 JS Object로 바꿔주도록 도와준다.
app.use(_express["default"].json());

// 세션미들웨어
app.use((0, _expressSession["default"])({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store: _connectMongo["default"].create({
    mongoUrl: process.env.DB_URL
  })
}));

// flash
app.use((0, _expressFlash["default"])());

// 로컬 미들웨어
app.use(_middlewares.localMiddleware);

// Static files serving
app.use("/uploads", _express["default"]["static"]("uploads"));
app.use("/static", _express["default"]["static"]("assets"));

// SharedArrayBuffer
app.use(function (req, res, next) {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

// Routers
app.use("/", _rootRouter["default"]);
app.use("/users", _userRouter["default"]);
app.use("/videos", _videoRouter["default"]);
app.use("/api", _apiRouter["default"]);
var _default = app;
exports["default"] = _default;