export const getAnswerCode = (element) => element.dataset.answerCode;

export const getAnswerTypeByAnswerCode = (answerCode) => {
    const selectId = `${answerCode}-select`;

    return document.getElementById(selectId).value;
};
