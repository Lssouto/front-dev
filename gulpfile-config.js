module.exports = {
    paths: {
        app : {
            base : 'app',
            html : 'app/',
            fonts: 'app/fonts',
            js: 'app/scripts',
            scss: 'app/styles',
            images: 'app/images'
        },
        tmp: {
            base: '.tmp',
    		fonts: '.tmp/fonts',
    		js: '.tmp/scripts',
            css: '.tmp/styles'
    	},
    	dist: {
            base: 'dist',
    		fonts: 'dist/fonts',
            js: 'dist/scripts',
            css: 'dist/styles',
            images: 'dist/images'
    	},
        export: {
            base: 'export',
            fonts: 'export/fonts',
            js: 'export/scripts',
            css: 'export/styles/css',
            scss:  'export/styles/scss',
            html: 'export/views',
            images: 'export/images',
        },
    }
};