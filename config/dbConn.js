const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_DB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
}).then(() => {
	console.log("connection is successful");
}).catch((e) => {
	console.log("connection not found");
})