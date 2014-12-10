/*!
 * @license CC0 1.0 Universal License
 */
(function (namespace) {
	// set sticky module and directive
	angular.module(namespace, []).directive(namespace, ['$compile', function ($compile) {
		var DEBUG = false;

		return {
			link: function (scope, angularElement, attrs) {
				DEBUG && console.log('[angular-sticky create]');

				var
				// get element
				element = angularElement[0],

				// get document
				document = element.ownerDocument,

				// get window
				window = document.defaultView,

				// get wrapper type
				wrapperType = attrs[namespace + 'WrapperTag'] || 'span',
				wrapperProvided = attrs[namespace + 'WrapperProvided'] || 'false',

				// get wrapper
				wrapper,

				// cache styles
				style = element.getAttribute('style'),
				stickyStyle = attrs[namespace + 'Style'] || '',
				stickyClass = attrs[namespace + 'Class'] || '',

				// get options
				bottom = parseFloat(attrs[namespace + 'Bottom']),
				media = window.matchMedia(attrs[namespace + 'Media'] || 'all'),
				top = parseFloat(attrs[namespace + 'Top']),

				// initialize states
				activeBottom = false,
				activeTop = false,
				offset = {};

				// see if a wrapper context has already been provided
				wrapperProvided =
					(wrapperProvided.toLowerCase().trim() == 'true');

				if (wrapperProvided) {
					DEBUG && console.log('[angular-sticky create] using provided wrapper');
					wrapper = element.parentNode;
				} else {
					wrapper = document.createElement(wrapperType);
				}

				// configure wrapper
				wrapper.className = 'is-' + namespace;

				// activate sticky
				function activate() {
					DEBUG && console.log('[angular-sticky activate]');

					// get element computed style
					var
					computedStyle = getComputedStyle(element),
					position = activeTop ? 'top:' + top : 'bottom:' + bottom,
					parentNode = element.parentNode,
					nextSibling = element.nextSibling;

					// replace element with wrapper containing element
					if (!wrapperProvided) {
						wrapper.appendChild(element);
						if (parentNode) {
							parentNode.insertBefore(wrapper, nextSibling);
						}
					}

					// style wrapper
					wrapper.setAttribute('style',
						'display:' + computedStyle.display + ';' +
						'height:' + element.offsetHeight + 'px;' +
						'margin:' + computedStyle.margin + ';' +
						'width:' + element.offsetWidth + 'px;' +
						stickyStyle
					);

					var angularWrapper = angular.element(wrapper);
					angularWrapper.addClass(stickyClass);

					// style element
					element.setAttribute('style',
						'left:' + offset.left + 'px;' +
						'margin:0;' +
						'position:fixed;' +
						'transition:none;' +
						position + 'px;' +
						'width:' + computedStyle.width + ';' +
						stickyStyle
					);
				}

				// deactivate sticky
				function deactivate() {
					DEBUG && console.log('[angular-sticky deactivate]');

					var
					parentNode = wrapper.parentNode,
					nextSibling = wrapper.nextSibling;

					if (!wrapperProvided) {
						// replace wrapper with element
						parentNode.removeChild(wrapper);

						parentNode.insertBefore(element, nextSibling);
					}

					// unstyle element
					if (style === null) {
						element.removeAttribute('style');
					} else {
						element.setAttribute('style', style);
					}

					// unstyle wrapper
					wrapper.removeAttribute('style');

					activeTop = activeBottom = false;
				}

				// window scroll listener
				function onscroll() {
					DEBUG && console.log('[angular-sticky onscroll]');

					// if activated
					if (activeTop || activeBottom) {
						// get wrapper offset
						offset = wrapper.getBoundingClientRect();

						activeBottom = !isNaN(bottom) && offset.top > window.innerHeight - bottom - wrapper.offsetHeight;
						activeTop = !isNaN(top) && offset.top < top;

						// deactivate if wrapper is inside range
						if (!activeTop && !activeBottom) {
							deactivate();
						}
					}
					// if not activated
					else if (media.matches) {
						// get element offset
						offset = element.getBoundingClientRect();

						activeBottom = !isNaN(bottom) && offset.top > window.innerHeight - bottom - element.offsetHeight;
						activeTop = !isNaN(top) && offset.top < top;

						// activate if element is outside range
						if (activeTop || activeBottom) {
							activate();
						}
					}
				}

				// window resize listener
				function onresize() {
					DEBUG && console.log('[angular-sticky onresize]');

					// conditionally deactivate sticky
					if (activeTop || activeBottom) {
						deactivate();
					}

					// re-initialize sticky
					onscroll();
				}

				// destroy listener
				function ondestroy() {
					DEBUG && console.log('[angular-sticky ondestroy]');

					onresize();

					window.removeEventListener('scroll', onscroll);
					window.removeEventListener('resize', onresize);
				}

				// bind listeners
				window.addEventListener('scroll', onscroll);
				window.addEventListener('resize', onresize);

				scope.$on('$destroy', ondestroy);

				// initialize sticky
				onscroll();
			}
		};
	}]);
})('sticky');
