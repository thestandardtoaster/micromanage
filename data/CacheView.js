const Mustache = require('mustache');

let exporting = class CacheView {
    constructor(parent, template, predicate, ...types) {
        this.parent = parent;
        this.template = template;
        this.predicate = predicate;
        this.types = types;

        // this.items = map<datatype, DOM element>
        this.items = new Map();
        this.comparator = () => 0;
    }

    setOnClick(func) {
        this.onclick = func;
    }

    hasType(type) {
        return this.types.includes(type);
    }

    clear() {
        this.items.clear();
    }

    contains(item) {
        return this.items.has(item);
    }

    addItem(item) {
        let domElement = CacheView.runTemplate(this.template, item);
        if(this.onclick !== undefined){
            domElement.addEventListener("click", () => {
                this.onclick(domElement.data);
            });
        }
        this.items.set(item, domElement);
        this.render();
    }

    addItems(items) {
        items.forEach(item => {
            this.items.set(item, CacheView.runTemplate(this.template, item));
        });
        this.render();
    }

    removeItem(element) {
        this.parent.removeChild(element);
        this.items.delete(element);
    }

    render() {
        let frag = new DocumentFragment();
        let toAdd = Array.from(this.items.keys()).sort(this.comparator).filter(this.predicate);
        toAdd.forEach(item => frag.appendChild(this.items.get(item)));

        // remove any existing elements
        while (this.parent.firstChild) {
            this.parent.removeChild(this.parent.firstChild);
        }

        this.parent.appendChild(frag);
    }

    static addTemplates(...templates) {
        if (this.templates === undefined) {
            this.templates = new Map();
        }
        templates.forEach(adding => {
            let addingElement = document.querySelector("#" + adding);
            this.templates.set(adding, addingElement.innerHTML);
            Mustache.parse(this.templates.get(adding));
        });
    }

    static runTemplate(templateName, object) {
        if (!this.templates.has(templateName)) {
            throw Error("Template " + templateName + " not added to cache.");
        }
        if (this.parser === undefined) {
            this.parser = new DOMParser();
        }
        let template = this.templates.get(templateName);
        let obj = this.parser.parseFromString(Mustache.render(template, object), "text/html");
        obj = obj.getElementsByTagName("body")[0].firstChild;
        obj.data = object;
        return obj;
    }
};

module.exports = exporting;
