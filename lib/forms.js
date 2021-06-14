"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseFormModel = exports.getErrors = void 0;
var _ = require("lodash");
var class_transformer_1 = require("class-transformer");
var class_validator_1 = require("class-validator");
var helpers_1 = require("./helpers");
var getErrors = function (v) { return __awaiter(void 0, void 0, void 0, function () {
    var c, errors, out, recurse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                c = class_transformer_1.classToClass(v);
                return [4 /*yield*/, class_validator_1.validate(c)];
            case 1:
                errors = _a.sent();
                out = {};
                recurse = function (root, errors) {
                    for (var _i = 0, errors_1 = errors; _i < errors_1.length; _i++) {
                        var error = errors_1[_i];
                        var property = [root, error.property].filter(function (val) { return val != ""; }).join('.');
                        recurse(property, error.children);
                        var constraints = Object.values(error.constraints || {});
                        if (constraints.length > 0) {
                            // only shows the first constraint right now
                            out[property] = constraints[0];
                        }
                        else {
                            out[property] = "error";
                        }
                    }
                };
                recurse("", errors);
                return [2 /*return*/, out];
        }
    });
}); };
exports.getErrors = getErrors;
var BaseFormModelConfigDefaults = {
    validator: undefined,
    data: {},
    keys: []
};
var BaseFormModel = /** @class */ (function () {
    function BaseFormModel(config) {
        var _this = this;
        this.onChange = function (key) {
            /**
             * returns a function to be called upon change
             *
             * should be used like so
             *
             * <input onChange={form.onChange("data.id")}/>
             */
            // takes name of the input and sets the value of this.data[name] = input
            return function (e) {
                // e can be Event, string, number...
                var value = undefined;
                if (e.constructor.name === "Event")
                    value = e.target.value;
                else
                    value = e;
                _.set(_this.data, key, value);
                _this.validateDebounce();
            };
        };
        this.convert = function (obj, map, castMap) {
            /**
             * @param obj: object to be converted
             * @param map maps keys of obj to keys of 'desired object' shape
             * @param castMap maps keys of 'desired object' to a cast function (to type cast)
             */
            // convert(obj, map) to call _.
            // console.log(obj, map, castMap)
            var out = {};
            var keys = helpers_1.nestedKeys(obj);
            // console.log("KEYS", keys)
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                var kout = map[key] || key;
                var cast = castMap[kout];
                // console.log()
                var rawVal = _.get(obj, key);
                var val = cast ? cast(rawVal) : rawVal;
                _.set(out, kout, val);
                // console.log(key, kout, val)
            }
            return out;
        };
        this.validate = function () { return __awaiter(_this, void 0, void 0, function () {
            var data, v, errors;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // use toDB because the validator is based on the toDB Value
                        if (this.validator == undefined) {
                            // if you can't validate form
                            // i.e. public user info form
                            this.state = 'valid';
                            return [2 /*return*/];
                        }
                        data = _.cloneDeep(this.payload);
                        v = new this.validator();
                        Object.assign(v, data);
                        return [4 /*yield*/, exports.getErrors(v)];
                    case 1:
                        errors = _a.sent();
                        this.errors = this.convert(errors, this.inMap, {});
                        this.state = Object.keys(this.errors).length == 0 ? 'valid' : 'invalid';
                        // console.log("validate", data, errors, this.isValid)
                        return [2 /*return*/, this.state];
                }
            });
        }); };
        this.validateDebounce = _.debounce(this.validate, 200, { leading: true });
        this.config = helpers_1.initConfig(BaseFormModelConfigDefaults, config);
        this.data = this.config.data;
        this.validator = this.config.validator;
        this.keys = this.config.keys;
    }
    Object.defineProperty(BaseFormModel.prototype, "keyMap", {
        get: function () {
            /**
             * map of form data keys to payload data keys
             */
            // this insures that keys not specified in config.keys is included
            // const out = _.zipObject(Object.keys(this.data), Object.keys(this.data))
            var out = {};
            this.keys.forEach(function (key) {
                var k1 = key[0];
                var k2 = key[1];
                var k1out;
                var k2out;
                if (typeof k1 === 'object')
                    k1out = k1.key;
                else
                    k1out = k1;
                if (typeof k2 === 'object')
                    k2out = k2.key;
                else
                    k2out = k2;
                // if(k1out in out) delete out[k1out] // remove 
                // if(typeof v1 === 'object') {
                // const cast = v1.cast
                // if(cast === undefined) v1 = v1.key
                // else v1 = cast(v1.key) 
                // }
                // else v2 = v1
                out[k1out] = k2out;
            });
            return out;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseFormModel.prototype, "inMap", {
        get: function () {
            /**
             * to map in coming data
             *
             * form data structure -> payload data structure
             */
            return _.invert(this.keyMap);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseFormModel.prototype, "outMap", {
        get: function () {
            /**
             * to map out going data
             *
             * payload data structure -> form data structure
             */
            return this.keyMap;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseFormModel.prototype, "inCast", {
        get: function () {
            var out = {};
            this.keys.forEach(function (key) {
                var k = key[0];
                // const k2 = key[1]
                if (typeof k === 'object' && k.cast !== undefined)
                    out[k.key] = k.cast;
            });
            return out;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseFormModel.prototype, "outCast", {
        get: function () {
            var out = {};
            this.keys.forEach(function (key) {
                var k = key[1];
                if (typeof k === 'object' && k.cast !== undefined)
                    out[k.key] = k.cast;
            });
            return out;
        },
        enumerable: false,
        configurable: true
    });
    BaseFormModel.prototype.get = function (key) {
        /**
         * get value from data by the key
         *
         * this allows for nested values to be referenced with period deliminated stirngs
         * i.e. "user.name", "resources.cpu.percent"
         */
        return _.get(this.data, key);
    };
    Object.defineProperty(BaseFormModel.prototype, "payload", {
        get: function () {
            /**
             * This should return in the data formatted in the 'backend' data structure
             *
             */
            return this.convert(this.data, this.outMap, this.outCast);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseFormModel.prototype, "isValid", {
        get: function () {
            return this.state === 'valid';
        },
        enumerable: false,
        configurable: true
    });
    return BaseFormModel;
}());
exports.BaseFormModel = BaseFormModel;
