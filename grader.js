#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes. Uses commander.js and cheerio. Teaches command line application development and basic DOM parsing.References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/


var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var sys = require('util');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLFILE_DEFAULT = 'http://obscure-reef-2770.herokuapp.com';
var targetFileName = "test.html";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1);
    }
    return instr;
};

var assertUrlExists = function(infile) {
    var instr = infile.toString();
    rest.get(instr).on('complete', function(result) {
	if (result instanceof Error) {
	    console.log('Error: ' + result.message);
	    process.exit(1);
	} else {
	    //return sys.puts(result);
	    return instr;
	}
    });
};


var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

/*var isUrlError = function(url) {
    rest.get(url).on('complete', function(result) {
	if (result instanceof Error) {
	    sys.puts('Error: ' + result.message);
	    this.retry(5000); // try again after 5 sec
	} else {
	    return result;
	}
    });
}*/

var writeURLToFile = function(url, fileName) {
    var response2console = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
            console.error("Wrote %s", csvfile);
            fs.writeFileSync(fileName, result);
        }
    };
    return response2console;
};

var checkAndParse = function(url, fileName, checkFile) {
    var parsedFile = writeURLToFile(url, fileName);
    var checkJson = checkHtmlFile(parsedFile, checkFile);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}



if(require.main == module) {
//    var alternateUrl = isUrlError(process.argv);
//    var html = alternateUrl || HTMLFILE_DEFAULT;
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url_file>', 'Path to external url', clone(assertUrlExists), URLFILE_DEFAULT)
	.parse(process.argv);
    if(program.url != undefined){
	var parsedData = checkAndParse(program.url, targetFileName, program.checks);
	return parsedData;
	} else{
	    var checkJson = checkHtmlFile(program.file, program.checks);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	  }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
