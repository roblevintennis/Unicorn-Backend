# Options Compiler for Unicorn UI Modules (aka Backend)

General strategy:

* The Client POSTs (actually, we use jsonp so it's really a simulated post) options + module scss
* The Server (options-compiler), detects it's a custom configuration, and then validates both the options and modules provided
* The Server creates files with these custom options
* The Server does a `compass compile`, etc., and finally returns zip to client

## Buttons

The Buttons we use is a submodule of the buttons repo
```shell
[submodule "buttons"]
	path = buttons
	url = https://github.com/alexwolfe/Buttons.git
```
To update buttons submodule to very latest do:
```shell
cd buttons
git submodule init && git submodule update
git pull origin master
git checkout origin/master
git status # HEAD is now at <sha1 of HEAD>
```

Nice guide here: http://blog.jacius.info/git-submodule-cheat-sheet/

More to come...
