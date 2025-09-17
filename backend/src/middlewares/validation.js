// 请求验证中间件
const Joi = require('joi');

/**
 * 验证规则映射
 */
exports.validationRules = {
  // 通用规则
  required: 'required',
  optional: 'optional',
  string: 'string',
  number: 'number',
  integer: 'integer',
  boolean: 'boolean',
  array: 'array',
  object: 'object',
  date: 'date',
  email: 'email',
  url: 'url',
  uuid: 'uuid',
  file: 'file',
  // 字符串规则
  min: 'min',
  max: 'max',
  length: 'length',
  pattern: 'pattern',
  // 数字规则
  positive: 'positive',
  negative: 'negative',
  greaterThan: 'greaterThan',
  lessThan: 'lessThan',
  // 数组规则
  items: 'items',
  // 对象规则
  keys: 'keys'
};

/**
 * 解析验证规则字符串
 * @param {string} ruleStr - 验证规则字符串，如 'required|string|min:3|max:50'
 * @returns {Object} 解析后的规则对象
 */
function parseRules(ruleStr) {
  const rules = ruleStr.split('|').map(rule => {
    const parts = rule.split(':');
    const name = parts[0].trim();
    const value = parts.length > 1 ? parts[1].trim() : true;
    return { name, value };
  });
  return rules;
}

/**
 * 创建Joi验证模式
 * @param {Object} rules - 验证规则对象
 * @returns {Object} Joi验证模式
 */
function createJoiSchema(rules) {
  const schema = {};
  
  for (const [field, ruleStr] of Object.entries(rules)) {
    const fieldRules = parseRules(ruleStr);
    let joiRule = Joi.any();
    
    for (const { name, value } of fieldRules) {
      switch (name) {
        case exports.validationRules.required:
          joiRule = joiRule.required();
          break;
        case exports.validationRules.string:
          joiRule = Joi.string();
          break;
        case exports.validationRules.number:
          joiRule = Joi.number();
          break;
        case exports.validationRules.integer:
          joiRule = Joi.number().integer();
          break;
        case exports.validationRules.boolean:
          joiRule = Joi.boolean();
          break;
        case exports.validationRules.array:
          joiRule = Joi.array();
          break;
        case exports.validationRules.object:
          joiRule = Joi.object();
          break;
        case exports.validationRules.date:
          joiRule = Joi.date();
          break;
        case exports.validationRules.email:
          joiRule = Joi.string().email();
          break;
        case exports.validationRules.url:
          joiRule = Joi.string().uri();
          break;
        case exports.validationRules.uuid:
          joiRule = Joi.string().uuid();
          break;
        case exports.validationRules.min:
          if (joiRule._type === 'string') {
            joiRule = joiRule.min(parseInt(value));
          } else if (joiRule._type === 'number') {
            joiRule = joiRule.min(parseFloat(value));
          }
          break;
        case exports.validationRules.max:
          if (joiRule._type === 'string') {
            joiRule = joiRule.max(parseInt(value));
          } else if (joiRule._type === 'number') {
            joiRule = joiRule.max(parseFloat(value));
          }
          break;
        case exports.validationRules.length:
          if (joiRule._type === 'string' || joiRule._type === 'array') {
            joiRule = joiRule.length(parseInt(value));
          }
          break;
        case exports.validationRules.positive:
          if (joiRule._type === 'number') {
            joiRule = joiRule.positive();
          }
          break;
        case exports.validationRules.negative:
          if (joiRule._type === 'number') {
            joiRule = joiRule.negative();
          }
          break;
        case exports.validationRules.greaterThan:
          if (joiRule._type === 'number') {
            joiRule = joiRule.gt(parseFloat(value));
          }
          break;
        case exports.validationRules.lessThan:
          if (joiRule._type === 'number') {
            joiRule = joiRule.lt(parseFloat(value));
          }
          break;
        case exports.validationRules.file:
          // 文件验证在上传中间件中处理
          break;
        default:
          console.warn(`未知的验证规则: ${name}`);
      }
    }
    
    schema[field] = joiRule;
  }
  
  return Joi.object(schema);
}

/**
 * 验证请求参数
 * @param {Object} rules - 验证规则对象
 * @returns {Function} Koa中间件
 */
