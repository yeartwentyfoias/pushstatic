// http://stackoverflow.com/questions/2420970/how-can-i-get-selector-from-jquery-object/15623322#15623322
!function (e, t) {
	var n = function (e) {
		var n = [];
		for (; e && e.tagName !== t; e = e.parentNode) {
			if (e.className) {
				var r = e.className.split(" ");
				for (var i in r) {
					if (r.hasOwnProperty(i) && r[i]) {
						n.unshift(r[i]);
						n.unshift(".")
					}
				}
			}
			if (e.id && !/\s/.test(e.id)) {
				n.unshift(e.id);
				n.unshift("#")
			}
			n.unshift(e.tagName);
			n.unshift(" > ")
		}
		return n.slice(1).join("")
	};
	e.fn.getSelector = function (t) {
		if (true === t) {
			return n(this[0])
		} else {
			return e.map(this, function (e) {
				return n(e)
			})
		}
	}
}(window.jQuery)

/**
 * Find content column and sidebars
 * @param obj $entryContent parent of placeholder.
 * @returns obj jQuery elements for left, right sidebars, and content column
 */
function vgplFindContentColumns($entryContent, allowForPadding) {

	//		var entryContentWidth = $entryContent.innerWidth() - parseInt($entryContent.css('padding-left').replace('px')) - parseInt($entryContent.css('padding-right').replace('px') );
	var entryContentWidth = $entryContent.width();
	var $parents = $entryContent.parents();
	var $parent, $inmediateParent;

	var padding = (allowForPadding) ? 50 : 0;

	// Find entryContent column and columns container
	$parents.each(function () {
		var parentWidth = jQuery(this).outerWidth();
		if (parentWidth > (entryContentWidth + padding)) {
			$parent = jQuery(this);
			return false;
		} else {
			$inmediateParent = null;
			$inmediateParent = jQuery(this);
		}
	});
	
	if(!$parent){
		$parent = $parents.first();
	}

	if (!$inmediateParent || !$inmediateParent.length) {
		$inmediateParent = $entryContent;
	}

	var $parentChildren = $parent.children();
	var $siblings = $parentChildren.not($inmediateParent);
	var inmediateParentLeft = $inmediateParent.offset().left;
	var inmediateParentRight = inmediateParentLeft + $inmediateParent.outerWidth();

	// Find theme sidebars
	var $firstLeft, $lastRight;
	$siblings.each(function () {
		var $column = jQuery(this);
		var columnLeft = $column.offset().left;

		if (columnLeft < inmediateParentLeft) {
			$firstLeft = $column;
		} else if (columnLeft > inmediateParentRight) {
			$lastRight = $column;
		}
	});


	if ((!$firstLeft || !$firstLeft.length) && (!$lastRight || !$lastRight.length)) {
		var $possibleSidebarElements = jQuery('.widget, .widget-area, .sidebar, #secondary, .secondary');
		var parentLeft = $parent.offset().left;
		var parentRight = parentLeft + $parent.width();

		$leftSidebarElements = $possibleSidebarElements.filter(function () {
			return jQuery(this).offset().left < parentLeft && !jQuery(this).parents('.vg-page-layout-sidebar').length;
		});
		$rightSidebarElements = $possibleSidebarElements.filter(function () {
			return  jQuery(this).offset().left > parentRight && !jQuery(this).parents('.vg-page-layout-sidebar').length;
		});

		var $firstLeftSidebarElement = $leftSidebarElements.first();
		var $firstLeftSidebarElementParents = $firstLeftSidebarElement.parents();
		var $leftSidebarInmediateParent = null, $leftSidebarParent = null;

		$firstLeftSidebarElementParents.each(function () {
			var parentWidth = jQuery(this).outerWidth();
			var parentLeft = jQuery(this).offset().left;
			if ((parentLeft + parentWidth) > parentLeft) {
				$leftSidebarParent = jQuery(this);

				if (!$leftSidebarInmediateParent || !$leftSidebarInmediateParent.length) {
					$leftSidebarInmediateParent = $firstLeftSidebarElement;
				}
				return false;
			} else {
				$leftSidebarInmediateParent = null;
				$leftSidebarInmediateParent = jQuery(this);
			}
		});

		var $firstRightSidebarElement = $rightSidebarElements.first();
		var $firstRightSidebarElementParents = $firstRightSidebarElement.parents();
		var $rightSidebarInmediateParent = null, $rightSidebarParent = null;

		$firstRightSidebarElementParents.each(function () {
			var parentWidth = jQuery(this).outerWidth();
			var parentLeft = jQuery(this).offset().left;
			if (parentLeft < parentRight) {
				$rightSidebarParent = jQuery(this);
				if (!$rightSidebarInmediateParent || !$rightSidebarInmediateParent.length) {
					$rightSidebarInmediateParent = $firstRightSidebarElement;
				}
				return false;
			} else {
				$rightSidebarInmediateParent = null;
				$rightSidebarInmediateParent = jQuery(this);
			}
		});

		$firstLeft = $leftSidebarInmediateParent,
				$lastRight = $rightSidebarInmediateParent;

		$sidebars = jQuery().add($firstLeft).add($lastRight);
		$possibleInmediateParent = $sidebars.first().siblings().first();

		if ($possibleInmediateParent.length) {
			$inmediateParent = $possibleInmediateParent;
		}
	}

	return {
		$firstLeft: $firstLeft,
		$lastRight: $lastRight,
		$inmediateParent: $inmediateParent,
		$parent: $parent
	};
}
jQuery(document).ready(function () {

	var $marker = jQuery('.vg-page-layout-placeholder');

	if (!$marker.length) {
		return;
	}
	
	// We need the body to be desktop size, to be able to find the sidebars,
	// otherwise sidebars appear below the content and the algorithm doesn't consider
	// them sidebars
	if( jQuery( window ).width() < 769){
		var windowSizeWasChanged = true;
		jQuery( 'body' ).width(1365);
	}
	
	
	var leftSidebarSelector = $marker.data('left-sidebar-selector');
	var rightSidebarSelector = $marker.data('right-sidebar-selector');
	var contentColumnSelector = $marker.data('content-column-selector');



	var $entryContent = $marker.parent();
	contentColumns = vgplFindContentColumns($entryContent, false);

	if (!contentColumns.$inmediateParent || !contentColumns.$inmediateParent.length) {
		contentColumns = vgplFindContentColumns($entryContent, true);
	}

	// Use settings element if available
	if (leftSidebarSelector) {
		var $firstLeft = jQuery(leftSidebarSelector);

		if ($firstLeft.length) {
			contentColumns.$firstLeft = $firstLeft;
		}
	}
	if (rightSidebarSelector) {
		var $lastRight = jQuery(rightSidebarSelector);

		if ($lastRight.length) {
			contentColumns.$lastRight = $lastRight;
		}
	}
	if (contentColumnSelector) {
		var $inmediateParent = jQuery(contentColumnSelector);
		if ($inmediateParent.length) {
			contentColumns.$inmediateParent = $inmediateParent;
		}
	}

	window.vgplContentColumns = contentColumns;
	jQuery('body').trigger('vgplInit');
	
	// Reset screen width
	if( windowSizeWasChanged){
		jQuery( 'body' ).css('width', '');
	}

	// Hide theme sidebars
	if (contentColumns.$firstLeft) {
		contentColumns.$firstLeft.hide();
	}
	if (contentColumns.$lastRight) {
		contentColumns.$lastRight.hide();
	}

	// Make content column full width. We will add our sidebars inside this column.
	if (contentColumns.$inmediateParent && contentColumns.$inmediateParent.length) {
		contentColumns.$inmediateParent.css({
			width: '100%',
			'max-width': '100%',
			'box-sizing': 'border-box',
			'margin-left': '0',
			'margin-right': '0',
		});
	}
	if ($entryContent && $entryContent.length) {
		$entryContent.css({
			width: '100%',
			'max-width': '100%',
			'box-sizing': 'border-box',
			'margin-left': '0',
			'margin-right': '0',
		});
	}

	// Display our sidebars
	var $sidebars = $entryContent.find('.vg-page-layout-sidebar');

	if ($sidebars.length) {
		var asideSidebars = 0;
		$sidebars.each(function () {
			var position = jQuery(this).data('position');

			jQuery(this).css({
				'display': 'block',
				'float': position
			});

			if (!position) {
				jQuery(this).css({
					'width': '100%'
				});
			} else {
				asideSidebars++;
			}
		});

		// Wrap content in div to separate from sidebars
		$entryContent.children().not($sidebars).wrapAll('<div class="vg-page-layout-content"></div>');

		var $content = $entryContent.find('.vg-page-layout-content');

		if (jQuery('.vg-page-layout-left-sidebar').length) {
			if (jQuery(window).width() < 769) {
				$content.insertBefore(jQuery('.vg-page-layout-left-sidebar'));
			} else {
				$content.insertAfter(jQuery('.vg-page-layout-left-sidebar'));
			}
		}
		if (jQuery('.vg-page-layout-above-content-sidebar').length) {
			jQuery('.vg-page-layout-above-content-sidebar').prependTo($content.parent());
		}


		if (jQuery(window).width() > 768) {
			if (asideSidebars > 1) {
				$content.css({
					'width': '50%'
				});

			} else if (asideSidebars > 0) {
				$content.css({
					'width': '75%'
				});
			}
		}
	}



});