import "../custom-question";
import { CustomSettingsService } from "./custom-settings-service";
import { getAnswerTypes } from "../../custom-validation-settings";
import { getAnswerCode, getAnswerTypeByAnswerCode } from "./utilities";

class CustomValidationSettingsView {
    constructor(rootContainerId) {
        this.rootContainerId = rootContainerId;

        customQuestion.onInit = this.init;
        customQuestion.onSettingsReceived = this.settingsReceived;

        this.ds = new CustomSettingsService();
    }

    init = (...onInitArgs) => {
        this.ds.init(onInitArgs);

        const currentElementId = this.rootContainerId;

        this.render(currentElementId);

        this.toggleErrors();
    };

    settingsReceived = (customQuestionSettings, uiSettings) => {
        this.ds.settings = customQuestionSettings;

        this.ds.currentLanguage = uiSettings.currentLanguage;

        this.setInitialValueToInput();

        this.toggleErrors();
    };

    render(targetElementId) {
        const currentElementId = "cv-settings-container";

        this.containerId = currentElementId;

        const htmlContent = `
            <div id="${currentElementId}" class="node-property">
            </div>
        `;

        document
            .getElementById(targetElementId)
            .insertAdjacentHTML("afterbegin", htmlContent);

        this.renderTable(currentElementId);
    }

    renderTable(targetElementId) {
        const tableBodyId = "tableBody";

        const htmlTable = `
            <div class="node-property__content">
              <div class="setting-col">
                <div class="setting-col">
                  <div class="setting-row">
                    <div class="node-property__label value__option-header validation__option-header--answer-code">Code</div>
                    <div class="node-property__label value__option-header validation__option-header--answer-type">Type</div>
                    <div class="node-property__label value__option-header validation__option-header--error-message">Error Message</div>
                  </div>
                  <div class="setting-col" id="${tableBodyId}">
                  </div>
                </div>
              </div>
            </div>
        `;
        document
            .getElementById(targetElementId)
            .insertAdjacentHTML("afterbegin", htmlTable);

        this.renderRows(tableBodyId);
    }

    renderRows(targetElementId) {
        let htmlRows = ``;

        const answers = this.ds.answers;

        for (const answer of answers) {
            const answerCode = answer.code;

            const selectId = `${answerCode}-select`;
            const inputId = `${answerCode}-input`;
            const errorToasterId = `${answerCode}-error-toaster`;

            htmlRows += `
                <div class="setting-row">
                  <div class="value__option-input validation__option-input--answer-code">
                    <label for="${selectId}">${answerCode}</label>  
                  </div>
                  <div class="value__option-input validation__option-input--answer-type">
                    <select id="${selectId}" class="form-input" data-answer-code="${answerCode}"></select>
                  </div>
                  <div class="value__option-input validation__option-input--error-message">
                    <input type="text" id="${inputId}" class="form-input" disabled data-answer-code="${answerCode}" value=""/>
                    <span id="${errorToasterId}" class="error-element"></span>
                  </div>
                </div>
            `;
        }

        document
            .getElementById(targetElementId)
            .insertAdjacentHTML("afterbegin", htmlRows);

        const currentElementSelector = `select.form-input`;

        this.initializeSelects(currentElementSelector);
        this.initializeInputs();
    }

    initializeSelects(targetElementSelector) {
        const options = this.getOptionsFromValidationAnswerTypes();

        const selects = document.querySelectorAll(targetElementSelector);

        for (const select of selects) {
            select.insertAdjacentHTML("afterbegin", options);

            select.addEventListener("change", this.selectChangeHandler);
        }

        this.setInitialValueToSelect();
    }

    getOptionsFromValidationAnswerTypes() {
        const settings = getAnswerTypes();

        let options = ``;

        for (const answerType of settings) {
            options += `<option value="${answerType}">${answerType}</option>`;
        }

        return options;
    }

    setInitialValueToSelect() {
        const validationSettings = this.ds.validationSettings;

        for (const setting of validationSettings) {
            const { answerCode, answerType } = setting;

            const selectId = `${answerCode}-select`;

            document.getElementById(selectId).value = answerType;

            this.enableInputByAnswerCode(answerCode);
        }
    }

    initializeInputs() {
        this.subscribeInputsOnChange();

        this.setInitialValueToInput();
    }

