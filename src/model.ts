import { BaseRepository } from "./repo"
import { state_t, repoMainMap_i, formMainMap_i, map_i, repoMap_i, repoConfig, formConfig, main_i } from "./types"
import * as _ from 'lodash'
import { initConfig, Repos } from "./helpers"
import { BaseFormModel } from "./forms"
import { observable } from "mobx"
import { Forms, Children, Collections, Collection, format } from "."
import { BaseModel } from "./base"



type modelClass = new (...args: any[]) => BaseDataModel;

interface child_i { key: string, model: modelClass }

interface BaseDataModelConfig_i {
    data?: any
    repos?: repoConfig
    forms?: formConfig
    async?: boolean
    children?: modelClass | {[key: string]: child_i }
    parent?: BaseDataModel
    parentCollection?: Collection
    // _collection?: BaseDataModel[]
}

const BaseDataModelConfigDefaults = {
    async: true
} as BaseDataModelConfig_i

export class BaseDataModel extends BaseModel{
    /**
     * BaseDataModel implements the base functionality of BaseDataItemModel and BaseDataCollectionModel
     */


    @observable
    asyncState: state_t
    config: BaseDataCollectionModelConfig_i
    _repos: repoMainMap_i
    _forms: formMainMap_i
    _children: Children
    @observable
    _data: any
    parent?: BaseDataModel
    parentCollection?: Collection
    constructor(config: BaseDataModelConfig_i) {
        super()
        this.config = initConfig(BaseDataModelConfigDefaults, config)

        this._data = config.data
        this.asyncState = 'unloaded'

        this._repos = format<repoMainMap_i>(this.config.repos)
        this._forms = format<formMainMap_i>(this.config.forms)

        if(this.config.parent) this.parent = this.config.parent
        if(this.config.parentCollection) this.parentCollection = this.config.parentCollection

        this._children = new Children(this, this.config.children)

    }

            // loadInit: config.loadInit
    get repo(){
        return this.repos.main
    }
    get repos(): repoMainMap_i{
        return this._repos
    }
    set repo(repo: BaseRepository){
        // this._repos = new Repos({main: repo})
        this._repos = {main: repo}
    }
    set repos(repos: repoMainMap_i){
        // throw error if repos is already defined ?
        // this._repos = new Repos(repos)
        this._repos = repos
    }


    get form(){
        /**
         * get main form
         */
        return this.forms.main
    }
    get forms(){
        /**
         * get object of forms
         */
        return this._forms
    }
    set form(form: BaseFormModel){
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
        await this.preLoad()
        this.asyncState = 'loading'
        if(this.repo){
            await this.repo.call()
        }
        await this._children.load()
        await this.postLoad()
        this.asyncState = 'loaded'
    }

    get state() {
        if (this.config.async) {
            return this.asyncState
        }
        if(this.repos.main){
            return this.repos.main.state
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

    get child(): BaseDataModel{
        return this.children.main
    }

    // Collection Functions

    get defaultData(){
        /**
         * returns the default data to instantiate a new item in the collection
         * 
         * TODO: should this be an option in the BaseDataModelConfig  
         */
        return undefined
    }

    add = () => {
        /**
         * BaseDataModel adds to parent
         * BaseDataCollectionModel adds to collections.main
         */
        this.parentCollection?.add(this.defaultData)
    }

    remove = () => { 
        /**
         * BaseDataModel removes from parent
         * BaseDataCollectionModel removes from collections.main
         */
        this.parentCollection?.remove(this)
    }
}

interface BaseDataCollectionModelConfig_i extends BaseDataModelConfig_i {
    collections?: modelClass | {[key: string]: child_i }
}

const BaseDataCollectionModelConfigDefaults = {
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
    config: BaseDataCollectionModelConfig_i

    _collections: Collections
 
    // children: DynamicClass
    constructor(config: BaseDataCollectionModelConfig_i) {
        super({
            data: config.data,
            repos: config.repos,
            forms: config.forms,
            parent: config.parent,
            children: config.children,
            async: config.async
        })
        this.config = initConfig(BaseDataCollectionModelConfigDefaults, config)
        this._collections = new Collections(this, this.config.collections)
    }


    get collections(){
        return this._collections.collections
    }

    get collection(){
        return this.collections.main
    }

    map(args: (value: any, index: number, array: BaseDataModel[]) => unknown){
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
         * BaseDataModel adds to parent
         * BaseDataCollectionModel adds to collections.main
         */
        this.collection?.add(this.defaultData)
    }

    remove = () => { 
        /**
         * BaseDataModel removes from parent
         * BaseDataCollectionModel removes from collections.main
         */
        this.collection?.remove(this)
    }
}