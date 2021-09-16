import * as _ from "lodash"
import * as _fp from "lodash/fp"
import { BaseRepo, repoMainMap_i, FormModel } from ".";
import { map_i, formMainMap_i, modelClass, child_i, main_i } from "./types";
import { Base } from "./base";
import { Model } from "./model";
import { observable } from "mobx";
// lodash fp provides immutable methods
// _.merge needs to not change the objects
export const nestedKeys = (obj) => {
    const keys = []
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object" && obj[key]) {
            nestedKeys(obj[key]).forEach(innerKey => {
                keys.push(`${key}.${innerKey}`)
            })
        } else {
            keys.push(key)
        }
    });
    return keys
}

export const initConfig = (defaultConfig, config) => {
    // return _.merge(_.cloneDeep(defaultConfig), _.cloneDeep(config))
    return _fp.merge(defaultConfig, config)
}


export const format = <T>(d: Base|T) => {
    if (d === undefined) return {} as T
    if (d instanceof Base) {
        return { main: d } as T
    } else {
        return d as T
    }
}

export class MapClass<T, CLSObj extends main_i<T>>{
    private _data: CLSObj
    constructor(d?: T | CLSObj) {
        if (d === undefined) return
        if (d instanceof Base) {
            this._data = { main: d } as CLSObj
        } else {
            this._data = d as CLSObj
        }
    }
    // extend(d: formMainMap_i) {
    //     this._data = {
    //         ...this._data,
    //         ...d
    //     }
    // }
    get data() {
        return this._data
    }
}



export class Forms extends MapClass<FormModel, formMainMap_i>{
    constructor(d: FormModel | formMainMap_i) {
        super(d);
    }
}


export class Repos extends MapClass<BaseRepo, repoMainMap_i>{
    constructor(d: BaseRepo | repoMainMap_i) {
        super(d);
    }
}



export class Children {
    childrenConfig: { [key: string]: child_i } = {}
    children: { [key: string]: Model } = {}
    constructor(public parent: Model, collections: modelClass | { [key: string]: child_i }) {
        this.childrenConfig = this.format(collections)
    }

    format = (collections): { [key: string]: child_i } => {
        let out = {}
        if (collections === undefined) return out
        if ((collections as modelClass)?.prototype instanceof Model
            || collections == Model
        ) {
            out = { main: { model: collections as modelClass, key: undefined } }
        } else if (collections instanceof Object) {
            out = collections
        }
        // console.log("child format", out)
        return out
    }

    load = async () => {
        let promises = []
        const { data } = this.parent
        if(!data) return
        for (const name of Object.keys(this.childrenConfig)) {
            const childConfig = this.childrenConfig[name]
            const childClass = childConfig.model as modelClass
            const key = childConfig.key
            // iter is a bad variable name
            const iter = key ? _.get(data, key) : undefined
            const c = new childClass({
                data: iter,
                parent: this.parent,
                // childrenParent: this
            })
            if(this.parent.config.async) promises.push(c.load())
            this.children[name] = c
        }
        await Promise.all(promises)
    }
}

export class Collections {
    collectionsConfig: { [key: string]: child_i } = {}
    collections: { [key: string]: Collection } = {}
    constructor(public model: Model, collections: modelClass | { [key: string]: child_i }) {
        this.collectionsConfig = this.format(collections)
    }
    format = (collections): { [key: string]: child_i } => {
        let out = {}
        if (collections === undefined) return out
        if ((collections as modelClass)?.prototype instanceof Model
            || collections == Model
        ) {
            out = { main: { model: collections as modelClass, key: undefined } }
        } else if (collections instanceof Object) {
            out = collections
        }
        return out
    }


    load = async () => {
        let promises = []
        const { data } = this.model
        if(!data) return
        for (const name of Object.keys(this.collectionsConfig)) {
            const modelObject = this.collectionsConfig[name]
            const collection = new Collection(this.model, data, modelObject)
            this.collections[name] = collection
            promises.push(collection.load())
        }
        await Promise.all(promises)
    }
}


export class Collection {
    @observable
    models: Model[] = []
    constructor(private parent: Model, private data: any, private modelObject: child_i) {
        this.models = []
    }
    
    map = (args: (value: any, index: number, array: Model[]) => unknown) => {
        return this.models.map(args)
    }
    *[Symbol.iterator](){
        for(let item of this.models){
            yield item;
        }
    }
    get length(){
        return this.models.length
    }

    add = async (data) => {
        await this.initModel(data)
    }

    remove = (model: Model) => {
        this.models = _.filter(this.models, (item)=>{
            return item !== model
        })
        // TODO
    }


    initModel = async (data) => {
        const childClass = this.modelObject.model as modelClass
        const c = new childClass({
            data: data,
            parent: this.parent,
            parentCollection: this
        })
        if (this.parent.config.async) {
            await c.load()
        }
        this.models.push(c)
        return 
        // console.log(this.parent, this.parent.config.async)
    }

    load = async () => {
        // let out = []
        let promises = []

        const key = this.modelObject.key

        // if key is not defined iterate over the data
        const iter = key ? _.get(this.data, key) : this.data
        // console.log("iter", modelObject, key, data, iter)
        for (const d of iter) {
            promises.push(this.initModel(d))
            // TODO should async still load collections?
        }
        await Promise.all(promises)
    }
}

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
