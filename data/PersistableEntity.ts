export default class PersistableEntity {
    name: string;
    description: string;
    id: number;
    static typeName : string = "Persistable";
    static formName : string = "nah";

    constructor(name: string, description: string) {
        this.name = name;
        this.description = description;
        this.id = -1;
    }

    _construct() {
        return {
            name: this.name,
            description: this.description
        };
    }
};