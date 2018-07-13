import Validation from "client/Validation.js";
import PersistableEntity from "data/PersistableEntity.js";

export default class Field {
    inputElement: HTMLElement;
    type: new() => PersistableEntity;
    validationElement: HTMLElement;
    fieldName: string;
    validator: Validation;

    constructor(type : new() => PersistableEntity, input : HTMLElement) {
        this.inputElement = input;
        this.type = type;
        if (input.parentElement.nodeName !== "LABEL") {
            console.warn("Field not surrounded by label element, could not create validation component.");
        } else {
            this.validationElement = document.createElement("div");
            this.validationElement.classList.add("validationStatus");
            this.validationElement.classList.add("valid");
            input.parentElement.appendChild(this.validationElement);
        }
        this.fieldName = this.inputElement.getAttribute("data-fieldname");
        let validationString = this.inputElement.getAttribute("data-validation");
        this.validator = new Validation(this, validationString || "");
        
        this.inputElement.oninput = () => {
            this.validate();
        }
    }

    validate() {
        let v = this.validator.run();
        this.setValidation(v.valid, v.valid ? "" : v.messages);
        return v.valid;
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

    isEmpty() {
        if (this.inputElement.type !== "date") {
            return !this.getValue();
        } else {
            return !this.inputElement.value;
        }
    }

    getType() {
        return this.type;
    }

    getFieldName() {
        return this.fieldName;
    }

    getFriendlyName() {
        let friendlyName = this.inputElement.parentNode.textContent;
        if(this.inputElement.hasAttribute("data-name")){
            friendlyName = this.inputElement.getAttribute("data-name");
        }
        return friendlyName.trim().replace(/[^a-zA-Z ]/g, "");
    }

    clear() {
        this.inputElement.value = '';
    }

    setValidation(valid, message) {
        if (valid) {
            this.validationElement.classList.remove("invalid");
            this.validationElement.classList.add("valid");
        } else {
            this.validationElement.classList.remove("valid");
            this.validationElement.classList.add("invalid");
        }
        this.validationElement.setAttribute("title", message);
    }
};