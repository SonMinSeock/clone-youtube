"use strict";

require("dotenv/config");
require("./db");
require("./models/Video");
require("./models/User");
require("./models/Comment");
var _index = _interopRequireDefault(require("./index"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
var PORT = 4000;
var handleListening = function handleListening() {
  console.log("\u2705 Server Listening on Port http://localhost:".concat(PORT));
};
_index["default"].listen(PORT, handleListening);