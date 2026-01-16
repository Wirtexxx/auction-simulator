import express, { type Router } from "express";
import { bidController } from "./bidController";

export const bidRouter: Router = express.Router();

// GET /bids?auction_id=...&round_number=...
bidRouter.get("/", bidController.getRoundBids);
