const cookieParser = require('cookie-parser');
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const config = require('config');
const fs = require('fs');
const ejs = require('ejs');

app.use(cors());
app.use(cookieParser());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.header('origin')); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

let trackingFilePath = './dist/viewer.js';
if (process.env.NODE_ENV === 'production') {
	trackingFilePath = './dist/viewer.min.js';
}

app.use('/static/viewer.js', async (req, res) => {
	try{
		let f = ejs.compile(fs.readFileSync(trackingFilePath).toString('utf8'));
		let fileContent = f({ 
			status : 200
		});
		
		res.setHeader('Content-Type', 'application/javascript');
		res.setHeader('Content-Length', fileContent.length);
		res.status(200).send(fileContent);
	}catch(e){
		let f = ejs.compile(fs.readFileSync(trackingFilePath).toString('utf8'));
		let fileContent = f({ 
			status : 500
		});
		res.status(500).send(fileContent);
	}
});

// Serving static files
app.use('/static', express.static(path.join(__dirname, 'public')));

module.exports = app;
