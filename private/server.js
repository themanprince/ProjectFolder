const {Server} = require("http");
const {exists, readFile, lstat} = require("fs");;
const path = require("path");

const reqGroupDelimeter = "-".repeat(10); //this is for separating / grouping requests made at the same time
let timeout = null;
const timeBound = 500;
function debounceDelimeterPrinting() {
    clearTimeout(timeout);
    timeout = setTimeout(() => console.log(reqGroupDelimeter), timeBound);
}


const theServer = new Server(async (req, res) => {
	
	let requestedFilePath = (path.dirname(__filename) + "/.." + req.url).replace(/\%\2\0/g, " ");
	
	
	const fileExistsAndIsNotDirectory = new Promise(resolve => {
	    
	    exists(requestedFilePath, (itExists) => {
	        if(!itExists)
	            return resolve(false);
	        
	       lstat(requestedFilePath, (err, stats) => {
	               if(stats.isDirectory())
	                   return resolve(false);
	               
	               return resolve(true);
	            });
	       
	    });
	});
	
	
	if(("GET" == req.method) && (await fileExistsAndIsNotDirectory)) {
	    
	    console.log(req.method, "\"" + req.url + "\"");
    	debounceDelimeterPrinting();
    	
		const fileContents = new Promise((resolve, reject) => {
			readFile(requestedFilePath, (err, result) => {
				if(err)	reject(err);
				
				resolve(result);
			})
		});
		
		let contents = await fileContents;
		if(path.extname(requestedFilePath).match(/.?html?/)) {
		let noOfDirsRelativeToEruda  = req.url.split("/").length - 2; //I needed to obtain this variable because when this html file will send a req for the script later...
		//e go do like say d kini dy with am
		//so I dy use this one go back
		contents += '<script src="' + '../'.repeat(noOfDirsRelativeToEruda)+'/private/eruda.js"></script>\n<script>eruda.init();</script>';
		
		}
		
		res.end(contents);
	} else {
		res.setHeader("status", 401);
		res.end("Error!\n\n1. make sure the file requested for exists\n2. make sure you did not request for a folder instead of a file.\n3. contact the developer");
	}
});

theServer.listen(8000, () => console.log("The Server is Active\nThe Web Address is localhost:8000\n"));
