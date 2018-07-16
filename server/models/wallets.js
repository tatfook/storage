
import Model from "./model.js";
import Sequelize from 'sequelize';

export const Wallets = class extends Model {
	constructor() {
		super();
	}

	async getByUserId(userId) {
		let data = await this.model.findOne({where:{userId}});
		
		if (!data) {
			data = {
				userId,
				balance: 0,
			}
			data = await this.model.create(data);
			if (!data) return ;

			return data.get({plain:true});
		}

		return data.get({plain:true});
	}

	async updateBalanceByUserId(userId, amount) {
		const data = await this.getByUserId(userId);

		if (!data) return ;

		data.balance += amount;
		
		if (data.balance) return;

		await this.model.upsert(data);
		
		return true;

		//const sql = `update wallets set balance = balance + :amount where userId = :userId`;

		//const result = await this.query(sql, {
			//type: Sequelize.UPDATE,
			//replacements: {
				//amount,
				//userId,
			//}
		//});

		//console.log(result);
	}
}

export default new Wallets();
