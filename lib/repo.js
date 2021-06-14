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
exports.MockRepository = exports.APIRepository = exports.GraphQLRepository = exports.FirestoreRepository = exports.BaseRepository = void 0;
var helpers_1 = require("./helpers");
var errors_1 = require("./errors");
var BaseRepositoryConfigDefaults = {};
var BaseRepository = /** @class */ (function () {
    function BaseRepository(config) {
        var _this = this;
        this.state = 'unloaded';
        this.preCall = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                /**
                 * sets state to loading or reloading
                 */
                this.state = this.state === 'loading' ? 'reloading' : 'loading';
                return [2 /*return*/];
            });
        }); };
        this.fetch = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                /**
                 * retrieve data from repository
                 */
                throw new errors_1.NotImplementedError();
            });
        }); };
        this.parse = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                /**
                 * parse response data
                 */
                throw new errors_1.NotImplementedError();
            });
        }); };
        this.postCall = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                /**
                 * implement checking if call was successful
                 *
                 * sets state to 'loaded' or 'error'
                 */
                throw new errors_1.NotImplementedError();
            });
        }); };
        this.call = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.preCall()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.fetch()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.parse()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.postCall()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.config = helpers_1.initConfig(BaseRepositoryConfigDefaults, config);
        this.data = config.data;
    }
    return BaseRepository;
}());
exports.BaseRepository = BaseRepository;
/**
*
* this is the repository pattern, implemented with three examples
* - BaseFirestoreModel: for abstracting firestore interactions
* - BaseGraphQLModel: for abstracting GraphQL interactions
* - BaseAPIModel: for abstracting RESTful interactions
*
**/
// 
var FirestoreRepository = /** @class */ (function (_super) {
    __extends(FirestoreRepository, _super);
    function FirestoreRepository() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return FirestoreRepository;
}(BaseRepository));
exports.FirestoreRepository = FirestoreRepository;
var GraphQLRepository = /** @class */ (function (_super) {
    __extends(GraphQLRepository, _super);
    function GraphQLRepository() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return GraphQLRepository;
}(BaseRepository));
exports.GraphQLRepository = GraphQLRepository;
var APIRepositoryConfigDefaults = {
    path: '',
    method: 'GET'
};
var APIRepository = /** @class */ (function (_super) {
    __extends(APIRepository, _super);
    function APIRepository(config) {
        var _this = _super.call(this, {}) || this;
        _this.fetch = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log(this.config.path, this.options);
                        _a = this;
                        return [4 /*yield*/, fetch(this.config.path, this.options)];
                    case 1:
                        _a.response = _b.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.parse = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.response.json()];
                    case 1:
                        _a.data = _b.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        _this.postCall = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.response.status >= 200 && this.response.status < 300) {
                    this.state = 'loaded';
                }
                else {
                    this.state = 'error';
                }
                return [2 /*return*/];
            });
        }); };
        _this.config = helpers_1.initConfig(APIRepositoryConfigDefaults, config);
        return _this;
    }
    Object.defineProperty(APIRepository.prototype, "options", {
        get: function () {
            return {
                method: this.config.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        },
        enumerable: false,
        configurable: true
    });
    return APIRepository;
}(BaseRepository));
exports.APIRepository = APIRepository;
var MockRepositoryConfig = {
    data: {
        abc: 123
    },
};
var MockRepository = /** @class */ (function (_super) {
    __extends(MockRepository, _super);
    function MockRepository(config) {
        var _this = _super.call(this, {
            data: config.data
        }) || this;
        _this.fetch = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.response = this.config;
                return [2 /*return*/];
            });
        }); };
        _this.parse = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.data = this.response.data;
                return [2 /*return*/];
            });
        }); };
        _this.postCall = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.state = 'loaded';
                return [2 /*return*/];
            });
        }); };
        _this.config = helpers_1.initConfig(MockRepositoryConfig, config);
        return _this;
    }
    return MockRepository;
}(BaseRepository));
exports.MockRepository = MockRepository;
