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
        args = args.split(' ');
        args.forEach(arg => {
            if (arg.substr(0, 8) === "notempty") {   // form: notempty
                this.validators.push({
                    type: ValidationTypes.NotEmpty,
                    run: function (f) {
                        return !f.isEmpty();
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
                        run: function (f) {
                            return min <= f.getValue() && max >= f.getValue();
                        },
                    });
                }
            } else if (arg === "unique") {           // form: unique
                this.validators.push({
                    run: function (f) {
                        let result = true;
                        LocalCache.forAllOfType(f.getType(), item => {
                            result &= !(item[f.getFieldName()] === f.getValue());
                        });
                        return result;
                    },
                });
            }
        })
    }

    run() {
        let validationPassed = true;
        this.validators.forEach(v => {
            validationPassed &= v.run(this.field);
        });
        return validationPassed;
    }
};

module.exports = exporting;