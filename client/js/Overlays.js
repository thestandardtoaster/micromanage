class Overlays {
    constructor(){
        this.overlays = new Map();
        this.initialized = false;
    }

    initialize(root){
        if(!this.initialized){
            this.root = root;

            let overlayElements = Array.from(root.children).filter(c => {
                return c.hasAttribute("data-overlayname");
            });
            overlayElements.forEach(element => {
                this.overlays.set(element.getAttribute("data-overlayname"), element);
            });

            for(let element of this.overlays.entries()){
                element[1].classList.remove("visible");
            }

            this.currentOverlay = "";
            this.initialized = true;
            this.root.onclick = (e) => {
                if(e.target === this.root){
                    this.hide();
                }
            }
        }
    }

    static getSingleton(){
        if(this.instance === undefined){
            this.instance = new Overlays();
        }

        return this.instance;
    }

    show(name, obj){
        if(!this.initialized){
            throw new Error("Overlays was not initialized.");
        }

        if(this.currentOverlay !== ""){
            this.overlays.get(this.currentOverlay).classList.remove("visible");
        }

        let overlay = this.overlays.get(name);
        if(overlay !== undefined){
            overlay.classList.add("visible");
            this.currentOverlay = name;
            if(!this.root.classList.contains("visible")){
                this.root.classList.add("visible");
            }

            this.populate(overlay, obj);
        }
        if(overlay === ""){
            this.root.classList.remove("visible");
        }
    }

    hide(){
        for(let element of this.overlays.entries()){
            element[1].classList.remove("visible");
        }

        this.root.classList.remove("visible");

        this.currentOverlay = "";
    }

    populate(element, obj){
        if(obj === undefined){
            return;
        }

        let fieldname = element.getAttribute("data-fieldname");
        if(fieldname !== undefined && obj.hasOwnProperty(fieldname)){
            if(element.nodeName === "INPUT" || element.nodeName === "TEXTAREA"){
                if(obj[fieldname] instanceof Date){
                    element.value = obj[fieldname].toISOString().substring(0, 10);
                } else {
                    element.value = obj[fieldname];
                }
            } else {
                element.textContent += obj[fieldname];
            }
        }

        let children = Array.from(element.children);
        children.forEach(c => {
            this.populate(c, obj);
        });
    }
}

module.exports = Overlays.getSingleton();