const {Server} = require("http");
const {exists, readFile, lstat} = require("fs");;
const path = require("path");

const reqGroupDelimeter = "-".repeat(10); //this delimeter is for separating / grouping requests made at the same time
let debounceTimeout = null;
const debounceTime = 500;
function debounceDelimeterPrinting() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => console.log(reqGroupDelimeter), debounceTime);
}

const log = function(wasFound, url) {
    
    const date = new Date();
    let hrs, mins, secs, meridian, timeStr;
    const is12HrStyle = true;
    
    hrs = (date.getHours() + 1) % 24; // '+1' because nodejs getHours() returns a number that is one-less than the actual no of hours, in 24-hrs time style
    if ((hrs >= 0) && (hrs <= 11))
        meridian = "AM";
    else
        meridian = "PM";
    
    if((is12HrStyle) && (hrs > 12))
        hrs = hrs - 12;
    
    mins = date.getMinutes();
    secs = date.getSeconds();
    timeStr = `${hrs}:${mins}:${secs} ${meridian}`;
    foundStr = (wasFound) ? "OK" : "404";
    reqStr = `${url} - ${foundStr}`;
         	
    const strToLog = `[${timeStr}] ${reqStr}`;
    console.log(strToLog);
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
	
	
	if("GET" == req.method) {
	    
	   	if(await fileExistsAndIsNotDirectory) {
	        log(true, req.url);
             	
    		const fileContents = new Promise((resolve, reject) => {
    			readFile(requestedFilePath, (err, result) => {
    				if(err)	reject(err);
				
    				resolve(result);
    			})
	    	});
		
    		let contents = await fileContents;
    		if(path.extname(requestedFilePath).match(/.?html?/)) {
    		    let noOfDirsRelativeToAdure  = req.url.split("/").length - 2; //I needed to obtain this variable because when this html file will send a req for the script later...
                //to understand previous line, consider the result of "/home".split("/")
                //you get ["", "home"] as the result... this has a length of 2.... Thus, the value of above variable will be 0
                
                //check it for other url such as "/proejct1/style.css"... you'll see that the next line of code is to take you to the root of ProjectFolder
    	    	contents += '<script src="' + '../'.repeat(noOfDirsRelativeToAdure)+'/private/adure.js"></script>\n<script>eruda.init();</script>';
    		
    		}
	    	
    		res.end(contents);
    	} else {
    	    log(false, req.url);
    		res.setHeader("status", 401);
    		res.end("Error!\n\n1. make sure the file requested for exists\n2. make sure you did not request for a folder instead of a file.\n3. contact the developer");
    	}
	}
      
    debounceDelimeterPrinting();

});

theServer.listen(8000, () => console.log("The Server is Active\nThe Web Address is localhost:8000\n"));
