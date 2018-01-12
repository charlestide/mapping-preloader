
import {Maker} from "./maker";

declare class PreLoader {

    static instance: PreLoader;

    private loadedCallback;

    private maker:Maker;

    private components:Map<string,object>;

    private constructor(config)

    static getInstance(config?): PreLoader;

    static install(Vue,options?);

    public loadMap(componentMap:object):void;

    public getMaker():Maker;

    public setCallback(callback);

    public get(name:string);

    public register(name:string);

    public registerAll():void;
}

export default PreLoader;

export * from "./maker";

