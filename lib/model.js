"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.BaseDataCollectionModel = exports.BaseDataItemModel = exports.BaseDataModel = void 0;
var repo_1 = require("./repo");
var helpers_1 = require("./helpers");
var BaseDataModelConfigDefaults = {};
var BaseDataModel = /** @class */ (function () {
    function BaseDataModel(config) {
        var _this = this;
        // loadInit: config.loadInit
        this.loadRepos = function () {
            if (_this.config.repos === undefined)
                return;
            if (_this.config.repos instanceof repo_1.BaseRepository) {
                _this.repos = { main: _this.config.repos };
            }
            else if (_this.config.repos instanceof Object) {
                _this.repos = _this.config.repos;
            }
        };
        this.loadChildren = function () { return __awaiter(_this, void 0, void 0, function () {
            var children, promises, _i, _a, name_1, child, childClass, data, c;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        children = {};
                        if (this.config.children.prototype instanceof BaseDataModel
                            || this.config.children == BaseDataModel) {
                            children = { main: { model: this.config.children, key: undefined } };
                        }
                        else if (this.config.children instanceof Object) {
                            children = this.config.children;
                        }
                        promises = [];
                        for (_i = 0, _a = Object.keys(children); _i < _a.length; _i++) {
                            name_1 = _a[_i];
                            child = children[name_1];
                            childClass = child.model;
                            data = child.key ? this.data[child.key] : undefined;
                            c = new childClass({
                                data: data,
                                parent: this
                            });
                            this.children[name_1] = c;
                            if (this.config.async)
                                promises.push(c.load());
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.loadForms = function () {
            if (_this.config.forms === undefined)
                return;
            _this.forms = _this.config.forms;
            // for (const key of Object.keys(this.config.forms)) {
            // const form = this.config.forms[key]
            // this.forms[key] = form
            // }
        };
        this.config = helpers_1.initConfig(BaseDataModelConfigDefaults, config);
        this._data = config.data;
        this.repos = {};
        this.forms = {};
        this.loadRepos();
        this.loadForms();
        if (this.config.parent)
            this.parent = this.config.parent;
    }
    Object.defineProperty(BaseDataModel.prototype, "state", {
        get: function () {
            if (this.repos.main) {
                return this.repos.main.state;
            }
            return 'loaded';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseDataModel.prototype, "data", {
        get: function () {
            return this.repos.main.data;
        },
        enumerable: false,
        configurable: true
    });
    BaseDataModel.prototype.load = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.repos.main) return [3 /*break*/, 2];
                        return [4 /*yield*/, ((_a = this.repos.main) === null || _a === void 0 ? void 0 : _a.call())];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [4 /*yield*/, this.loadChildren()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return BaseDataModel;
}());
exports.BaseDataModel = BaseDataModel;
var BaseDataItemModelConfigDefaults = {};
var BaseDataItemModel = /** @class */ (function (_super) {
    __extends(BaseDataItemModel, _super);
    function BaseDataItemModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BaseDataItemModel;
}(BaseDataModel));
exports.BaseDataItemModel = BaseDataItemModel;
var BaseDataCollectionModelConfigDefaults = __assign({ async: true }, BaseDataModelConfigDefaults);
var BaseDataCollectionModel = /** @class */ (function (_super) {
    __extends(BaseDataCollectionModel, _super);
    // children: DynamicClass
    function BaseDataCollectionModel(config) {
        var _this = _super.call(this, {
            repos: config.repos,
            forms: config.forms,
            parent: config.parent
        }) || this;
        _this.loadCollections = function () { return __awaiter(_this, void 0, void 0, function () {
            var collections, promises, _i, _a, name_2, child, childClass, out, iter, _b, iter_1, d, c;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        collections = {};
                        if (this.config.collections.prototype instanceof BaseDataModel
                            || this.config.collections == BaseDataModel) {
                            collections = { main: { model: this.config.collections, key: undefined } };
                        }
                        else if (this.config.collections instanceof Object) {
                            collections = this.config.collections;
                        }
                        promises = [];
                        for (_i = 0, _a = Object.keys(collections); _i < _a.length; _i++) {
                            name_2 = _a[_i];
                            child = collections[name_2];
                            childClass = child.model;
                            out = [];
                            iter = child.key ? this.data[child.key] : this.data;
                            for (_b = 0, iter_1 = iter; _b < iter_1.length; _b++) {
                                d = iter_1[_b];
                                c = new childClass({
                                    data: d,
                                    parent: this
                                });
                                out.push(c);
                                if (this.config.async)
                                    promises.push(c.load());
                            }
                            this.collections[name_2] = out;
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.config = helpers_1.initConfig(BaseDataCollectionModelConfigDefaults, config);
        _this.collections = {};
        return _this;
    }
    Object.defineProperty(BaseDataCollectionModel.prototype, "state", {
        get: function () {
            if (this.config.async) {
                return this.asyncState;
            }
            return this.repos.main.state;
        },
        enumerable: false,
        configurable: true
    });
    BaseDataCollectionModel.prototype.load = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.asyncState = 'loading';
                        if (!this.repos.main) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.repos.main.call()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.loadCollections()];
                    case 3:
                        _a.sent();
                        this.asyncState = 'loaded';
                        return [2 /*return*/];
                }
            });
        });
    };
    return BaseDataCollectionModel;
}(BaseDataModel));
exports.BaseDataCollectionModel = BaseDataCollectionModel;
