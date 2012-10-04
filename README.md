Marionette FormView Component
============================

###Extension

#Validators Must be truthy/falsy value

```
var RegistrationForm = FormView.extend({
      el : "#form",

      fields : {
         fname : {
           el          : ".fname",
           validations : {
             fname    : "Fname Must Be Blah...",
             "min:10" : "Minimum Of 10 Characters",
             "max:20" : "Maximum Of 20 Characters"
           },
           validateOn  : 'blur' //submit
         }
      },
      rules : {
        "fname" : function() {
          //Validation Logic
          return true;
        }
      },
      onSubmit      : function (serializedData) {}, //Before The Submission
      onSubmitError : function (errors) {},
      onFieldError  : function (fieldName, errorArray) {} //Called Behind the scenes but allow it to be overridden
});
```

/*

//Default
function onFieldError(fieldName, domElement, errorArray) {
  //Be able to get fieldDef by this.fields['fieldName']
}

If we have a template already and/or a model passed in we could prepopulate that model, otherwise we create it on the fly

The FormView should listen for a form Submission. Then we do the magic which will serialize the data and run .validate()

For Rules

  If True/False - We Popup Immediately

  if Async and has a Deferred/Promise attached to it then we
  Wait to do the validation check until the promise fails/succeeds Then Popup

*/