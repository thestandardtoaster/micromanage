const Mustache = require('mustache');

import PersistableEntity from "./PersistableEntity";

interface DataNode extends Node {
    data: PersistableEntity;
}

export default class CacheView {
    parent: HTMLElement;
    template: string;
    predicate: (obj: PersistableEntity) => boolean;
    types: string[];
    items: Map<PersistableEntity, DataNode>;
    comparator: (a: PersistableEntity, b: PersistableEntity) => number;

    static templates: Map<string, string>;
    static parser: DOMParser;

    constructor(parent: HTMLElement, template: string,
                predicate: (obj: PersistableEntity) => boolean,
                ...types: string[]) {
        this.parent = parent;
        this.template = template;
        this.predicate = predicate;
        this.types = types;

        this.items = new Map();
        this.comparator = () => 0;
    }

    hasType(type: string) {
        return this.types.includes(type);
    }

    clear() {
        this.items.clear();
    }

    contains(item: PersistableEntity) {
        return this.items.has(item);
    }

    addItem(item: PersistableEntity) {
        let domElement = CacheView.runTemplate(this.template, item);
        this.items.set(item, domElement);
        this.render();
    }

    addItems(items: PersistableEntity[]) {
        items.forEach(item => {
            this.items.set(item, CacheView.runTemplate(this.template, item));
        });
        this.render();
    }

    removeItem(item: PersistableEntity) {
        this.parent.removeChild(this.items.get(item));
        this.items.delete(item);
    }

    render() {
        let frag = new DocumentFragment();
        let toAdd = Array.from(this.items.keys()).filter(this.predicate).sort(this.comparator);
        toAdd.forEach(item => frag.appendChild(this.items.get(item)));

        // remove any existing elements
        while (this.parent.firstChild) {
            this.parent.removeChild(this.parent.firstChild);
        }

        this.parent.appendChild(frag);
    }

    static addTemplates(...templates: string[]) {
        if (this.templates === undefined) {
            this.templates = new Map();
        }
        templates.forEach(adding => {
            let addingElement = document.querySelector("#" + adding);
            this.templates.set(adding, addingElement.innerHTML);
            Mustache.parse(this.templates.get(adding));
        });
    }

    static runTemplate(templateName: string, object: PersistableEntity) {
        if (!this.templates.has(templateName)) {
            throw Error("Template " + templateName + " not added to cache.");
        }
        if (this.parser === undefined) {
            this.parser = new DOMParser();
        }
        let template = this.templates.get(templateName);
        let document = this.parser.parseFromString(Mustache.render(template, object), "text/html");
        let obj = <DataNode>document.getElementsByTagName("body")[0].firstChild;
        obj.data = object;
        return obj;
    }
};
