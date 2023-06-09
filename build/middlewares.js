"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.videoUpload = exports.publicOnlyMiddleware = exports.protectorMiddleware = exports.localMiddleware = exports.avatarUpload = void 0;
var _multer = _interopRequireDefault(require("multer"));
var _multerS = _interopRequireDefault(require("multer-s3"));
var _awsSdk = _interopRequireDefault(require("aws-sdk"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var s3 = new _awsSdk["default"].S3({
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
  }
});
var multerUploader = (0, _multerS["default"])({
  s3: s3,
  bucket: "webyoutubeclone"
});
var localMiddleware = function localMiddleware(req, res, next) {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Webtube";
  res.locals.loggedInUser = req.session.user || {};
  console.log("locals loggedInUser : ", res.locals.loggedInUser);
  next();
};
exports.localMiddleware = localMiddleware;
var protectorMiddleware = function protectorMiddleware(req, res, next) {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Log in first.");
    return res.redirect("/login");
  }
};
exports.protectorMiddleware = protectorMiddleware;
var publicOnlyMiddleware = function publicOnlyMiddleware(req, res, next) {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};
exports.publicOnlyMiddleware = publicOnlyMiddleware;
var avatarUpload = (0, _multer["default"])({
  dest: "uploads/avatars/",
  limits: {
    fieldSize: 3000
  },
  storage: multerUploader
});
exports.avatarUpload = avatarUpload;
var videoUpload = (0, _multer["default"])({
  dest: "uploads/videos/",
  limits: {
    fieldSize: 10000000
  },
  storage: multerUploader
});
exports.videoUpload = videoUpload;