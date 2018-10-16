/* jshint node:true */
/* global require */

module.exports = function (grunt) {
	'use strict';

	var loader = require('load-project-config'),
		config = require('grunt-plugin-fleet');
	config = config();
	// jshint ignore: start
	config.files.js.push('!**/*.js');
	// jshint ignore: end
	loader(grunt, config).init();
	loader(grunt, config).init();
};