    subscribeInputsOnChange() {
        const answers = this.ds.answers;

        for (const answer of answers) {
            const answerCode = answer.code;

            const inputId = `${answerCode}-input`;

            document
                .getElementById(inputId)
                .addEventListener("input", this.inputChangeHandler);
        }
    }

    setInitialValueToInput() {
        const validationSettings = this.ds.validationSettings;

        for (const setting of validationSettings) {
            const { answerCode } = setting;
            const errorMessage =
                setting.localizedErrorMessages[this.ds.currentLanguage] || "";

            const inputId = `${answerCode}-input`;

            document.getElementById(inputId).value = errorMessage;
        }
    }

    inputChangeHandler = (e) => {
        const answerCode = getAnswerCode(e.target);

        const answerType = getAnswerTypeByAnswerCode(answerCode);

        const errorMessage = e.target.value;

        this.ds.updateSetting(answerCode, answerType, errorMessage);

        this.unmarkError(answerCode);

        this.saveChanges();
    };

    selectChangeHandler = (e) => {
        const answerCode = getAnswerCode(e.target);

        const answerType = e.target.value;

        if (!answerType) {
            this.ds.deleteSetting(answerCode);

            this.unmarkError(answerCode);

            this.disableInputByAnswerCode(answerCode);
        } else {
            this.ds.createSetting(answerCode, answerType);

            this.enableInputByAnswerCode(answerCode);
        }

        this.saveChanges();
    };

    enableInputByAnswerCode(answerCode) {
        const inputId = `${answerCode}-input`;

        document.getElementById(inputId).disabled = false;
    }

    disableInputByAnswerCode(answerCode) {
        const inputId = `${answerCode}-input`;

        document.getElementById(inputId).value = "";
        document.getElementById(inputId).disabled = true;
    }

    saveChanges() {
        const isGlobalError = this.toggleErrors();

        const { settings } = this.ds;

        customQuestion.saveChanges(settings, isGlobalError);
    }

    toggleErrors() {
        this.toggleCurrentLanguageErrors();

        return this.toggleGlobalErrors();
    }

    toggleCurrentLanguageErrors() {
        const inputSelector = "input:not([disabled])";

        const inputs = document.querySelectorAll(inputSelector);

        for (const input of inputs) {
            if (!input.value) {
                input.classList.add("has-error");

                input.setAttribute("aria-invalid", "true");

                this.renderError(input);
            } else {
                const answerCode = getAnswerCode(input);

                this.unmarkError(answerCode);
            }
        }
    }

    renderError(targetElement) {
        const answerCode = getAnswerCode(targetElement);

        const errorToasterId = `${answerCode}-error-toaster`;

        const errorToaster = document.getElementById(errorToasterId);

        errorToaster.textContent = "Please provide an value.";
    }

    unmarkError(answerCode) {
        const inputElementId = `${answerCode}-input`;

        const inputElement = document.getElementById(inputElementId);

        inputElement.classList.remove("has-error");

        inputElement.removeAttribute("aria-invalid");

        this.removeToaster(inputElement);
    }

    removeToaster(inputElement) {
        const answerCode = getAnswerCode(inputElement);

        const errorToasterId = `${answerCode}-error-toaster`;

        const errorToaster = document.getElementById(errorToasterId);

        errorToaster.textContent = "";
    }

    toggleGlobalErrors() {
        const globalErrorToasterId = "global-error-toaster";

        const isError = this.ds.isErrorWithLocalizedMessages();

        const globalErrorToaster = document.getElementById(
            globalErrorToasterId
        );

        if (!isError) {
            globalErrorToaster &&
                this.removeGlobalErrorToaster(globalErrorToaster);
        } else {
            !globalErrorToaster && this.renderGlobalError(globalErrorToasterId);
        }

        return isError;
    }

    renderGlobalError(globalErrorToasterId) {
        const targetElementId = this.containerId;

        const errorText = "Check other language pages, please.";

        const htmlContent = `
            <span id="${globalErrorToasterId}" class="error-element">
              ${errorText}
            </span>
        `;

        document
            .getElementById(targetElementId)
            .insertAdjacentHTML("afterbegin", htmlContent);
    }

    removeGlobalErrorToaster(globalErrorToaster) {
        globalErrorToaster.remove();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new CustomValidationSettingsView("root");
});
