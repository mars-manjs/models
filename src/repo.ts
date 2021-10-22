import { event_i, state_t } from "./types"
import * as _ from "lodash"
import { initConfig } from "./helpers"
import { NotImplementedError } from "./errors"
import {makeObservable, observable} from 'mobx'
import { Base } from "./base"
import { PubSub } from "./pubsub"
import { events } from "."

interface BaseRepoConfig_i<DataT = any> {
    data?: DataT,
    events?: {
        onLoad?: event_i,
        onError?: event_i,
    }
}

export const BaseRepoConfigDefaults = {
} as BaseRepoConfig_i


export class BaseRepo<DataT = any> extends Base{
    config: BaseRepoConfig_i<DataT>


    @observable
    state: state_t
    response: any
    @observable
    data: DataT
    onLoad: PubSub<any>
    onError: PubSub<any>
    constructor(config?: BaseRepoConfig_i<DataT>) {
        super()
        this.config = initConfig(BaseRepoConfigDefaults, config)
        this.data = this.config.data
        this.onLoad = new PubSub()
        this.onError = new PubSub()

        // console.log(config.events)
        // events
        if(config?.events?.onLoad){
            this.onLoad.subscribe(()=>{
                events.emit(config.events.onLoad.type, config.events.onLoad.data)
            })
        }
        if(config?.events?.onError){
            this.onError.subscribe(()=>{
                events.emit(config.events.onError.type, config.events.onError.data)
            })
        }
        this.state = 'unloaded'
        makeObservable(this)
    }

    preCall = async (): Promise<any> => {
        /**
         * sets state to loading or reloading
         */
        this.state = this.state === 'loaded' ? 'reloading' : 'loading'
    }

    fetch = async (): Promise<any> => {
        /**
         * retrieve data from repository
         */
        throw new NotImplementedError()
    }

    parse = async (): Promise<any> => {
        /**
         * parse response data
         */
        throw new NotImplementedError()
    }

    postCall = async (): Promise<any> => {
        /**
         * implement checking if call was successful 
         * 
         * sets state to 'loaded' or 'error'
         * 
         * emits to onLoadSub 
         */
        throw new NotImplementedError()
    }
    _postCall = async () => {
        /**
         * cannot be written over
         * 
         * this is used for common postCall logic of a repo including
         * 1. emiting pubsub events
         */
        if(this.state == 'loaded') this.onLoad.emit(this.data)
        if(this.state == 'error') this.onError.emit(this.data)
    }

    async call(payload?: DataT){
        await this.preCall()
        await this.fetch()
        await this.parse()
        await this.postCall()
        await this._postCall()
    }
}

/**
*
* this is the repository pattern, implemented with three examples
* - BaseFirestoreModel: for abstracting firestore interactions
* - BaseGraphQLModel: for abstracting GraphQL interactions
* - BaseAPIModel: for abstracting RESTful interactions
* 
**/

export class FirestoreRepo extends BaseRepo {
    // TODO
}

export class GraphQLRepo extends BaseRepo {
    // TODO
}

interface APIRepoConfig_i<DataT = any> extends BaseRepoConfig_i<DataT>{
    path: string
    method?: 'CONNECT'|'DELETE'|'GET'|'HEAD'|'OPTIONS'|'PATCH'|'POST'|'PUT'|'TRACE',
    headers?: ()=>{} | {}
    body?:    (()=>DataT) | DataT
}

const APIRepoConfigDefaults = {
    path: '',
    method: 'GET'
} as APIRepoConfig_i

export class APIRepo<DataT = any> extends BaseRepo {
    declare config: APIRepoConfig_i<DataT>
    declare response: Response
    _body: DataT|(()=>DataT)
    constructor(config?: APIRepoConfig_i<DataT>){
        super({})
        this.config = initConfig(APIRepoConfigDefaults, config)
        this._body = this.config.body
    }

    get body(){
        if(typeof this._body === "function"){
            return JSON.stringify((this._body as ()=>DataT)())
        }
        return JSON.stringify(this._body)
    }

    get options(){
        return {
            method: this.config.method,
            body: this.body,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }
    call = async (payload?: DataT) => {
        if(payload) {
            this._body = payload
        }
        await super.call()
    }
    fetch = async () => {
        this.response = await fetch(this.config.path, this.options)
    }

    parse = async () => {
        try{
            this.data = await this.response.text()
            try{
                this.data = JSON.parse(this.data)
            }catch(e){
            }
        }catch(e){
        }
    }

    postCall = async () => {
        /**
         * sets state upon success
         */
        if (this.response.status >= 200 && this.response.status < 300) {
            this.state = 'loaded'
        }else{
            this.state = 'error'
        }
    }
}




function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


interface MockRepoConfig_i<DataT = any> extends BaseRepoConfig_i<DataT>{
    data: DataT,
    finalState?: state_t
}

const MockRepoConfig = {
    data: {},
    finalState: 'loaded'
} as MockRepoConfig_i

export class MockRepo<DataT = any> extends BaseRepo{
    declare config: MockRepoConfig_i<DataT>
    constructor(config?: MockRepoConfig_i<DataT>){
        super(config)
        this.config = initConfig(MockRepoConfig, config)
        // console.log("CREATING MOCK REPOSITORY")
    }

    fetch = async () => {
        await timeout(100)
        this.response = this.config
    }
    parse = async () => {
        this.data = this.response.data
    }
    
    postCall = async () => {
        this.state = this.config.finalState
    }
}

export const PeriodicRepo = <T extends BaseRepo>(repo: T): T => {
    
    setInterval(()=>{
        repo.call()
    }, 5000)
    
    return repo
}

export const OnDemandRepo = <T extends BaseRepo>(repo: T): T => {
    return new Proxy(repo, {
        get: function(target, prop, receiver){
            if(prop === "data" && repo.state == "unloaded"){
                repo.call()
            }
            return Reflect.get(target, prop, receiver)
        }
    })
}