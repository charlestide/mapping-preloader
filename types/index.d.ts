
import {Maker} from "./maker";

declare class PreLoader {

    static instance: PreLoader;

    private loadedCallback;

    private maker:Maker;

    private components:Map<string,object>;

    private constructor(config)

    static getInstance(cacheFile:string,callback?:Function): PreLoader;

    static install(Vue:any,options:any):void;

    public loadMap(componentMap:object):void;

    public getMaker():Maker;

    public setCallback(callback:any):void;

    public get(name:string):any;

    public register(name:string):void;

    public registerAll():void;
}

export default PreLoader;

export * from "./maker";


