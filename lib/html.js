/**
 * template literal function that returns an HTML element
 * @param {*} strings 
 * @param  {...any} values 
 * @returns {HTMLElement | null}
 */
export default function html(strings, ...values) {
  const template = strings.reduce((acc, string, i) => acc + string + (values[i] || ''), '');
  const parser = new DOMParser();
  const doc = parser.parseFromString(template, 'text/html');
  return doc.body.firstChild;
}
