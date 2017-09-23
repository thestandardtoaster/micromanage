const PersistableEntity = require("../data/persistableEntity.js");

module.exports = class MicroProject extends PersistableEntity {
	constructor (dateStart, dateEnd, time, name, description){
		super("project", name, description, db.projects);
        this.start = dateStart;
        this.end = dateEnd;
        this.time = time;
	}
};