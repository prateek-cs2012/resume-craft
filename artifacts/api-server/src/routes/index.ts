import { Router, type IRouter } from "express";
import healthRouter from "./health";
import parseResumeRouter from "./parse-resume";

const router: IRouter = Router();

router.use(healthRouter);
router.use(parseResumeRouter);

export default router;
