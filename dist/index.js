"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var vue_1 = require("vue");
var PreLoader = /** @class */ (function () {
    /**
     * 私有构造方法
     * @param {string} cacheFile
     * @param {Function} callback
     */
    function PreLoader(cacheFile, callback) {
        /**
         * 需加载的组件信息
         * @type {Map<string, Object>}
         */
        this.components = new Map();
        if (callback) {
            this.setCallback(callback);
        }
        try {
            this.loadMap(require(cacheFile));
        }
        catch (e) {
            console.error('cannot load cache file: ' + cacheFile);
        }
    }
    /**
     * 获得单例实例
     * @param {string} cacheFile
     * @param {Function} callback
     * @returns {PreLoader}
     */
    PreLoader.getInstance = function (cacheFile, callback) {
        if (!PreLoader.instance) {
            PreLoader.instance = new PreLoader(cacheFile, callback);
        }
        return PreLoader.instance;
    };
    /**
     * Vue plugins 的安装方法
     * @param Vue
     * @param {object} options
     */
    PreLoader.install = function (Vue, options) {
        if (options === void 0) { options = {}; }
        var loader = PreLoader.getInstance(_.get(options, 'cacheFile', './preload.mapping.json'), _.get(options, 'callback', null));
        if (_.has(options, 'callback')) {
            loader.setCallback(options.callback);
        }
        Vue.prototype.$loader = loader;
    };
    /**
     * 加载一个新的组件列表
     * @param {object} componentMap
     */
    PreLoader.prototype.loadMap = function (componentMap) {
        var _this = this;
        _.forEach(componentMap, function (com, name) {
            if (_.isString(name) && _.isFunction(com)) {
                _this.components.set(name, {
                    loader: com,
                    loaded: false,
                    name: name
                });
            }
        });
    };
    /**
     * 设置加载完成后的callback
     * @param {Function} callback
     */
    PreLoader.prototype.setCallback = function (callback) {
        this.loadedCallback = callback;
    };
    /**
     * 获取一个模块的加载函数
     * @param {string} name
     * @returns {any}
     */
    PreLoader.prototype.get = function (name) {
        var callback = this.loadedCallback;
        if (this.components && this.components.has(name)) {
            var item = this.components.get(name);
            if (!_.has(item, 'loader')) {
                console.error('module should have \"loader\" property');
            }
            var loaderFunction_1 = _.get(item, 'loader');
            if (_.isFunction(callback)) {
                return function () { return loaderFunction_1().then(function (com) {
                    callback(name);
                    return com;
                }); };
            }
            else {
                return function () { return loaderFunction_1(); };
            }
        }
        console.error('component not found: ' + name);
    };
    /**
     * 将组件用vue.component方法注册
     * @param {string} name
     */
    PreLoader.prototype.register = function (name) {
        try {
            var com = this.get(name);
            vue_1.default.component(name, com);
        }
        catch (e) {
            console.error('module "' + name + '" cannot register');
        }
    };
    /**
     * 注册所有组件
     */
    PreLoader.prototype.registerAll = function () {
        for (var name in this.components) {
            this.register(name);
        }
    };
    return PreLoader;
}());
exports.default = PreLoader;
//# sourceMappingURL=index.js.map