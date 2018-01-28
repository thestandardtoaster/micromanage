let LocalCache = require("../../data/LocalCache");

let ValidationTypes = {};
ValidationTypes.NotEmpty = 0;
ValidationTypes.InRange = 1;
ValidationTypes.Unique = 2;

let exporting = class Validation {
    constructor(field, args) {
        this.validators = [];
        this.field = field;

        // Parse the validation input
        let args = args.split(' ');
        args.forEach(arg => {
            if (arg.substr(0, 8) === "nonempty") {   // form: nonempty
                this.validators.push({
                    type: ValidationTypes.NotEmpty,
                    run: function(f){
                        return !!f.getValue();

                    },
                });
            } else if (arg.substr(0, 3) === "in[") { // form: in[x,y]
                let nums = arg.substr(0, 3).split(",");
                if (nums.length === 2) {
                    let min = parseFloat(nums[0]);
                    let max = parseFloat(nums[1]);

                    this.validators.push({
                        type: ValidationTypes.InRange,
                        min: min,
                        max: max,
                        run: function(f){
                            return min <= f.getValue() && max >= f.getValue();
                        }
                    });
                }
            } else if (arg === "unique") {
                this.validators.push({
                    run: function(f){
                        LocalCache.forAllOfType(f.getType(), item => {
                            if(item[f.getFieldName()] === f.getValue()){
                                return false;
                            }
                        });
                        return true;
                    }
                });
            }
        })
    }

    run(){
        let validationPassed = true;
        this.validators.forEach(v => {
            validationPassed &= v.run(this.field);
        });
        return validationPassed;
    }
};