import { getRegExpForAnswerType } from "../../../custom-validation-settings";

const OpenTextListQuestionView =
    Confirmit.pageView.questionViewTypes["OpenTextListQuestionView"];

const currentLanguage = Confirmit.page.surveyInfo.language;

class CustomTextListView extends OpenTextListQuestionView {
    constructor(currentQuestion, customQuestionSettings) {
        super(currentQuestion);

        this.validationSettings =
            customQuestionSettings.validationSettings || [];

        this.init();
    }

    init() {
        this.render();

        this.subscribeToQuestion();

        this.bindCustomValidation();
    }

    render() {
        const qid = this._question.id;

        const htmlContent = `
            <div class="cf-question__text" id="${qid}_text">
                ${this._question.text}
            </div>

            <div class="cf-question__instruction" id="${qid}_instruction">
                ${this._question.instruction}
            </div>
        `;

        document
            .getElementById(qid)
            .insertAdjacentHTML("afterbegin", htmlContent);

        this.renderContent();
    }

    renderContent() {
        const qid = this._question.id;

        const htmlContent = `
            <div class="cf-question__content">
                <div class="cf-grid-layout">
                </div>
            </div>
        `;

        const targetElementId = `${qid}_instruction`;

        document
            .getElementById(targetElementId)
            .insertAdjacentHTML("afterend", htmlContent);

        this.renderRows();
    }

    renderRows() {
        let htmlGridContent = ``;

        const answers = this.answers;

        for (const answer of answers) {
            const answerId = answer.fieldName;

            htmlGridContent += `
                <div class="cf-grid-layout__row cf-open-list-answer  " id="${answerId}">
                    <div class="cf-grid-layout__row-text">
                        <div class="cf-open-list-answer__text" id="${answerId}_text">${answer.text}</div>
                    </div>
                    <div class="cf-grid-layout__row-control cf-open-list-answer__control">
                        <div class="cf-open-list-answer__input-wrapper">
                            <input type="text" class="cf-open-list-answer__input cf-text-box  " id="${answerId}_input" value="" aria-required="true" aria-labelledby="${answerId}_text">
                        </div>
                    </div>
                </div>
            `;
        }

        const targetElementSelector = `#${this._question.id} .cf-grid-layout`;

        document
            .querySelector(targetElementSelector)
            .insertAdjacentHTML("afterbegin", htmlGridContent);
    }

    subscribeToQuestion() {
        const answers = this.answers;

        for (const answer of answers) {
            const targetElementId = `${answer.fieldName}_input`;

            document
                .getElementById(targetElementId)
                .addEventListener("input", (e) =>
                    this._question.setValue(answer.code, e.target.value)
                );
        }

        this._question.validationCompleteEvent.on(this._showAnswerError);
    }

    bindCustomValidation() {
        const validationSettings = this.validationSettings;

        const validationSubscriber = (validationResult) => {
            for (const setting of validationSettings) {
                validateAnswer(setting, validationResult);
            }
        };

        const validateAnswer = (setting, validationResult) => {
            const answerCode = setting.answerCode;

            const regExp = getRegExpForAnswerType(setting.answerType);

            const localizedErrorMessage =
                setting.localizedErrorMessages[currentLanguage];

            const answerValue = this._question.values[answerCode];

            const answer = this._question.getAnswer(answerCode);
            const answerText = answer.text;

            const isValid = regExp.test(answerValue);

            if (!isValid) {
                const errorMessage =
                    localizedErrorMessage ||
                    `Please, enter a valid ${answerText} answer`;

                const error = { message: errorMessage };

                const errors = [];
                errors.push(error);

                const answerLevelError = { answerCode, errors };

                validationResult.answerValidationResults.push(answerLevelError);
            }
        };

        this._question.validationEvent.on(validationSubscriber);
    }
}

export default CustomTextListView;
