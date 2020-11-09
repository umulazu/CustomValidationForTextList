// place to input one's custom validation settings
const customValidationSettings = {
    "": /.*/,
    email: /.+@.+/,
    phone: /(?:\d{3}|\(\d{3}\))([-\/.])\d{3}\1\d{4}/,
};

export const getAnswerTypes = () => Object.keys(customValidationSettings);

// imitation of customValidationSettings parameter for dev-version only
export const getValidationSettings = (answerCodesWithAnswerTypes) => {
    const validationSettings = [];

    for (const answerType in answerCodesWithAnswerTypes) {
        if (
            answerCodesWithAnswerTypes.hasOwnProperty(answerType) &&
            answerType
        ) {
            const regExp = getRegExpForAnswerType(answerType);
            const answerCode = answerCodesWithAnswerTypes[answerType];

            const validationSetting = {
                answerCode,
                regExp,
            };

            validationSettings.push(validationSetting);
        }
    }

    return validationSettings;
};

export const getRegExpForAnswerType = (answerType) => {
    if (customValidationSettings.hasOwnProperty(answerType)) {
        return customValidationSettings[answerType];
    } else {
        return customValidationSettings[""];
    }
};