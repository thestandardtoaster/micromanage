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
            if (arg.substr(0, 8) === "notempty") {   // format: notempty
                this.validators.push({
                    type: ValidationTypes.NotEmpty,
                    run: function (f) {
                        return {
                            valid: !f.isEmpty(),
                            message: "Field " + f.getFriendlyName().toLowerCase() + " cannot be empty.",
                        };
                    },
                });
            } else if (arg.substr(0, 3) === "in[") { // format: in[x,y]
                let nums = arg.substr(0, 3).split(",");
                if (nums.length === 2) {
                    let min = parseFloat(nums[0]);
                    let max = parseFloat(nums[1]);

                    this.validators.push({
                        type: ValidationTypes.InRange,
                        min: min,
                        max: max,
                        run: function (f) {
                            return {
                                valid: min <= f.getValue() && max >= f.getValue(),
                                message: "Field " + f.getFriendlyName().toLowerCase() + " isn't in range [" + min + ", " + max + "].",
                            }
                        }
                    });
                }
            } else if (arg === "unique") {           // format: unique
                this.validators.push({
                    run: function (f) {
                        let result = true;
                        LocalCache.forAllOfType(f.getType(), item => {
                            result &= !(item[f.getFieldName()] === f.getValue());
                        });
                        return {
                            valid: result,
                            message: f.getType().typeName + " " + f.getFriendlyName().toLowerCase() + " already exists.",
                        };
                    },
                });
            }
        })
    }

    run() {
        let validationPassed = true;
        let messages = [];
        this.validators.forEach(v => {
            let result = v.run(this.field);
            validationPassed &= result.valid;
            messages.push(result.message);
        });
        return {
            valid: validationPassed,
            messages: messages.join("\n"),
        };
    }
};

module.exports = exporting;