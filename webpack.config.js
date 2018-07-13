const path = require('path');

module.exports = {
    entry: [
        "./client/client.html",
        "./client/ClientController.js"
    ],
    mode: 'development',
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: [
                    'html-loader'
                ]
            },
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
            },
            {
                test: /\.ts$/,
                use: [
                    'ts-loader'
                ]
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve(__dirname, './node_modules'),
            path.resolve(__dirname, './data'),
            path.resolve(__dirname, './client'),
            path.resolve(__dirname, './assets/css/')
        ]
    },
    node: {
        fs: 'empty'
    }
};
