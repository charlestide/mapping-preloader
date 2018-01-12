
import Maker from './maker';
import * as _ from 'lodash';

class PreLoader {

    static instance: PreLoader;

    /**
     * 加载完成后的callback
     */
    private loadedCallback: Function;

    /**
     * @var Maker
     */
    private maker:Maker;

    /**
     * 需加载的组件信息
     * @type {Map<string, Object>}
     */
    private components:Map<string,object> = new Map<string, object>();

    /**
     * 私有构造
     * @param {object} config
     */
    private constructor(config: object = {}) {
        if (_.has(config,'callback')) {
            this.setCallback(_.get(config,'callback'));
        }

        this.maker = new Maker(config);
        this.maker.make();

        let makerConfig = this.maker.getConfig();
        if (_.has(makerConfig,'cacheFile')) {
            this.loadMap(
                require('.'+_.get(makerConfig,'cacheFile'))
            );
        }
    }

    /**
     * 获得单例实例
     * @param {object} config
     * @returns {PreLoader}
     */
    static getInstance(config = {}): PreLoader {
        if (!PreLoader.instance) {
            PreLoader.instance = new PreLoader(config);
        }
        return PreLoader.instance;
    }

    /**
     * Vue plugins 的安装方法
     * @param Vue
     * @param {object} options
     */
    static install(Vue:any,options:any = {}) {
        let loader = PreLoader.getInstance(options);

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
     * 返回 Maker
     * @returns {Maker}
     */
    public getMaker():Maker {
        return this.maker;
    }

    /**
     * 设置加载完成后的callback
     * @param {Function} callback
     */
    public setCallback(callback: Function) {
        this.loadedCallback = callback;
    }

    /**
     * 获取一个模块的加载函数
     * @param {string} name
     * @returns {any}
     */
    public get(name:string) {
        let self = this,
            callback = this.loadedCallback;

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
            // Vue.component(name,com);
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