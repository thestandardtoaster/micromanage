module.exports = class Field {
    constructor(input) {
        this.inputElement = input;
        if (input.parentElement.nodeName !== "LABEL") {
            console.warn("Field not surrounded by label element, could not create validation component.  Things will probably break");
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
                break;
            case "number":
                return parseInt(this.inputElement.value);
                break;
            case "date":
                return new Date(this.inputElement.value);
                break;
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