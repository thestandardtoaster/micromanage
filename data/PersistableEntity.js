let exporting = class PersistableEntity {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.id = -1;
    }

    _construct() {
        return {name: this.name, description: this.description};
    }
};

exporting.typeName = "Persistable";

module.exports = exporting;