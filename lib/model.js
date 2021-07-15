var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { initConfig } from "./helpers";
import { observable } from "mobx";
import { Children, Collections, format } from ".";
import { BaseModel } from "./base";
const BaseDataModelConfigDefaults = {
    async: true
};
export class BaseDataModel extends BaseModel {
    constructor(config) {
        super();
        this.preLoad = async () => {
            /**
             * TO BE IMPLEMENTED
             */
        };
        this.postLoad = async () => {
            /**
             * TO BE IMPLEMENTED
             *
             * use this for setting form data
             */
        };
        this.load = async () => {
            await this.preLoad();
            this.asyncState = 'loading';
            if (this.repo) {
                await this.repo.call();
            }
            await this._children.load();
            await this.postLoad();
            this.asyncState = 'loaded';
        };
        this.add = () => {
            console.log("ADD 1");
            this.parentCollection?.add(this.defaultData);
        };
        this.remove = () => {
            this.parentCollection?.remove(this);
        };
        this.config = initConfig(BaseDataModelConfigDefaults, config);
        this._data = config.data;
        this.asyncState = 'unloaded';
        this._repos = format(this.config.repos);
        this._forms = format(this.config.forms);
        if (this.config.parent)
            this.parent = this.config.parent;
        if (this.config.parentCollection)
            this.parentCollection = this.config.parentCollection;
        this._children = new Children(this, this.config.children);
    }
    // loadInit: config.loadInit
    get repo() {
        return this.repos.main;
    }
    get repos() {
        return this._repos;
    }
    set repo(repo) {
        // this._repos = new Repos({main: repo})
        this._repos = { main: repo };
    }
    set repos(repos) {
        // throw error if repos is already defined ?
        // this._repos = new Repos(repos)
        this._repos = repos;
    }
    get form() {
        /**
         * get main form
         */
        return this.forms.main;
    }
    get forms() {
        /**
         * get object of forms
         */
        return this._forms;
    }
    set form(form) {
        /**
         * set forms
         */
        this._forms = { main: form };
    }
    set forms(forms) {
        // throw error if repos is already defined ?
        this._forms = forms;
    }
    get data() {
        if (this.repo) {
            return this.repo.data;
        }
        return this._data;
    }
    get state() {
        if (this.config.async) {
            return this.asyncState;
        }
        if (this.repos.main) {
            return this.repos.main.state;
        }
        return 'loaded';
    }
    // form functions
    onChange(key) {
        return this.form.onChange(key);
    }
    get payload() {
        /**
         * TODO:
         * - add toJS from mobx?
         */
        return {
            ...this.form?.data,
            ...this.child?.payload
        };
    }
    get children() {
        return this._children.children;
    }
    get child() {
        return this.children.main;
    }
    // Collection Functions
    get defaultData() {
        /**
         * returns the default data to instantiate a new item in the collection
         *
         * TODO: should this be an option in the BaseDataModelConfig
         */
        return undefined;
    }
}
__decorate([
    observable
], BaseDataModel.prototype, "asyncState", void 0);
__decorate([
    observable
], BaseDataModel.prototype, "_data", void 0);
const BaseDataCollectionModelConfigDefaults = {
    ...BaseDataModelConfigDefaults
};
export class BaseDataCollectionModel extends BaseDataModel {
    // children: DynamicClass
    constructor(config) {
        super({
            data: config.data,
            repos: config.repos,
            forms: config.forms,
            parent: config.parent,
            children: config.children,
            async: config.async
        });
        this.load = async () => {
            this.asyncState = 'loading';
            if (this.repo) {
                await this.repo.call();
            }
            await this._collections.load();
            this.asyncState = 'loaded';
        };
        this.add = () => {
            /**
             * BaseDataModel adds to parent
             * BaseDataCollectionModel adds to collections.main
             */
            console.log("ADD 3");
            this.collection?.add(this.defaultData);
        };
        this.remove = () => {
            /**
             * BaseDataModel removes from parent
             * BaseDataCollectionModel removes from collections.main
             */
            this.collection?.remove(this);
        };
        this.config = initConfig(BaseDataCollectionModelConfigDefaults, config);
        this._collections = new Collections(this, this.config.collections);
    }
    get collections() {
        return this._collections.collections;
    }
    get collection() {
        return this.collections.main;
    }
    map(args) {
        return this.collection.map(args);
    }
    get payload() {
        return this.collection.map((child) => child.payload);
    }
}
//# sourceMappingURL=model.js.map