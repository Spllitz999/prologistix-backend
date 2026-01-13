import express from "express";
import {
  createApplication,
  getApplications,
  updateStatus
} from "../controllers/applicationsController.js";

const router = express.Router();

router.post("/", createApplication);
router.get("/", getApplications);
router.put("/:id", updateStatus);

export default router;

