import clamp from 'clamp';

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
export default function salvager({
  target,
  data,
  bufferSize = 100,
  buildRow = data => {
    const row = document.createElement('div');
    row.textContent = data;
    return row;
  },
  updateRow = (row, data) => row.textContent = data
}) {

  const state = [];
  const targetHeight = target.offsetHeight;

  let itemHeight;
  let bufferStartIndex;
  let bufferEndIndex;
  let isUpdating = false;

  // Add the `container` to the DOM.
  const container = document.createElement('div');
  container.classList.add('Salvager');
  container.style.position = 'relative';
  target.appendChild(container);

  // Set up the `buffer` range.
  bufferSize = Math.min(bufferSize, data.length);
  bufferStartIndex = 0;
  bufferEndIndex = bufferSize - 1;

  // Append `row`s and update `state` according to `bufferSize`.
  for (let i = bufferStartIndex, j = bufferEndIndex; i <= j; i++) {
    let row = buildRow(data[i]);
    container.appendChild(row);
    let rowTop = row.offsetTop;
    state.push({ row: { el: row, top: rowTop }, top: rowTop });
    itemHeight = itemHeight || row.offsetHeight;
  }

  // Fill the rest of the state.
  for (let i = bufferSize, j = data.length, top = bufferSize * itemHeight; i < j; i++, top += itemHeight) {
    state.push({ row: null, top: top });
  }

  // Create the `spacer` element.
  const spacer = document.createElement('div');
  spacer.classList.add('Salvager-spacer');
  container.appendChild(spacer);
  spacer.style.height = (data.length - bufferSize) * itemHeight + 'px';

  // Scroll handling.
  const scrollHandler = function scrollHandler() {

    // Exit early if we're in the process of updating.
    if (isUpdating) return;
    isUpdating = true;

    // Calculate new buffer range.
    const newTargetMidPoint = target.scrollTop + targetHeight / 2;
    const newBufferMidPointIndex = Math.floor(newTargetMidPoint / itemHeight);
    let newBufferStartIndex = clamp(Math.floor(newBufferMidPointIndex - bufferSize / 2), 0, data.length - bufferSize);
    let newBufferEndIndex = Math.min(data.length - 1, newBufferStartIndex + bufferSize - 1);

    // Bail if nothing's changed.
    if (newBufferStartIndex === bufferStartIndex) return isUpdating = false;

    // Render the new buffer, using free elements from the old buffer.
    for (let i = newBufferStartIndex, j = newBufferEndIndex, k = bufferStartIndex; i <= j; i++) {
      while (k >= newBufferStartIndex && k <= newBufferEndIndex) k++;
      if (state[i].row) continue;
      state[i].row = { el: state[k].row.el, top: state[k].row.top };
      state[i].row.el.style.transform = `translateY(${state[i].top - state[i].row.top}px)`;
      updateRow(state[i].row.el, data[i]);
      state[k].row = null;
      k++;
    }

    // Switch to the new buffer.
    bufferStartIndex = newBufferStartIndex;
    bufferEndIndex = newBufferEndIndex;
    isUpdating = false;

  }

  target.addEventListener('scroll', scrollHandler);

  return {

    /**
     * Destroy `salvager`.
     *
     * @access public
     */
    destroy() {
      target.removeEventListener('scroll', scrollHandler);
      target.removeChild(container);
    }

  };

}
