import CustomTextListView from "./custom-validation/CustomTextListView";

register(function (question, customQuestionSettings, questionViewSettings) {
    new CustomTextListView(question, customQuestionSettings);
});
