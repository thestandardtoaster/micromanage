// Libs
const {remote, ipcRenderer} = require('electron');
const fs = require('fs');
const Dexie = require('dexie');
const Mustache = require('mustache');

// Datatypes
const MicroTask = require('../data/task.js');
const MicroProject = require('../data/project.js');
const MicroEvent = require('../data/event.js');

// templates
let templates = new Map();
// local caches
let taskCache = new Map();
let projectCache = new Map();
let eventCache = new Map();

// DOM Parser
let templateParser = new DOMParser();

const win = remote.getCurrentWindow();

function addTask(t){
    let dom = runTemplate("task", t);
    taskCache.set(t, dom);
    let taskListElement = document.querySelector("#taskList");
    if(!taskListElement.contains(taskCache.get(t), false)){
        taskListElement.appendChild(taskCache.get(t));
    }
}

function populateTasks() {
    db.transaction('r', db.tasks, () => {
        db.tasks.each(task => {
            let newTask = new MicroTask(task.date, task.duration, task.complete, task.name, task.description);
            addTask(newTask);
        });
    }).catch(e => console.log(e.stack));
}

function gatherTask(){
    let taskNameField = document.querySelector("#taskNameField");
    let taskDescriptionField = document.querySelector("#taskDescriptionField");
    let taskDateField = document.querySelector("#taskDateField");
    let taskDurationField = document.querySelector("#taskDurationField");

    let name = taskNameField.value;
    let description = taskDescriptionField.value;
    let date = new Date(taskDateField.value);
    let duration = parseInt(taskDurationField.value);

    // TODO Data validation

    return new MicroTask(date, duration, false, name, description);
}

function runTemplate(template, object) {
    let obj = templateParser.parseFromString(Mustache.render(templates.get(template), object), "text/html");
    obj = obj.getElementsByTagName("body")[0].firstChild;
    return obj;
}

function addListeners() {
    let minimizeBtn = document.getElementById("minBtn");
    minimizeBtn.onclick = e => {
        win.minimize()
    };
    let maximizeBtn = document.getElementById("maxBtn");

    maximizeBtn.onclick = e => {
        if (!win.isMaximized()) {
            win.maximize();
        } else {
            win.unmaximize();
        }
    };
    let closeBtn = document.getElementById("closeBtn");

    closeBtn.onclick = e => {
        win.close();
    };
    let addBtn = document.getElementById("addBtn");

    let addOverlay = document.getElementById("addOverlay");
    addBtn.onclick = e => {
        if (addOverlay.classList.contains("visible")) {
            addOverlay.classList.remove("visible");
        } else {
            addOverlay.classList.add("visible");
        }
    };
    addOverlay.onclick = e => {
        addOverlay.classList.remove("visible");
    };

    let addTaskItem = document.querySelector("#addTaskItem");
    let addTaskOverlay = document.querySelector("#addTaskOverlay");
    addTaskItem.onclick = e => {
        e.stopPropagation();
        addOverlay.classList.remove("visible");
        addTaskOverlay.classList.add("visible");
    };

    let cancelTaskButton = document.querySelector("#cancelTaskButton");
    cancelTaskButton.onclick = e => {
        addTaskOverlay.classList.remove("visible");
    };

    let saveTaskButton = document.querySelector("#saveTaskButton");
    saveTaskButton.onclick = e => {
        let newTask = gatherTask();
        addTask(newTask);
        newTask.save();
        addTaskOverlay.classList.remove("visible");
    }
}

function initApp() {
    // TODO Pre-load mustache templates here
    templates.set("task", document.querySelector("#taskTemplate").innerHTML);
    templates.forEach((value, key) => Mustache.parse(value));

    populateTasks();

    addListeners();
}

const db = new Dexie('micromanage');

fs.readFile('./backend/dbstructure.json', 'utf-8', (error, data) => {
    if (error) {
        console.error("Unable to load database format:" + error.stack);
    } else {
        try {
            db.version(1).stores(JSON.parse(data));
            db.open().then(initApp);
        } catch (error) {
            console.error("Unable to set database format:" + error.stack);
        }
    }
});