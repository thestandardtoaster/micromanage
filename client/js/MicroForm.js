const Field = require("./field.js");
const DataAccess = require("../../data/DataAccess");

NodeList.prototype.forEach = Array.prototype.forEach;

module.exports = class MicroForm {
    constructor(container, emptyObject) {
        this.container = container; // make available to lambda scope later
        this.formElement = this.container.querySelector(".overlayForm");
        if (this.constructor === MicroForm) {
            throw TypeError("Attempt to instantiate abstract class MicroForm");
        }

        this.emptyObject = emptyObject;

        this.fields = [];
        let elements = container.getElementsByTagName("label");
        for (let i = 0; i < elements.length; i++) {
            let inputElement = elements[i].querySelector("input");
            inputElement = inputElement || elements[i].querySelector("textarea");
            this.fields.push(new Field(inputElement));
        }

        container.querySelectorAll("input[type='button'].saveButton").forEach(saveButton => {
            saveButton.addEventListener("click", () => {
                let newObject = this.gatherObject();
                if (this.validateData()) {
                    DataAccess.save(newObject).then(() => {
                        this.container.classList.remove("visible");
                        this.fields.forEach(field => field.clear());
                        this.postPersist(newObject);
                    });
                }
            });
        });
        container.querySelectorAll("input[type='button'].cancelButton").forEach(cancelButton => {
            cancelButton.addEventListener("click", () => {
                this.container.classList.remove("visible");
                this.fields.forEach(field => field.clear());
            });
        });

        this.postPersist = o => {
        };
    }

    validateData() {
        console.warn("MicroForm.validateData() not filled in by subclass");
        return true;
    }

    gatherObject() {
        let newEmpty = Object.create(this.emptyObject);
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