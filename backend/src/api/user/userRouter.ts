import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";

export const userRegistry = new OpenAPIRegistry();
export const userRouter: Router = express.Router();

// TODO: Add user routes here

