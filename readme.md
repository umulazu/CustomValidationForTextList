CustomValidationForTextList
=====================

The component uses `CustomQuestions`(CQ) base.

It is `OpenTextListQuestion` with `inputs` that can be validated with any RegEx.

Before you start
-----------------------------------
You should have installed `parcel` package added in PATH variable.
 
Customization
-----------------------------------
`customValidationSettings` in `_{project directory}_/custom-validation-settings.js` is the object to insert custom settings.
Every setting consists of `customAnswerType` as key, `customRegExp` as value. 

For example, `customValidationSettings` could look like
```
{
    "": /.*/,
    email: /.+@.+/,
    phone: /(?:\d{3}|\(\d{3}\))([-\/.])\d{3}\1\d{4}/,
}
```

Here the first setting is necessary and corresponds to default validation behavior (emptiness check in most cases).

Usage
-----------------------------------
For any changes ready to be deployed, all you need to do is run the `build.sh` script.

It bundles `design` and `runtime` components to `zip` folder ready for import.