import LocalCache from 'data/LocalCache.js';
import Field from 'client/Field';

enum ValidationType {
    NotEmpty = 0,
    InRange,
    Unique
}

export default class Validation {
    validators: {
        type: ValidationType,
        min?: number,
        max?: number,
        run: (f: Field) => {
            valid: boolean,
            message: string,
        }
    }[];
    field: Field;

    constructor(field: Field, args: string) {
        this.validators = [];
        this.field = field;

        // Parse the validation input
        let argsSplit = args.split(' ');
        argsSplit.forEach(arg => {
            if (arg.substr(0, 8) === "notempty") {   // format: notempty
                this.validators.push({
                    type: ValidationType.NotEmpty,
                    run: function (f: Field) {
                        let valid = !f.isEmpty();
                        let message = "";
                        if (!valid) {
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
                        type: ValidationType.InRange,
                        min: min,
                        max: max,
                        run: function (f: Field) {
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
                    type: ValidationType.Unique,
                    run: function (f: Field) {
                        let valid = true;
                        LocalCache.forAllOfType(f.getType(), item => {
                            valid = valid && !(item[f.getFieldName()] === f.getValue());
                        });

                        let message = "";
                        if (!valid) {
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
        let messages: string[] = [];
        this.validators.forEach(v => {
            let result = v.run(this.field);
            validationPassed = validationPassed && result.valid;
            messages.push(result.message);
        });
        return {
            valid: validationPassed,
            messages: messages.join("\n"),
        };
    }
};