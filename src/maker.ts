import * as _ from 'lodash';
import * as fs from 'fs-extra';
import * as path from 'path';

class Maker {

    /**
     * 配置文件
     * @type {{path: {root: string; except: any[]}; files: {test: RegExp; except: any[]}[]; cacheFile: string}}
     */
    private config = {
        path: {
            root: './src',
            except: [],
        },
        files: [{
            test: /\.vue$/,
            except: []
        }],
        cacheFile: './preloader.mapping.js',
    };

    /**
     * 查找到的文件列表
     */
    private files:Map<string,string> = new Map<string,string>();

    /**
     * 构造器
     * @param {object} config
     */
    constructor(config: object = {}) {
        this.config = _.defaultsDeep(config,this.config);
    }

    /**
     * 生成mapping文件
     */
    public make(): void {
        this.scanDir(this.config.path.root);
        this.output();
    }

    /**
     * 返回config
     * @returns {object}
     */
    public getConfig():object {
        return this.config;
    }

    /**
     * 扫描文件夹
     * @param {string} path
     */
    private scanDir(path:string):void {
        let files = fs.readdirSync(path),
            self = this;

        for(let filename of files) {
            let currentPath = path + '/' +filename;

            if (fs.pathExistsSync(currentPath)) {
                let stat = fs.statSync(currentPath);

                //如果是目录，则继续递归
                if (stat.isDirectory() && !this.isExceptDir(filename)) {
                    this.scanDir(currentPath);
                } else if (this.isTargetFile(filename)) {
                    this.parseFile(currentPath);
                }
            }
        };
    }

    /**
     * 判断文件是否是需要排除的文件
     * @param {string} name
     * @returns {boolean}
     */
    private isExceptDir(name:string):boolean {
        return this.isHit(name,this.config.path.except);
    }

    /**
     * 判断是否是目标文件
     * @param {string} name
     * @returns {boolean}
     */
    private isTargetFile(name:string):boolean {
        return this.isHit(name,this.config.files);
    }

    /**
     * name是否被conditions的条件命中
     * conditions是一个条件数组，可以包含string和regexp
     * string按包含计算命中
     * regexp按匹配计算命中
     * @param {string} name
     * @param {any[]} conditions
     * @returns {boolean}
     */
    private isHit(name:string,conditions:any[]):boolean {
        if (conditions.length) {
            for (let exp of conditions) {
                if (_.isRegExp(exp) && exp.test(name)) {
                    return true;
                } else if (_.isString(exp) && name.indexOf(exp) !== -1) {
                    return true;
                } else if (_.isObject(exp)) {
                    if (
                        //如果有正则，则对name判断
                        (_.has(exp,'test') && _.isRegExp(exp.test) && exp.test.test(name))
                        //如果有except，则对name进行排除
                        && (_.has(exp,'except') && !this.isHit(name,exp.except))
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;

    }

    /**
     * 解析文件
     * @param {string} file
     */
    private parseFile(file:string):void {
        let name:string = path.basename(file,path.extname(file));
        if (name) {
            this.files.set(name,file);
        }
    }

    /**
     * 输出
     */
    public output():void {

        let template = "let PreLoaderMapping = { \n",
            targetFile = this.config.cacheFile,
            requireFun = 'import';

        //测试环境
        if (process.env.NODE_ENV == 'test') {
            requireFun = 'require';
            this.config.cacheFile = targetFile = './preloader.mapping.ts';
        }

        this.files.forEach(function (path,name) {
            template += "\"" + name + "\": () => "+requireFun+"(/* webpackChunkName: \""+name+"\" */ \""+path+"\"), \n";
        });

        template += "};\n";
        template += "export default PreLoaderMapping; \n";
        template += "module.exports = PreLoaderMapping; \n";
        fs.ensureFile(targetFile);
        fs.writeFileSync(targetFile,template,'utf-8');
    }
}

export default Maker;

