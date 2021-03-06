//From https://github.com/vdemedes/google-images/blob/master/index.js
'use strict';

const qs = require('querystring');
const got = require('got');

class Client {
	constructor(id, apiKey) {
		this.endpoint = 'https://www.googleapis.com';
		this.apiKey = apiKey;
		this.id = id;
	}

	search(query, options) {
		if (!query) {
			throw new TypeError('Expected a query');
		}

		return got(this.endpoint + '/customsearch/v1?' + this._buildOptions(query, options), {
			json: true
		}).then(this._buildResponse);
	}

	_buildOptions(query, options) {
		if (!options) {
			options = {};
		}

		var result = {
			q: query.replace(/\s/g, '+'),
			searchType: 'image',
			cx: this.id,
			key: this.apiKey
		};

		if (options.page) {
			result.start = options.page;
		}

		if (options.size) {
			result.imgSize = options.size;
		}

		return qs.stringify(result);
	}

	_buildResponse(res) {
		return (res.body.items || []).map(function (item) {
			console.log(JSON.stringify(item));
			return {
				type: item.mime,
				width: item.image.width,
				height: item.image.height,
				size: item.image.byteSize,
				url: item.link,
				snippet: item.snippet,
				context: item.image.contextLink,
				thumbnail: {
					url: item.image.thumbnailLink,
					width: item.image.thumbnailWidth,
					height: item.image.thumbnailHeight
				}
			};
		});
	}
}

module.exports = Client;