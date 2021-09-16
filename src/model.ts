import { BaseRepo } from "./repo"
import { state_t, repoMainMap_i, formMainMap_i, map_i, repoMap_i, repoConfig, formConfig, main_i } from "./types"
import * as _ from 'lodash'
import { initConfig, Repos } from "./helpers"
import { FormModel } from "./forms"
import { observable } from "mobx"
import { Forms, Children, Collections, Collection, format } from "."
import { Base } from "./base"



type modelClass = new (...args: any[]) => Model<any>;

interface child_i { key: string, model: modelClass }

interface ModelConfig_i<DataT>{
    data?: any
    repos?: repoConfig
    forms?: formConfig
    async?: boolean
    children?: modelClass | {[key: string]: child_i }
    parent?: Model<DataT>
    parentCollection?: Collection
    // _collection?: Model[]
}

const ModelConfigDefaults = {
    async: true
} as ModelConfig_i<any>



interface configRepo_i{
    [key: string]: BaseRepo
    main: BaseRepo
}

interface configForm_i{
    [key: string]: FormModel
    main: FormModel
}

export class Model<DataT = any, RepoT extends configRepo_i = {main: BaseRepo}, FormT extends configForm_i = {main: FormModel}> extends Base{
    /**
     * Model implements the base functionality of BaseDataItemModel and CollectionModel
     */


    @observable
    asyncState: state_t
    config: ModelConfig_i<DataT>
    _repos: RepoT
    _forms: FormT
    _children: Children
    @observable
    _data: any
    parent?: Model<any>
    parentCollection?: Collection
    constructor(config: ModelConfig_i<DataT>) {
        super()
        this.config = initConfig(ModelConfigDefaults, config)

        this._data = config.data
        this.asyncState = 'unloaded'

        this._repos = format<RepoT>(this.config.repos)
        this._forms = format<FormT>(this.config.forms)

        if(this.config.parent) this.parent = this.config.parent
        if(this.config.parentCollection) this.parentCollection = this.config.parentCollection

        this._children = new Children(this, this.config.children)

    }

    get repo(){
        return this.repos['main']
    }
    get repos(): RepoT{
        return this._repos
    }
    set repo(repo: BaseRepo){
        this._repos = {main: repo}
        this._repos['main'] = repo
    }
    set repos(repos: RepoT){
        // throw error if repos is already defined ?
        // this._repos = new Repos(repos)
        this._repos = repos
    }


    get form(): FormModel|undefined{
        /**
         * get main form
         */
        return this.forms['main']
    }
    get forms(): FormT{
        /**
         * get object of forms
         */
        return this._forms
    }
    set form(form: FormModel){
        /**
         * set forms
         */
        // this._forms = {main: form}
        this._forms['main'] = form
    }
    set forms(forms: FormT){
        // throw error if repos is already defined ?
        this._forms = forms
    }

    get data() {
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
    load = async () => {
        // awaiting preload causes load to exit event loop before state can be set to loading
        this.asyncState = this.asyncState === 'loaded' ? 'reloading' : 'loading'
        await this.preLoad()
        if(this.repo){
            await this.repo.call()
        }
        await this._children.load()
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

    get child(): Model<any>{
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

interface CollectionModelConfig_i<DataT> extends ModelConfig_i<DataT> {
    collections?: modelClass | {[key: string]: child_i }
    data?: DataT[]
}

const CollectionModelConfigDefaults = {
    ...ModelConfigDefaults,
    collections: Model
} as CollectionModelConfig_i<any>

export class CollectionModel<DataT = any> extends Model<DataT> {
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
    declare config: CollectionModelConfig_i<DataT>

    _collections: Collections
 
    // children: DynamicClass
    constructor(config: CollectionModelConfig_i<DataT>) {
        super({
            data: config.data,
            repos: config.repos,
            forms: config.forms,
            parent: config.parent,
            children: config.children,
            async: config.async
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

    map(args: (value: any, index: number, array: Model<DataT>[]) => unknown){
        return this.collection.map(args)
    }

    load = async () => {
        this.asyncState = 'loading'
        if(this.repo){
            await this.repo.call()
        }
        await this._collections.load()
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
}