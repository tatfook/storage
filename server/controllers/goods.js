import joi from "joi";

import Controller from "@/controllers/controller.js";
import models from "@/models";
import ERR from "@@/common/error.js";


export const Goods = class extends Controller {
	constructor() {
		super();
	}

	async upsert(ctx) {
		const params = ctx.state.params;

		await this.model.upsert(params);

		return ERR.ERR_OK();
	}

	async delete(ctx) {
		const id = ctx.params.id;

		await this.model.destroy({where:{id}});

		return ERR.ERR_OK();
	}

	async getOne(ctx) {
		const id = ctx.params.id;

		const data = await this.model.findOne({where:{id}});

		return ERR.ERR_OK(data);
	}

	async gets(ctx) {
		const list = await this.model.find({});

		return ERR.ERR_OK(list);
	}

	static getRoutes() {
		this.pathPrefix = "goods";
		const baseRoutes = super.getRoutes();
		const routes = [
		{
			path:"",
			method: "POST",
			action:"upsert",
			authenticated: true,
			validated: {
				subject: joi.string().required(),
				body: joi.string().required(),
				price: joi.number().required(),
			},
		},
		{
			path:":id",
			method: "PUT",
			action:"upsert",
			authenticated: true,
		},
		{
			path: ":id",
			method: "DELETE",
			action: "delete",
			authenticated: true,
		},
		{
			path: "",
			method: "GET",
			action: "gets",
		},
		{
			path: ":id",
			method: "GET",
			action: "getOne",
		},
		];

		return routes.concat(baseRoutes);
	}
}

export default Goods;
