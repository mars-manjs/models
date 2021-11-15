import * as _ from "lodash"
import { modelClass, child_i, main_i } from "./types";
import { Base } from "./base";
import { Model } from "./model";
import { makeObservable, observable } from "mobx";

export const nestedKeys = (obj) => {
    const keys = []
    Object.keys(obj).forEach((key) => {
        // console.log("nestedKeys", key, typeof obj[key], obj[key])
        if (typeof obj[key] === "object" && !Array.isArray(obj[key]) && obj[key]) {
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
    if(!config) return defaultConfig
    return _.merge({}, defaultConfig, config)
}


export const format = <T>(d: Base|T): T => {
    if (d === undefined) return {} as T
    if (d instanceof Base) {
        return { main: d } as unknown as T
    } else {
        return d
    }
}

export class Children {
    childrenConfig: { [key: string]: child_i } = {}
    // @observable
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
    @observable
    collections: { [key: string]: Collection } = {}
    constructor(public model: Model, collections: modelClass | { [key: string]: child_i }) {
        this.collectionsConfig = this.format(collections)
        makeObservable(this)
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
        let tmp = {}
        if(!data) return
        for (const name of Object.keys(this.collectionsConfig)) {
            const modelObject = this.collectionsConfig[name]
            const collection = new Collection(this.model, data, modelObject)
            tmp[name] = collection
            promises.push(collection.load())
        }
        await Promise.all(promises)

        this.collections = tmp
    }
}


export class Collection {
    @observable
    models: Model[] = []
    constructor(private parent: Model, private data: any, private modelObject: child_i) {
        this.models = []
        makeObservable(this)
    }
    
    map = (args: (value: any, index: number, array: Model[]) => unknown) => {
        return this.models.map(args)
    }
    filter =  ( predicate: (value: Model<any, any, any>, index: number, array: Model<any, any, any>[]) => unknown) => {
        return this.models.filter(predicate)
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
        // if(!iter && !!iter[Symbol.iterator]) return 
        for (const d of iter) {
            promises.push(this.add(d))
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
