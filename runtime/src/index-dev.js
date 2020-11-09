import { getValidationSettings } from "../../custom-validation-settings";
import CustomTextListView from "./custom-validation/CustomTextListView";

(function () {
    console.log("Running CQ dev mode");

    const question = Confirmit.page.questions[3];
    // emulated object with settings for concrete question and answer, regexp
    const customQuestionSettings = getValidationSettings();

    new CustomTextListView(question, customQuestionSettings);
})();
