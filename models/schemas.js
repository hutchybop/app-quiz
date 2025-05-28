const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                    textFilter: (text) => {
                        return text
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#39;/g, "'")
                            .replace(/&apos;/g, "'")
                            .replace(/&nbsp;/g, ' ')
                            .replace(/&hellip;/g, '…')
                            .replace(/&mdash;/g, '—')
                            .replace(/&ndash;/g, '–')
                            .replace(/&ldquo;/g, '“')
                            .replace(/&rdquo;/g, '”')
                            .replace(/&lsquo;/g, '‘')
                            .replace(/&rsquo;/g, '’')
                            .replace(/&deg;/g, '°')
                            .replace(/&copy;/g, '©')
                            .replace(/&reg;/g, '®');
                    }
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)


module.exports.lobbyNewSchema = Joi.object({
    userNameNew: Joi.string().required().escapeHTML(),
    amount: Joi.string().valid('10', '20', '30', '40', '50').required(),
    diff: Joi.string().valid(
        'easy',
        'medium',
        'hard',
        'easy,medium',
        'easy,medium,hard',
        'medium,hard'
    ).escapeHTML().required(),
    auto: Joi.string().valid('on').escapeHTML()
}).required()


module.exports.lobbyJoinSchema = Joi.object({
    userNameJoin: Joi.string().required().escapeHTML(),
    quizCode: Joi.string().escapeHTML().required()
}).required()


module.exports.userDataSchema = Joi.object({
    userName: Joi.string().required().escapeHTML(),
    quizCode: Joi.string().required().escapeHTML(),
    progress: Joi.string().valid('/lobby', '/quiz', '/finish').required(),
    quizProgress: Joi.string().valid('na', 'answering', 'answered', 'waiting').required(),
    questionNumber: Joi.number().min(0).max(50).required(),
    answers: Joi.alternatives().try(Joi.array().items(Joi.string().escapeHTML()), Joi.string().escapeHTML()), // Handles both array or string inputs
    quizMaster: Joi.boolean().required(),
    auto: Joi.boolean()
})



