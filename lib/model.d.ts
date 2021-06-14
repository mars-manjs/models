import { BaseRepository } from "./repo";
import { state_t } from "./types";
import { BaseFormModel } from "./forms";
declare type modelClass = new (...args: any[]) => BaseDataModel;
interface child_i {
    key: string;
    model: modelClass;
}
interface BaseDataModelConfig_i {
    data?: any;
    repos?: BaseRepository | {
        [key: string]: BaseRepository;
    };
    forms?: {
        [key: string]: BaseFormModel;
    };
    async?: boolean;
    children?: modelClass | {
        [key: string]: child_i;
    };
    parent?: BaseDataModel;
}
export declare class BaseDataModel {
    /**
     * BaseDataModel implements the base functionality of BaseDataItemModel and BaseDataCollectionModel
     */
    config: BaseDataCollectionModelConfig_i;
    repos: {
        [key: string]: BaseRepository;
    };
    forms: {
        [key: string]: BaseFormModel;
    };
    children: {
        [key: string]: BaseDataModel;
    };
    _data: any;
    parent?: BaseDataModel;
    constructor(config: BaseDataModelConfig_i);
    get state(): state_t;
    loadRepos: () => void;
    loadChildren: () => Promise<void>;
    loadForms: () => void;
    get data(): any;
    load(): Promise<void>;
}
export declare class BaseDataItemModel extends BaseDataModel {
}
interface BaseDataCollectionModelConfig_i extends BaseDataModelConfig_i {
    collections?: modelClass | {
        [key: string]: child_i;
    };
}
export declare class BaseDataCollectionModel extends BaseDataModel {
    /**
     * BaseDataCollectionModel is for an array of BaseDataModel (Item or Collection)
     *
     * i.e. WikiSections, WikiPages
     *
     *
     * CHALLENGES:
     * - how to set the state of loaded only after having iterated through children
     * - async / sync collection
     */
    asyncState: state_t;
    config: BaseDataCollectionModelConfig_i;
    collections: {
        [key: string]: BaseDataModel[];
    };
    constructor(config: BaseDataCollectionModelConfig_i);
    get state(): state_t;
    loadCollections: () => Promise<void>;
    load(): Promise<void>;
}
export {};
