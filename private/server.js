const {Server} = require("http");
const {exists, readFile} = require("fs");
const path = require("path");

const theServer = new Server(async (req, res) => {
	
	let requestedFilePath = (path.dirname(__filename) + "/.." + req.url).replace(/\%\2\0/g, " ");
	
	
	console.log(req.method, "\"", requestedFilePath, "\"");
	
	const fileExists = new Promise(resolve => exists(requestedFilePath, resolve));
	
	
	if(("GET" == req.method) && (await fileExists)) {
		const fileContents = new Promise((resolve, reject) => {
			readFile(requestedFilePath, (err, result) => {
				if(err)	reject(err);
				
				resolve(result);
			})
		});
		
		let contents = await fileContents;
		if(path.extname(requestedFilePath).match(/.?html?/)) {
		let noOfDirsRelativeToAdure  = req.url.split("/").length - 2; //I needed to obtain this variable because when this html file will send a req for the script later...
		//e go do like say d kini dy with am
		//so I dy use this one go back
		contents += '<script src="' + '../'.repeat(noOfDirsRelativeToAdure)+'/private/adure.js"></script>\n<script>eruda.init();</script>';
		
		}
		
		res.end(contents);
	} else {
		res.setHeader("status", 401);
		res.end("unexisting filepath OR unsupported method");
	}
});

theServer.listen(8000, () => console.log("Idan is active"));