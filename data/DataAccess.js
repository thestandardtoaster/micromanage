const fs = require('fs');
const Dexie = require('dexie');
const PersistableEntity = require("./PersistableEntity.js");

class DataAccess {
    constructor() {
        this.ready = false;
        this.db = new Dexie('micromanage');
        this.onReady = [];
        fs.readFile('./backend/dbstructure.json', 'utf-8', (error, data) => {
            if (error) {
                console.error("Unable to load database format:" + error.stack);
            } else {
                try {
                    this.db.version(1).stores(JSON.parse(data));
                    this.db.open().catch(error => {
                        console.error("Unable to open database " + error.stack);
                    }).finally(() => {
                        this.ready = true;
                        this.onReady.forEach(item => item.call());
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

    registerType(type, table) {
        if (this.tableMap.has(type)) {
            console.warn("Duplicate datatype registration attempted for type " + type);
            return;
        }
        this.tableMap.set(type, table);
    }

    setOnReady(func) {
        if (this.ready) {
            func();
        } else {
            this.onReady.push(func);
        }
    }

    save(persistable) {
        if (!(persistable instanceof PersistableEntity)) {
            throw new TypeError("Attempted to save object of non-persistable type " + persistable.constructor + ".");
        }
        let object = persistable._construct();

        let table = this.tableMap.get(persistable.constructor);
        return this.db.transaction('rw', table, function () {
            table.add(object);
        }).then(function () {
            console.log(persistable.constructor.type + " " + persistable.name + " added to db.");
        }).catch(error => {
            console.log(persistable.constructor.type + " " + persistable.name + " not added to db. \n" + error.stack);
        });
    }

    delete(persistable) {
        if (!(persistable instanceof PersistableEntity)) {
            throw new TypeError("Attempted to delete object of non-persistable type " + persistable.constructor + ".");
        }

        let table = this.tableMap.get(persistable.constructor);
        return this.db.transaction('rw', table, function () {
            table.delete(table.get({name: persistable.name}));
        }).then(function () {
            console.log(persistable.constructor.type + " " + persistable.name + " deleted from db.");
        }).catch(error => {
            console.log(persistable.constructor.type + " " + persistable.name + " not deleted from db. \n" + error.stack);
        });
    }

    forAllOfType(type, operation) {
        let table = this.tableMap.get(type);
        if (table !== undefined) {
            this.db.transaction('r', table, () => {
                table.each(operation);
            });
        }
    }
}

const _dataAccessInstance = DataAccess.getSingleton();

module.exports = _dataAccessInstance;