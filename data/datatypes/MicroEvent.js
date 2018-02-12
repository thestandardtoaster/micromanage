const PersistableEntity = require("../PersistableEntity.js");
const DataAccess = require("../DataAccess");

let exporting = class MicroEvent extends PersistableEntity {
    constructor(date = Date.now(), duration = 0, reminders = [], name = "", description = "") {
        super(name, description);
        this.date = date;
        this.duration = duration;
        this.reminders = [];
        this.reminders.concat(reminders);
    }

    _construct() {
        let object = super._construct(true);
        object.date = this.date;
        object.duration = this.duration;
        object.reminders = this.reminders;
        return object;
    }
};

exporting.typeName = "Event";

DataAccess.setOnReady(() => DataAccess.registerType(exporting, DataAccess.getDatabase().events));

module.exports = exporting;