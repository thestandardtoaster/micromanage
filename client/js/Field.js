let Validation = require("Validation");

module.exports = class Field {
    constructor(type, input) {
        this.inputElement = input;
        this.type = type;
        if (input.parentElement.nodeName !== "LABEL") {
            console.warn("Field not surrounded by label element, could not create validation component.");
        } else {
            this.validationElement = document.createElement("div");
            this.validationElement.classList.add("validationStatus");
            input.parentElement.appendChild(this.validationElement);
        }
        this.fieldName = this.inputElement.getAttribute("data-fieldname");
        let validationString = this.inputElement.getAttribute("data-validation");
        this.validator = new Validation(this, validationString);
    }

    validate() {
        return this.validator.run();
    }

    getValue() {
        switch (this.inputElement.type) {
            case "text":
            case "textarea":
                return this.inputElement.value;
            case "number":
                return parseFloat(this.inputElement.value);
            case "date":
                let utcOffset = -(new Date().getTimezoneOffset());
                let hoursOffset = Math.floor(utcOffset / 60);
                let minutesOffset = utcOffset % 60;
                let offsetString = " GMT";
                if (hoursOffset < 0) {
                    offsetString += '-';
                    hoursOffset = Math.abs(hoursOffset);
                }
                if (hoursOffset < 10) {
                    offsetString += '0';
                }
                offsetString += hoursOffset;
                if (minutesOffset === 0) {
                    offsetString += "00";
                } else {
                    offsetString += minutesOffset;
                }
                return new Date(Date.parse(this.inputElement.value + offsetString));
            default:
                console.warn("Unable to retrieve value from field " + this.inputElement.parentElement().textContent);
                break;
        }
    }

    getType(){
        return this.type;
    }

    getFieldName() {
        return this.fieldName;
    }

    clear() {
        this.inputElement.value = '';
    }
};