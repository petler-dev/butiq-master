jQuery(function() {
    initMobileNav();
    initStickyScrollBlock();
});


// mobile menu init
function initMobileNav() {
    jQuery('body').mobileNav({
        menuActiveClass: 'nav-active',
        menuOpener: '.nav-opener',
        menuDrop: 'ul'
    });
}

// initialize fixed blocks on scroll
function initStickyScrollBlock() {
    jQuery('#header').stickyScrollBlock({
        setBoxHeight: false,
        activeClass: 'fixed-position',
        positionType: 'fixed',
        extraTop: function() {
            var totalHeight = 0;
            jQuery('0').each(function() {
                totalHeight += jQuery(this).outerHeight();
            });
            return totalHeight;
        }
    });
}


/*
 * Simple Mobile Navigation
 */
;(function($) {
    function MobileNav(options) {
        this.options = $.extend({
            container: null,
            hideOnClickOutside: false,
            menuActiveClass: 'nav-active',
            menuOpener: '.nav-opener',
            menuDrop: '.nav-drop',
            toggleEvent: 'click',
            outsideClickEvent: 'click touchstart pointerdown MSPointerDown'
        }, options);
        this.initStructure();
        this.attachEvents();
    }
    MobileNav.prototype = {
        initStructure: function() {
            this.page = $('html');
            this.container = $(this.options.container);
            this.opener = this.container.find(this.options.menuOpener);
            this.drop = this.container.find(this.options.menuDrop);
        },
        attachEvents: function() {
            var self = this;

            if(activateResizeHandler) {
                activateResizeHandler();
                activateResizeHandler = null;
            }

            this.outsideClickHandler = function(e) {
                if(self.isOpened()) {
                    var target = $(e.target);
                    if(!target.closest(self.opener).length && !target.closest(self.drop).length) {
                        self.hide();
                    }
                }
            };

            this.openerClickHandler = function(e) {
                e.preventDefault();
                self.toggle();
            };

            this.opener.on(this.options.toggleEvent, this.openerClickHandler);
        },
        isOpened: function() {
            return this.container.hasClass(this.options.menuActiveClass);
        },
        show: function() {
            this.container.addClass(this.options.menuActiveClass);
            if(this.options.hideOnClickOutside) {
                this.page.on(this.options.outsideClickEvent, this.outsideClickHandler);
            }
        },
        hide: function() {
            this.container.removeClass(this.options.menuActiveClass);
            if(this.options.hideOnClickOutside) {
                this.page.off(this.options.outsideClickEvent, this.outsideClickHandler);
            }
        },
        toggle: function() {
            if(this.isOpened()) {
                this.hide();
            } else {
                this.show();
            }
        },
        destroy: function() {
            this.container.removeClass(this.options.menuActiveClass);
            this.opener.off(this.options.toggleEvent, this.clickHandler);
            this.page.off(this.options.outsideClickEvent, this.outsideClickHandler);
        }
    };

    var activateResizeHandler = function() {
        var win = $(window),
            doc = $('html'),
            resizeClass = 'resize-active',
            flag, timer;
        var removeClassHandler = function() {
            flag = false;
            doc.removeClass(resizeClass);
        };
        var resizeHandler = function() {
            if(!flag) {
                flag = true;
                doc.addClass(resizeClass);
            }
            clearTimeout(timer);
            timer = setTimeout(removeClassHandler, 500);
        };
        win.on('resize orientationchange', resizeHandler);
    };

    $.fn.mobileNav = function(opt) {
        var args = Array.prototype.slice.call(arguments);
        var method = args[0];

        return this.each(function() {
            var $container = jQuery(this);
            var instance = $container.data('MobileNav');

            if (typeof opt === 'object' || typeof opt === 'undefined') {
                $container.data('MobileNav', new MobileNav($.extend({
                    container: this
                }, opt)));
            } else if (typeof method === 'string' && instance) {
                if (typeof instance[method] === 'function') {
                    args.shift();
                    instance[method].apply(instance, args);
                }
            }
        });
    };
}(jQuery));

/*
 * jQuery sticky box plugin 
 */
