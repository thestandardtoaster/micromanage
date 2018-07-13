import Dexie from "dexie";

const fs = require('fs');

import PersistableEntity from 'data/PersistableEntity';
import LocalCache from 'data/LocalCache';

class DataAccess {
    ready: boolean;
    db: Dexie;
    onReady: (() => void)[];
    tableMap: Map<string, Dexie.Table<any, any>>;
    Promise: typeof Dexie.Promise;

    static instance: DataAccess;

    constructor() {
        this.ready = false;
        this.db = new Dexie('micromanage');
        this.onReady = [];
        fs.readFile('./backend/dbstructure.json', 'utf-8', (error: Error, data: string) => {
            if (error) {
                console.error("Unable to load database format:" + error.stack);
            } else {
                try {
                    this.db.version(1).stores(JSON.parse(data));
                    this.db.open().catch(error => {
                        console.error("Unable to open database " + error.stack);
                    }).finally(() => {
                        this.ready = true;
                        this.onReady.forEach(item => item());
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

    registerType(type: string, table: Dexie.Table<any, any>) {
        if (this.tableMap.has(type)) {
            console.warn("Duplicate datatype registration attempted for type " + type);
            return;
        }
        this.tableMap.set(type, table);
    }

    setOnReady(func: () => void) {
        if (this.ready) {
            func();
        } else {
            this.onReady.push(func);
        }
    }

    save(persistable: PersistableEntity) {
        let object = persistable._construct();

        let table = this.tableMap.get(typeof persistable);
        return this.db.transaction('rw', table, function () {
            table.add(object);
        }).then(function () {
            console.log(persistable.constructor.name + " " + persistable.name + " added to db.");
        }).catch(error => {
            console.log(persistable.constructor.name + " " + persistable.name + " not added to db. \n" + error.stack);
        }).finally(() => {
            LocalCache.add(persistable);
        });
    }

    saveAll(persistables: PersistableEntity[]) {
        if (persistables.length > 0) {
            let toAdd: object[] = [];
            persistables.forEach(p => {
                toAdd.push(p._construct());
            });

            let table = this.tableMap.get(typeof persistables[0]);
            return this.db.transaction('rw', table, function () {
                table.bulkAdd(toAdd);
            }).then(function () {
                console.log(persistables.length + " " + persistables[0].constructor.name + "s added to db.");
            }).catch(error => {
                console.log("Error adding " + persistables.length + " " + persistables[0].constructor.name + "s to db. \n" + error.stack);
            }).finally(() => {
                LocalCache.addItems(persistables);
            });
        }
    }

    delete(persistable: PersistableEntity) {
        let table = this.tableMap.get(typeof persistable);
        return this.db.transaction('rw', table, function () {
            table.delete(table.get({name: persistable.name}));
        }).then(function () {
            console.log(typeof persistable + " " + persistable.name + " deleted from db.");
        }).catch(error => {
            console.log(typeof persistable + " " + persistable.name + " not deleted from db. \n" + error.stack);
        }).finally(() => {
            LocalCache.removeItem(persistable);
        })
    }

    forAllOfType(type: string, operation: (obj: PersistableEntity) => void) {
        let table = this.tableMap.get(type);
        if (table !== undefined) {
            return this.db.transaction('r', table, () => {
                table.each(obj => {
                    operation(Object.create(obj));
                });
            });
        }
        // If no operation happened, return an empty promise
        return Dexie.Promise.resolve(0);
    }

    populateType(type: string) {
        let collected: PersistableEntity[] = [];
        return this.forAllOfType(type, obj => {
            collected.push(Object.create(obj));
        }).finally(() => {
            LocalCache.addItems(collected);
        });
    }
}

const _dataAccessInstance = DataAccess.getSingleton();
_dataAccessInstance.Promise = Dexie.Promise;

export default _dataAccessInstance;