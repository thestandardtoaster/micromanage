const {remote, ipcRenderer} = require('electron');

const fs = require('fs');
const Dexie = require('dexie');
const Project = require('../data/project.js');
const Task = require('../data/task.js');

const db = new Dexie('micromanage');

fs.readFile('./backend/dbstructure.json', 'utf-8', (error, data) => {
	if(error){
		console.error("Unable to load database format:" + error.stack);
	}
	else
	{
		try
		{
			db.version(1).stores(JSON.parse(data));
			db.open();
		}
		catch(error)
		{
			console.error("Unable to set database format:" + error.stack);
		}
	}
});

const win = remote.getCurrentWindow();

function persist(object){
	console.log("Received object " + JSON.stringify(object));
	if(object.type === "project"){
		console.log("Object is a Project, adding to db");
		db.transaction('rw', db.projects, function*(){
			db.projects.add(object);
		}).then(() => {
			console.log("Project " + object.name + " added to db.");
		}).catch(error => {
			console.log("Project " + object.name + " not added to db; " + error.stack);
		});
	} else if(object.type === "task"){
		console.log("Object is a Task, adding to db");
		db.transaction('rw', db.tasks, function*(){
			db.tasks.add(object);
		}).then(() => {
			console.log("Task " + object.name + " added to db.");
		}).catch(error => {
			console.log("Task " + object.name + " not added to db; \n" + error.stack);
		});
	} else {
		console.info("Received persist request with unknown argument.");
	}
}

function addListeners(){
    let minimizeBtn = document.getElementById("minBtn");
    minimizeBtn.onclick = e => {
		win.minimize()
	};

    let maximizeBtn = document.getElementById("maxBtn");
    maximizeBtn.onclick = e => {
		if(!win.isMaximized()){
			win.maximize();
		} else {
			win.unmaximize();
		}
	};

    let closeBtn = document.getElementById("closeBtn");
    closeBtn.onclick = e => {
		win.close()
	};
}

function createTaskItem(task){
	let element = document.createElement("div");
	element.classList.add("task-item");
	element.textContent = task.name;
	element.taskContent += ": " + task.description;
	return element;
}

function initApp(){
	let taskElement = document.querySelector("#todaySchedulePane");
    db.transaction('r', db.tasks, () => {
        db.tasks.each(task => {
            taskElement.appendChild(createTaskItem(task));
        });
    }).catch(e => console.log(e.stack));
    addListeners();
}

initApp();