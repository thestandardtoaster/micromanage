const Field = require("./Field.js");
const DataAccess = require("../../data/DataAccess");
const LocalCache = require("../../data/LocalCache");
const Overlays = require("./Overlays");

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
            let newField = new Field(type, inputElement);
            this.fields.push(newField);
        }

        container.querySelectorAll("input[type='button'].saveButton").forEach(saveButton => {
            saveButton.addEventListener("click", () => {
                let newObject = this.gatherObject();
                if (this.validateData()) {
                    DataAccess.save(newObject).finally(() => {
                        Overlays.hide(this.type.formName);
                        this.fields.forEach(field => {
                            field.clear();
                            field.validate();
                        });
                        this.postPersist(newObject);
                    });
                }
            });
        });
        container.querySelectorAll("input[type='button'].cancelButton").forEach(cancelButton => {
            cancelButton.addEventListener("click", () => {
                Overlays.hide(this.overlayName);
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
};