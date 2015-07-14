import {parse} from "cltags";
import {writeFile, exists, stat, open, read, close} from "fs";
//import  from "child_process" as shell;
var shell = require("shelljs");
let defaults = {
    repository: "",
    remote: "origin",
    branch: "master"
};
let replacements = {
    "M":"bumpmajor",
    "m":"bumpminor",
    "p":"bumppatch",
    "P":"prerelease"
};

//parseArgs parses the command line args passed to it into a single object and returns it.
//export var parseArgs = (args, done) => {
//  return new Promise((resolve, reject) => {
//    
//    //adding in a bogus value into the args array because CLTags drops the first arg.
//    var targs = ["bogus"].concat(args);
//    var results = "default";
//    try {
//      results = parse(targs, defaults, replacements);
//    } catch(e){
//      reject(Error(`Error: ${e}`));
//    }
//    resolve(results);
//  });
//};

export var parseArgs = (args) => {
  var targs = ["bogus"].concat(args);
  return parse(targs, defaults, replacements);  
};
export var saveFile = (data, filename) => {
  return new Promise((resolve, reject) => {
    writeFile(filename, JSON.stringify(data, null, 4), (err) => {
      if (err) {
        reject(Error("Error: "+err);
      }
      else
        resolve(true);
    });
  });
};

//export var saveFile = (data, filename, done) => {
//    writeFile(filename, JSON.stringify(data, null, 4), (err) => {
//        if (err) {
//            return done(false);
//        }
//	return done(true);
//    });
//};

  export var loadFile = (filename, done) => {
    return new Promise((resolve, reject) => {
      
//    });
//  };
//export var loadFile = (filename, done) => {
    
    exists(filename, (exists) => {
    if (exists) {
        stat(filename, (error, stats) => {
            open(filename, "r", (error, fd) => {
                var buffer = new Buffer(stats.size);
	read(fd, buffer, 0, buffer.length, null, (error, bytesRead, buffer) => {
            var data = buffer.toString("utf8", 0, buffer.length);
            close(fd);
	    //console.log(`data: ${JSON.stringify(data)}`);
    	    return done(JSON.parse(data));
		    
                });
            });
        });
    }
    });
    });
  };
    

//update the version based off the args parsed from parseArgs
export var bumpVersion = (data, newversion, done) => {
    var passthrough = false;
    var ifhaspre = data.version.split("-");
    var results = data.version.split(".");
    var prereleaseinfo = 0;
    if (ifhaspre[1])
    {
	results = ifhaspre[0].split(".");
	prereleaseinfo = +ifhaspre[1].split(".")[1] + 1;

    }
    if (newversion.major >= 0)
	results[0] = newversion.majorv;
    if (newversion.minor >= 0)
	results[1] = newversion.minorv;
    if (newversion.patch >= 0)
	results[2] = newversion.patchv;

    if (newversion.bumpmajor){
	results[0] = +results[0] +1;
	passthrough = true;
    }
    if (newversion.bumpminor){
	results[1] = +results[1] +1;
	passthrough = true;
    }
    if (newversion.bumppatch){
	results[2] = +results[2] +1;
	passthrough = true;
    }

    data.version = `${results[0]}.${results[1]}.${results[2]}`;
    
    if (newversion.prerelease && !passthrough){
	var presults = `-${newversion.prerelease}.${prereleaseinfo}`;
    	data.version = `${results[0]}.${results[1]}.${results[2]}${presults}`;
    }
    
        console.log(`DataVersion:: ${data.version}`);
    return done(data);
};

export var commitToLocalGit = (message, done) => {
    console.log(`===Newest Version :: ${message}===`);
    let command = `git pull && git commit package.json`;
	if (shell.exec(command).code !== 0) {
	    shell.echo('Error: Git commit failed');
	    shell.exit(1);
	    return done(false);
	}
 	return done(true);
};

export var addGitTag = (version, message, done) => {
    let command = `git tag -a v${version}`;
    console.log(shell.exec(command).output);
    return done(`v${version}`);
};

export var pushToRemote = (remote, user, pass, done) => {
  
    let command = `git push origin --tags`;
	if (shell.exec(command).code !== 0) {
	    shell.echo('Error: Git commit failed');
	    shell.exit(1);
	    return done(false);
	}
 	return done(true);
};
