module.exports = function(grunt) {
    grunt.initConfig({
        compass: {
            dist: {
                options: {
                    sassDir: 'buttons/scss',
                    cssDir: 'buttons/css',
                    force: true,
                    outputStyle: 'compressed',
                    environment: 'production'
                }
            },
            dev: {
                options: {
                    sassDir: 'buttons/scss',
                    cssDir: 'buttons/css',
                    force: true
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.registerTask('heroku', 'compass');
};

