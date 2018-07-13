import PersistableEntity from 'data/PersistableEntity';
import CacheView from 'data/CacheView';

class _LocalCache {
    typeCacheMap: Map<string, Array<PersistableEntity>>;
    views: CacheView[];
    static instance: _LocalCache;

    constructor() {
        this.typeCacheMap = new Map();
        this.views = [];
    }

    static getSingleton() {
        if (this.instance === undefined) {
            this.instance = new _LocalCache();
        }
        return this.instance;
    }

    add(obj: PersistableEntity) {
        let cache = this.typeCacheMap.get(typeof obj);
        if (cache === undefined) {
            this.typeCacheMap.set(typeof obj, []);
            cache = this.typeCacheMap.get(typeof obj);
        }
        if (!cache.includes(obj)) {
            cache.push(obj);
        }

        this.viewsOfType(typeof obj).forEach(view => {
            view.addItem(obj);
        });
    }

    addItems(objs: PersistableEntity[]) { // NOTE: All objects should be the same type
        if (objs.length > 0) {
            let cache = this.typeCacheMap.get(typeof objs[0]);
            if (cache === undefined) {
                this.typeCacheMap.set(typeof objs[0], []);
                cache = this.typeCacheMap.get(typeof objs[0]);
            }
            objs.forEach(obj => {
                if (!cache.includes(obj)) {
                    cache.push(obj);
                }
            });

            this.viewsOfType(typeof objs[0]).forEach(view => {
                view.addItems(objs);
            });
        }
    }

    removeItem(obj: PersistableEntity) {
        let cache = this.typeCacheMap.get(typeof obj);
        if (cache !== undefined) {
            cache.splice(cache.indexOf(obj), 1);

            this.viewsOfType(typeof obj).forEach(view => {
                view.removeItem(obj);
            });
        }
    }

    viewsOfType(type: string) {
        return this.views.filter(view => view.hasType(type));
    }

    addView(view: CacheView) {
        this.views.push(view);
        this.populateView(view);
        view.render();
    }

    updateViews() {
        this.views.forEach(view => view.render());
    }

    populateView(view: CacheView) {
        let index: number;
        if ((index = this.views.indexOf(view)) > 0) {
            view.types.forEach(type => this.views[index].addItems(this.typeCacheMap.get(typeof type)));
        }
    }

    forAllOfType(type: string, action: (obj: PersistableEntity) => void) {
        if (this.typeCacheMap.has(type)) {
            this.typeCacheMap.get(type).forEach(action);
        }
    }
}

let LocalCache = _LocalCache.getSingleton();

export default LocalCache;