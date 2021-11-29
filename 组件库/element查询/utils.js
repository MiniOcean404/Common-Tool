export function debounce(fn, delay) {
	return function () {
		let context = this;
		let _args = arguments;

		clearTimeout(fn.id);
		fn.id = setTimeout(function () {
			fn.call(context, _args);
		}, delay);
	};
}
