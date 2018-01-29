const Field = require("./Field.js");
const DataAccess = require("../../data/DataAccess");
const LocalCache = require("../../data/LocalCache");

NodeList.prototype.forEach = Array.prototype.forEach;

module.exports = class MicroForm {
    constructor(container, type) {
        this.container = container; // make available to lambda scope later
        this.formElement = this.container.querySelector(".overlayForm");

        this.type = type;
        this.fields = [];

        let elements = container.getElementsByTagName("label");
        for (let i = 0; i < elements.length; i++) {
            let inputElement = elements[i].querySelector("input");
            inputElement = inputElement || elements[i].querySelector("textarea");
            this.fields.push(new Field(type, inputElement));
        }

        container.querySelectorAll("input[type='button'].saveButton").forEach(saveButton => {
            saveButton.addEventListener("click", () => {
                let newObject = this.gatherObject();
                if (this.validateData()) {
                    DataAccess.save(newObject).finally(() => {
                        this.hide();
                        this.fields.forEach(field => field.clear());
                        this.postPersist(newObject);
                    });
                }
            });
        });
        container.querySelectorAll("input[type='button'].cancelButton").forEach(cancelButton => {
            cancelButton.addEventListener("click", () => {
                this.hide();
                this.fields.forEach(field => field.clear());
            });
        });

        this.postPersist = o => {
        };
    }

    validateData() {
        let validationPassed = true;
        this.fields.forEach(field => {
                validationPassed &= field.validate();
        });
        return validationPassed;
    }

    gatherObject() {
        let newEmpty = new this.type();
        for (let i = 0; i < this.fields.length; i++) {
            newEmpty[this.fields[i].getFieldName()] = this.fields[i].getValue();
        }
        return newEmpty;
    }

    getField(name) {
        for (let field of this.fields) {
            if (field.getFieldName() === name) {
                return field;
            }
        }
    }

    setPostPersist(event) {
        this.postPersist = event;
    }

    hide() {
        this.container.classList.remove("visible");
    }

    show() {
        this.container.classList.add("visible");
    }
};