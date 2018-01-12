module.exports = class Field {
    constructor(input) {
        this.inputElement = input;
        if (input.parentElement.nodeName !== "LABEL") {
            console.warn("Field not surrounded by label element, could not create validation component.");
        } else {
            this.validationElement = document.createElement("div");
            this.validationElement.classList.add("validationStatus");
            input.parentElement.appendChild(this.validationElement);
        }
    }

    validate() {
        return true;
    }

    getValue() {
        switch (this.inputElement.type) {
            case "text":
            case "textarea":
                return this.inputElement.value;
            case "number":
                return parseInt(this.inputElement.value);
            case "date":
                return new Date(Date.parse(this.inputElement.value + "MST"));
            default:
                console.warn("Unable to retrieve value from field " + this.inputElement.parentElement().textContent);
                break;
        }
    }

    getFieldName() {
        return this.inputElement.getAttribute("data-fieldname");
    }

    clear() {
        this.inputElement.value = '';
    }
};