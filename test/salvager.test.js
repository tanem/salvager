import test from 'tape';
import event from 'synthetic-dom-events';
import salvager from '../src/salvager';

const slice = nodeList => Array.prototype.slice.call(nodeList);

const target = document.createElement('div');
target.style.overflow = 'auto';
target.style.height = '40px';
document.body.appendChild(target);

const createSalvager = () => {
  return salvager({
    target: target,
    data: ['1', '2', '3', '4', '5', '6'],
    bufferSize: 3,
    buildRow(data) {
      const row = document.createElement('div');
      row.classList.add('Salvager-row');
      row.style.height = '20px';
      row.textContent = data;
      return row;
    },
    updateRow(row, data) {
      row.textContent = data;
      row.style.color = 'blue';
    }
  });
};

const scroll = amount => {
  target.scrollTop += amount;
  target.dispatchEvent(event('scroll'));
};

const cleanup = salvager => {
  salvager.destroy();
  target.scrollTop = 0;
};

/*
0 buffer
1 buffer
2 buffer
3 spacer
4 spacer
5 spacer
*/
test('should calculate the correct spacer height', assert => {
  const s = createSalvager();
  assert.equal(document.querySelector('.Salvager-spacer').offsetHeight, 60);
  assert.end();
  cleanup(s);
});

/*
0 buffer newBuffer
1 buffer newBuffer
2 buffer newBuffer
3
4
5
*/
test('should move nothing if both buffers haven\'t significantly changed', assert => {
  const s = createSalvager();
  scroll(1);
  const rowEls = document.querySelectorAll('.Salvager-row');
  assert.deepEqual(
    slice(rowEls).map(el => el.style.transform || ''),
    ['', '', '']
  );
  assert.end();
  cleanup(s);
});

/*
0 buffer
1 buffer newBuffer
2 buffer newBuffer
3        newBuffer
4
5
*/
test('should move the correct data from buffer to newBuffer if newBuffer is slightly ahead', assert => {
  const s = createSalvager();
  scroll(40);
  const rowEls = document.querySelectorAll('.Salvager-row');
  assert.deepEqual(
    slice(rowEls).map(el => el.style.transform || ''),
    ['translateY(60px)', '', '']
  );
  assert.end();
  cleanup(s);
});

/*
0        newBuffer
1 buffer newBuffer
2 buffer newBuffer
3 buffer
4
5
*/
test('should move the correct data from buffer to newBuffer if newBuffer is slightly behind', assert => {
  const s = createSalvager();
  scroll(40);
  scroll(-40);
  const rowEls = document.querySelectorAll('.Salvager-row');
  assert.deepEqual(
    slice(rowEls).map(el => el.style.transform || ''),
    ['translateY(0px)', '', '']
  );
  assert.end();
  cleanup(s);
});

/*
0 buffer
1 buffer
2 buffer
3        newBuffer
4        newBuffer
5        newBuffer
*/
test('should move the correct data from buffer to newBuffer if newBuffer is completely ahead', assert => {
  const s = createSalvager();
  scroll(80);
  const rowEls = document.querySelectorAll('.Salvager-row');
  assert.deepEqual(
    slice(rowEls).map(el => el.style.transform || ''),
    ['translateY(60px)', 'translateY(60px)', 'translateY(60px)']
  );
  assert.end();
  cleanup(s);
});

/*
0        newBuffer
1        newBuffer
2        newBuffer
3 buffer
4 buffer
5 buffer
*/
test('should move the correct data from buffer to newBuffer if newBuffer is completely behind', assert => {
  const s = createSalvager();
  scroll(80);
  scroll(-80);
  const rowEls = document.querySelectorAll('.Salvager-row');
  assert.deepEqual(
    slice(rowEls).map(el => el.style.transform || ''),
    ['translateY(0px)', 'translateY(0px)', 'translateY(0px)']
  );
  assert.end();
  cleanup(s);
});

test('should build rows correctly', assert => {
  const s = createSalvager();
  for (let i = 1, j = 3; i <= j; i++) {
    let row = document.querySelector(`.Salvager-row:nth-child(${i})`);
    assert.equal(row.style.height, '20px');
    assert.equal(row.textContent, `${i}`);
  }
  assert.end();
  cleanup(s);
});

test('should update rows correctly', assert => {
  const s = createSalvager();
  scroll(80);
  for (let i = 1, j = 3; i <= j; i++) {
    let row = document.querySelector(`.Salvager-row:nth-child(${i})`);
    assert.equal(row.textContent, `${i + 3}`);
    assert.equal(row.style.color, 'blue');
  }
  assert.end();
  cleanup(s);
});
