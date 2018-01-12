import * as _ from 'lodash';
import Vue from 'vue';

class PreLoader {

    static instance: PreLoader;

    /**
     * 加载完成后的callback
     */
    private loadedCallback: Function;

    /**
     * 需加载的组件信息
     * @type {Map<string, Object>}
     */
    private components:Map<string,object> = new Map<string, object>();

    /**
     * 私有构造方法
     * @param {string} cacheFile
     * @param {Function} callback
     */
    private constructor(cacheFile:string,callback?:Function) {
        if (callback) {
            this.setCallback(callback);
        }

        try {
            this.loadMap(
                require(cacheFile)
            );
        } catch (e) {
            console.error('cannot load cache file: ' + cacheFile);
        }


    }

    /**
     * 获得单例实例
     * @param {string} cacheFile
     * @param {Function} callback
     * @returns {PreLoader}
     */
    static getInstance(cacheFile:string,callback?:Function): PreLoader {
        if (!PreLoader.instance) {
            PreLoader.instance = new PreLoader(cacheFile,callback);
        }
        return PreLoader.instance;
    }

    /**
     * Vue plugins 的安装方法
     * @param Vue
     * @param {object} options
     */
    static install(Vue:any,options:any = {}):void {

        let loader = PreLoader.getInstance(
            _.get(options,'cacheFile','./preload.mapping.json'),
            _.get(options,'callback',null)
        );

        if (_.has(options,'callback')) {
            loader.setCallback(options.callback);
        }

        Vue.prototype.$loader = loader;
    }

    /**
     * 加载一个新的组件列表
     * @param {object} componentMap
     */
    public loadMap(componentMap:object):void {
        _.forEach(componentMap,(com,name) => {
            if (_.isString(name) && _.isFunction(com)) {
                this.components.set(name,{
                    loader: com,
                    loaded: false,
                    name: name
                });
            }
        });
    }

    /**
     * 设置加载完成后的callback
     * @param {Function} callback
     */
    public setCallback(callback: Function):void {
        this.loadedCallback = callback;
    }

    /**
     * 获取一个模块的加载函数
     * @param {string} name
     * @returns {any}
     */
    public get(name:string):any {
        let callback = this.loadedCallback;

        if (this.components && this.components.has(name)) {
            let item = this.components.get(name);

            if (!_.has(item,'loader')) {
                console.error('module should have \"loader\" property');
            }

            let loaderFunction = _.get(item,'loader');

            if (_.isFunction(callback)) {
                return () => loaderFunction().then(function (com:any) {
                    callback(name);
                    return com;
                });
            } else {
                return () => loaderFunction();
            }
        }
        console.error('component not found: ' + name);
    }

    /**
     * 将组件用vue.component方法注册
     * @param {string} name
     */
    public register(name:string) {
        try {
            let com = this.get(name);
            Vue.component(name,com);
        } catch (e) {
            console.error('module "'+name+'" cannot register');
        }
    }

    /**
     * 注册所有组件
     */
    public registerAll():void {
        for (let name in this.components) {
            this.register(name);
        }
    }

}

export default PreLoader;