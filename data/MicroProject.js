const PersistableEntity = require("../data/persistableEntity.js");
const DataAccess = require("../data/DataAccess");

let exporting = class MicroProject extends PersistableEntity {
    constructor(dateStart = Date.now(), dateEnd = Date.now(), duration = 0, name = "", description = "") {
        super(name, description);
        this.start = dateStart;
        this.end = dateEnd;
        this.duration = duration;
    }
};

exporting.type = "project";

DataAccess.setOnReady(() => DataAccess.registerType(exporting.type, DataAccess.getDatabase().projects));

module.exports = exporting;