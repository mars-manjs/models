import { BaseRepository } from "./repo"
import { state_t } from "./types"
import * as _ from 'lodash'
import { initConfig, DynamicClass } from "./helpers"
import { BaseFormModel } from "./forms"
import { times } from "lodash"



type modelClass = new (...args: any[]) => BaseDataModel;

interface child_i { key: string, model: modelClass }

interface BaseDataModelConfig_i {
    data?: any,
    repos?: BaseRepository | { [key: string]: BaseRepository } //{repo: BaseRepository}
    forms?: { [key: string]: BaseFormModel }, //{form: BaseFormModel}
    async?: boolean
    children?: modelClass | {[key: string]: child_i }
    parent?: BaseDataModel
}

const BaseDataModelConfigDefaults = {
} as BaseDataModelConfig_i

export class BaseDataModel {
    /**
     * BaseDataModel implements the base functionality of BaseDataItemModel and BaseDataCollectionModel
     */


    config: BaseDataCollectionModelConfig_i
    repos: { [key: string]: BaseRepository }
    forms: { [key: string]: BaseFormModel }
    children: { [key: string]: BaseDataModel }
    _data: any
    parent?: BaseDataModel
    constructor(config: BaseDataModelConfig_i) {
        this.config = initConfig(BaseDataModelConfigDefaults, config)


        this._data = config.data
        this.repos = {}
        this.forms = {}

        this.loadRepos()
        this.loadForms()

        if(this.config.parent) this.parent = this.config.parent
    }



    get state(){
        if(this.repos.main){
            return this.repos.main.state
        }
        return 'loaded'
    }
            // loadInit: config.loadInit
 
    loadRepos = () => {
        if (this.config.repos === undefined) return
        if (this.config.repos instanceof BaseRepository) {
            this.repos = { main: this.config.repos }
        } else if (this.config.repos instanceof Object) {
            this.repos = this.config.repos
        }
    }


    loadChildren = async () => {
        let children = {}
        if ((this.config.children as modelClass).prototype instanceof BaseDataModel
            || this.config.children == BaseDataModel
        ) {
            children = {main: {model: this.config.children as modelClass, key: undefined }}
        } else if (this.config.children instanceof Object) {
            children = this.config.children
        }


        let promises = []

        for (const name of Object.keys(children)) {
            const child = children[name]
            const childClass = child.model as modelClass
            const data = child.key ? this.data[child.key] : undefined
            const c = new childClass({
                data,
                parent: this
            })
            this.children[name] = c
            if(this.config.async) promises.push(c.load())
        }
        await Promise.all(promises)
    }

    loadForms = () => {
        if (this.config.forms === undefined) return
        this.forms = this.config.forms
        // for (const key of Object.keys(this.config.forms)) {
            // const form = this.config.forms[key]
            // this.forms[key] = form
        // }
    }

    get data() {
        return this.repos.main.data
    }


    async load() {
        if(this.repos.main){
            await this.repos.main?.call()
        }
        await this.loadChildren()
    }
}



interface BaseDataItemModelConfig_i extends BaseDataModelConfig_i {
}

const BaseDataItemModelConfigDefaults = {

} as BaseDataCollectionModelConfig_i


export class BaseDataItemModel extends BaseDataModel {
    /**
     * BaseDataItemModel is for a single data model
     * 
     * i.e. WikiSection, WikiPage
     */
}




interface BaseDataCollectionModelConfig_i extends BaseDataModelConfig_i {
    collections?: modelClass | {[key: string]: child_i }
}

const BaseDataCollectionModelConfigDefaults = {
    async: true,
    ...BaseDataModelConfigDefaults
} as BaseDataCollectionModelConfig_i

export class BaseDataCollectionModel extends BaseDataModel {
    /**
     * BaseDataCollectionModel is for an array of BaseDataModel (Item or Collection) 
     * 
     * i.e. WikiSections, WikiPages
     * 
     * 
     * CHALLENGES:
     * - how to set the state of loaded only after having iterated through children
     * - async / sync collection
     */
    asyncState: state_t
    config: BaseDataCollectionModelConfig_i

    collections: { [key: string]: BaseDataModel[] }

    // children: DynamicClass
    constructor(config: BaseDataCollectionModelConfig_i) {
        super({
            repos: config.repos,
            forms: config.forms,
            parent: config.parent
        })
        this.config = initConfig(BaseDataCollectionModelConfigDefaults, config)
        this.collections = {}
    }


    get state() {
        if (this.config.async) {
            return this.asyncState
        }
        return this.repos.main.state
    }


    loadCollections = async () => {

        let collections = {}
        if ((this.config.collections as modelClass).prototype instanceof BaseDataModel
            || this.config.collections == BaseDataModel
        ) {
            collections = { main: { model: this.config.collections as modelClass, key: undefined }}
        } else if (this.config.collections instanceof Object) {
            collections = this.config.collections
        }


        let promises = []

        for (const name of Object.keys(collections)) {
            const child = collections[name]
            const childClass = child.model as modelClass
            let out = []

            // if key is not defined iterate over the data
            const iter = child.key ? this.data[child.key] : this.data
            for (const d of iter) {
                const c = new childClass({
                    data: d,
                    parent: this
                })
                out.push(c)


                if(this.config.async) promises.push(c.load())
            }
            this.collections[name] = out
        }
        await Promise.all(promises)
    }

    async load() {
        this.asyncState = 'loading'
        if(this.repos.main){
            await this.repos.main.call()
        }
        await this.loadCollections()
        this.asyncState = 'loaded'
    }
}