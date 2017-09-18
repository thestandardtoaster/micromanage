module.exports = class Task {
	constructor (date, time, complete, name, description){
		this.type = "task";
		this.date = date;
		this.time = time;
		this.complete = complete;
		this.name = name;
		this.description = description;
	}
}