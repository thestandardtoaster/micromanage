// Libs
const {remote, ipcRenderer} = require('electron');
const Mustache = require('mustache');

// Datatypes
const {MicroEvent, MicroProject, MicroTask} = require("../data/datatypes");
const MicroForm = require("./js/MicroForm");
const DataAccess = require("../data/DataAccess");

// templates
let templates = new Map();
// local caches
let taskCache = new Map();
let projectCache = new Map();
let eventCache = new Map();

// DOM Parser
let templateParser = new DOMParser();

class NewTaskForm extends MicroForm {
    constructor(element) {
        super(element, new MicroTask());
    }
}

let newTaskForm;

const win = remote.getCurrentWindow();

function addTask(t) {
    let dom = runTemplate("task", t);
    taskCache.set(t, dom);
    let taskListElement = document.querySelector("#taskList");
    if (!taskListElement.contains(taskCache.get(t), false)) {
        taskListElement.appendChild(taskCache.get(t));
    }
}

function populateTasks() {
    DataAccess.forAllOfType(MicroTask.type, task => {
        let newTask = MicroTask.copy(task);
        addTask(newTask);
    });
}

function runTemplate(template, object) {
    let obj = templateParser.parseFromString(Mustache.render(templates.get(template), object), "text/html");
    obj = obj.getElementsByTagName("body")[0].firstChild;
    return obj;
}

function addListeners() {
    let minimizeBtn = document.getElementById("minBtn");
    minimizeBtn.onclick = e => {
        win.minimize();
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
    let addTaskForm = document.querySelector("#addTaskForm");
    addTaskItem.onclick = e => {
        e.stopPropagation();
        addOverlay.classList.remove("visible");
        addTaskForm.classList.add("visible");
    };
}

DataAccess.setOnReady(() => {
    // Pre-load mustache templates here
    templates.set("task", document.querySelector("#taskTemplate").innerHTML);
    templates.forEach((value, key) => Mustache.parse(value));

    newTaskForm = new NewTaskForm(document.querySelector("#addTaskForm"));
    newTaskForm.setPostPersist(newTask => {
        addTask(MicroTask.copy(newTask));
    });

    populateTasks();

    addListeners();

    // We're done with loading, hide the loading overlay
    document.querySelector(".loadingOverlay").classList.remove("visible");
});