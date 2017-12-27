const PersistableEntity = require("../data/persistableEntity.js");
const DataAccess = require("../data/DataAccess");

module.exports = class MicroProject extends PersistableEntity {
	constructor (dateStart = Date.now(), dateEnd = Date.now(), duration = 0, name = "", description = ""){
		super("project", name, description);
		DataAccess.registerTable(this.type, DataAccess.getDatabase().projects);
        this.start = dateStart;
        this.end = dateEnd;
        this.duration = duration;
	}
};