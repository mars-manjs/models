import * as _ from 'lodash'

import { BaseRepo } from "./repo"
import { state_t} from "./types"
import { initConfig } from "./helpers"
import { FormModel } from "./forms"
import { observable } from "mobx"
import { Children, Collections, Collection, format } from "."
import { Base } from "./base"



type modelClass = new (...args: any[]) => Model;

interface child_i { key: string, model: modelClass }

interface ModelConfig_i<DataT = any, RepoT=any, FormT=any>{
    data?: DataT
    repos?: RepoT
    forms?: FormT
    async?: boolean
    children?: modelClass | {[key: string]: child_i }
    parent?: Model
    parentCollection?: Collection
    // _collection?: Model[]
}

export const ModelConfigDefaults = {
    async: true
} as ModelConfig_i





// type IsMain<T>  = T extends Base ? {main: T} : T
type IsMain<T, BaseClass>  = T extends {[key: string]: BaseClass} ? T : {main: T}
type IsMainRepo<T> = IsMain<T, BaseRepo>
type IsMainForm<T> = IsMain<T, FormModel>

export class Model<DataT = any, RepoT extends BaseRepo|{[key: string]: BaseRepo} = any, FormT extends FormModel|{[key: string]: FormModel} = any> extends Base{
    /**
     * Model implements the base functionality of BaseDataItemModel and CollectionModel
     */


    @observable
    asyncState: state_t
    config: ModelConfig_i<DataT, RepoT, FormT>
    repos: IsMainRepo<RepoT>
    forms: IsMainForm<FormT>
    @observable
    _data: DataT
    parent?: Model<any>
    parentCollection?: Collection
    _children: Children
    dependents: Model[] = []

    constructor(config?: ModelConfig_i<DataT, RepoT, FormT>) {
        super()
        this.config = initConfig(ModelConfigDefaults, config)

        this._data = this.config.data
        this.asyncState = 'unloaded'

        this.repos = format<IsMainRepo<RepoT>>(this.config.repos)
        this.forms = format<IsMainForm<FormT>>(this.config.forms)

        if(this.config.parent) this.parent = this.config.parent
        if(this.config.parentCollection) this.parentCollection = this.config.parentCollection

        this._children = new Children(this, this.config.children)
        
    }

    get repo(): BaseRepo|undefined{
        /**
         * get main form
         */
        return (this.repos as IsMainForm<BaseRepo>).main
    }

    get form(): FormModel|undefined{
        /**
         * get main form
         */
        return (this.forms as IsMainForm<FormModel>).main
    }

    get data(): DataT {
        if(this.repo){
            return this.repo.data
        }
        return this._data
    }

    preLoad = async () => {
        /**
         * TO BE IMPLEMENTED
         */
    }
    postLoad = async () => {
        /**
         * TO BE IMPLEMENTED
         * 
         * use this for setting form data
         */
    }

    loadRepo = async () => {
        if(this.repo){
            await this.repo.call()
        }
    }
    loadChildren = async () => {
        await this._children.load()
    }
    loadDependents = async () => {
        for(const dependent of this.dependents){
            await dependent.load()
        }
    }

    load = async () => {
        // awaiting preload causes load to exit event loop before state can be set to loading
        this.asyncState = this.asyncState === 'loaded' ? 'reloading' : 'loading'
        await this.preLoad()
        await this.loadRepo()
        await this.loadChildren()
        await this.loadDependents()
        await this.postLoad()
        this.asyncState = this.repo ? this.repo.state : 'loaded'
    }

    get state() {
        if (this.config.async) {
            return this.asyncState
        }
        if(this.repo){
            return this.repo.state
        }
        return 'loaded'
    }


    // form functions
    onChange(key: string){
        return this.form.onChange(key)
    }


    get payload(): any{
        /**
         * TODO:
         * - add toJS from mobx?
         */
        return {
            ...this.form?.data,
            ...this.child?.payload
        }
    }
    get children(){
        return this._children.children
    }

    get child(): Model{
        return this.children.main
    }

    // Collection Functions

    get defaultData(){
        /**
         * returns the default data to instantiate a new item in the collection
         * 
         * TODO: should this be an option in the ModelConfig  
         */
        return undefined
    }

    add = () => {
        /**
         * Model adds to parent
         * CollectionModel adds to collections.main
         */
        this.parentCollection?.add(this.defaultData)
    }

    remove = () => { 
        /**
         * Model removes from parent
         * CollectionModel removes from collections.main
         */
        this.parentCollection?.remove(this)
    }


}

interface CollectionModelConfig_i<DataT = any, RepoT = any, FormT = any> extends ModelConfig_i<DataT, RepoT, FormT> {
    collections?: modelClass | {[key: string]: child_i }
    data?: DataT,
    repos?: RepoT,
    forms?: FormT
}

export const CollectionModelConfigDefaults = {
    ...ModelConfigDefaults,
    collections: Model
} as CollectionModelConfig_i



export class CollectionModel<DataT extends Array<Record<any,any>> = any, 
                            RepoT extends BaseRepo|{[key: string]: BaseRepo} = any, 
                            FormT extends FormModel|{[key: string]: FormModel} = any
                            > extends Model<DataT, RepoT, FormT> {
    /**
     * CollectionModel is for an array of Model (Item or Collection) 
     * 
     * i.e. WikiSections, WikiPages
     * 
     * 
     * CHALLENGES:
     * - how to set the state of loaded only after having iterated through children
     * - async / sync collection
     */
    declare config: CollectionModelConfig_i<DataT, RepoT, FormT>

    _collections: Collections
 
    // children: DynamicClass
    constructor(config?: CollectionModelConfig_i<DataT, RepoT, FormT>) {
        super({
            ...config
            // data: config.data,
            // repos: config.repos,
            // forms: config.forms,
            // parent: config.parent,
            // children: config.children,
            // async: config.async
        })
        this.config = initConfig(CollectionModelConfigDefaults, config)
        this._collections = new Collections(this, this.config.collections)
    }


    get collections(){
        return this._collections.collections
    }

    get collection(){
        return this.collections.main
    }

    map(args: (value: any, index: number, array: Model<DataT, RepoT, FormT>[]) => unknown){
        return this.collection.map(args)
    }


    loadCollections = async () => {
        await this._collections.load()
    }
    load = async () => {
        this.asyncState = 'loading'
        await this.preLoad()
        await this.loadRepo()
        await this.loadChildren()
        await this.loadCollections()
        await this.loadDependents()
        await this.postLoad()
        this.asyncState = 'loaded'
    }

    get payload(): any{
        return this.collection.map((child)=>child.payload)
    }


    add = () => {
        /**
         * Model adds to parent
         * CollectionModel adds to collections.main
         */
        this.collection?.add(this.defaultData)
    }

    remove = () => { 
        /**
         * Model removes from parent
         * CollectionModel removes from collections.main
         */
        this.collection?.remove(this)
    }

    getBy = (key: string, val: any) => {
        return this.collection.filter((item)=>{
            return item.data[key] === val
        })
    }
}