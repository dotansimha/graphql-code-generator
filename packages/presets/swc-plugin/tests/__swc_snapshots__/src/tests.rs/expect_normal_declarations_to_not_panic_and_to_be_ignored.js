const emitter = (0, _mitt).default();
const looseToArray = (input)=>[].slice.call(input);
const targetTag = document.querySelector(`style[data-n-href="${href}"]`);