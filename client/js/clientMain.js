// Libs
const {remote, ipcRenderer} = require('electron');

Date.prototype.sameDay = function (other) {
    return this.getUTCFullYear() === other.getUTCFullYear() &&
        this.getUTCMonth() === other.getUTCMonth() &&
        this.getUTCDate() === other.getUTCDate();
};

// Datatypes
const {MicroEvent, MicroProject, MicroTask} = require('../data/datatypes');
const MicroForm = require('./js/MicroForm');
const DataAccess = require('../data/DataAccess');
const LocalCache = require('../data/LocalCache');
const CacheView = require('../data/CacheView');

let typeFormMap = new Map();
let currentDay = new Date(Date.now());
let taskView = new CacheView(document.querySelector("#taskList"),
    "taskTemplate", task => {
        return task.date.sameDay(currentDay);
    }, MicroTask);
taskView.comparator = (a, b) => a.name.localeCompare(b.name); // sort by name
taskView.setOnClick(data => {
    alert(data.name + " " + data.description + " " + data.getFriendlyDuration());
});

const win = remote.getCurrentWindow();

function addListeners() {
    let minimizeBtn = document.getElementById("minBtn");
    minimizeBtn.onclick = () => {
        win.minimize();
    };
    let maximizeBtn = document.getElementById("maxBtn");

    maximizeBtn.onclick = () => {
        if (!win.isMaximized()) {
            win.maximize();
        } else {
            win.unmaximize();
        }
    };
    let closeBtn = document.getElementById("closeBtn");

    closeBtn.onclick = () => {
        win.close();
    };
    let addBtn = document.getElementById("addBtn");

    let addOverlay = document.getElementById("addOverlay");
    addBtn.onclick = e => {
        if (addOverlay.classList.contains("visible")) {
            addOverlay.classList.remove("visible");
        } else if (document.querySelectorAll(".overlay.visible > .overlayForm").length < 1) {
            addOverlay.classList.add("visible");
        }
    };
    addOverlay.onclick = e => {
        addOverlay.classList.remove("visible");
    };

    let types = [MicroTask, MicroProject];

    types.forEach(type => {
        let typeItemBase = "#add" + type.typeName.charAt(0).toUpperCase() + type.typeName.slice(1);
        let typeItem = document.querySelector(typeItemBase + "Item");
        let typeForm = document.querySelector(typeItemBase + "Form");
        // might as well build the map here, because it's the first place we query for these
        typeFormMap.set(type, new MicroForm(typeForm, type));
        typeItem.onclick = e => {
            e.stopPropagation();
            addOverlay.classList.remove("visible");
            typeFormMap.get(type).show();
        }
    });
}

DataAccess.setOnReady(() => {
    // Pre-load mustache templates
    LocalCache.registerTypes(MicroProject, MicroTask);
    CacheView.addTemplates("taskTemplate");
    LocalCache.addView(taskView);
    LocalCache.updateViews();

    addListeners();

    // Done with loading, hide the loading overlay
    document.querySelector(".loadingOverlay").classList.remove("visible");
});