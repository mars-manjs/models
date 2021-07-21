var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { initConfig } from "./helpers";
import { NotImplementedError } from "./errors";
import { observable } from 'mobx';
import { BaseModel } from "./base";
import { PubSub } from "./pubsub";
const BaseRepositoryConfigDefaults = {};
export class BaseRepository extends BaseModel {
    constructor(config) {
        super();
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
        this.preCall = async () => {
            /**
             * sets state to loading or reloading
             */
            this.state = this.state === 'loaded' ? 'reloading' : 'loading';
        };
        this.fetch = async () => {
            /**
             * retrieve data from repository
             */
            throw new NotImplementedError();
        };
        this.parse = async () => {
            /**
             * parse response data
             */
            throw new NotImplementedError();
        };
        this.postCall = async () => {
            /**
             * implement checking if call was successful
             *
             * sets state to 'loaded' or 'error'
             *
             * emits to onLoadSub
             */
            throw new NotImplementedError();
        };
        this.call = async () => {
            await this.preCall();
            await this.fetch();
            await this.parse();
            await this.postCall();
        };
        this.config = initConfig(BaseRepositoryConfigDefaults, config);
        this.data = config.data;
        this.onLoad = new PubSub();
        this.onError = new PubSub();
        this.state = 'unloaded';
    }
}
__decorate([
    observable
], BaseRepository.prototype, "state", void 0);
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
}
export class GraphQLRepository extends BaseRepository {
}
const APIRepositoryConfigDefaults = {
    path: '',
    method: 'GET'
};
export class APIRepository extends BaseRepository {
    constructor(config) {
        super({});
        this.fetch = async () => {
            // console.log(this.config.path, this.options)
            this.response = await fetch(this.config.path, this.options);
        };
        this.parse = async () => {
            this.data = await this.response.json();
        };
        this.postCall = async () => {
            /**
             * sets state upon success
             */
            if (this.response.status >= 200 && this.response.status < 300) {
                this.state = 'loaded';
                /**
                 * emits to LoadPubSub
                 */
                this.onLoad.emit(this.data);
            }
            else {
                this.state = 'error';
                /**
                 * emits to LoadPubSub
                 */
                this.onError.emit(this.data);
            }
        };
        this.config = initConfig(APIRepositoryConfigDefaults, config);
    }
    get body() {
        if (typeof this.config.body === "function") {
            return JSON.stringify(this.config.body());
        }
        return JSON.stringify(this.config.body);
    }
    get options() {
        return {
            method: this.config.method,
            body: this.body,
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
}
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const MockRepositoryConfig = {
    data: {},
    finalState: 'loaded'
};
export class MockRepository extends BaseRepository {
    constructor(config) {
        super({
            data: config.data
        });
        this.fetch = async () => {
            await timeout(100);
            this.response = this.config;
        };
        this.parse = async () => {
            this.data = this.response.data;
        };
        this.postCall = async () => {
            this.state = this.config.finalState;
            // console.log("POSTCALL", this.state)
            this.onLoad.emit(this.data);
        };
        this.config = initConfig(MockRepositoryConfig, config);
        // console.log("CREATING MOCK REPOSITORY")
    }
}
//# sourceMappingURL=repo.js.map