import { state_t } from "./types"
import _ = require("lodash")
import { initConfig } from "./helpers"
import { NotImplementedError } from "./errors"


interface BaseRepositoryConfig_i {
    data?: any
}

const BaseRepositoryConfigDefaults = {
} as BaseRepositoryConfig_i
export class BaseRepository {
    config: BaseRepositoryConfig_i

    state: state_t = 'unloaded'
    response: any
    data: any
    constructor(config: BaseRepositoryConfig_i) {
        this.config = initConfig(BaseRepositoryConfigDefaults, config)
        this.data = config.data
    }


    preCall = async (): Promise<any> => {
        /**
         * sets state to loading or reloading
         */
        this.state = this.state === 'loading' ? 'reloading' : 'loading'
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

    get options(){
        return {
            method: this.config.method,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }

    fetch = async () => {
        console.log(this.config.path, this.options)
        this.response = await fetch(this.config.path, this.options)
    }

    parse = async () => {
        this.data = await this.response.json()
    }

    postCall = async () => {
        if (this.response.status >= 200 && this.response.status < 300) {
            this.state = 'loaded'
        }else{
            this.state = 'error'
        }
    }

    // call = () => {
    //     // abstraction of Fetch API
    //     // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
    // }
}




interface MockRepositoryConfig_i{
    data: any
}

const MockRepositoryConfig = {
    data: {
        abc: 123
    },
} as MockRepositoryConfig_i

export class MockRepository extends BaseRepository{
    constructor(config: MockRepositoryConfig_i){
        super({
            data: config.data
        })
        this.config = initConfig(MockRepositoryConfig, config)
    }

    fetch = async () => {
        this.response = this.config
    }
    parse = async () => {
        this.data = this.response.data
    }

    postCall = async () => {
        this.state = 'loaded'
    }
}