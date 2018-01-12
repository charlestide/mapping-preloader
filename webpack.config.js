var path = require('path');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                include: [path.resolve('src')],
                exclude: [path.resolve('test')]
            },
            {
                test: /\.sass$/,
                loaders: ['style', 'css', 'sass']
            },
            {   test: /\.ts$/,
                loader: 'ts-loader'
            },
            {   test: /\.tsx$/,
                loader: 'ts-loader'
            },
            {
                test: /\.js\.map$/,
                loader: "raw-loader"
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        chunkFilename: './components/[name].bundle.js'
    },
    resolve: {
        extensions: ['.js','.ts'],
    }
};