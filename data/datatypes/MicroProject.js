const PersistableEntity = require("../PersistableEntity.js");
const DataAccess = require("../DataAccess");

let exporting = class MicroProject extends PersistableEntity {
    constructor(dateStart = Date.now(), dateEnd = Date.now(), duration = 0, name = "", description = "") {
        super(name, description);
        this.start = dateStart;
        this.end = dateEnd;
        this.duration = duration;
    }
};

exporting.typeName = "project";

DataAccess.setOnReady(() => DataAccess.registerType(exporting, DataAccess.getDatabase().projects));

module.exports = exporting;