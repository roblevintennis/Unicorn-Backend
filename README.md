# Options Compiler for Unicorn UI Modules (aka Backend)

General strategy:

A user comes in at: [Buttons Builder](http://alexwolfe.github.io/Buttons/) and configures her button options. For example, she may remove or include various buttons types, or change the CSS class names, namespace, colors, etc.

Upon clicking the "Download" button the following happens behind the scenes:

* The Client POSTs (actually, we use jsonp so it's really a simulated post) options + module scss
* The Server (options-compiler), detects it's a custom configuration, and then validates both the options and modules provided
* The Server creates files with these custom options using regex replacement
* The Server does a `compass compile` and zips file
* Finally returns zip to client

## More Details

There are two main endpoints, "build" and "download". The only difference really is that download–in addition to configuring and compiling the module (which they both do)–will archive a zip and send back to client.

### Configure Options & Compile

As mentioned, both configure and compile; this is because they both share the same custom middleware that runs before the controllers:

	var customMiddleware = [
		//Ordering here is top to bottom
		safetyFirst,//copy module dir over since we mutate
		createOptionsMiddleware,
		compassCompileMiddleware];

So, as the names imply, we creat an options file (using regex replacement on an initial _options partial using the custom values the client sends up), and then we simply compile that module.

*Note that we plan to change the regex replacement once the Buttons-2 projec is implemented. Essentially, we've broken up the modules as includes (as opposed to types). So, per the client's request, we will instead comment out or uncomment the type includes *

## Buttons

The Buttons we use is a submodule of the buttons repo
```bash
[submodule "buttons"]
	path = buttons
	url = https://github.com/alexwolfe/Buttons.git
```

To update buttons submodule to very latest do:
```bash
cd buttons
git submodule init && git submodule update
git pull origin master
git checkout origin/master
git status # HEAD is now at <sha1 of HEAD>
```

Nice guide here: http://blog.jacius.info/git-submodule-cheat-sheet/

More to come...

## Buildpack

We recently switched buildpacks. Here's the notes.

First unset our old buildpack and point to the buildpack-multi:

    heroku config:unset BUILDPACK_URL
    heroku config:add BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git

Buildpack multi requires you to add your own .buildpacks file. This configuration is what I ended up using successfully:

    cat .buildpacks
    https://github.com/heroku/heroku-buildpack-nodejs.git
    https://github.com/heroku/heroku-buildpack-ruby.git


Here's my Gemfile to pickup only Compass:

    cat Gemfile
    source 'https://rubygems.org'
    gem 'compass'

Now you need to do:

    bundle install

Which will add a Gemfile.lock

Commit everything to git and push back to heroku. This will kick in your new multi buildpack configuration and hopefully get you back up and running. You should see both the nodejs and ruby buildpacks download serially per above configuration.

Reference: http://stackoverflow.com/questions/25091012/heroku-compass-buildpack-compass-fail/25714282#25714282


## Development

Ensure you have the heroku workbench installed (see [nodejs](https://devcenter.heroku.com/articles/nodejs) article [download toolbelt](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up)), and ensure you're a collaborator

	heroku login
	heroku apps:info # outputs: === options-compiler

If you don't have:

	heroku git:clone --app options-compiler


Add your keys and pull the latest:

	heroku keys:add
	git pull heroku master
	npm install
	bundle install

### Running builder locally

First start the options-compiler locally via foreman:

	foreman start web

Now you need to hit this from a client. The best way to do this is to also run the Buttons client locally using the `gh-pages` branch. Go to another directory and checkout that repo:

	git clone git@github.com:alexwolfe/Buttons.git
	git checkout gh-pages

In the `js/app/setup.js` file toggle the `serverUrl` property to point to localhost:

            //serverUrl: 'http://options-compiler.herokuapp.com',
            serverUrl: 'http://localhost:5000',

Now that you've updated to localhost you should be able to open the index.html page directly in the browser. On my system:

	file:///Users/roblevin/workspace/opensource/unicorn/Buttons/index.html

Since we're using jsonp, it "just works" even though the client is not behind a server.

## Viewing the Client HTTP Requests

In Chrome, you'll likely want to set a breakpoint for:

* In the `js/app/model.js#build` method which gets called when you open the Customize modal and click the "Update" button
* In the `js/app/app.js#download` method which gets called when you click any of the "Download" buttons

As you fire these client requests, the server console logs will be output to the stdout of the terminal where you did `foreman start web`.


## Pushing changes:

	git add .; git commit -m"YOUR MSG"; git push heroku master; #Takes long since downloads build packs!

View Heroku Site

	heroku open


### Debugging remote tips

	heroku logs --tail # tail the remote logs
	heroku run bash # open remote in local terminal


### Scheduler

We have scheduled updates of the Buttons submodule per these instructions: [Heroku Scheduler Docs](https://devcenter.heroku.com/articles/scheduler).

```bash
# add scheduler
heroku addons:add scheduler:standard

# open docs
heroku addons:docs scheduler

# open scheduler
heroku addons:open scheduler
```

The script doesn't update the submodule reference, it just manually updates the checked out branch to the latest [master]. Test it locally with:

```bash
heroku run ./bin/update-buttons-submodule #from project root directory
```



