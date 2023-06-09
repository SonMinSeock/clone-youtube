import express from "express";
import {
  registerView,
  createComment,
  deleteComment,
  settingModal,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.get("/videos/:id([0-9a-f]{24})/setting", settingModal);
apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete("/videos/:id([0-9a-f]{24})/comment/delete", deleteComment);
export default apiRouter;
