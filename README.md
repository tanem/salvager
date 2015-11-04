# salvager

[![build status](https://img.shields.io/travis/tanem/salvager/master.svg?style=flat-square)](https://travis-ci.org/tanem/salvager)
[![npm version](https://img.shields.io/npm/v/salvager.svg?style=flat-square)](https://www.npmjs.com/package/salvager)
[![npm downloads](https://img.shields.io/npm/dm/salvager.svg?style=flat-square)](https://www.npmjs.com/package/salvager)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/salvager.svg)](https://saucelabs.com/u/salvager)

Reuse row elements when displaying large datasets. This is beneficial to performance since the number of row elements rendered to the DOM is fixed, no matter how big the dataset is.

**Caveats**

- Assumes a consistent row height
- If `data.length * rowHeight` exceeds the maximum element height for a particular browser, all rows may not be displayed.

## Installation

```
$ npm install salvager --save
```

You can also use the files in `dist`, where `salvager` is exposed via UMD.

## Example

```js
import salvager from 'salvager';

const data = [];
for (let i = 1; i <= 50000; i++) data.push('Item ' + i);

salvager({
  target: document.querySelector('.Container'),
  data: data,
  bufferSize: 50,
  buildRow(data) {
    var row = document.createElement('div');
    row.style.padding = '10px';
    row.textContent = data;
    row.style.backgroundColor = getStripeColour(data);
    return row;
  },
  updateRow(row, data) {
    row.textContent = data;
    row.style.backgroundColor = getStripeColour(data);
  }
});

function getStripeColour(data) {
  if (data.split(' ').pop() % 2 === 0) return '#eee';
  return '#fff';
}
```

To run the browser example:

```
$ npm run example
```

### API

#### salvager(target, data, [bufferSize], [buildRow], [updateRow])

Renders recyclable rows based on `data` into the `target` element.

__Arguments__

* `target` - The element which will contain the recyclable row elements.
* `data` - The array of data to display.
* `bufferSize` - *Optional* The number of row elements rendered into the DOM, which will be recycled as the list is scrolled. Defaults to `100`.
* `buildRow` - *Optional* The function used to generate each row element. Defaults to:

```js
data => {
  const row = document.createElement('div');
  row.textContent = data;
  return row;
}
```

* `updateRow` - *Optional* The function used when updating a row element. Defaults to:

```js
(row, data) => row.textContent = data
```

## Tests

```
$ npm run test-local
```

## Credits

- The core algorithm is based on [@cmpolis](https://github.com/cmpolis)'s [Smart Table Scroll](https://github.com/cmpolis/smart-table-scroll). I thought it was a great idea, so decided to dig into it some more and tweak it here :smile:
- [@gaearon](https://github.com/gaearon)'s [Redux](https://github.com/rackt/redux) for ideas around webpack setup, npm run scripts, and dot files :+1:

## License

MIT
