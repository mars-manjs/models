import { state_t } from "./types"
import * as _ from "lodash"
import { initConfig } from "./helpers"
import { NotImplementedError } from "./errors"
import {observable} from 'mobx'
import { BaseModel } from "./base"
import { PubSub } from "./pubsub"

interface BaseRepositoryConfig_i {
    data?: any
}

const BaseRepositoryConfigDefaults = {
} as BaseRepositoryConfig_i
export class BaseRepository extends BaseModel{
    config: BaseRepositoryConfig_i


    @observable
    state: state_t
    response: any
    data: any
    onLoad: PubSub<any>
    onError: PubSub<any>
    constructor(config: BaseRepositoryConfig_i) {
        super()
        this.config = initConfig(BaseRepositoryConfigDefaults, config)
        this.data = config.data
        this.onLoad = new PubSub()
        this.onError = new PubSub()
        this.state = 'unloaded'
    }
    // set state(state: state_t){
    //     console.log("STATE IS BEING OVER WRITTEN", state)
    //     this._state = state
    // }
    // get state(){
    //     return this._state
    // }

    // onLoad = (subscriber: (value: any)=>void) => {
    //     this.onLoadSub.subscribe(subscriber)
    // }
    // onError = (subscriber: (value: any)=>void) => {
    //     this.onLoadSub.subscribe(subscriber)
    // }


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

    call = async () => {
        await this.preCall()
        await this.fetch()
        await this.parse()
        await this.postCall()
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
// 
export class FirestoreRepository extends BaseRepository {
    // TODO
}

export class GraphQLRepository extends BaseRepository {
    // TODO
}

interface APIRepositoryConfig_i extends BaseRepositoryConfig_i{
    path: string
    method?: 'CONNECT'|'DELETE'|'GET'|'HEAD'|'OPTIONS'|'PATCH'|'POST'|'PUT'|'TRACE',
    headers?: ()=>{} | {}
    body?:    ()=>{} | {}
}

const APIRepositoryConfigDefaults = {
    path: '',
    method: 'GET'
} as APIRepositoryConfig_i

export class APIRepository extends BaseRepository {
    config: APIRepositoryConfig_i
    response: Response
    data: any
    constructor(config: APIRepositoryConfig_i){
        super({})
        this.config = initConfig(APIRepositoryConfigDefaults, config)
    }

    get body(){
        if(typeof this.config.body === "function"){
            return JSON.stringify(this.config.body())
        }
        return JSON.stringify(this.config.body)
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

    fetch = async () => {
        // console.log(this.config.path, this.options)
        this.response = await fetch(this.config.path, this.options)
    }

    parse = async () => {
        this.data = await this.response.json()
    }

    postCall = async () => {
        /**
         * sets state upon success
         */
        if (this.response.status >= 200 && this.response.status < 300) {
            this.state = 'loaded'
            /**
             * emits to LoadPubSub
             */
            this.onLoad.emit(this.data)
        }else{
            this.state = 'error'
            /**
             * emits to LoadPubSub
             */
            this.onError.emit(this.data)
        }


    }

    // call = () => {
    //     // abstraction of Fetch API
    //     // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
    // }
}




function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


interface MockRepositoryConfig_i extends BaseRepositoryConfig_i{
    data: any,
    finalState?: state_t
}

const MockRepositoryConfig = {
    data: {},
    finalState: 'loaded'
} as MockRepositoryConfig_i

export class MockRepository extends BaseRepository{
    config: MockRepositoryConfig_i
    constructor(config: MockRepositoryConfig_i){
        super({
            data: config.data
        })
        this.config = initConfig(MockRepositoryConfig, config)
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
        // console.log("POSTCALL", this.state)
        this.onLoad.emit(this.data)
    }
}