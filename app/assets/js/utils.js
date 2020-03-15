var forEach = function (collection, callback, scope) {
	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */

	if (Object.prototype.toString.call(collection) === '[object Object]') {
		for (var prop in collection) {
			if (Object.prototype.hasOwnProperty.call(collection, prop)) {
				callback.call(scope, collection[prop], prop, collection);
			}
		}
	} else {
		for (var i = 0, len = collection.length; i < len; i++) {
			callback.call(scope, collection[i], i, collection);
		}
	}
};

var generateID = function () {
	/**  https://gist.github.com/gordonbrander/2230317
	* Math.random should be unique because of its seeding algorithm.
	* Convert it to base 36 (numbers + letters), and grab the first n characters
	* after the decimal.
	*/
	const n = 20;
	return '_' + Math.random().toString(36).substr(2, n);
};