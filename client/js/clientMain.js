// Libs
const {remote} = require('electron');

Date.prototype.sameDay = function(a) {
    return this.getUTCFullYear() === a.getUTCFullYear() &&
        this.getUTCMonth() === a.getUTCMonth() &&
        this.getUTCDate() === a.getUTCDate();
};

// Datatypes
const MicroForm = require('./js/MicroForm');
const DataAccess = require('../data/DataAccess');
const LocalCache = require('../data/LocalCache');
const CacheView = require('../data/CacheView');

let typeFormMap = new Map();
let currentDay = new Date(Date.now());
let taskView = new CacheView(document.querySelector("#taskList"),
    "taskTemplate", () => true, MicroTask);
taskView.comparator = (a, b) => a.name.localeCompare(b.name); // sort by name
taskView.setOnClick(data => {
    Overlays.show(data.constructor.formName, data);
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

    datatypes.forEach(type => {
        let typeForm = document.querySelector('[data-overlayname="' + type.typeName.toLowerCase() + 'Form"]');
        if(typeForm !== null){
            typeFormMap.set(type, new MicroForm(typeForm, type));
        }
    });
}

DataAccess.setOnReady(() => {
    // Pre-load mustache templates
    CacheView.addTemplates("taskTemplate");
    LocalCache.addView(taskView);
    LocalCache.updateViews();

    addListeners();

    console.time("Data population");
    let populate = DataAccess.populateType();
    datatypes.forEach(type => {
        populate = populate.then(() => {return DataAccess.populateType(type)});
    });
    populate.finally(() => {
        // Done with loading, hide the loading overlay
        document.querySelector(".loadingOverlay").classList.remove("visible");
        console.timeEnd("Data population");
    });
});