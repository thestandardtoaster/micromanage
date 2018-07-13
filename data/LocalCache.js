"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PersistableEntity_1 = require("data/PersistableEntity");
var _LocalCache = /** @class */ (function () {
    function _LocalCache() {
        // typeCacheMap = <type : array<instance of type>>
        this.typeCacheMap = new Map();
        this.views = [];
    }
    _LocalCache.getSingleton = function () {
        if (this.instance === undefined) {
            this.instance = new _LocalCache();
        }
        return this.instance;
    };
    _LocalCache.prototype.add = function (obj) {
        if (!(obj instanceof PersistableEntity_1.default)) {
            throw new TypeError("Attempt to cache non-persistable object.");
        }
        var cache = this.typeCacheMap.get(obj.constructor);
        if (cache === undefined) {
            this.typeCacheMap.set(obj.constructor, []);
            cache = this.typeCacheMap.get(obj.constructor);
        }
        if (!cache.includes(obj)) {
            cache.push(obj);
        }
        this.viewsOfType(obj.constructor).forEach(function (view) {
            view.addItem(obj);
        });
    };
    _LocalCache.prototype.addItems = function (objs) {
        if (objs.length > 0) {
            var cache_1 = this.typeCacheMap.get(objs[0].constructor);
            if (cache_1 === undefined) {
                this.typeCacheMap.set(objs[0].constructor, []);
                cache_1 = this.typeCacheMap.get(objs[0].constructor);
            }
            objs.forEach(function (obj) {
                if (!(obj instanceof PersistableEntity_1.default)) {
                    throw new TypeError("Attempt to cache non-persistable object.");
                }
                if (!cache_1.includes(obj)) {
                    cache_1.push(obj);
                }
            });
            this.viewsOfType(objs[0].constructor).forEach(function (view) {
                view.addItems(objs);
            });
        }
    };
    _LocalCache.prototype.removeItem = function (obj) {
        var cache = this.typeCacheMap.get(obj.constructor);
        if (cache !== undefined) {
            cache.remove(obj);
            this.viewsOfType(obj.constructor).forEach(function (view) {
                view.removeItem(obj);
            });
        }
    };
    _LocalCache.prototype.viewsOfType = function (type) {
        return this.views.filter(function (view) { return view.hasType(type); });
    };
    _LocalCache.prototype.addView = function (view) {
        this.views.push(view);
        this.populateView(view);
        view.render();
    };
    _LocalCache.prototype.updateViews = function () {
        this.views.forEach(function (view) { return view.render(); });
    };
    _LocalCache.prototype.populateView = function (view) {
        var _this = this;
        var index;
        if (index = this.views.indexOf(view) > 0) {
            view.types.forEach(function (type) { return _this.views[index].addItems(_this.typeCacheMap.get(type)); });
        }
    };
    _LocalCache.prototype.forAllOfType = function (type, action) {
        if (this.typeCacheMap.has(type)) {
            this.typeCacheMap.get(type).forEach(action);
        }
    };
    return _LocalCache;
}());
var LocalCache = _LocalCache.getSingleton();
exports.default = LocalCache;
