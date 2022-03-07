'use strict';

module.exports = function (schema) {
	// schema.add({ deleted: Boolean });
	// schema.add({ deletedAt: Date });
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
	

	schema.pre('save', function (next) {
		if (!this.deleted) {
			this.deleted = false;
		}

		if (!this.deletedAt) {
			this.deletedAt = null;
		}

		next();
	});

	schema.methods.softDelete = function (callback) {
		this.deleted = true;
		this.deletedAt = new Date();
		this.save(callback);
	};

	schema.methods.restore = function (callback) {
		this.deleted = false;
		this.deletedAt = null;
		this.save(callback);
	};

	schema.query.isDeleted = function (cond) {
		if (typeof cond === 'undefined') {
			cond = true;
		}

		return this.find({
			deleted: cond
		});
	};

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

	// typesFindQueryMiddleware.forEach((type) => {
	// 	schema.pre(type, 'excludeInFindQueriesIsDeleted');
	// });
	
};
