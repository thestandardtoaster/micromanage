const PersistableEntity = require('./PersistableEntity');
const DataAccess = require('./DataAccess');

class LocalCache {
    constructor() {
        // typeCacheMap = <type : array<instance of type>>
        this.typeCacheMap = new Map();
        this.views = [];
    }

    static getSingleton() {
        if (this.instance === undefined) {
            this.instance = new LocalCache();
        }
        return this.instance;
    }

    registerTypes(/* types */) {
        [...arguments].forEach(type => {
            this.typeCacheMap.set(type, []);
            DataAccess.forAllOfType(type, item => {
                this.add(type.copy(item));
            });
        });
    }

    add(obj) {
        if (!(obj instanceof PersistableEntity)) {
            throw new TypeError("Attempt to cache non-persistable object.");
        }
        let cache = this.typeCacheMap.get(obj.constructor);
        if (cache === undefined) {
            throw new Error("Attempt to cache object of unregistered type " + obj.constructor);
        }
        if (cache.indexOf(obj) < 0) {
            cache.push(obj);
        }

        this.viewsOfType(obj.constructor).forEach(view => {
            view.addItem(obj);
        });
    }

    removeObject(obj) {
        DataAccess.delete(obj);
        let cache = this.typeCacheMap.get(obj.constructor);
        if (cache !== undefined) {
            cache.remove(obj);
            this.viewsOfType(obj.constructor).forEach(view => {
                view.removeItem(obj);
            });
        }
    }

    viewsOfType(type) {
        return this.views.filter(view => view.hasType(type));
    }

    addView(view) {
        this.views.push(view);
        this.populateView(view);
        view.render();
    }

    updateViews() {
        this.views.forEach(view => view.render());
    }

    populateView(view) {
        let index;
        if(index = this.views.indexOf(view) > 0){
            view.types.forEach(type => this.views[index].addItems(this.typeCacheMap.get(type)));
        }
    }
}

let exporting = LocalCache.getSingleton();

module.exports = exporting;