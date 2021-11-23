import { event_i, state_t } from "./types"
import * as _ from "lodash"
import { initConfig } from "./helpers"
import { makeObservable, observable } from 'mobx'
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


export class BaseRepo<DataT = any, PayloadT = any> extends Base {
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
        // console.log("YOOO!", config)
        if (config?.events?.onLoad) {
            this.onLoad.subscribe((data) => {
                events.emit(config.events.onLoad.type, config.events.onLoad.data, data)
            })
        }
        if (config?.events?.onError) {
            this.onError.subscribe((data) => {
                events.emit(config.events.onError.type, config.events.onError.data, data)
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
        // throw new NotImplementedError()
    }

    parse = async (): Promise<any> => {
        /**
         * parse response data
         */
        // throw new NotImplementedError()
    }

    postCall = async (): Promise<any> => {
        /**
         * implement checking if call was successful 
         * 
         * sets state to 'loaded' or 'error'
         * 
         * emits to onLoadSub 
         */
        // throw new NotImplementedError()
    }
    _postCall = async () => {
        /**
         * cannot be written over
         * 
         * this is used for common postCall logic of a repo including
         * 1. emiting pubsub events
         */
        // console.log("_postcall")
        if (this.state == 'loaded'){
            this.onLoad.emit(this.data)
            // console.log("emit", JSON.stringify(this.data))
        } 
        if (this.state == 'error') this.onError.emit(this.data)
    }

    async call(payload?: PayloadT) {
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

interface APIRepoConfig_i<BodyT = any, DataT = any> extends BaseRepoConfig_i<DataT> {
    path: string
    method?: 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'TRACE',
    headers?: {} | (() => {})
    body?: BodyT | (() => BodyT)
}

const APIRepoConfigDefaults = {
    path: '',
    method: 'GET'
} as APIRepoConfig_i

export class APIRepo<DataT = any, PayloadT = any> extends BaseRepo<DataT, PayloadT> {
    declare config: APIRepoConfig_i<PayloadT, DataT>
    declare response: Response
    _body: PayloadT | (() => PayloadT)
    _headers: {} | (()=>{})
    constructor(config?: APIRepoConfig_i<PayloadT, DataT>) {
        super(config)
        this.config = initConfig(APIRepoConfigDefaults, config)
        this._body = this.config.body
        this._headers = this.config.headers
    }

    get body() {
        if (typeof this._body === "function") {
            return JSON.stringify((this._body as () => PayloadT)())
        }
        return JSON.stringify(this._body)
    }

    get headers(){
        if(!this._headers) return {'Content-Type': 'application/json'}
        if (typeof this._headers === "function") {
            return this._headers()
        }
        return this._headers
    }

    get options() {
        return {
            method: this.config.method,
            body: this.body,
            headers: {
                ...this.headers
            }
        }
    }



    call = async (payload?: PayloadT) => {
        if (payload) {
            this._body = payload
        }
        await super.call()
    }
    fetch = async () => {
        try {
            this.response = await fetch(this.config.path, this.options)
        } catch (e) {
            // console.warn(e)
            this.state = 'error'
        }
    }

    parse = async () => {
        try {
            const str = await this.response.text()
            try {
                this.data = JSON.parse(str)
            } catch (e) {
                this.data = str as any
            }
        } catch (e) {
        }
    }

    postCall = async () => {
        /**
         * sets state upon success
         */
        if (this.response.status >= 200 && this.response.status < 300) {
            this.state = 'loaded'
        } else {
            this.state = 'error'
        }
    }
}




function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


interface MockRepoConfig_i<DataT = any> extends BaseRepoConfig_i<DataT> {
    data: DataT,
    finalState?: state_t
}

const MockRepoConfig = {
    data: {},
    finalState: 'loaded'
} as MockRepoConfig_i

export class MockRepo<DataT = any> extends BaseRepo {
    declare config: MockRepoConfig_i<DataT>
    constructor(config?: MockRepoConfig_i<DataT>) {
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

export const PeriodicRepo = <T extends BaseRepo>(repo: T, interval: number): T => {
    let started = false
    const periodicCall = () => {
        if(!started){
            started = true
            setInterval(() => {
                if(!window.document.hidden && window.document.hasFocus()){
                    repo.call()
                }
            }, interval || 10000)
        }
    }
    periodicCall()

    // return new Proxy(repo, {
        // get: function (target, prop, receiver) {
            // if (prop === "call") {
            // }
            // return Reflect.get(target, prop, receiver)
        // }
    // })
    return repo
}

export const OnDemandRepo = <T extends BaseRepo>(repo: T): T => {
    return new Proxy(repo, {
        get: function (target, prop, receiver) {
            if (prop === "data" && repo.state == "unloaded") {
                repo.call()
            }
            return Reflect.get(target, prop, receiver)
        }
    })
}