//Mongodb Helpers
var dbHelper = {};
dbHelper.findRow = function(doc, col, callback) {
	var findResp = col.find(doc);
	findResp.toArray(function(err, documents){
		console.log("findRow result " + JSON.stringify(documents));
		if(!err)
		{
			callback(null, documents);
		}
		else
			callback(err, null);
	});
};
dbHelper.findRows = function(doc, col, sortDoc, pageOffset, pageLimit, callback) {
	var findResp = col.find(doc);
	if(pageOffset < 0)
		pageOffset = 0;
	if(sortDoc)
		findResp = findResp.sort(sortDoc);
	findResp = findResp.skip(pageOffset).limit(pageLimit);
	findResp.toArray(function(err, documents){
		console.log("findRow result " + JSON.stringify(documents));
		if(!err)
		{
			callback(null, documents);
		}
		else
			callback(err, null);
	});
};

dbHelper.insertRow = function(doc, col, callback) {
	var update = doc;
	col.insert(doc, {strict: false}, function(err, result) {
		console.log("insertRow result " + JSON.stringify(result));
		if(err)
		{
			callback(err, null);
		}
		else
		{
			callback(null, result.ops[0]);
		}
	});	
};

dbHelper.createCollection = function(db, colName, callback) {
	db.createCollection(colName, {strict:false}, function(err, collection){
		if(err)
			console.log("err " + JSON.stringify(err));
		else
			console.log(colName + " collection is ready to use.");
		callback(err, collection);
	})
};

var exports = module.exports = dbHelper;