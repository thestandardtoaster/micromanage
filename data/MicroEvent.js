const PersistableEntity = require("../data/persistableEntity.js");
const DataAccess = require("../data/DataAccess");

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

exporting.type = "event";

DataAccess.setOnReady(() => DataAccess.registerType(exporting.type, DataAccess.getDatabase().events));

module.exports = exporting;