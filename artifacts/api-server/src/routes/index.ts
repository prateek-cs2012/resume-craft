import { Router, type IRouter } from "express";
import healthRouter from "./health";
import parseResumeRouter from "./parse-resume";
import configRouter from "./config";
import authRouter from "./auth";
import userRouter from "./user";
import aiRouter from "./ai";
import checkoutRouter from "./checkout";

const router: IRouter = Router();

router.use(healthRouter);
router.use(configRouter);
router.use(authRouter);
router.use(userRouter);
router.use(aiRouter);
router.use(checkoutRouter);
router.use(parseResumeRouter);

export default router;
