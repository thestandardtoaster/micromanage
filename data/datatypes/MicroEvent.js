const PersistableEntity = require("../PersistableEntity.js");
const DataAccess = require("../DataAccess");

let exporting = class MicroEvent extends PersistableEntity {
    constructor(date = Date.now(), duration = 0, reminders = [], name = "", description = "") {
        super(name, description);
        this.date = date;
        this.duration = duration;
        this.reminders = [].concat(reminders);
    }

    _construct() {
        let object = super._construct(true);
        object.date = this.date;
        object.duration = this.duration;
        object.reminders = this.reminders;
        return object;
    }

    static copy(other) {
        let newObject = new MicroEvent(other.date, other.duration, other.reminders, other.name, other.description);
        if (other.hasOwnProperty("id")) { // If the other object came from a database, we want the primary key
            newObject.primaryId = other["id"];
        }
        return newObject;
    }
};

exporting.typeName = "Event";
exporting.formName = "eventForm";

DataAccess.setOnReady(() => DataAccess.registerType(exporting, DataAccess.getDatabase().events));

module.exports = exporting;