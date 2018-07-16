import joi from "joi";

import Controller from "@/controllers/controller.js";
import ERR from "@@/common/error.js";

export const Wallets = class extends Controller {
	constructor() {
		super();
	}

	async getByUserId(ctx) {
		const userId = ctx.state.user.userId;

		const data = await this.model.getByUserId(userId);

		return ERR.ERR_OK(data);
	}
	
	async updateBalance(ctx) {
		const amount = ctx.state.params.amount;
		const userId = ctx.state.user.userId;

		const result = await this.model.updateBalanceByUserId(userId, amount);

		return ERR.ERR_OK(result);
	}

	static getRoutes() {
		this.pathPrefix = "wallets";

		const baseRoutes = super.getRoutes();

		const routes = [
		{
			path: "getByUserId",
			method: "GET",
			action: "getByUserId",
			authenticated: true,
		},
		{
			path: ":id/updateBalance",
			method: "POST",
			action: "updateBalance",
			authenticated: true,
			validated: {
				amount: joi.number().required(),
			},
		},
		];

		return routes.concat(baseRoutes);
	}
}

export default Wallets;
