var express = require("express");
var mongo = require('mongodb').MongoClient;
var path = require("path");
var dbHelper = require('./dbHelper');
var ImagesClient = require('./GoogleImages');
//var ImagesClient = require('google-images');

var app = express();

//LOCAL --> mongodb://localhost:27017/freecodecamp
var MONGO_KEY = process.env.MONGO_KEY;
var MONGO_DB_SEARCH_COL = "recentImageSearch";
var GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
var GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
var client = new ImagesClient(GOOGLE_CSE_ID, GOOGLE_API_KEY);

app.get('/', function(req, res){
	res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/init', function(req, res){
	console.log("init");
	mongo.connect(MONGO_KEY, function(err, db) {
		// db.collection(MONGO_DB_SEARCH_COL).drop();
		// res.send("done");
		dbHelper.createCollection(db, MONGO_DB_SEARCH_COL, function(err, collection) {
			db.close();
			res.send("done");
		});
	});
});

app.get("/api/latest/imageSearch", function(req, res) {
	//Get details from mongo db collection
	mongo.connect(MONGO_KEY, function(err, db) {
		var col = db.collection(MONGO_DB_SEARCH_COL);
		dbHelper.findRows({}, col, {$natural: -1}, 0, 10, function(err, documents){
			var retval = [];
			if(!err)
			{
				documents.forEach(function(cur){
					retval.push({"term": cur.term, "when": cur.when});
				});
			}
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(retval));
			db.close();
		});
	})
});

app.get("/api/imageSearch/:query", function(req, res) {
	var queryStr = req.params.query;
	var page = req.query.offset || 1;
	console.log("imageSearch:" + queryStr + " offset:" + page);

	//insert the entry into the db.
	//Since its priority is less, compared to sending actual results, putting client search outside this insert callback.
	mongo.connect(MONGO_KEY, function(err, db) {
		var col = db.collection(MONGO_DB_SEARCH_COL);
		dbHelper.insertRow({"term": queryStr, "when": new Date().toISOString()}, col, function(err, documents){
			db.close();
		});
	});

	client.search(queryStr, {"page": page})
		.then(function (images) {
			console.log(JSON.stringify(images[0]));
			var retval = [];
			for(var ii=0; ii < images.length; ++ii)
			{
				var oneEl = {}
				oneEl.url = images[ii].url;
				oneEl.thumbnail = images[ii].thumbnail.url;
				oneEl.snippet = images[ii].snippet;
				oneEl.context = images[ii].context;
				retval.push(oneEl);
			}
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(retval));
			/*
			[{
				"url": "http://steveangello.com/boss.jpg",
				"type": "image/jpeg",
				"width": 1024,
				"height": 768,
				"size": 102451,
				"thumbnail": {
					"url": "http://steveangello.com/thumbnail.jpg",
					"width": 512,
					"height": 512
				}
			}]
			 */
		});
});


app.listen(process.env.PORT || 4000);

