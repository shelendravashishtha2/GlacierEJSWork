// softDeletePlugin
module.exports = function (schema) {
	// schema.add({ deleted: Boolean });
	// schema.add({ deletedAt: Date });
	schema.add({
		isDeleted: {
			type: Boolean,
			required: true,
			default: false,
			// select: false
		},
		deletedAt: {
			type: Date,
			default: null,
			// select: false
		},
	});

	schema.pre('save', function (next) {
		if (!this.isDeleted) {
			this.isDeleted = false;
		}
		if (!this.deletedAt) {
			this.deletedAt = null;
		}
		next();
	});

	// const setDocumentIsDeleted = async (doc) => {
	// 	doc.isDeleted = true;
	// 	doc.deletedAt = new Date();
	// 	doc.$isDeleted(true);
	// 	await doc.save();
	// };

	// schema.pre('save', async function (next) {
	// 	await setDocumentIsDeleted(this);
	// 	next();
	// });

	// schema.methods.softDelete = async function (callback) { // find documents and documents.softDelete()
	// 	this.isDeleted = true;
	// 	this.deletedAt = new Date();
	// 	this.save(callback);
	// };

	// schema.methods.restore = function (callback) { // find documents and documents.restore()
	// 	this.isDeleted = false;
	// 	this.deletedAt = null;
	// 	this.save(callback);
	// };

	schema.static('softDelete', async function (query, options) { // CategoryMaster.softDelete({}, {validateBeforeSave: false})
		// const templates = await this.find(query);
		// let deleted = 0;
		// for (const template of templates) {
		// 	if (!template.isDeleted) {
		// 		template.$isDeleted(true);
		// 		template.isDeleted = true;
		// 		template.deletedAt = new Date();
		// 		// await template.save(options).then(() => deleted++).catch((e) => { throw new Error(e.name + ' ' + e.message) });
		// 	}
		// }
		// return { deleted };

		const processedIds = await this.find(query).distinct('_id')
		if (!processedIds) {
			return Error('Element not found');
		}
		const deleteData = await this.updateMany({_id: { $in: processedIds}}, {$set: {isDeleted: true, deletedAt: new Date()}}, options);
		return { deleteData };
	});

	schema.static('restore', async function (query, options) { // CategoryMaster.restore({}, {validateBeforeSave: false})
		const processedIds = await this.find(query).distinct('_id')
		if (!processedIds) {
			return Error('Element not found');
		}
		const deleteData = await this.updateMany({_id: { $in: processedIds}}, {$set: {isDeleted: false, deletedAt: null}}, options);
		return { deleteData };
	});

	const typesFindQueryMiddleware = [
		'count',
		'find',
		'findOne',
		'findOneAndDelete',
		'findOneAndRemove',
		'findOneAndUpdate',
		'update',
		'updateOne',
		'updateMany',
	];

	const excludeInFindQueriesIsDeleted = async function (next) {
		if (!this.schema.query.isDeleted) {
			this.where({ isDeleted: false });
		}
		next();
	}

	typesFindQueryMiddleware.forEach((type) => {
		schema.pre(type, excludeInFindQueriesIsDeleted);
	});

	const excludeInDeletedInAggregateMiddleware = async function (next) {
		this.pipeline().unshift({ $match: { isDeleted: false } });
		next();
	};

	schema.pre('aggregate', excludeInDeletedInAggregateMiddleware);

	// find deleted records-----------------------------------------------------------------------------------------
	schema.static('findDeleted', async function () { // ModelName.findDeleted()
		return this.find({ isDeleted: true });
	});

	schema.query.isDeleted = function (cond) { // ModelName.find().isDeleted(true)
		if (typeof cond == 'undefined' || cond == true) {
			cond = true;
		}
		return this.find({ isDeleted: cond });
	};
};
