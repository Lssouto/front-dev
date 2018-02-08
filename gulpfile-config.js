const paths = {
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
};
const options = {
    export: {
        fileOld: 'html', //without dot
        fileNew: '.blade.php' 
    }
};
const functions = {
    gulpState : () =>{
        let config  =  {
          state: '', //dev,build,export
          minify: false,
          dest : {}
        };
        const put = (state,min)=>{
            config.state = state;
            config.minify = min;

            switch (state){

                case "export":
                config.dest = paths.export;
                break;

                case "build":
                config.dest = paths.dist;
                break;

                default:
                config.dest = paths.tmp;
                break;
            }
            return config;
        };
        return {
            put
        };
    }
};
module.exports = {
    paths,
    options,
    gulpPutState : functions.gulpState()
};