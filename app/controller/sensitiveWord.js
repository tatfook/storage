
const fs = require("fs");
const joi = require("joi");
const _ = require("lodash");

const Controller = require("../core/controller.js");

const SensitiveWord = class extends Controller {
	get modelName() {
		return "sensitiveWords";
	}

	async importWords() {
		const wordstr = await new Promise((resolve, reject) => {
			fs.readFile("./app/public/sensitive_word.txt", function(err, data) {
				if (err) {
					console.log("加载铭感词文件失败");
					return resolve("");
				}
				return resolve(data.toString());
			});

		});
		
		const words = wordstr.split(",");
		for (let i = 0; i < words.length; i++) {
			const word = words[i];
			await this.model.sensitiveWords.upsert({word});
		}
		
		return this.success({words, size: words.length});
	}

	async check() {
		const {word} = this.validate();

		const data = await this.app.ahocorasick.check(word);

		return this.success(data);
	}
}

module.exports = SensitiveWord;
