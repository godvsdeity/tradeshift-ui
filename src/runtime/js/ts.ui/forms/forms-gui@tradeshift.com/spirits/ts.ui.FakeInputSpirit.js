/**
 * The date-input and the select will hide themselves 
 * and present this fake input to the outside world.
 * @see {ts.ui.FakeDateInputSpirit}
 * @see {ts.ui.FakeSelectInputSpirit}
 */
ts.ui.FakeInputSpirit = (function() {

	var KEY_ENTER = 13;
	var KEY_SPACE = 32;

	return ts.ui.TextInputSpirit.extend({

		onconfigure: function() {
			this.super.onconfigure();
			this.css.add(ts.ui.CLASS_FAKE);
			this.element.tabIndex = -1;
			this.element.type = 'text';
			this.element.name = '';
			this.att.set('readonly', true);
		},

		/**
		 * Set it up so that we are prepared to work 
		 * even if not embedded into a Form component.
		 */
		onattach: function() {
			this.super.onattach();
			var label = this.dom.parent(ts.ui.LabelSpirit);
			if (label) {
				label.event.add('click', label, this);
			} else {
				this.event.add('click');
			}
		},

		/**
		 * At least attempt to flush some listeners.
		 */
		ondetach: function() {
			this.super.ondetach();
			this._label(function(label) {
				label.event.remove('click', label, this);
			});
		},

		/**
		 * @param {Element} element
		 */
		proxy: function(element) {
			this._proxyelement = element;
			this._proxyspirit = ts.ui.get(element);
			this.event.add('keydown', element, this);
		},

		/**
		 * Handle event. Notice that we don't call super. 
		 * We should probably refactor something some day.
		 * @param {Event} e
		 */
		onevent: function(e) {
			switch (e.type) {
				/*
				 * Try not to focus this, focus the real 
				 * element for better keyboard handling.
				 */
				case 'focus':
					switch(e.target) {
						case this.element:
							this._proxyelement.focus();
							break;
						case this._proxyelement:
							break;
					}
					break;
				case 'click':
					if(!this.disabled) {
						this._maybeopen();
					}
					break;
				case 'keydown':
					
				/*
				 * All attempts to open the aside would fail :/
				 * Keyboard handling simply disabled for the time 
				 * being, but we also need to `preventDefault` the 
				 * ENTER key to stop Chrome from showing native 
				 * select dropdowns and date pickers at this point.
				 */
					switch(e.keyCode) {
						case KEY_ENTER:
						case KEY_SPACE:
							e.preventDefault();
							if(!this.disabled) {
								this._maybeopen();
							}
							break;
					}
					break;
			}
		},


		// Privileged ..............................................................

		/**
		 * Style the form.
		 */
		$updatestyling: function() {
			this.super.$updatestyling();
			this._label(function(label) {
				label.$fakelabel();
			});
		},


		// Private .................................................................

		/**
		 * Click might be triggered twice, 
		 * Is it because of FastClick.js??
		 */
		_maybeopen: function() {
			if(!this._isopen) {
				this._isopen = true;
				this._label(function(label) {
					label.css.add(ts.ui.CLASS_FOCUS_ON);
				});
				this._openaside(function onclosed() {
					this._isopen = false;
					this._proxyelement.focus();
					this._label(function(label) {
						label.css.remove(ts.ui.CLASS_FOCUS_ON);
					});
				});
			}
		},

		/**
		 * TODO: Use `ts.ui.get(this._proxyelement).event.trigger('change') 
		 * but make sure that we cover this with some kind of test first...
		 */
		_triggerchange: function() {
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent("change", false, true);
			this._proxyelement.dispatchEvent(evt);
		},

		/**
		 * Restore focus (when Aside is closed).
		 */
		_restorefocus: function() {
			this._proxyelement.focus();
		}
		
	});

}());
