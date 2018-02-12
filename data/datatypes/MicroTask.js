const PersistableEntity = require("../PersistableEntity");
const DataAccess = require("../DataAccess");

let exporting = class MicroTask extends PersistableEntity {
    constructor(date = Date.now(), duration = 0, complete = false, name = "", description = "") {
        super(name, description);
        if(!(date instanceof Date)){
            date = new Date(date);
        }
        this.date = date;
        this.duration = duration;
        this.complete = complete;
    }

    static copy(other) {
        let newObject = new MicroTask(other.date, other.duration, other.complete, other.name, other.description);
        if (other.hasOwnProperty("id")) { // If the other object came from a database, we want the primary key
            newObject.primaryId = other["id"];
        }
        return newObject;
    }

    _construct() {
        let object = super._construct(true);
        object.date = this.date;
        object.duration = this.duration;
        object.complete = this.complete;
        return object;
    }

    getFriendlyDuration() {
        let tempDuration = this.duration;
        let result = "";
        let weeks = Math.floor(tempDuration / (60 * 24 * 7));
        tempDuration -= weeks * (60 * 24 * 7);
        let days = Math.floor(tempDuration / (60 * 24));
        tempDuration -= days * (60 * 24);
        let hours = Math.floor(tempDuration / 60);
        tempDuration -= hours * 60;
        let minutes = tempDuration;

        if (weeks > 0) {
            result += weeks;
            result += "w";
        }
        if (days > 0) {
            result += days;
            result += "d";
        }
        if (hours > 0) {
            result += hours;
            result += "h";
        }
        if (minutes > 0) {
            result += minutes;
            result += "m";
        }
        return result;
    }
};

exporting.typeName = "Task";

DataAccess.setOnReady(() => DataAccess.registerType(exporting, DataAccess.getDatabase().tasks));

module.exports = exporting;