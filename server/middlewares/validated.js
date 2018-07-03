import _ from 'lodash';
import joi from 'joi';

import {ERR_PARAMS} from "@@/common/error.js";

export const validated = (schema = {}, options = {}) => {
	options.allowUnknown = true;

  	return async (ctx, next) => {
    	const defaultValidateKeys = ['body', 'query', 'params'];

		const toValidateObj = {};
    	defaultValidateKeys.find((item) => {
      		const validateObj = item === 'body' ? ctx.request.body : ctx[item];
			_.merge(toValidateObj, validateObj);
    	});

		const result = joi.validate(toValidateObj, schema, options);
		if (result.error) {
			const errmsg = result.error.details[0].message.replace(/"/g, '');
			ctx.body = ERR_PARAMS().setMessage(errmsg);
			return;
		}

		_.assignIn(toValidateObj, result.value);

    	await next();
  	};
};

export default validated;
