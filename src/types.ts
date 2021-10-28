import { BaseRepo } from "./repo";
import { Model } from "./model";
import { FormModel } from ".";

export type state_t = 'unloaded' | 'loading' | 'loaded' | 'error' | 'reloading'


export interface map_i<T>{
    [key: string]: T
}

export interface main_i<T>{
    main: T
}

export interface repoMap_i extends map_i<BaseRepo>{}
export interface formMap_i extends map_i<FormModel>{}
export interface childMap_i extends map_i<Model>{}



export type modelClass = new (...args: any[]) => Model;
export interface child_i { key: string, model: modelClass }
export type childrensConfig_t = modelClass|{[key: string]: child_i}
export type collectionsConfig_t = childrensConfig_t




export interface event_i{
    type: string
    data?: any
}


export type validator_t = new (...args: any[]) => any
