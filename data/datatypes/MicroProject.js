const PersistableEntity = require("../PersistableEntity.js");
const DataAccess = require("../DataAccess");

let exporting = class MicroProject extends PersistableEntity {
    constructor(dateStart = Date.now(), dateEnd = Date.now(), duration = 0, name = "", description = "") {
        super(name, description);
        this.start = dateStart;
        this.end = dateEnd;
        this.duration = duration;
    }

    static copy(other) {
        let newObject = new MicroProject(other.start, other.end, other.duration, other.name, other.description);
        if (other.hasOwnProperty("id")) { // If the other object came from a database, we want the primary key
            newObject.primaryId = other["id"];
        }
        return newObject;
    }
};

exporting.typeName = "Project";
exporting.formName = "projectForm";

DataAccess.setOnReady(() => DataAccess.registerType(exporting, DataAccess.getDatabase().projects));

module.exports = exporting;