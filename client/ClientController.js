// Libs
console.time("Initialize");
const {remote} = require('electron');
import './client.html';

Date.prototype.sameDay = function (a) {
    return this.getUTCFullYear() === a.getUTCFullYear() &&
        this.getUTCMonth() === a.getUTCMonth() &&
        this.getUTCDate() === a.getUTCDate();
};

// Datatypess
import MicroForm from 'MicroForm';
import CacheView from 'CacheView';
import DataAccess from 'DataAccess';
import LocalCache from 'LocalCache';
import 'style.css';

let typeFormMap = new Map();
let currentDay = new Date(Date.now());
let taskView = new CacheView(document.querySelector("#taskList"),
    "taskTemplate", () => true, MicroTask);
taskView.comparator = (a, b) => a.name.localeCompare(b.name); // sort by name

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

    datatypes.forEach(type => {
        let typeForm = document.querySelector('[data-overlayname="' + type.typeName.toLowerCase() + 'Form"]');
        if (typeForm !== null) {
            typeFormMap.set(type, new MicroForm(typeForm, type));
        }
    });
}

console.timeEnd("Initialize");
DataAccess.setOnReady(() => {
    // Pre-load mustache templates
    CacheView.addTemplates("taskTemplate");
    LocalCache.addView(taskView);

    addListeners();

    console.time("Data population");
    let populate = DataAccess.populateType();
    datatypes.forEach(type => {
        populate = populate.then(() => {
            return DataAccess.populateType(type)
        });
    });
    populate.finally(() => {
        // Done with loading, hide the loading overlay
        document.querySelector(".loadingOverlay").classList.remove("visible");
        console.timeEnd("Data population");
    });
});