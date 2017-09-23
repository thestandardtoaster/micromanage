const {remote, ipcRenderer} = require('electron');

const fs = require('fs');
const Dexie = require('dexie');
const Mustache = require('mustache');

const MicroTask = require('../data/task.js');
const MicroProject = require('../data/project.js');
const MicroEvent = require('../data/event.js');

let templates = new Map();
// local caches
let tasks = [];
let projects = [];
let events = [];

const win = remote.getCurrentWindow();

function createTaskItem(task) {
    let element = document.createElement("div");
    element.classList.add("task-item");
    element.textContent = task.name;
    element.taskContent += ": " + task.description;
    return element;
}

function populateTasks() {
    // Get the element that holds the tasks
    let taskElement = document.querySelector("#todaySchedulePane");
    taskElement.innerHTML = "";

    // DB is initialized, so populate data from it
    tasks = [];
    db.transaction('r', db.tasks, () => {
        db.tasks.each(task => {
            tasks.append(
                new MicroTask(task.date, task.duration, task.complete, task.name, task.description));
        });
    }).catch(e => console.log(e.stack));

    taskElement.innerHTML.concat(Mustache.render(templates.get("task"), {tasks: tasks}));
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