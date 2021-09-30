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

export interface repoMainMap_i extends main_i<BaseRepo>, repoMap_i{}
export interface formMainMap_i extends main_i<FormModel>, formMap_i{}
export interface childMainMap_i extends main_i<Model>, childMap_i{}



export type modelClass = new (...args: any[]) => Model;
export interface child_i { key: string, model: modelClass }


export type repoConfig = BaseRepo | repoMainMap_i
export type formConfig = FormModel  | formMainMap_i


export interface event_i{
    type: string
    data: any
}