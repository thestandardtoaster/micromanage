const path = require('path');

module.exports = {
    entry: "./client/js/clientMain.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, './node_modules'),
            path.resolve(__dirname, './data'),
            path.resolve(__dirname, './client/js'),
            path.resolve(__dirname, './client/css')
        ]
    },
    node: {
        fs: 'empty'
    }
};
