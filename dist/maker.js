"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var fsExtra = require("fs-extra");
var path = require("path");
var Maker = /** @class */ (function () {
    /**
     * 构造器
     * @param {object} config
     */
    function Maker(config) {
        if (config === void 0) { config = {}; }
        /**
         * 配置文件
         * @type {{path: {root: string; except: any[]}; files: {test: RegExp; except: any[]}[]; cacheFile: string}}
         */
        this.config = {
            path: {
                root: './src',
                exclude: [],
            },
            files: [{
                    test: /\.vue$/,
                    exclude: []
                }],
            cacheFile: './preloader.mapping.js',
        };
        /**
         * 查找到的文件列表
         */
        this.files = new Map();
        this.config = _.defaultsDeep(config, this.config);
    }
    /**
     * 生成mapping文件
     */
    Maker.prototype.make = function () {
        this.scanDir(this.config.path.root);
        this.output();
    };
    /**
     * 返回config
     * @returns {object}
     */
    Maker.prototype.getConfig = function () {
        return this.config;
    };
    /**
     * 扫描文件夹
     * @param {string} path
     */
    Maker.prototype.scanDir = function (path) {
        var files = fsExtra.readdirSync(path), self = this;
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var filename = files_1[_i];
            var currentPath = path + '/' + filename;
            if (fsExtra.pathExistsSync(currentPath)) {
                var stat = fsExtra.statSync(currentPath);
                //如果是目录，则继续递归
                if (stat.isDirectory() && !this.isExcludeDir(filename)) {
                    this.scanDir(currentPath);
                }
                else if (this.isTargetFile(filename)) {
                    this.parseFile(currentPath);
                }
            }
        }
        ;
    };
    /**
     * 判断文件是否是需要排除的文件
     * @param {string} name
     * @returns {boolean}
     */
    Maker.prototype.isExcludeDir = function (name) {
        return this.isHit(name, this.config.path.exclude);
    };
    /**
     * 判断是否是目标文件
     * @param {string} name
     * @returns {boolean}
     */
    Maker.prototype.isTargetFile = function (name) {
        return this.isHit(name, this.config.files);
    };
    /**
     * name是否被conditions的条件命中
     * conditions是一个条件数组，可以包含string和regexp
     * string按包含计算命中
     * regexp按匹配计算命中
     * @param {string} name
     * @param {any[]} conditions
     * @returns {boolean}
     */
    Maker.prototype.isHit = function (name, conditions) {
        if (conditions.length) {
            for (var _i = 0, conditions_1 = conditions; _i < conditions_1.length; _i++) {
                var exp = conditions_1[_i];
                if (_.isRegExp(exp) && exp.test(name)) {
                    return true;
                }
                else if (_.isString(exp) && name.indexOf(exp) !== -1) {
                    return true;
                }
                else if (_.isObject(exp)) {
                    if (
                    //如果有正则，则对name判断
                    (_.has(exp, 'test') && _.isRegExp(exp.test) && exp.test.test(name))
                        //如果有except，则对name进行排除
                        && (_.has(exp, 'exclude') && !this.isHit(name, exp.exclude))) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    /**
     * 解析文件
     * @param {string} file
     */
    Maker.prototype.parseFile = function (file) {
        var name = path.basename(file, path.extname(file));
        if (name) {
            this.files.set(name, file);
        }
    };
    /**
     * 输出
     */
    Maker.prototype.output = function () {
        var template = "let PreLoaderMapping = { \n", targetFile = this.config.cacheFile, requireFun = 'import';
        //测试环境
        if (process.env.NODE_ENV == 'test') {
            requireFun = 'require';
            this.config.cacheFile = targetFile = './preloader.mapping.ts';
        }
        this.files.forEach(function (path, name) {
            template += "\"" + name + "\": () => " + requireFun + "(/* webpackChunkName: \"" + name + "\" */ \"" + path + "\"), \n";
        });
        template += "};\n";
        template += "export default PreLoaderMapping; \n";
        template += "module.exports = PreLoaderMapping; \n";
        // fsExtra.ensureFile(targetFile);
        fsExtra.writeFileSync(targetFile, template, 'utf-8');
    };
    return Maker;
}());
exports.default = Maker;
//# sourceMappingURL=maker.js.map