import type { Request, Response } from "express";

import { userService } from "./userService";

export const userController = {
    authenticate: async (req: Request, res: Response) => {
        const { initData } = req.body;
        const serviceResponse = await userService.authenticateWithTelegram(
            initData
        );
        res.status(serviceResponse.statusCode).send(serviceResponse);
    },

    getUser: async (req: Request, res: Response) => {
        const { id } = req.params;
        const serviceResponse = await userService.getUserById(Number(id));
        res.status(serviceResponse.statusCode).send(serviceResponse);
    },
};
