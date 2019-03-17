/*!
 *
 * Feed Back jQuery Plugin.
 *
 * @version
 *   1.1.0
 *
 * @Dependancy:
 *   jQuery 1.6
 *   metronic (Keen Themes)
 *   html2canvas 0.33
 *
 * @autor:
 *   Muaaz Khalid <muaaz.khalid@fastesol.com>
 *
 * @Date:
 *   16 03 2019 20.30:00
 *
 */
(function($) {
    $.feedback = {};

	/**
	 * For text translation.
	 */
    $.feedback.text = {
        label: "Send your feedback",
        steps: {
            first: {
                label: "Add your comment",
                holder: "Type your comment"
            },
            second: {
                label: "Get your preview",
                showSection: "Show section",
                hideSection: "Hide section"
            },
            third: {
                label: "Get your resume",
                comment: "Your comment",
                globalInfo: "Global info",
                applicationInfo: "Application info",
                clientInfo: "Client info"
            }
        },
        action: {
            close: "Close",
            next: "Next",
            resume: "Resume",
            send: "Send"
        },
        alerts: {
            success: {
                label: "Success",
                message: "Feed sended with success."
            },
            error: {
                label: "Error",
                message: "Error in sending feedback!"
            }
        }
    };
    $.fn.feedback = function(options) {
		
		var img64 = null, self = null, logger = null, baseImg64 = null, comment = null,
		/* dom var */
        progress = null, box = null, canvas = null,
		/* timing var */
		globalStart = null, startLoading = null, startConvert = null, startRetriveNavigationInfo = null,
		/* report var */
		navInfo = null, globalCarry = null, courrentStep = null,
		/* global var */
		sendFeedBackPath = null, extraData = null,
		/* all canvas */
		canvass = [],
		/* index of created box */
		index = 0;

		/**
		 * Master init function.
		 */
        function init() {
			/* init object */
            options = options || {};
			sendFeedBackPath = options.sendFeedBackPath || '';
			extraData = options.extraData || null;
			logger = {};
			navInfo = {};
			options.elements = self;
			/* load next image handle */
			options.loadNextImage = function(carry) {
				step = Math.round((carry * 0.3) * 100);
			};
			/* before start handle */
			options.beforeStart = function() {
				globalStart = new Date().getTime();
				globalCarry = 0;
				updateProgressStatus();
			};
			/* before loading handle */
			options.beforeLoadingImage = function(nbImg) {
				startLoading = new Date().getTime();
				globalCarry = 20;
				updateProgressStatus();
			};
			/* before convert handle */
			options.beforeConvert = function(nbImg) {
				startConvert = new Date().getTime();
				globalCarry = 50;
				updateProgressStatus();
			};
			/* before retrive navigation info handle */
			options.beforeRetriveNavigationInfo = function() {
				startRetriveNavigationInfo = new Date().getTime();
				globalCarry = 80;
				updateProgressStatus();
			};
            /* finish handle */
			options.finish = function() {
				startRetriveNavigationInfo = new Date().getTime();
				globalCarry = 100;
				updateProgressStatus();
			};
			/* init logger */
			logger.status = options.logger || true;
			/* send info msg */
			logger.info = function(msg) {
				if (logger.status && window.console && window.console.info)
					console.info(msg);
			};
			/* send succes or error msg */
			logger.log = function(msg) {
				if (logger.status && window.console && window.console.log)
					console.log(msg);
			};
		}

		/**
		 * Update progress bar action.
		 */
		function updateProgressStatus() {
			if (progress !== null) {
				progress.find('.bar').css('width', globalCarry + '%');
			}
		}

        /**
		 * Bind finishing scrennshot getting.
		 * 
		 * @param jQueryElement
		 *            element target element.
		 * @param function
		 *            action callback after finishing scrennshot getting.
		 * @param Object
		 *            resize for resizing option.
		 */
		function bindFinishGettingScreenShot(element, action, resize) {
			/* on complete handle */
			options.complete = function(images) {

				// clone option
				var otherOption = $.extend({}, options);
				if (resize) {
					$.extend(otherOption, {
						'width' : parseFloat(element.css('width')),
						'height' : parseFloat(element.css('height')),
						'repositionat' : {
							top : element.offset().top,
							left : element.offset().left
						}
					});
				}

				var queue = html2canvas.Parse(element[0], images, otherOption);

				canvas = $(html2canvas.Renderer(queue, otherOption));

				canvass.push(canvas);

				var finishTime = new Date();
                
				canvas.css({
					position : 'absolute',
					display : 'none',
					left : 0,
					top : 0
				}).appendTo(document.body);

				logger.info('Screenshot created in ' + ((finishTime.getTime() - globalStart)) + " ms");
				logger.info('Getting images in :' + (startLoading - globalStart) + ' ms');
				logger.info('Loading images in :' + (startConvert - startLoading) + ' ms');
				logger.info('Convert images in :' + (finishTime.getTime() - startConvert) + ' ms');

				try {
					img64 = canvas[0].toDataURL();
				} catch (e) {
					logger.log('Error to load screeshot');
				} finally {
					if (typeof action === 'function') {
						action();
					}
				}
			};
		}

		/**
		 * Make loader view (init step).
		 */
        function openLoader() {
            courrentStep = 0;
			box = $('<div id="OVERLAY" class="modal hide fade" role="dialog" aria-labelledby="Loader" aria-hidden="true" />');
            box.append('<div class="modal-dialog">');
            box.find('.modal-dialog').append('<div class="modal-content" style="max-height: 100%;">');
			box.find('.modal-content').append('<div class="modal-header" />');
			box.find('.modal-content').append('<div class="modal-body" />');
			box.find('.modal-content').append('<div class="modal-footer" />');
			
			box.find('.modal-content').find('div.modal-header').append('<h3 class="modal-title">' + $.feedback.text.label + '</h3>');
			box.find('.modal-content').find('div.modal-header').append('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>');
			
			progress = $('<div class="progress progress-striped"/>');
			progress.append('<div class="progress-bar progress-bar-striped progress-bar-animated bar" style="width: 0%;"></div>');
			box.find('.modal-content').find('div.modal-body').append(progress);

			box.find('.modal-content').find('div.modal-footer').append('<button class="btn" data-dismiss="modal" aria-hidden="true">' + $.feedback.text.action.close + '</button>');
			
            $(self).append(box);

			box.modal({
				keyboard : false
			});

			box.bind('hidden', function(e) {
				cleanUp();
			});
		}

        /**
		 * Make second step view.
		 */
		function makeSecondStep() {
			courrentStep = 2;
			var screenSize = getScreenSize();
			var previewSize = [ screenSize[0] * 0.75, screenSize[1] * 0.45 ];
            box.find('.modal-header').find('h3').html($.feedback.text.steps.second.label);
			box.find('.modal-body').empty();
			box.find('.modal-body').append('<img src="' + img64 + '" style="/*width:' + previewSize[0] + 'px;height:' + previewSize[1] + 'px*/ max-height: 100%; max-width: 100%; "/>');
            var mask = $('<div class="mask"/>').css({
				'background': 'rgba(0,0,0,0.1)',
				'background': '-moz-radial-gradient(center,circle closest-corner,rgba(0,0,0,0.36),rgba(0,0,0,0.1))',
				'background': '-ms-radial-gradient(center,circle closest-corner,rgba(0,0,0,0.36),rgba(0,0,0,0.1))',
				'background': '-o-radial-gradient(center,circle closest-corner,rgba(0,0,0,0.36),rgba(0,0,0,0.1))',
				'background': '-webkit-radial-gradient(center,circle closest-corner,rgba(0,0,0,0.36),rgba(0,0,0,0.1))',
				'background': 'radial-gradient(center,circle closest-corner,rgba(0,0,0,0.36),rgba(0,0,0,0.1))',
				'opacity': '.1',
				'position': 'absolute',
				'top': '0',
				'left': '0',
				'width': '100%',
				'left': '0',
				'width': '100%',
				'height': '100%',
				'-moz-user-select': '-moz-none',
				'-khtml-user-select': 'none',
				'-webkit-user-select': 'none',
				'-o-user-select': 'none',
				'user-select': 'none'
			});
            box.find('.modal-body').append(mask);
			box.css({
				'width' : screenSize[0] * 0.7,
				'height' : screenSize[1] * 0.95,
				'left' : '15%',
				'top' : '2%',
				'overflow-y': 'hidden'
			});
			box.find('.modal-dialog').css('margin-top', '0');
            box.find(".modal-dialog").css({
                "max-width": "100%",
                "marign-top": 0
            });
			box.find('.modal-body').css({
				'max-height' : '9999px',
				'position' : 'relative',
                'overflow-y': "auto",
                'text-align': "center"
			});
			
            box.find('#toSecond').remove();
            box.find('div.modal-footer').append('<button class="btn btn-primary" id="toFinal">' + $.feedback.text.action.resume + '</button>');
			box.find('#toFinal').unbind('click').bind('click', function() {
				// save old img
				baseImg64 = img64;
				// bind finish
				bindFinishGettingScreenShot(box.find('div.modal-body'), makeFinalStep, true);
				// get final screen shot
				launchSecondProcess(box.find('div.modal-body'));
			});
            
			var actionGroup = $('<div class="btn-toolbar" />');
			actionGroup.append('<div class="btn-group" data-toggle="buttons-radio" />');

			var showBtn = $('<a id="showBtn" class="btn btn-primary btn-sm" href="javascript:void(0)"><i class="icon-eye-open"></i> ' + $.feedback.text.steps.second.showSection
					+ '</a>');
			showBtn.click(function() {$('#hideBtn').removeClass('active');})
			var hideBtn = $('<a id="hideBtn" class="btn btn-primary btn-sm" href="javascript:void(0)"><i class="icon-eye-close"></i> ' + $.feedback.text.steps.second.hideSection
					+ ' </a>');
			hideBtn.click(function() {$('#showBtn').removeClass('active');})
			
			actionGroup.find('div.btn-group').append(showBtn).append(hideBtn);
			box.find("div.modal-header h3").append(actionGroup);
			showBtn.addClass('active');
            
			box.find('.mask').bind(
					'mousedown',
					function(e) {
						if (e.which == 1 && e.button == 0) {
							var id = generatID();
							$(this).data('down', {
								id : id,
								startX : e.offsetX ? e.offsetX : e.pageX - $(this).offset().left,
								startY : e.offsetY ? e.offsetY : e.pageY - $(this).offset().top
							});

							var newbloc = generateBloc(id, e.offsetX ? e.offsetX : e.pageX - $(this).offset().left, e.offsetY ? e.offsetY : e.pageY
									- $(this).offset().top, $('#showBtn').hasClass('active'));
							$(this).parent().append(newbloc);
						} else
							$(this).removeData('down');
					});

			$(document).bind('mouseup', function(e) {
				box.find('.mask').removeData('down');
			});

			box.find('.mask').bind('mousemove', function(e) {
				if ($(this).data('down') == undefined)
					return;
				var data = $(this).data('down');
				var newbloc = $('#' + data.id);
				var x = e.offsetX ? e.offsetX : e.pageX - $(this).offset().left, y = e.offsetY ? e.offsetY : e.pageY - $(this).offset().top;
				if (data.startX < x) {
					newbloc.css('width', x - data.startX);
				} else {
					newbloc.css('width', data.startX - x);
					newbloc.css('left', x);
				}
				if (data.startY < y) {
					newbloc.css('height', y - data.startY);
				} else {
					newbloc.css('height', data.startY - y);
					newbloc.css('top', y);
				}
			});
			box.find(".modal-body").outerHeight(screenSize[1] * 0.9 - (box.find(".modal-header").outerHeight() < box.find(".modal-header").height() ? box.find(".modal-header").height() : box.find(".modal-header").outerHeight()) - (box.find(".modal-footer").outerHeight() < box.find(".modal-footer").height() ? box.find(".modal-footer").height() : box.find(".modal-footer").outerHeight()));
		}

		/**
		 * Generate viewer bloc (red or black).
		 * 
		 * @param id
		 *            integer id of new box.
		 * @param x
		 *            float position on x.
		 * @param y
		 *            float position on y.
		 * @param clear
		 *            boolean : if true hat white box else red box.
		 * @return jQueryElement new box.
		 */
        function generateBloc(id, x, y, clear) {
			var newbloc = $('<div id=' + id + '/>');
			newbloc.addClass('boxer');
			if (clear)
                newbloc.addClass('view-box').css({
					'position': 'absolute',
					'border-style': 'solid',
					'border-color': 'white',
					'border': '2px',
					'background': 'red'
				})
            else
                newbloc.addClass('hide-box').css({
					'position': 'absolute',
					'border-style': 'solid',
					'border-color': 'white',
					'border': '2px',
					'background': 'black'
				})
            newbloc.css({
				'left' : x,
				'top' : y
			});

			var closer = $('<div class="cross" />').css({
				'background-image': 'url(img/cross.png)',
				'width': '30px',
				'height': '30px',
				'cursor': 'pointer',
				'display': 'none',
				'position': 'absolute',
				'right': '-15px',
				'top': '-15px'
			});

			closer.bind('click', function() {
				$(this).parent().remove();
			});

			newbloc.append(closer);
            
            closer.bind('mouseenter', function() {
				if (parseFloat($(this).parent().css('width')) > 16 || parseFloat($(this).parent().css('height')) > 16) {
					if ($(this).parent().hasClass('view-box')) {
						$(this).parent().css('opacity', '0.4');
					} else {
						$(this).parent().css('opacity', '0.2');
					}
					$(this).show();
				}
			}).bind('mouseout', function() {
				if ($(this).parent().hasClass('view-box')) {
					$(this).parent().css('opacity', '0.2');
				} else {
					$(this).parent().css('opacity', '1');
				}
				$(this).hide();
			});

			newbloc.bind('mouseenter', function() {
				if (parseFloat($(this).css('width')) > 16 || parseFloat($(this).css('height')) > 16) {
					if ($(this).hasClass('view-box')) {
						$(this).css('opacity', '0.4');
					} else {
						$(this).css('opacity', '0.2');
					}
					closer.show();
				}
			}).bind('mouseout', function() {
				if ($(this).hasClass('view-box')) {
					$(this).css('opacity', '0.2');
				} else {
					$(this).css('opacity', '1');
				}
				closer.hide();
			});

			return newbloc;
		}

		/**
		 * Generate ID for customizing box.
		 * 
		 * @return integer new index.
		 */
		function generatID() {
			index++;
			return index;
		}

		/**
		 * Make final step view.
		 */
        function makeFinalStep() {
			courrentStep = 3;
			var screenSize = getScreenSize();
			var previewSize = [ screenSize[0] * 0.75, screenSize[1] * 0.72 ];

			box.find('.modal-header').find('h3').html($.feedback.text.steps.third.label);
			box.find('.modal-header').find('div.btn-toolbar').remove();
			box.find('#toFinal').remove();
			box.find('div.modal-footer').append(
					'<button class="btn btn-primary" data-loading-text="sending data..."  id="sendData">' + $.feedback.text.action.send + '</button>');

			// clear body
			box.find('div.modal-body').css({'overflow-y': 'auto', 'text-align': 'left'}).empty();
			// create new view
			var layout = $('<div />');
			layout.css({
				/*'width' : previewSize[0],*/
				'height' : previewSize[1],
				'float' : 'left'
			});
			layout.append('<div class="preview" style="width:70%;height:65%;float:left;" />');
			layout.append('<div class="comment" style="width:30%;height:65%;float:left;" />');
            layout.append('<div style="clear:both;" />');
			layout.append('<div class="data" style="width:100%;height:30%;float:left; margin-top: 10px;" />');
			// preview final screenshot
			layout.find('div.preview').append('<img src="' + img64 + '" style="max-width:100%;max-height:100%;" />');

			layout.find("div.comment").append('<div class="well m-stack m-stack--hor m-stack--general m-stack--demo" style="height: 87%; padding: 15px;"><div class="m-stack__items"><div class="m-stack__demo-item">' + $.feedback.text.steps.third.comment + '<div class="well"> ' + comment + '</div></div></div></div>');
			// make accordion
            var accordion = $('<div class="m-accordion m-accordion--default" id="accordion" role="tablist"/>');
            var template = '<div class="m-accordion__item" >\
						<div class="m-accordion__item-head collapsed"  role="tab" id="{{collapseREF}}_head" data-toggle="collapse" href="#{{collapseREF}}_body" aria-expanded="false">\
							<span class="m-accordion__item-title">{{title}}</span>\
							<span class="m-accordion__item-mode"></span>\
						</div>\
						<div class="m-accordion__item-body collapse" id="{{collapseREF}}_body" class="" role="tabpanel" aria-labelledby="{{collapseREF}}_head">\
							<div class="m-accordion__item-content">\
								<p>\
									{{data}}\
								</p>\
							</div>\
						</div>\
					</div>';

			// global info
			var data = template.replace(/{{collapseREF}}/g, 'globalInfo');
			data = data.replace(/{{action}}/, 'in');
			data = data.replace(/{{title}}/, '<strong> ' + $.feedback.text.steps.third.globalInfo + ' </strong>');
			if (navInfo.global)
				data = data.replace(/{{data}}/, '<strong> URL </strong>: <a href="' + navInfo.global.url + '" >' + navInfo.global.url + '</a>');
			else
				data = data.replace(/{{data}}/, 'Empty');
			accordion.append(data);
			// application info
			var data = template.replace(/{{collapseREF}}/g, 'ApplicationInfo');
			data = data.replace(/{{action}}/, '');
			data = data.replace(/{{title}}/, '<strong> ' + $.feedback.text.steps.third.applicationInfo + ' </strong>');
			if (navInfo.application) {
				var str = '<strong> Code name </strong>:' + navInfo.application.codeName;
				str += '<br /> <strong>Name </strong>:' + navInfo.application.name;
				str += '<br /><strong> Version </strong>:' + navInfo.application.version;
				str += '<br /><strong> Language </strong>:' + navInfo.application.language;
				str += '<br /><strong> Cookie </strong>:' + navInfo.application.cookie;
				str += '<br /><strong> Java </strong>:' + navInfo.application.java;
				data = data.replace(/{{data}}/, str);
			} else
				data = data.replace(/{{data}}/, 'Empty');
			accordion.append(data);
			// client info
			var data = template.replace(/{{collapseREF}}/g, 'ClientInfo');
			data = data.replace(/{{action}}/, '');
			data = data.replace(/{{title}}/, '<strong> ' + $.feedback.text.steps.third.clientInfo + ' </strong>');
			if (navInfo.client) {
				var str = '<strong> Platform </strong>:' + navInfo.client.platform;
				str += '<br /><strong> User Agent </strong>:' + navInfo.client.userAgent;
				str += '<br /><strong> Mime Types </strong>:' + navInfo.client.mimeTypes;
				str += '<br /><strong> Plugins </strong>:' + navInfo.client.plugins;

				data = data.replace(/{{data}}/, str);
			} else
				data = data.replace(/{{data}}/, 'Empty');
			accordion.append(data);

			accordion.find('.collapse').on('hidden', function(event) {
				event.stopPropagation();
			});

			layout.find('div.data').append(accordion);

			box.find('div.modal-body').append(layout);

			box.find('#sendData').unbind('click').bind('click', function() {
				var toSendData = {};
				toSendData.img64 = img64;
				toSendData.comment = comment;
				toSendData.debugData = navInfo;
				if (extraData)
					toSendData.extraData = extraData;

				$.ajax({
					url : sendFeedBackPath,
					type : 'POST',
					data : toSendData,
					beforeSend : function() {
						box.find('#sendData').button('loading');
						box.find('.collapse.in').collapse('hide');
					},
					success : function(response) {
                        logger.info('Feed Sended !');
                        //setTimeout(function() {
                            box.removeAttr('style');
                            box.show();
                            box.find('.modal-body').text('Thannk you!');
                            box.find('.modal-dialog').removeAttr('style');
                            box.find('.modal-content').removeAttr('style');
                            box.find('.modal-body').removeAttr('style');
                            box.find('#sendData').hide();
							//box.modal('hide');
							//cleanUp()
                        //}, 3000);
                        box.find('div.data').append(makeAlert($.feedback.text.alerts.success.message));
                    },
                    error : function() {
						logger.log('Error in sending feedback !');
						box.find('div.data').append(makeAlert($.feedback.text.alerts.error.message, true));
					},
					complete : function() {
						box.find('#sendData').button('reset');
					}
                });
            });
        }

        /**
		 * Make first step view.
		 */
		function makeFirstStep() {
			courrentStep = 1;
			// header
			box.find('.modal-header').find('h3').html($.feedback.text.steps.first.label);
			// body
			box.find('.modal-body').empty();
			box.find('.modal-body').append(
					'<textarea name="comment" rows="6" class="input-block-level form-control" placeholder="' + $.feedback.text.steps.first.holder + '"></textarea>');
			
            box.find('div.modal-footer').append('<button class="btn btn-primary" id="toSecond">' + $.feedback.text.action.next + '</button>');
			box.find('#toSecond').unbind('click').bind('click', function() {
				comment = box.find('textarea[name=comment]').val();
				makeSecondStep();
			});
        }

		/**
		 * Bind creation customizing box.
		 * 
		 * @param target
		 *            jQueryElement target element.
		 */
		function bindCreateElementView(target) {
            var leftButtonDown = false;
			target.unbind('mousedown').bind('mousedown', function(e) {
				if (e.which === 1)
					leftButtonDown = true;
			});
			target.unbind('mouseup').bind('mouseup', function(e) {
				if (e.which === 1)
					leftButtonDown = false;
			});
			target.unbind('mousemove').bind('mousemove', function(e) {
				if ($.browser.msie && !(document.documentMode >= 9) && !event.button) {
					leftButtonDown = false;
				}
				if (e.which === 1 && !leftButtonDown)
					e.which = 0;
			});
		}

		/**
		 * Launch screenshot process.
		 */
		function launchProcess() {
			html2canvas.Preload(self[0], options);
		}

		/**
		 * Launch second screenshot process after customizing the first.
		 * 
		 * @param target
		 *            jQueryElement target element.
		 */
		function launchSecondProcess(target) {
			html2canvas.Preload(target[0], options);
		}

		/**
		 * Retrive all navigation info (to be sended), and launch first step.
		 */
		function retriveNavigationInfo() {
			options.beforeRetriveNavigationInfo();
			try {
				/* init var */
				navInfo.global = {}, navInfo.application = {}, navInfo.client = {};

				navInfo.global.url = String(window.location);
				navInfo.application.codeName = String(navigator.appCodeName);
				navInfo.application.name = String(navigator.appName);
				navInfo.application.version = String(navigator.appVersion);
				navInfo.application.language = String(navigator.language);
				navInfo.application.cookie = (navigator.cookieEnabled) ? 'YES' : 'NO';
				navInfo.application.java = (navigator.javaEnabled) ? 'YES' : 'NO';

				navInfo.client.platform = String(navigator.platform);
				navInfo.client.userAgent = String(navigator.userAgent);

				navInfo.client.mimeTypes = '';

				for ( var i in navigator.mimeTypes) {
					navInfo.client.mimeTypes += '[' + String(navigator.mimeTypes[i].type) + ']';
				}

				navInfo.client.plugins = '';
				for ( var j in navigator.plugins) {
					navInfo.client.plugins += '[' + String(navigator.plugins[j].name) + ']';
				}
			} catch (er) {
				logger.log('Error in retriving navigation info [' + er + ']!');
			}

			setTimeout(function() {
				makeFirstStep();
			}, 500);
			options.finish();
		}

        /**
		 * Clear all element of plugin
		 */
		function cleanUp() {
			box.modal('hide');
			for ( var idx in canvass)
				canvass[idx].remove();
			box.empty();
			box.remove();
		}

		/**
		 * Calculate screen size.
		 * 
		 * @return Array(<float>)
		 */
		function getScreenSize() {
			var myWidth = 0, myHeight = 0;
			if (typeof (window.innerWidth) == 'number') {
				// Non-IE
				myWidth = window.innerWidth;
				myHeight = window.innerHeight;
			} else if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
				// IE 6+ in 'standards compliant mode'
				myWidth = document.documentElement.clientWidth;
				myHeight = document.documentElement.clientHeight;
			} else if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
				// IE 4 compatible
				myWidth = document.body.clientWidth;
				myHeight = document.body.clientHeight;
			}
			return [ myWidth, myHeight ];
		}

		/**
		 * Make an alert div.
		 * 
		 * @param msg
		 *            alert content.
		 * @param isError
		 *            boolean : true if is an error alert.
		 * @return jQueryElement
		 */
        function makeAlert(msg, isError) {
			var alert = $('<div class="alert ' + (isError ? 'alert-danger' : 'alert-success') + '" />');
			alert.append('<button type="button" class="close" data-dismiss="alert">&times;</button>');
			alert.append('<strong>' + (isError ? $.feedback.text.alerts.error.label : $.feedback.text.alerts.success.label) + '!</strong> ' + msg);
			return alert;
		}

        /**
		 * Master function.
		 */
		function build() {
			init();

			$.extend(this, {
				launch : function() {
					bindFinishGettingScreenShot(self, retriveNavigationInfo);
					openLoader();
					setTimeout(launchProcess, 500);
				},
				stop : function() {
					cleanUp();
				},
				sendFeed : function(callback) {
					if (courrentStep != 3)
						return;
					var toSendData = {};
					toSendData.img64 = img64;
					toSendData.comment = comment;
					toSendData.debugData = navInfo;
					if (extraData)
						toSendData.extraData = extraData;

					$.ajax({
						url : sendFeedBackPath,
						type : 'POST',
						data : toSendData,
						success : function(response) {
							logger.info('Feed Sended !');
							if (typeof (callback) == 'function')
								callback(true);
						},
						error : function() {
							logger.log('Error in sending feedback !');
							if (typeof (callback) == 'function')
								callback(false);
						}
					});
				}
			});

		}

		// init plugins
		var api = $(this).data('fastesol.feedback');
		if (api)
			return api;
		self = this;
		api = new build();
		$(self).data('fastesol.feedback', api);
		return api;

	};
})(jQuery);
