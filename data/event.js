const PersistableEntity = require("../data/persistableEntity.js");

module.exports = class MicroEvent extends PersistableEntity {
    constructor(date, duration, reminders, name, description) {
        super("event", name, description, db.events);
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