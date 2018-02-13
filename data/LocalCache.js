const PersistableEntity = require('./PersistableEntity');

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

    add(obj) {
        if (!(obj instanceof PersistableEntity)) {
            throw new TypeError("Attempt to cache non-persistable object.");
        }
        let cache = this.typeCacheMap.get(obj.constructor);
        if (cache === undefined) {
            this.typeCacheMap.set(obj.constructor, []);
            cache = this.typeCacheMap.get(obj.constructor);
        }
        if (!cache.includes(obj)) {
            cache.push(obj);
        }

        this.viewsOfType(obj.constructor).forEach(view => {
            view.addItem(obj);
        });
    }

    addItems(objs) { // NOTE: All objects should be the same type
        if(objs.length > 0){
            let cache = this.typeCacheMap.get(objs[0].constructor);
            if (cache === undefined) {
                this.typeCacheMap.set(objs[0].constructor, []);
                cache = this.typeCacheMap.get(objs[0].constructor);
            }
            objs.forEach(obj => {
                if (!(obj instanceof PersistableEntity)) {
                    throw new TypeError("Attempt to cache non-persistable object.");
                }
                if(!cache.includes(obj)){
                    cache.push(obj);
                }
            });

            this.viewsOfType(objs[0].constructor).forEach(view => {
                view.addItems(objs);
            });
        }
    }

    removeItem(obj) {
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
        if (index = this.views.indexOf(view) > 0) {
            view.types.forEach(type => this.views[index].addItems(this.typeCacheMap.get(type)));
        }
    }

    forAllOfType(type, action) {
        if(this.typeCacheMap.has(type)){
            this.typeCacheMap.get(type).forEach(action);
        }
    }
}

let exporting = LocalCache.getSingleton();

module.exports = exporting;