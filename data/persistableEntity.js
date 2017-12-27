module.exports = class PersistableEntity {
    constructor(type, name, description) {
        this.type = type;
        this.name = name;
        this.description = description;
    }

    _construct(callingFromSubclass) {
        if (callingFromSubclass !== true) {
            console.warn("Raw PersistableEntity._construct called, define this in the class file for " + this.type);
        }
        return {name: this.name, description: this.description};
    }
};