;(function($, $win) {

    'use strict';

    function StickyScrollBlock($stickyBox, options) {
        this.options = options;
        this.$stickyBox = $stickyBox;
        this.init();
    }

    var StickyScrollBlockPrototype = {
        init: function() {
            this.findElements();
            this.attachEvents();
            this.makeCallback('onInit');
        },

        findElements: function() {
            // find parent container in which will be box move 
            this.$container = this.$stickyBox.closest(this.options.container);
            // define box wrap flag
            this.isWrap = this.options.positionType === 'fixed' && this.options.setBoxHeight;
            // define box move flag
            this.moveInContainer = !!this.$container.length;
            // wrapping box to set place in content
            if (this.isWrap) {
                this.$stickyBoxWrap = this.$stickyBox.wrap('<div class="' + this.getWrapClass() + '"/>').parent();
            }
            //define block to add active class
            this.parentForActive = this.getParentForActive();
            this.isInit = true;
        },

        attachEvents: function() {
            var self = this;

            // bind events
            this.onResize = function() {
                if (!self.isInit) return;
                self.resetState();
                self.recalculateOffsets();
                self.checkStickyPermission();
                self.scrollHandler();
            };

            this.onScroll = function() {
                self.scrollHandler();
            };

            // initial handler call
            this.onResize();

            // handle events
            $win.on('load resize orientationchange', this.onResize)
                .on('scroll', this.onScroll);
        },

        defineExtraTop: function() {
            // define box's extra top dimension
            var extraTop;

            if (typeof this.options.extraTop === 'number') {
                extraTop = this.options.extraTop;
            } else if (typeof this.options.extraTop === 'function') {
                extraTop = this.options.extraTop();
            }

            this.extraTop = this.options.positionType === 'absolute' ?
                extraTop :
                Math.min(this.winParams.height - this.data.boxFullHeight, extraTop);
        },

        checkStickyPermission: function() {
            // check the permission to set sticky
            this.isStickyEnabled = this.moveInContainer ?
                this.data.containerOffsetTop + this.data.containerHeight > this.data.boxFullHeight + this.data.boxOffsetTop + this.options.extraBottom :
                true;
        },

        getParentForActive: function() {
            if (this.isWrap) {
                return this.$stickyBoxWrap;
            }

            if (this.$container.length) {
                return this.$container;
            }

            return this.$stickyBox;
        },

        getWrapClass: function() {
            // get set of container classes
            try {
                return this.$stickyBox.attr('class').split(' ').map(function(name) {
                    return 'sticky-wrap-' + name;
                }).join(' ');
            } catch (err) {
                return 'sticky-wrap';
            }
        },

        resetState: function() {
            // reset dimensions and state
            this.stickyFlag = false;
            this.$stickyBox.css({
                '-webkit-transition': '',
                '-webkit-transform': '',
                transition: '',
                transform: '',
                position: '',
                width: '',
                left: '',
                top: ''
            }).removeClass(this.options.activeClass);

            if (this.isWrap) {
                this.$stickyBoxWrap.removeClass(this.options.activeClass).removeAttr('style');
            }

            if (this.moveInContainer) {
                this.$container.removeClass(this.options.activeClass);
            }
        },

        recalculateOffsets: function() {
            // define box and container dimensions
            this.winParams = this.getWindowParams();

            this.data = $.extend(
                this.getBoxOffsets(),
                this.getContainerOffsets()
            );

            this.defineExtraTop();
        },

        getBoxOffsets: function() {
            function offetTop(obj){
                obj.top = 0;
                return obj
            }
            var boxOffset = this.$stickyBox.css('position') ==='fixed' ? offetTop(this.$stickyBox.offset()) : this.$stickyBox.offset();
            var boxPosition = this.$stickyBox.position();

            return {
                // sticky box offsets
                boxOffsetLeft: boxOffset.left,
                boxOffsetTop: boxOffset.top,
                // sticky box positions
                boxTopPosition: boxPosition.top,
                boxLeftPosition: boxPosition.left,
                // sticky box width/height
                boxFullHeight: this.$stickyBox.outerHeight(true),
                boxHeight: this.$stickyBox.outerHeight(),
                boxWidth: this.$stickyBox.outerWidth()
            };
        },

        getContainerOffsets: function() {
            var containerOffset = this.moveInContainer ? this.$container.offset() : null;

            return containerOffset ? {
                // container offsets
                containerOffsetLeft: containerOffset.left,
                containerOffsetTop: containerOffset.top,
                // container height
                containerHeight: this.$container.outerHeight()
            } : {};
        },

        getWindowParams: function() {
            return {
                height: window.innerHeight || document.documentElement.clientHeight
            };
        },

        makeCallback: function(name) {
            if (typeof this.options[name] === 'function') {
                var args = Array.prototype.slice.call(arguments);
                args.shift();
                this.options[name].apply(this, args);
            }
        },

        destroy: function() {
            this.isInit = false;
            // remove event handlers and styles
            $win.off('load resize orientationchange', this.onResize)
                .off('scroll', this.onScroll);
            this.resetState();
            this.$stickyBox.removeData('StickyScrollBlock');
            if (this.isWrap) {
                this.$stickyBox.unwrap();
            }
            this.makeCallback('onDestroy');
        }
    };

    var stickyMethods = {
        fixed: {
            scrollHandler: function() {
                this.winScrollTop = $win.scrollTop();
                var isActiveSticky = this.winScrollTop -
                    (this.options.showAfterScrolled ? this.extraTop : 0) -
                    (this.options.showAfterScrolled ? this.data.boxHeight + this.extraTop : 0) >
                    this.data.boxOffsetTop - this.extraTop;

                if (isActiveSticky) {
                    this.isStickyEnabled && this.stickyOn();
                } else {
                    this.stickyOff();
                }
            },

            stickyOn: function() {
                if (!this.stickyFlag) {
                    this.stickyFlag = true;
                    this.parentForActive.addClass(this.options.activeClass);
                    this.$stickyBox.css({
                        width: this.data.boxWidth,
                        position: this.options.positionType
                    });
                    if (this.isWrap) {
                        this.$stickyBoxWrap.css({
                            height: this.data.boxFullHeight
                        });
                    }
                    this.makeCallback('fixedOn');
                }
                this.setDynamicPosition();
            },

            stickyOff: function() {
                if (this.stickyFlag) {
                    this.stickyFlag = false;
                    this.resetState();
                    this.makeCallback('fixedOff');
                }
            },

            setDynamicPosition: function() {
                this.$stickyBox.css({
                    top: this.getTopPosition(),
                    left: this.data.boxOffsetLeft - $win.scrollLeft()
                });
            },

            getTopPosition: function() {
                if (this.moveInContainer) {
                    var currScrollTop = this.winScrollTop + this.data.boxHeight + this.options.extraBottom;

                    return Math.min(this.extraTop, (this.data.containerHeight + this.data.containerOffsetTop) - currScrollTop);
                } else {
                    return this.extraTop;
                }
            }
        },
        absolute: {
            scrollHandler: function() {
                this.winScrollTop = $win.scrollTop();
                var isActiveSticky = this.winScrollTop > this.data.boxOffsetTop - this.extraTop;

                if (isActiveSticky) {
                    this.isStickyEnabled && this.stickyOn();
                } else {
                    this.stickyOff();
                }
            },

            stickyOn: function() {
                if (!this.stickyFlag) {
                    this.stickyFlag = true;
                    this.parentForActive.addClass(this.options.activeClass);
                    this.$stickyBox.css({
                        width: this.data.boxWidth,
                        transition: 'transform ' + this.options.animSpeed + 's ease',
                        '-webkit-transition': 'transform ' + this.options.animSpeed + 's ease',
                    });

                    if (this.isWrap) {
                        this.$stickyBoxWrap.css({
                            height: this.data.boxFullHeight
                        });
                    }

                    this.makeCallback('fixedOn');
                }

                this.clearTimer();
                this.timer = setTimeout(function() {
                    this.setDynamicPosition();
                }.bind(this), this.options.animDelay * 1000);
            },

            stickyOff: function() {
                if (this.stickyFlag) {
                    this.clearTimer();
                    this.stickyFlag = false;

                    this.timer = setTimeout(function() {
                        this.setDynamicPosition();
                        setTimeout(function() {
                            this.resetState();
                        }.bind(this), this.options.animSpeed * 1000);
                    }.bind(this), this.options.animDelay * 1000);
                    this.makeCallback('fixedOff');
                }
            },

            clearTimer: function() {
                clearTimeout(this.timer);
            },

            setDynamicPosition: function() {
                var topPosition = Math.max(0, this.getTopPosition());

                this.$stickyBox.css({
                    transform: 'translateY(' + topPosition + 'px)',
                    '-webkit-transform': 'translateY(' + topPosition + 'px)'
                });
            },

            getTopPosition: function() {
                var currTopPosition = this.winScrollTop - this.data.boxOffsetTop + this.extraTop;

                if (this.moveInContainer) {
                    var currScrollTop = this.winScrollTop + this.data.boxHeight + this.options.extraBottom;
                    var diffOffset = Math.abs(Math.min(0, (this.data.containerHeight + this.data.containerOffsetTop) - currScrollTop - this.extraTop));

                    return currTopPosition - diffOffset;
                } else {
                    return currTopPosition;
                }
            }
        }
    };

    // jQuery plugin interface
    $.fn.stickyScrollBlock = function(opt) {
        var args = Array.prototype.slice.call(arguments);
        var method = args[0];

        var options = $.extend({
            container: null,
            positionType: 'fixed', // 'fixed' or 'absolute'
            activeClass: 'fixed-position',
            setBoxHeight: true,
            showAfterScrolled: false,
            extraTop: 0,
            extraBottom: 0,
            animDelay: 0.1,
            animSpeed: 0.2
        }, opt);

        return this.each(function() {
            var $stickyBox = jQuery(this);
            var instance = $stickyBox.data('StickyScrollBlock');

            if (typeof opt === 'object' || typeof opt === 'undefined') {
                StickyScrollBlock.prototype = $.extend(stickyMethods[options.positionType], StickyScrollBlockPrototype);
                $stickyBox.data('StickyScrollBlock', new StickyScrollBlock($stickyBox, options));
            } else if (typeof method === 'string' && instance) {
                if (typeof instance[method] === 'function') {
                    args.shift();
                    instance[method].apply(instance, args);
                }
            }
        });
    };

    // module exports
    window.StickyScrollBlock = StickyScrollBlock;
}(jQuery, jQuery(window)));