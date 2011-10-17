all: app/bin/playlistr www/js/playlistr.js
go: app/bin/playlistr
js: www/js/playlistr.js www/js/dev-playlistr.js
devjs: www/js/dev-playlistr.js

clean:
	rm -rf app/bin www-src/compiled www/js/playlistr.js
cleango:
	rm -rf app/bin
cleanjs:
	rm -rf www-src/compiled www/js/playlistr.js www/js/dev-playlistr.js

# Main app files
app/bin/playlistr: app/bin/easyauth.6 app/bin/rdio.6 app/bin/playlistr.6
	6l -o app/bin/playlistr app/bin/playlistr.6
	rm app/bin/playlistr.6 app/bin/easyauth.6 app/bin/rdio.6

app/bin/playlistr.6: app/playlistr.go
	6g -o app/bin/playlistr.6 app/playlistr.go

app/bin/rdio.6: app/rdio.go
	6g -o app/bin/rdio.6 app/rdio.go

app/bin/easyauth.6: app/easyauth.go
	mkdir app/bin
	6g -o app/bin/easyauth.6 app/easyauth.go

# JS template files
www-src/compiled/templates.js:
	mkdir www-src/compiled
	java -jar templates/SoyToJsSrcCompiler.jar --outputPathFormat www-src/compiled/templates.js www-src/templates/*.soy

www/js/playlistr.js: www-src/compiled/templates.js
	java -jar compiler/compiler.jar --js www-src/js/swfobject.js --js www-src/js/helpers.js --js www-src/js/Service.js --js www-src/js/ClientSearch.js --js www-src/js/Player.js --js www-src/js/playlistr.js --js www-src/compiled/templates.js --js templates/soyutils.js --js_output_file www/js/playlistr.js

www/js/dev-playlistr.js: www-src/compiled/templates.js
	cat www-src/js/swfobject.js www-src/js/helpers.js www-src/js/Service.js www-src/js/ClientSearch.js www-src/js/Player.js www-src/js/playlistr.js www-src/compiled/templates.js templates/soyutils.js > www/js/dev-playlistr.js
