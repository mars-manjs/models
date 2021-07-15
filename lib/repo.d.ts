import { state_t } from "./types";
import { BaseModel } from "./base";
import { PubSub } from "./pubsub";
interface BaseRepositoryConfig_i {
    data?: any;
}
export declare class BaseRepository extends BaseModel {
    config: BaseRepositoryConfig_i;
    state: state_t;
    response: any;
    data: any;
    onLoad: PubSub<any>;
    onError: PubSub<any>;
    constructor(config: BaseRepositoryConfig_i);
    preCall: () => Promise<any>;
    fetch: () => Promise<any>;
    parse: () => Promise<any>;
    postCall: () => Promise<any>;
    call: () => Promise<void>;
}
/**
*
* this is the repository pattern, implemented with three examples
* - BaseFirestoreModel: for abstracting firestore interactions
* - BaseGraphQLModel: for abstracting GraphQL interactions
* - BaseAPIModel: for abstracting RESTful interactions
*
**/
export declare class FirestoreRepository extends BaseRepository {
}
export declare class GraphQLRepository extends BaseRepository {
}
interface APIRepositoryConfig_i extends BaseRepositoryConfig_i {
    path: string;
    method?: 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'TRACE';
    headers?: () => {} | {};
    body?: () => {} | {};
}
export declare class APIRepository extends BaseRepository {
    config: APIRepositoryConfig_i;
    response: Response;
    data: any;
    constructor(config: APIRepositoryConfig_i);
    get body(): string;
    get options(): {
        method: "CONNECT" | "DELETE" | "GET" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT" | "TRACE";
        body: string;
        headers: {
            'Content-Type': string;
        };
    };
    fetch: () => Promise<void>;
    parse: () => Promise<void>;
    postCall: () => Promise<void>;
}
interface MockRepositoryConfig_i {
    data: any;
}
export declare class MockRepository extends BaseRepository {
    constructor(config: MockRepositoryConfig_i);
    fetch: () => Promise<void>;
    parse: () => Promise<void>;
    postCall: () => Promise<void>;
}
export {};
