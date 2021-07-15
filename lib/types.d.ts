import { BaseRepository } from "./repo";
import { BaseDataModel } from "./model";
import { BaseFormModel } from ".";
export declare type state_t = 'unloaded' | 'loading' | 'loaded' | 'error' | 'reloading';
export interface map_i<T> {
    [key: string]: T;
}
export interface main_i<T> {
    main: T;
}
export interface repoMap_i extends map_i<BaseRepository> {
}
export interface formMap_i extends map_i<BaseFormModel> {
}
export interface childMap_i extends map_i<BaseDataModel> {
}
export interface repoMainMap_i extends main_i<BaseRepository>, repoMap_i {
}
export interface formMainMap_i extends main_i<BaseFormModel>, formMap_i {
}
export interface childMainMap_i extends main_i<BaseDataModel>, childMap_i {
}
export declare type modelClass = new (...args: any[]) => BaseDataModel;
export interface child_i {
    key: string;
    model: modelClass;
}
export declare type repoConfig = BaseRepository | repoMainMap_i;
export declare type formConfig = BaseFormModel | formMainMap_i;
