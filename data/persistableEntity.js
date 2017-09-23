module.exports = class PersistableEntity {
    constructor(type, name, description, inTable) {
        this.type = type;
        this.name = name;
        this.description = description;
        this.table = inTable;
    }

    _construct(callingFromSubclass) {
        if (callingFromSubclass !== true) {
            console.warn("Raw PersistableEntity._construct called, define this in the class file for " + this.type);
        }
        return {name: this.name, description: this.description};
    }

    _transact() {
        let self = this;
        let object = self._construct();
        let valid = undefined;
        db.transaction('rw', self.table, function () {
            self.table.add(object);
        }).catch(error => {
            console.log(self.type + " " + self.name + " not added to db; \n" + error.stack);
        }).then(function () {
            console.log(self.type + " " + self.name + " added to db.");
        });

        return valid;
    }

    save() {
        return this._transact();
    }
};