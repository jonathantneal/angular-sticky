(function (namespace) {
	// set sticky module and directive
	angular.module(namespace, []).directive(namespace, function () {
		return {
			link: function ($scope, element, attrs) {
				var
				// get options
				bottom = parseFloat(attrs[namespace + 'Bottom']),
				media = window.matchMedia(attrs[namespace + 'Media'] || 'all'),
				top = parseFloat(attrs[namespace + 'Top']),

				// get elements
				nativeElement = element[0],
				nativeWrapper = document.createElement('span'),
				wrapper = angular.element(nativeWrapper),

				// cache style
				style = element.attr('style'),

				// initialize states
				activeBottom = false,
				activeTop = false,
				offset = {};

				// activate sticky
				function activate() {
					// conditionally skip unmatched media
					if (!media.matches) {
						activeTop = activeBottom = false;

						return;
					}

					// get element computed style
					var
					computedStyle = getComputedStyle(nativeElement),
					position = activeTop ? 'top:' + top : 'bottom:' + bottom;

					// replace element with wrapper containing element
					wrapper.append(element.replaceWith(wrapper));

					// style wrapper
					wrapper.attr('style', 'display:' + computedStyle.display + ';height:' + nativeElement.offsetHeight + 'px;margin:' + computedStyle.margin + ';width:' + nativeElement.offsetWidth + 'px');

					// style element
					element.attr('style', 'left:' + offset.left + 'px;margin:0;position:fixed;transition:none;' + position + 'px;width:' + computedStyle.width);
				}

				// deactivate sticky
				function deactivate() {
					// unstyle element
					if (style === undefined) {
						element.removeAttr('style');
					} else {
						element.attr('style', style);
					}

					// unstyle wrapper
					wrapper.removeAttr('style');

					// replace wrapper with element
					wrapper.replaceWith(element);

					activeTop = activeBottom = false;
				}

				// window scroll listener
				function onscroll() {
					// if activated
					if (activeTop || activeBottom) {
						// get wrapper offset
						offset = nativeWrapper.getBoundingClientRect();

						activeBottom = !isNaN(bottom) && offset.top > window.innerHeight - bottom - nativeWrapper.offsetHeight;
						activeTop = !isNaN(top) && offset.top < top;

						// deactivate if wrapper is inside range
						if (!activeTop && !activeBottom) {
							deactivate();
						}
					}
					// if not activated
					else {
						// get element offset
						offset = nativeElement.getBoundingClientRect();

						activeBottom = !isNaN(bottom) && offset.top > window.innerHeight - bottom - nativeElement.offsetHeight;
						activeTop = !isNaN(top) && offset.top < top;

						// activate if element is outside range
						if (activeTop || activeBottom) {
							activate();
						}
					}
				}

				// window resize listener
				function onresize() {
					// conditionally deactivate sticky
					if (activeTop || activeBottom) {
						deactivate();
					}

					// re-initialize sticky
					onscroll();
				}

				// bind listeners
				window.addEventListener('scroll', onscroll);
				window.addEventListener('resize', onresize);

				// initialize sticky
				onscroll();
			}
		};
	});
})('sticky');
