(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["salvager"] = factory();
	else
		root["salvager"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = salvager;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _clamp = __webpack_require__(1);

	var _clamp2 = _interopRequireDefault(_clamp);

	/**
	 * Reuse row elements when displaying large datasets. This is beneficial to
	 * performance since the number of row elements rendered to the DOM is fixed,
	 * no matter how big the dataset is. 
	 *
	 * The initial setup involves rendering the required number of row elements
	 * according to `bufferSize`, and adding a spacer element with a given height
	 * in order to set the scrollbar correctly.
	 *
	 * So if `data` is `['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']`, and
	 * `bufferSize` is `3`:
	 *
	 * ```
	 *   +--------+
	 * 0 | Item 1 |
	 *   +--------+
	 * 1 | Item 2 |
	 *   +--------+
	 * 2 | Item 3 |
	 *   +--------+
	 * 3
	 * 
	 * 4
	 * ```
	 *
	 * Then when the dataset is scrolled, row elements are transitioned from the old
	 * buffer to the new. The new buffer position is based on the scroll position
	 * of the target.
	 *
	 * `i`, `j` and `k` below represent the variable names used to reference the
	 * significant parts of the old and new buffers. In this case, the row element
	 * that currently displays `data[0]` will be reused to render `data[3]`.
	 *
	 * The transition of a row element involves a CSS transform to the new position,
	 * and an update of the row element in order to render the data at that point:
	 *
	 * ```
	 *   +------------+
	 * 0 | Item 1 (k) |
	 *   +------------+     +------------+
	 * 1 | Item 2     |     | Item 2 (i) |
	 *   +------------+ --> +------------+
	 * 2 | Item 3     |     | Item 3     |
	 *   +------------+     +------------+
	 * 3                    | Item 4 (j) |
	 *                      +------------+
	 * 4
	 * ```
	 *
	 * @param {HTMLElement} target The element to attach to.
	 * @param {Array} data The data to be displayed.
	 * @param {Number} bufferSize The number of rendered row elements.
	 * @param {Function} [buildRow] Defines how row elements should be initially rendered.
	 * @param {Function} [updateRow] Defines how existing row elements should be updated.
	 * @returns {Object}
	 * @access public
	 */

	function salvager(_ref) {
	  var target = _ref.target;
	  var data = _ref.data;
	  var _ref$bufferSize = _ref.bufferSize;
	  var bufferSize = _ref$bufferSize === undefined ? 100 : _ref$bufferSize;
	  var _ref$buildRow = _ref.buildRow;
	  var buildRow = _ref$buildRow === undefined ? function (data) {
	    var row = document.createElement('div');
	    row.textContent = data;
	    return row;
	  } : _ref$buildRow;
	  var _ref$updateRow = _ref.updateRow;
	  var updateRow = _ref$updateRow === undefined ? function (row, data) {
	    return row.textContent = data;
	  } : _ref$updateRow;
	  return (function () {

	    var state = [];
	    var targetHeight = target.offsetHeight;

	    var itemHeight = undefined;
	    var bufferStartIndex = undefined;
	    var bufferEndIndex = undefined;
	    var isUpdating = false;

	    // Add the `container` to the DOM.
	    var container = document.createElement('div');
	    container.classList.add('Salvager');
	    container.style.position = 'relative';
	    target.appendChild(container);

	    // Set up the `buffer` range.
	    bufferSize = Math.min(bufferSize, data.length);
	    bufferStartIndex = 0;
	    bufferEndIndex = bufferSize - 1;

	    // Append `row`s and update `state` according to `bufferSize`.
	    for (var i = bufferStartIndex, j = bufferEndIndex; i <= j; i++) {
	      var row = buildRow(data[i]);
	      container.appendChild(row);
	      var rowTop = row.offsetTop;
	      state.push({ row: { el: row, top: rowTop }, top: rowTop });
	      itemHeight = itemHeight || row.offsetHeight;
	    }

	    // Fill the rest of the state.
	    for (var i = bufferSize, j = data.length, _top = bufferSize * itemHeight; i < j; i++, _top += itemHeight) {
	      state.push({ row: null, top: _top });
	    }

	    // Create the `spacer` element.
	    var spacer = document.createElement('div');
	    spacer.classList.add('Salvager-spacer');
	    container.appendChild(spacer);
	    spacer.style.height = (data.length - bufferSize) * itemHeight + 'px';

	    // Scroll handling.
	    var scrollHandler = function scrollHandler() {

	      // Exit early if we're in the process of updating.
	      if (isUpdating) return;
	      isUpdating = true;

	      // Calculate new buffer range.
	      var newTargetMidPoint = target.scrollTop + targetHeight / 2;
	      var newBufferMidPointIndex = Math.floor(newTargetMidPoint / itemHeight);
	      var newBufferStartIndex = (0, _clamp2['default'])(Math.floor(newBufferMidPointIndex - bufferSize / 2), 0, data.length - bufferSize);
	      var newBufferEndIndex = Math.min(data.length - 1, newBufferStartIndex + bufferSize - 1);

	      // Bail if nothing's changed.
	      if (newBufferStartIndex === bufferStartIndex) return isUpdating = false;

	      // Render the new buffer, using free elements from the old buffer.
	      for (var i = newBufferStartIndex, j = newBufferEndIndex, k = bufferStartIndex; i <= j; i++) {
	        while (k >= newBufferStartIndex && k <= newBufferEndIndex) k++;
	        if (state[i].row) continue;
	        state[i].row = { el: state[k].row.el, top: state[k].row.top };
	        state[i].row.el.style.transform = 'translateY(' + (state[i].top - state[i].row.top) + 'px)';
	        updateRow(state[i].row.el, data[i]);
	        state[k].row = null;
	        k++;
	      }

	      // Switch to the new buffer.
	      bufferStartIndex = newBufferStartIndex;
	      bufferEndIndex = newBufferEndIndex;
	      isUpdating = false;
	    };

	    target.addEventListener('scroll', scrollHandler);

	    return {

	      /**
	       * Destroy `salvager`.
	       *
	       * @access public
	       */
	      destroy: function destroy() {
	        target.removeEventListener('scroll', scrollHandler);
	        target.removeChild(container);
	      }

	    };
	  })();
	}

	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = clamp

	function clamp(value, min, max) {
	  return min < max
	    ? (value < min ? min : value > max ? max : value)
	    : (value < max ? max : value > min ? min : value)
	}


/***/ }
/******/ ])
});
;