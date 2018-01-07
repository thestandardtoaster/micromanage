let exporting = class PersistableEntity {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.primaryId = -1;
    }

    _construct(callingFromSubclass) {
        if (callingFromSubclass !== true) {
            console.warn("Raw PersistableEntity._construct called, define this in the class file for " + this.type);
        }
        return {name: this.name, description: this.description};
    }
};

exporting.type = "";

module.exports = exporting;