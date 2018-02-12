let PersistableEntity = require('../data/PersistableEntity');

let exporting = {};

// Takes a number of words
exporting.possibleNameChars = "abcdefghijklmnopqrstuvwxyz";
exporting.randomWords = (num) => {
    let wordString = "";
    let firstWord = true;
    while (num > 0) {
        let length = Math.floor(Math.random() * 5) + 4;
        let stringArray = new Array(length);
        for (let i = 0; i < length; i++) {
            stringArray[i] = exporting.possibleNameChars.charAt(
                Math.floor(Math.random() * exporting.possibleNameChars.length));
        }
        if (firstWord) {
            stringArray[0] = stringArray[0].toUpperCase();
            firstWord = false;
        }
        wordString += stringArray.join("") + " ";
        num--;
    }
    return wordString;
};

exporting.createItems = (num, type) => {
    if (!(type.constructor === PersistableEntity.constructor)) {
        console.warn("Called Testing.createItems with non-persistable type.");
    }

    let returnItems = [];
    for (let i = 0; i < num; i++) {
        let obj = new type();
        obj.name = exporting.randomWords(2);
        obj.description = exporting.randomWords(15);
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop) && prop !== "id"){
                if(typeof obj[prop] === "number") {
                    obj[prop] = Math.floor(Math.random() * 30) + 40;
                } else if(obj[prop] instanceof Date){
                    obj[prop] = new Date(Date.now());
                }
            }
        }
        returnItems.push(obj);
    }

    return returnItems;
};

module.exports = exporting;