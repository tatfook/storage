import _ from "lodash";
import joi from "joi";
import axios from "axios";
import QRCode from "qrcode";

import Controller from "@/controllers/controller.js";
import models from "@/models";
import ERR from "@@/common/error.js";
import util from "@@/common/util.js";
import config from "@/config.js";
import pay from "@/services/pingpp.js";

import {
	TRADE_TYPE_CHARGE,
	TRADE_TYPE_EXPENSE,

	TRADE_STATE_START,
	TRADE_STATE_PAYING,
	TRADE_STATE_SUCCESS,
	TRADE_STATE_FAILED,
	TRADE_STATE_FINISH,
} from "@@/common/consts.js";

const generateQR = async text => {
	try {
		return await QRCode.toDataURL(text);
	} catch(e) {
		return ;
	}
}

export const Trades = class extends Controller {
	constructor() {
		super();
	}

	async test(ctx) {
		const func = async function() {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					const v = _.random(1, 10);
					if (v > 5) {
						resolve({key:true});
					} else {
						reject({key:false});
					}
				},1000);
			});
		}

		let isOk;
		await func().then(data => isOk = data.key).catch(data => isOk = data.key);
		return isOk;
	}

	async getPayQR(trade, ctx) {
		//channel = "wx_pub_qr" // 微信扫码支付
		//channel = "alipay_qr" // 支付宝扫码支付
		const channel = trade.channel;
		const chargeData = {
			order_no: util.getDate().datetime + "trade" + trade.id,
			app: {id: config.pingpp.appId},
			channel: trade.channel,
			amount: trade.amount,			
			client_ip: ctx.request.headers["x-real-ip"] || ctx.request.ip,
			currency: "cny",
			subject: trade.subject,
			body: trade.body,
		}

		if (channel == "wx_pub_qr") {
			chargeData.extra = {
				product_id: "goodsId" + (trade.goodsId || 0),
			}
		} else if(channel == "alipay_qr") {

		} else {
			return;
		}

		const charge = await pay.createChrage(chargeData).catch(e => console.log(e));

		if (!charge) {
			console.log("提交pingpp充值请求失败");
			return;
		}

		//console.log(charge);
		const result = await this.model.update({
			amount: chargeData.amount,
			subject: chargeData.subject,
			body: chargeData.body,
			tradeNo: chargeData.order_no,
			pingppId: charge.id,
			state: TRADE_STATE_PAYING,
		}, {
			where: {
				id: trade.id,
			},
		});

		return charge.credential[channel];
	}

	async create(ctx) {
		const userId = ctx.state.user.userId;
		const params = ctx.state.params;
		const goodsId = params.goodsId;
		const channel = params.channel;
		const goodsModel = models["goods"];

		let goods = await goodsModel.findOne({where:{id:goodsId}});
		goods = goods ? goods.get({plain:true}) : {};

		params.subject = params.subject || goods.subject;
		params.body = params.body || goods.body;
		params.amount = params.amount || goods.price;
		params.state = TRADE_STATE_START;
		params.userId = userId;

		if (!params.subject || !params.body || !params.amount) return ERR.ERR_PARAMS();

		let trade = await this.model.create(params);
		if (!trade) return ERR.ERR();
		trade = trade.get({plain:true});


		if (trade.channel) {
			trade.payQR = await this.getPayQR(trade, ctx);
			if (trade.payQR) {
				trade.payQRUrl = "http://qr.topscan.com/api.php?m=0&text=" + trade.payQR;
				trade.payQR = await generateQR(trade.payQR);
			}
		}

		return ERR.ERR_OK(trade);
	}

	async payQR(ctx) {
		const id = ctx.params.id;
		const params = ctx.state.params;

		let trade = await this.model.findOne({where: {id}});
		if (trade) return ERR.ERR_PARAMS();
		trade = trade.get({plain:true});

		trade.channel = params.channel;

		const alipay_qr = await this.getPayQR(trade, ctx);

		return ERR.ERR_OK(alipay_qr);
	}

	async pingpp(ctx) {
		const params = ctx.state.params;
		const signature = ctx.headers["x-pingplusplus-signature"];
		const body = JSON.stringify(params);
		const walletsModel = models["wallets"];
		
		if (!pay.verifySignature(body, signature)) {
			return ERR.ERR("签名验证失败");
		}

		console.log(params);

		const pingppId = params.data.object.id;
		const tradeNo = params.data.object.order_no;

		let trade = await this.model.findOne({where:{pingppId, tradeNo}});
		if (!trade) ERR.ERR("交易记录不存在");
		trade = trade.get({plain:true});
		
		let state = TRADE_STATE_FAILED;
		if (params.type == "charge.succeeded") {
			state = TRADE_STATE_SUCCESS;
		}
		
		trade.state = state;
		trade.description = "充值成功";
		await this.model.update(trade, {where:{id:trade.id}});
		await walletsModel.updateBalanceByUserId(trade.userId, trade.amount);
		
		if (!trade.callback) return ERR.ERR_OK();

		// 回调通知 增加认证 确保正确
		const data = {
			userId: trade.userId,
			goodsId: trade.goodsId,
		}

		try {
			// 返回2xx 表是成功
			await axios.post(trade.callback, {
				token: util.jwt_encode(data),
				data: data,
			});
		} catch(e) {
			return;
		}

		const newTrade = _.cloneDeep(trade);
		delete newTrade.id;
		delete newTrade.tradeNo;
		newTrade.amount = 0 - newTrade.amount;
		newTrade.type = TRADE_TYPE_EXPENSE;
		newTrade.description = "余额购买" + newTrade.subject;
		await this.model.upsert(newTrade);

		return ERR.ERR_OK();
	}

	static getRoutes() {
		this.pathPrefix = "trades";
		const baseRoutes = super.getRoutes();
		const routes = [
		{
			path: "",
			method: "POST",
			action: "create",
			authenticated: true,
			validated: {
				subject: joi.string().required(),
				body: joi.string().required(),
				goodsId: joi.number().required(),
			},
		},
		{
			path: "pingpp",
			method: "ALL",
			action: "pingpp",
		},
		{
			path: ":id/payQR",
			method: "GET",
			action: "payQR",
			authenticated: true,
			validated: {
				channel: joi.string().required(),
			},
		},
		{
			path:"test",
			method: "ALL",
			action:"test",
		}
		];

		return routes.concat(baseRoutes);
	}
}

export default Trades;
