all: app/bin/playlistr www/js/templates.js www/js/soyutils.js
go: app/bin/playlistr
js: www/js/templates.js www/js/soyutils.js www/js/playlistr.js
clean:
	rm -rf app/bin www/js/templates.js
cleango:
	rm -rf app/bin
cleanjs:
	rm www/js/templates.js www/js/playlistr.js

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
www/js/templates.js:
	java -jar templates/SoyToJsSrcCompiler.jar --outputPathFormat www/js/templates.js www-src/templates/*.soy

www/js/soyutils.js: templates/soyutils.js
	cp templates/soyutils.js www/js/soyutils.js

www/js/playlistr.js: www/js/soyutils.js www/js/templates.js www-src/js/playlistr.js
	java -jar compiler/compiler.jar --js www-src/js/playlistr.js --js www/js/templates.js --js www/js/soyutils.js --js_output_file www/js/playlistr.js
