//#!/usr/bin/env node

import Maker from "./maker";
import {loader} from "webpack";
import startsWith = require("core-js/fn/string/starts-with");

const
    appInfo = require('../package.json'),
    fs = require('fs-extra'),
    colors = require('colors'),
    _ = require('lodash');

let program = require('commander'),
    defaultConfig = {
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

program
    .version(appInfo.version)
    .description(
        'Preloader is '+appInfo.description+'. This is a tool to generate file mapping for sync loading'
    )
    .option('-ex, --exclude', 'specify exclude dirname or filename that will be exclude')
    .option('-e, --extension', 'specify which files to be scanned')
    .option('-r, --root', 'specify root path to scan')
    .option('-c, --config <file>', 'specify config file', 'preloader.config.json')
    .option('-t, --target <file>', 'specify target file that save scanning result', './preloader.mapping.js')
    .option('-i --init','generate a preloader.config.json for example');

program.parse(process.argv);

//初始化config文件
if (program.args.length && program.args[0] == 'init') {
    fs.writeFileSync('./preloader.config.json',"{ \n" +
        "\t\"path\": {\n" +
        "\t\t\"root\": \"./src\",\n" +
        "\t\t\"exclude\": [\"test\",\"node_modules\"]\n" +
        "\t},\n" +
        "\t\"files\": [\n" +
        "\t\t{\n" +
        "\t\t\t\"test\": \"\/\\\\.vue|js$\/\",\n" +
        "\t\t\t\"exclude\": [\"test\"]\n" +
        "\t\t}\n" +
        "\t],\n" +
        "\t\"cacheFile\": \"./preloader.mapping.js\"\n" +
        "}\n",'utf-8');

    console.log('');
    console.log(colors.yellow('./preloader.config.json') + ' generated');
    process.exit();
}

    //配置文件路径
let configFile = program.config ? program.config : './preloader.config.json',
    //配置信息
    config = {};

console.log('');


//读取配置文件
if (fs.pathExistsSync(configFile)) {
    console.log('Use config file: ' + colors.green(configFile));
    try {
        let localConfig = fs.readJSONSync('./'+configFile);

        //如果发现test是能"/"开头和结尾的，就将它转成正则表达式
        let files = [];
        for (let file of _.get(localConfig,'files')) {
            let test = file.test;
            if (_.isString(file.test)) {
                if (file.test[0] == '/' && file.test[file.test.length-1] == '/') {
                    file.test = eval(file.test);
                }
            }
            files.push({
                test: file.test,
                exclude: file.exlude
            })
        }
        _.set(localConfig,'files',files);

        config = _.defaults(localConfig, defaultConfig);

    } catch (e) {
        console.error(colors.red('cannot parse config file: ' + configFile));
        console.error(e);
        console.log('');
    }
}

//设置rootPath
if (program.args.length > 0) {
    _.set(config,'path.root',program.args[0])
}


//设置排除
if (program.exclude) {
    let pathExclude = _.get(config,'path.exclude');
    if (!_.isArray(pathExclude)) {
        pathExclude = [];
    }
    _.set(config,'path.exclude',pathExclude);
}

//增加扩展名
if (program.extension) {
    let files = _.get(config,'files');
    if (!_.isArray(files)) {
        files = [];
    }

    for (let ext of program.extension.split(',')) {
        files.push({
            test: new RegExp('\.'+ext+'$','i'),
            exclude: _.get(config,'path.exclude')
        });
    }
}

//扫描的根目录
if (program.root && fs.pathExistsSync(program.root)) {
    _.set(config,'path.root',program.root);
}

//指定输出文件
if (program.target) {
    _.set(config,'cacheFile',program.target);
}

let maker = new Maker(config);
    config = maker.getConfig();

console.log('Start Scanning at: ' + colors.green(_.get(config,'path.root'))
    + ' Except those path: ' + _.get(config,'path.exclude').toString());

let fileTests = 'Those files will be hit: ';
for (let f of _.get(config,'files')) {
    fileTests +=  colors.blue(_.get(f,'test')) + ' ';
}
console.log(fileTests);
console.log('');
maker.make();
console.log('');

console.log('Cache Files ' + colors.yellow(_.get(config,'cacheFile')) + ' Saved');
