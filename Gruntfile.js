module.exports = function(grunt) {
    grunt.initConfig({
        compass: {
            dist: {
                options: {
                    sassDir: 'scss',
                    cssDir: 'css',
                    force: true,
                    outputStyle: 'compressed',
                    environment: 'production'
                }
            },
            dev: {
                options: {
                    sassDir: 'scss',
                    cssDir: 'css',
                    force: true
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.registerTask('heroku', 'compass');
};

