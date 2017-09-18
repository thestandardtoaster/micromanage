module.exports = class Project {
	constructor (dateStart, dateEnd, time, name, description){
		this.type = "project";
		this.start = dateStart;
		this.end = dateEnd;
		this.time = time;
		this.name = name;
		this.description = description;
	}
}