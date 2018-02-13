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
                        let valid = !f.isEmpty();
                        let message = "";
                        if(!valid){
                            message = "Field " + f.getFriendlyName().toLowerCase() + " cannot be empty.";
                        }
                        return {
                            valid: valid,
                            message: message,
                        };
                    },
                });
            } else if (arg.substr(0, 3) === "in[") { // format: in[x,y]
                let nums = arg.substr(3).split(",");
                if (nums.length === 2) {
                    let min = parseFloat(nums[0]);
                    let max = parseFloat(nums[1]);

                    this.validators.push({
                        type: ValidationTypes.InRange,
                        min: min,
                        max: max,
                        run: function (f) {
                            let valid = min <= f.getValue() && max >= f.getValue();
                            let message = "";
                            if (!valid) {
                                message = "Field " + f.getFriendlyName().toLowerCase() + " isn't in range [" + min + ", " + max + "].";
                            }
                            return {
                                valid: valid,
                                message: message,
                            }
                        }
                    });
                }
            } else if (arg === "unique") {           // format: unique
                this.validators.push({
                    run: function (f) {
                        let valid = true;
                        LocalCache.forAllOfType(f.getType(), item => {
                            valid &= !(item[f.getFieldName()] === f.getValue());
                        });

                        let message = "";
                        if(!valid){
                            message = f.getType().typeName + " '" + f.getValue() + "' already exists.";
                        }
                        return {
                            valid: valid,
                            message: message,
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