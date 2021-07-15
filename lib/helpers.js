var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as _ from "lodash";
import * as _fp from "lodash/fp";
import { BaseModel } from "./base";
import { BaseDataModel } from "./model";
import { observable } from "mobx";
// lodash fp provides immutable methods
// _.merge needs to not change the objects
export const nestedKeys = (obj) => {
    const keys = [];
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object" && obj[key]) {
            nestedKeys(obj[key]).forEach(innerKey => {
                keys.push(`${key}.${innerKey}`);
            });
        }
        else {
            keys.push(key);
        }
    });
    return keys;
};
export const initConfig = (defaultConfig, config) => {
    // return _.merge(_.cloneDeep(defaultConfig), _.cloneDeep(config))
    return _fp.merge(defaultConfig, config);
};
export const format = (d) => {
    if (d === undefined)
        return {};
    if (d instanceof BaseModel) {
        return { main: d };
    }
    else {
        return d;
    }
};
export class MapClass {
    constructor(d) {
        if (d === undefined)
            return;
        if (d instanceof BaseModel) {
            this._data = { main: d };
        }
        else {
            this._data = d;
        }
    }
    // extend(d: formMainMap_i) {
    //     this._data = {
    //         ...this._data,
    //         ...d
    //     }
    // }
    get data() {
        return this._data;
    }
}
export class Forms extends MapClass {
    constructor(d) {
        super(d);
    }
}
export class Repos extends MapClass {
    constructor(d) {
        super(d);
    }
}
export class Children {
    constructor(parent, collections) {
        this.parent = parent;
        this.childrenConfig = {};
        this.children = {};
        this.format = (collections) => {
            let out = {};
            if (collections === undefined)
                return out;
            if (collections?.prototype instanceof BaseDataModel
                || collections == BaseDataModel) {
                out = { main: { model: collections, key: undefined } };
            }
            else if (collections instanceof Object) {
                out = collections;
            }
            // console.log("child format", out)
            return out;
        };
        this.load = async () => {
            let promises = [];
            const { data } = this.parent;
            if (!data)
                return;
            for (const name of Object.keys(this.childrenConfig)) {
                const childConfig = this.childrenConfig[name];
                const childClass = childConfig.model;
                const key = childConfig.key;
                // iter is a bad variable name
                const iter = key ? _.get(data, key) : undefined;
                const c = new childClass({
                    data: iter,
                    parent: this
                });
                if (this.parent.config.async)
                    promises.push(c.load());
                this.children[name] = c;
            }
            await Promise.all(promises);
        };
        this.childrenConfig = this.format(collections);
    }
}
export class Collections {
    constructor(model, collections) {
        this.model = model;
        this.collectionsConfig = {};
        this.collections = {};
        this.format = (collections) => {
            let out = {};
            if (collections === undefined)
                return out;
            if (collections?.prototype instanceof BaseDataModel
                || collections == BaseDataModel) {
                out = { main: { model: collections, key: undefined } };
            }
            else if (collections instanceof Object) {
                out = collections;
            }
            return out;
        };
        this.load = async () => {
            let promises = [];
            const { data } = this.model;
            if (!data)
                return;
            for (const name of Object.keys(this.collectionsConfig)) {
                const modelObject = this.collectionsConfig[name];
                const collection = new Collection(this.model, data, modelObject);
                this.collections[name] = collection;
                promises.push(collection.load());
            }
            await Promise.all(promises);
        };
        this.collectionsConfig = this.format(collections);
    }
}
export class Collection {
    constructor(parent, data, modelObject) {
        this.parent = parent;
        this.data = data;
        this.modelObject = modelObject;
        this.models = [];
        this.map = (args) => {
            return this.models.map(args);
        };
        this.add = async (data) => {
            await this.initModel(data);
        };
        this.remove = (model) => {
            this.models = _.filter(this.models, (item) => {
                return item !== model;
            });
            // TODO
        };
        this.initModel = async (data) => {
            const childClass = this.modelObject.model;
            const c = new childClass({
                data: data,
                parent: this.parent,
                parentCollection: this
            });
            if (this.parent.config.async) {
                await c.load();
            }
            this.models.push(c);
            return;
            // console.log(this.parent, this.parent.config.async)
        };
        this.load = async () => {
            // let out = []
            let promises = [];
            const key = this.modelObject.key;
            // if key is not defined iterate over the data
            const iter = key ? _.get(this.data, key) : this.data;
            // console.log("iter", modelObject, key, data, iter)
            for (const d of iter) {
                promises.push(this.initModel(d));
                // TODO should async still load collections?
            }
            await Promise.all(promises);
        };
        this.models = [];
    }
    *[Symbol.iterator]() {
        for (let item of this.models) {
            yield item;
        }
    }
    get length() {
        return this.models.length;
    }
}
__decorate([
    observable
], Collection.prototype, "models", void 0);
/**
 *
class _DynamicClass<T> {
    _data: T;
    constructor(data: T) {
        this._data = data;
        Object.keys(data).forEach((key) => Object.defineProperty(this, key, { get: () => this._data[key] }));
    }
}

export const DynamicClass = _DynamicClass as ({
    new <T>(data: T): _DynamicClass<T> & T
})

 */
//# sourceMappingURL=helpers.js.map