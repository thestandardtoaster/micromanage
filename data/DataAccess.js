const fs = require('fs');
const Dexie = require('dexie');
const PersistableEntity = require("../data/persistableEntity.js");

class DataAccess {
    constructor() {
        this.ready = false;
        this.db = new Dexie('micromanage');
        fs.readFile('./backend/dbstructure.json', 'utf-8', (error, data) => {
            if (error) {
                console.error("Unable to load database format:" + error.stack);
            } else {
                try {
                    this.db.version(1).stores(JSON.parse(data));
                    this.db.open().then(() => {
                        this.ready = true;
                        if (this.onReady !== undefined) {
                            this.onReady();
                        }
                    });
                } catch (error) {
                    console.error("Unable to set database format:" + error.stack);
                }
            }
        });

        this.tableMap = new Map();
    };

    static getSingleton() {
        if (this.instance === undefined) {
            this.instance = new DataAccess();
        }
        return this.instance;
    }

    getDatabase() {
        return this.db;
    }

    registerTable(type, table) {
        this.tableMap.set(type, table);
    }

    setOnReady(func) {
        this.onReady = func;
        if (this.ready) {
            this.onReady();
        }
    }

    save(persistable) {
        if (!(persistable instanceof PersistableEntity)) {
            console.error("Attempted to save object of non-persistable type " + persistable.type + ".");
            return false;
        }
        let object = persistable._construct();
        let valid = undefined;

        let table = this.tableMap.get(persistable.type);
        this.db.transaction('rw', table, function () {
            table.add(object);
        }).then(function () {
            console.log(persistable.type + " " + persistable.name + " added to db.");
            valid = true;
        }).catch(error => {
            console.log(persistable.type + " " + persistable.name + " not added to db; \n" + error.stack);
            valid = false;
        });
        return valid;
    }
}

const _dataAccessInstance = DataAccess.getSingleton();

module.exports = _dataAccessInstance;