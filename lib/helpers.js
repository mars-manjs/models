"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicClass = exports.initConfig = exports.nestedKeys = void 0;
var _ = require("lodash/fp");
// lodash fp provides immutable methods
// _.merge needs to not change the objects
var nestedKeys = function (obj) {
    var keys = [];
    Object.keys(obj).forEach(function (key) {
        if (typeof obj[key] === "object" && obj[key]) {
            exports.nestedKeys(obj[key]).forEach(function (innerKey) {
                keys.push(key + "." + innerKey);
            });
        }
        else {
            keys.push(key);
        }
    });
    return keys;
};
exports.nestedKeys = nestedKeys;
var initConfig = function (defaultConfig, config) {
    return _.merge(defaultConfig, config);
};
exports.initConfig = initConfig;
var _DynamicClass = /** @class */ (function () {
    function _DynamicClass(data) {
        var _this = this;
        this._data = data;
        Object.keys(data).forEach(function (key) { return Object.defineProperty(_this, key, { get: function () { return _this._data[key]; } }); });
    }
    return _DynamicClass;
}());
exports.DynamicClass = _DynamicClass;
