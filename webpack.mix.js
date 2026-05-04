const mix = require('laravel-mix');
const path = require('path');

mix.js('resources/js/app.js', 'public/js/app.js')
    .react()
    .sass('resources/sass/app.scss', 'public/css', {
        additionalData: `@use "resources/sass/variables" as *;`,
    })
    .options({
        processCssUrls: false,
    })
    .webpackConfig({
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    use: [
                        {
                            loader: 'sass-loader',
                            options: {
                                additionalData: `@use "resources/sass/variables" as *;`,
                                sassOptions: {
                                    includePaths: [path.resolve(__dirname, 'resources/sass')],
                                },
                            },
                        },
                    ],
                },
            ],
        },
    })
    .version();
