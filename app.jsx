#! /usr/bin/env node
import {parseArgs, loadFile, bumpVersion, saveFile, commitToLocalGit, addGitTag, pushToRemote}
  from "./lib/argparser.js";
/***
launch this app from the command line.
use the following parameters to update the version following semver guidelines as desired:
 SemVer Standards: 1.0.2 : Major.Minor.Patch
  -M : --major : Major version
  -m : --minor : Minor version
  -p : -P : --patch : Patch version
  --bumpmajor : Bump the major version to the next version
  --bumpminor : Bump the minor version to the next version
  --bumppatch : Bump the patch version to the next version
  --pre-release : Make the current release push as a beta version
***/
let version = "0.0.0";
let filename = "package.json";
let vargs = "none";
//Initializes the application

	console.log(`initializing`);
    parseArgs(process.argv, (results) => {
	vargs = results;
    });
    loadFile(filename, (results) => {
	bumpVersion(results, vargs, (results2) => {
	    version = results2.version;
	    saveFile(results2, filename, (results3) => {
		if (!results3)
		    console.log(`failed to bump the module version to ${version}`);
		else{
		    console.log(`succeeded in bumping the module version to ${version}`);
		    commitToLocalGit(version, (results4) => {
			if (!results4)
			  console.log(`failed to commit to local git repository; Is one set-up?`);
			else {
			    addGitTag(version,`ESBump added git Tag v${version}`, (results5) => {
				pushToRemote(null,vargs.username, vargs.password, (results6) => {
				    console.log(`completed pushing to remote:
${results6}`);
				});
			    });
			}
		    });
		}
	    });
	});
    });

