/*!
 * @license CC0 1.0 Universal License
 */

/*jslint browser: true, plusplus: true, white: true, indent: 4 */
/*global angular, getComputedStyle, MutationObserver */

(function (namespace) {
	"use strict";

	// set sticky module and directive
	angular.module(namespace, []).directive(namespace, ['$timeout', '$log', function ($timeout, $log) {
		if (window.matchMedia === undefined) {
			return {
				link: function () {
					$log.error(
						'angular-sticky requires window.matchMedia, ' +
						'which your browser does not seem to support.  ' +
						'Please load a shim layer like ' +
						'https://github.com/weblinc/media-match to ' +
						'provide that functionality.'
					);
				}
			};
		}

		return {
			link: function (scope, angularElement, attrs) {
				$log.debug('[angular-sticky create] version 1.1.0');

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
				positionUsingStyle = attrs[namespace + 'PositionUsingStyle'] || 'true',

				// get the initialization delay
				stickyInitDelayMsec = attrs[namespace + 'InitDelay'] || 1,

				// get options
				bottom = parseFloat(attrs[namespace + 'Bottom']),
				media = window.matchMedia(attrs[namespace + 'Media'] || 'all'),
				top = parseFloat(attrs[namespace + 'Top']),

				// initialize states
				activeBottom = false,
				activeTop = false,
				offset = {},

				// MutationObserver to handle dynamic changes
				observer,
				observerConfig =
					{
						attributes: true,
						childList: true,
						characterData: true,
						subtree: true
					};

				// see if positioning should be done by angular-sticky
				positionUsingStyle =
					(positionUsingStyle.toLowerCase().trim() === 'true');

				// see if a wrapper context has already been provided
				wrapperProvided =
					(wrapperProvided.toLowerCase().trim() === 'true');

				if (wrapperProvided) {
					$log.debug('[angular-sticky create] using provided wrapper');
					wrapper = element.parentNode;
				} else {
					wrapper = document.createElement(wrapperType);
				}

				// activate sticky
				function activate() {
					$log.debug('[angular-sticky activate]');

					// get element computed style
					var
					computedStyle = getComputedStyle(element),
					position = activeTop ? 'top:' + top : 'bottom:' + bottom,
					parentNode = element.parentNode,
					nextSibling = element.nextSibling,
					angularWrapper,
					elementStyle;

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

					angularWrapper = angular.element(wrapper);
					angularWrapper.addClass('is-' + namespace);

					// style element
					elementStyle =
						'left:' + offset.left + 'px;' +
						'margin:0;' +
						'position:fixed;' +
						'transition:none;' +
						position + 'px;';

					element.setAttribute('style',
						(positionUsingStyle ? elementStyle : '') +
						'width:' + computedStyle.width + ';' +
						stickyStyle
					);

					if (!positionUsingStyle) {
						angularElement.addClass(stickyClass);
					}
				}

				// deactivate sticky
				function deactivate() {
					$log.debug('[angular-sticky deactivate]');

					var
					parentNode = wrapper.parentNode,
					angularWrapper = angular.element(wrapper),
					nextSibling = wrapper.nextSibling;

					if (!wrapperProvided) {
						// replace wrapper with element
						parentNode.removeChild(wrapper);

						parentNode.insertBefore(element, nextSibling);
					}

					// unstyle element
					if (!style) {
						element.removeAttribute('style');
					} else {
						element.setAttribute('style', style);
					}

					angularElement.removeClass(stickyClass);
					angularWrapper.removeClass('is-' + namespace);

					// unstyle wrapper
					wrapper.removeAttribute('style');

					activeTop = activeBottom = false;
				}

				// window scroll listener
				function onscroll() {
					$log.debug('[angular-sticky onscroll]');

					if (activeTop || activeBottom) { // if activated
						// get wrapper offset
						offset = wrapper.getBoundingClientRect();

						activeBottom = !isNaN(bottom) && offset.top > window.innerHeight - bottom - wrapper.offsetHeight;
						activeTop = !isNaN(top) && offset.top < top;

						// deactivate if wrapper is inside range
						if (!activeTop && !activeBottom) {
							deactivate();
						}
					} else if (media.matches) { // if not activated
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
					$log.debug('[angular-sticky onresize]');

					// conditionally deactivate sticky
					if (activeTop || activeBottom) {
						deactivate();
					}

					// re-initialize sticky
					onscroll();
				}

				// destroy listener
				function ondestroy() {
					$log.debug('[angular-sticky ondestroy]');

					onresize();

					window.removeEventListener('scroll', onscroll);
					window.removeEventListener('resize', onresize);
				}

				// registers the MutationObserver
				function registerobserver() {
					observer.observe(element, observerConfig);
				}

				// unregisters the MutationObserver
				function unregisterobserver() {
					observer.disconnect();
				}

				// bind listeners
				window.addEventListener('scroll', onscroll);
				window.addEventListener('resize', onresize);

				if ('MutationObserver' in window) {
					$log.debug('[angular-sticky create] mutation observer found');

					observer =
						new MutationObserver(function (mutations) {
							mutations.forEach(function (mutation) {
								if (mutation.type !== 'attributes') {
									return;
								}

								switch (mutation.attributeName) {
								case 'class':
								case 'style':
									break;
								default:
									return;
								}

								if (wrapper.offsetHeight === element.offsetHeight) {
									return;
								}

								$log.debug('[angular-sticky mutation-observer]');
								unregisterobserver();
								onresize();
								registerobserver();
							});
						});

					registerobserver();
				} else {
					$log.warn(
						'MutationObserver support not found in your ' +
						'browser.  There may be problems if the ' +
						'sticky bar content is dynamic.'
					);
				}

				scope.$on('$destroy', ondestroy);

				// initialize sticky
				$timeout(
					function () {
						$log.debug('[angular-sticky initialize]');
						onscroll();
					},
					stickyInitDelayMsec
				);
			}
		};
	}]);
}('sticky'));
