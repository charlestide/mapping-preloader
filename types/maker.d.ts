
export declare class Maker {

    constructor(config);

    public make(): void;

    public getConfig():object;

    private scanDir(path:string):void;

    private isExceptDir(name:string):boolean;

    private isTargetFile(name:string):boolean;

    private isHit(name:string,conditions:any[]):boolean;

    private parseFile(file:string):void;

    public output():void;

}

