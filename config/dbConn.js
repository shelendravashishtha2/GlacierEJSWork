const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_DB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
	console.log("connection is successful");
}).catch((error) => {
	console.log("connection not found");
	console.log(error, 'mongodb connection error');
})

// debug query log
if (process.env.APP_ENV == 'development') {
	mongoose.set('debug', true);
	// mongoose.set('debug', function (collectionName, method, query, doc, options) {
	// });
}
