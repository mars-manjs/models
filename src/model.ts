import * as _ from 'lodash'

import { BaseRepo } from "./repo"
import { state_t, repoMainMap_i, formMainMap_i, repoConfig, formConfig } from "./types"
import { initConfig, Repos } from "./helpers"
import { FormModel } from "./forms"
import { observable } from "mobx"
import { Children, Collections, Collection, format } from "."
import { Base } from "./base"



type modelClass = new (...args: any[]) => Model;

interface child_i { key: string, model: modelClass }

interface ModelConfig_i{
    data?: any
    repos?: repoConfig
    forms?: formConfig
    async?: boolean
    children?: modelClass | {[key: string]: child_i }
    parent?: Model
    parentCollection?: Collection
    // _collection?: Model[]
}

const ModelConfigDefaults = {
    async: true
} as ModelConfig_i



export class Model extends Base{
    /**
     * Model implements the base functionality of BaseDataItemModel and CollectionModel
     */


    @observable
    asyncState: state_t
    config: ModelConfig_i
    _repos: repoMainMap_i
    _forms: formMainMap_i
    _children: Children
    @observable
    _data: any
    parent?: Model
    parentCollection?: Collection
    constructor(config: ModelConfig_i) {
        super()
        this.config = initConfig(ModelConfigDefaults, config)

        this._data = config.data
        this.asyncState = 'unloaded'

        this._repos = format<repoMainMap_i>(this.config.repos)
        this._forms = format<formMainMap_i>(this.config.forms)

        if(this.config.parent) this.parent = this.config.parent
        if(this.config.parentCollection) this.parentCollection = this.config.parentCollection

        this._children = new Children(this, this.config.children)

    }

    get repo(){
        return this.repos['main']
    }
    get repos(): repoMainMap_i{
        return this._repos
    }
    set repo(repo: BaseRepo){
        this._repos = {main: repo}
    }
    set repos(repos: repoMainMap_i){
        // throw error if repos is already defined ?
        // this._repos = new Repos(repos)
        this._repos = repos
    }


    get form(): FormModel{
        /**
         * get main form
         */
        return this.forms.main
    }
    get forms(): formMainMap_i{
        /**
         * get object of forms
         */
        return this._forms
    }
    set form(form: FormModel){
        /**
         * set forms
         */
        this._forms = {main: form}
    }
    set forms(forms: formMainMap_i){
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

interface CollectionModelConfig_i extends ModelConfig_i {
    collections?: modelClass | {[key: string]: child_i }
}

const CollectionModelConfigDefaults = {
    ...ModelConfigDefaults,
    collections: Model
} as CollectionModelConfig_i

export class CollectionModel extends Model {
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
    declare config: CollectionModelConfig_i

    _collections: Collections
 
    // children: DynamicClass
    constructor(config: CollectionModelConfig_i) {
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

    map(args: (value: any, index: number, array: Model[]) => unknown){
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