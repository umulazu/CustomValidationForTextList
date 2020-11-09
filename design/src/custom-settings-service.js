export class CustomSettingsService {
    init(onInitArgs) {
        const [
            customQuestionSettings,
            uiSettings,
            questionSettings,
            projectSettings,
        ] = onInitArgs;

        this._settings = customQuestionSettings || {};

        this._settings.validationSettings =
            this._settings.validationSettings || [];

        this._languages = projectSettings.languages;

        this._currentLanguage = uiSettings.currentLanguage || 9;

        this._answers = questionSettings.answers;
    }

    set currentLanguage(newLanguage) {
        this._currentLanguage = newLanguage || this._currentLanguage;
    }

    get currentLanguage() {
        return this._currentLanguage;
    }

    get validationSettings() {
        return this._settings.validationSettings;
    }

    set settings(customQuestionSettings) {
        this._settings = customQuestionSettings || {};
    }

    get settings() {
        return this._settings;
    }

    get answers() {
        return this._answers;
    }

    updateSetting(answerCode, answerType, errorMessage) {
        const { validationSettings } = this._settings;

        const indexOfSetting = this.findIndexByAnswerCode(answerCode);

        const languageId = this.currentLanguage;

        validationSettings[indexOfSetting].answerType = answerType;

        validationSettings[indexOfSetting].localizedErrorMessages[
            languageId
        ] = errorMessage;
    }

    deleteSetting(answerCode) {
        const { validationSettings } = this._settings;

        const indexOfSetting = this.findIndexByAnswerCode(answerCode);

        validationSettings.splice(indexOfSetting, 1);
    }

    createSetting(answerCode, answerType) {
        const { validationSettings } = this._settings;

        const languageId = this.currentLanguage;

        const setting = {
            answerCode,
            answerType,
            localizedErrorMessages: {
                [languageId]: "",
            },
        };

        const indexOfSetting = this.findIndexByAnswerCode(answerCode);

        if (indexOfSetting !== -1) {
            validationSettings[indexOfSetting] = setting;
        } else {
            validationSettings.push(setting);
        }
    }

    findIndexByAnswerCode(answerCode) {
        return this.validationSettings.findIndex(
            (setting) => setting.answerCode === answerCode
        );
    }

    isErrorWithLocalizedMessages() {
        for (const validationSetting of this.validationSettings) {
            const messages = Object.entries(
                validationSetting.localizedErrorMessages
            );

            if (messages.length < this._languages.length) {
                return true;
            }

            for (const [languageId, errorMessage] of messages) {
                if (!errorMessage) {
                    return true;
                }
            }
        }
    }
}
