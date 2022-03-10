// softDeletePlugin (mongoose plugin)
module.exports = function (schema) {
	schema.add({
		isDeleted: {
			type: Boolean,
			required: true,
			default: false,
			select: false
		},
		deletedAt: {
			type: Date,
			default: null,
			select: false
		},
	});

	// soft delete and restore methods-------------------------------------------------------------------------
	schema.static('softDelete', async function (query, options) { // CategoryMaster.softDelete({}, {validateBeforeSave: false})
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


	// all find query middleware---------------------------------------------------------------------------------
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

	// for aggregate
	const excludeInDeletedInAggregateMiddleware = async function (next) {
		this.pipeline().unshift({ $match: { isDeleted: false } });
		next();
	};
	schema.pre('aggregate', excludeInDeletedInAggregateMiddleware);


	// find deleted records-----------------------------------------------------------------------------------------
	schema.static('findDeleted', async function () { // ModelName.findDeleted()
		return this.find({ isDeleted: true });
	});
	// or
	schema.query.isDeleted = function (cond) { // ModelName.find().isDeleted(true)
		if (typeof cond == 'undefined' || cond == true) {
			cond = true;
		}
		return this.find({ isDeleted: cond });
	};
};
