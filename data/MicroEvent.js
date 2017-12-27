const PersistableEntity = require("../data/persistableEntity.js");
const DataAccess = require("../data/DataAccess");

module.exports = class MicroEvent extends PersistableEntity {
    constructor(date = Date.now(), duration = 0, reminders = [], name = "", description = "") {
        super("event", name, description);
        DataAccess.registerTable(this.type, DataAccess.getDatabase().events);
        this.date = date;
        this.duration = duration;
        this.reminders = [];
        this.reminders.concat(reminders);
    }

    _construct(){
        let object = super._construct(true);
        object.date = this.date;
        object.duration = this.duration;
        object.reminders = this.reminders;
        return object;
    }
};