#compiler = 6g
#linker = 6l
compiler = /Users/nate/src/go2/bin/6g
linker = /Users/nate/src/go2/bin/6l

all: go js
dev: go devjs

go: app/bin/playlistr
js: www/js/playlistr.js www/js/dev-playlistr.js
	rm -rf www-src/compiled
devjs: www/js/dev-playlistr.js
	rm -rf www-src/compiled

clean: cleango cleanjs
cleango:
	rm -rf app/bin
cleanjs:
	rm -rf www-src/compiled www/js

# Main app files
app/bin/playlistr: app/bin/easyauth.6 app/bin/rdio.6 app/bin/playlist.6 app/bin/playlistr.6
	$(linker) -o app/bin/playlistr app/bin/playlistr.6
	rm app/bin/*.6

app/bin/playlistr.6: app/playlistr.go
	$(compiler) -o app/bin/playlistr.6 app/playlistr.go

app/bin/playlist.6: app/playlist.go
	$(compiler) -o app/bin/playlist.6 app/playlist.go

app/bin/rdio.6: app/rdio.go
	$(compiler) -o app/bin/rdio.6 app/rdio.go

app/bin/easyauth.6: app/easyauth.go
	mkdir -p app/bin
	$(compiler) -o app/bin/easyauth.6 app/easyauth.go

# JS template files
www-src/compiled/templates.js:
	mkdir -p www-src/compiled
	java -jar templates/SoyToJsSrcCompiler.jar --outputPathFormat www-src/compiled/templates.js www-src/templates/*.soy

www/js/playlistr.js: www-src/compiled/templates.js
	mkdir -p www/js
	java -jar compiler/compiler.jar --js www-src/js/swfobject.js --js www-src/js/helpers.js --js www-src/js/Service.js --js www-src/js/ClientSearch.js --js www-src/js/Player.js --js www-src/js/PlayerCallbacks.js --js www-src/js/Playlist.js --js www-src/js/playlistr.js --js www-src/compiled/templates.js --js templates/soyutils.js --js_output_file www/js/playlistr.js

www/js/dev-playlistr.js: www-src/compiled/templates.js
	mkdir -p www/js
	cat www-src/js/swfobject.js www-src/js/helpers.js www-src/js/Service.js www-src/js/ClientSearch.js www-src/js/Player.js www-src/js/PlayerCallbacks.js www-src/js/Playlist.js www-src/js/playlistr.js www-src/compiled/templates.js templates/soyutils.js > www/js/dev-playlistr.js