exports.validateRequest = (rules) => {
  const schema = createJoiSchema(rules);
  
  return async (ctx, next) => {
    try {
      // 合并所有请求数据
      const requestData = {
        ...ctx.query,
        ...ctx.request.body,
        ...ctx.params
      };
      
      // 执行验证
      const { error, value } = schema.validate(requestData, {
        abortEarly: false, // 收集所有错误
        allowUnknown: true, // 允许未知字段
        convert: true // 尝试转换类型
      });
      
      if (error) {
        // 处理验证错误
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, '')
        }));
        
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '输入数据验证失败',
          errors
        };
        return;
      }
      
      // 将验证后的数据合并到请求对象
      Object.assign(ctx.query, value);
      Object.assign(ctx.request.body, value);
      Object.assign(ctx.params, value);
      
      await next();
    } catch (err) {
      console.error('验证请求时出错:', err);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '内部服务器错误'
      };
    }
  };
};

/**
 * 验证请求体
 * @param {Object} rules - 验证规则对象
 * @returns {Function} Koa中间件
 */
exports.validateBody = (rules) => {
  const schema = createJoiSchema(rules);
  
  return async (ctx, next) => {
    try {
      const { error, value } = schema.validate(ctx.request.body, {
        abortEarly: false,
        allowUnknown: true,
        convert: true
      });
      
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, '')
        }));
        
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '请求体数据验证失败',
          errors
        };
        return;
      }
      
      ctx.request.body = value;
      await next();
    } catch (err) {
      console.error('验证请求体时出错:', err);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '内部服务器错误'
      };
    }
  };
};

/**
 * 验证查询参数
 * @param {Object} rules - 验证规则对象
 * @returns {Function} Koa中间件
 */
exports.validateQuery = (rules) => {
  const schema = createJoiSchema(rules);
  
  return async (ctx, next) => {
    try {
      const { error, value } = schema.validate(ctx.query, {
        abortEarly: false,
        allowUnknown: true,
        convert: true
      });
      
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, '')
        }));
        
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '查询参数验证失败',
          errors
        };
        return;
      }
      
      ctx.query = value;
      await next();
    } catch (err) {
      console.error('验证查询参数时出错:', err);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '内部服务器错误'
      };
    }
  };
};

/**
 * 验证URL参数
 * @param {Object} rules - 验证规则对象
 * @returns {Function} Koa中间件
 */
exports.validateParams = (rules) => {
  const schema = createJoiSchema(rules);
  
  return async (ctx, next) => {
    try {
      const { error, value } = schema.validate(ctx.params, {
        abortEarly: false,
        allowUnknown: true,
        convert: true
      });
      
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, '')
        }));
        
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: 'URL参数验证失败',
          errors
        };
        return;
      }
      
      ctx.params = value;
      await next();
    } catch (err) {
      console.error('验证URL参数时出错:', err);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '内部服务器错误'
      };
    }
  };
};

/**
 * 自定义验证函数
 * @param {Function} validator - 验证函数，返回 { valid: boolean, message?: string }
 * @returns {Function} Koa中间件
 */
exports.customValidate = (validator) => {
  return async (ctx, next) => {
    try {
      const result = await validator(ctx);
      
      if (!result.valid && result.message) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: result.message || '输入验证失败'
        };
        return;
      }
      
      if (!result.valid) {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '输入验证失败'
        };
        return;
      }
      
      await next();
    } catch (error) {
      console.error('自定义验证时出错:', error);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        message: '内部服务器错误'
      };
    }
  };
};

/**
 * 获取验证错误消息
 * @param {string} field - 字段名
 * @param {string} type - 错误类型
 * @param {Object} options - 选项
 * @returns {string} 错误消息
 */
exports.getValidationMessage = (field, type, options = {}) => {
  // 简化版本，移除了本地化依赖
  const messages = {
    required: `${field} 是必填项`,
    string: `${field} 必须是字符串`,
    number: `${field} 必须是数字`,
    integer: `${field} 必须是整数`,
    boolean: `${field} 必须是布尔值`,
    array: `${field} 必须是数组`,
    object: `${field} 必须是对象`,
    date: `${field} 必须是日期`,
    email: `${field} 必须是有效的邮箱地址`,
    url: `${field} 必须是有效的URL`,
    uuid: `${field} 必须是有效的UUID`,
    min: `${field} 长度或值不能小于 ${options.min}`,
    max: `${field} 长度或值不能大于 ${options.max}`,
    length: `${field} 长度必须为 ${options.length}`,
    positive: `${field} 必须是正数`,
    negative: `${field} 必须是负数`,
    file: `${field} 必须是有效的文件`
  };
  
  return messages[type] || `${field} 无效`;
};

// 默认导出
module.exports = {
  validateRequest: exports.validateRequest,
  validateBody: exports.validateBody,
  validateQuery: exports.validateQuery,
  validateParams: exports.validateParams,
  customValidate: exports.customValidate,
  getValidationMessage: exports.getValidationMessage,
  validationRules: exports.validationRules
};