import en from './en.json';
import es from './es.json';

function keyPaths(obj, prefix = '') {
  return Object.keys(obj).flatMap((k) => {
    const path = prefix ? `${prefix}.${k}` : k;
    const v = obj[k];
    return v && typeof v === 'object' && !Array.isArray(v) ? keyPaths(v, path) : [path];
  });
}

test('en.json and es.json expose the same key structure', () => {
  expect(keyPaths(en).sort()).toEqual(keyPaths(es).sort());
});
