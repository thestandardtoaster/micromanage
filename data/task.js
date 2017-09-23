const PersistableEntity = require("../data/persistableEntity.js");

module.exports = class MicroTask extends PersistableEntity {
    constructor(date, duration, complete, name, description) {
        super("task", name, description, db.tasks);
        this.date = date;
        this.duration = duration;
        this.complete = complete;
    }

    _construct(){
        let object = super._construct(true);
        object.date = this.date;
        object.duration = this.duration;
        object.complete = this.complete;
        return object;
    }

    getFriendlyDuration(){
        let tempDuration = this.duration;
        let result = "";
        let weeks = Math.floor(tempDuration/(60*24*7));
        tempDuration -= weeks*(60*24*7);
        let days = Math.floor(tempDuration/(60*24));
        tempDuration -= days*(60*24);
        let hours = Math.floor(tempDuration/60);
        tempDuration -= hours*60;
        let minutes = tempDuration;

        if(weeks > 0){
            result += weeks;
            result += "w";
        }
        if(days > 0){
            result += days;
            result += "d";
        }
        if(hours > 0){
            result += hours;
            result += h;
        }
        if(minutes > 0){
            result += minutes;
            result += "m";
        }
        return result;
    }
};