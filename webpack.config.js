const path = require('path');

const main = () => {
    return {
        entry: {
            main: './src/main/Main'
        },
        output: {
            path: path.join(__dirname, './dist'),
            filename: '[name].bundle.js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
            modules: ['./node_modules']
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true
                            }
                        }
                    ]
                }
            ]
        },
        target: 'electron-main',
        node: {
            __dirname: false
        }
    };
};

const injection = () => {
    return {
        entry: {
            injection: './src/injection/Injection'
        },
        output: {
            path: path.join(__dirname, './dist'),
            filename: '[name].bundle.js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
            modules: ['./node_modules']
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true
                            }
                        }
                    ]
                }
            ]
        },
        target: 'electron-renderer'
    };
};

const preload = () => {
    return {
        entry: {
            preload: './src/preload/Preload'
        },
        output: {
            path: path.join(__dirname, './dist'),
            filename: '[name].bundle.js'
        },
        resolve: {
            extensions: ['.ts', '.js'],
            modules: ['./node_modules']
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true
                            }
                        }
                    ]
                }
            ]
        },
        target: 'electron-preload',
        node: {
            __dirname: false
        }
    };
};

module.exports = [main, injection, preload];
