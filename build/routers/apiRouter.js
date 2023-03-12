"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _express = _interopRequireDefault(require("express"));
var _videoController = require("../controllers/videoController");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var apiRouter = _express["default"].Router();
apiRouter.get("/videos/:id([0-9a-f]{24})/setting", _videoController.settingModal);
apiRouter.post("/videos/:id([0-9a-f]{24})/view", _videoController.registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", _videoController.createComment);
apiRouter["delete"]("/videos/:id([0-9a-f]{24})/comment/delete", _videoController.deleteComment);
var _default = apiRouter;
exports["default"] = _default;