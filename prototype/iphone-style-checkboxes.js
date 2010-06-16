var iPhoneStyle = Class.create({
	
	initialize: function() {
		
		var optionIndex = 0;	
		this.options = Object.extend({
			wrapper:           '',
			selector_or_elems: 'input[type=checkbox]',
			duration:          200,
		  checkedLabel:      'ON', 
		  uncheckedLabel:    'OFF', 
		  resizeHandle:      true,
		  resizeContainer:   true,
		  background:        '#fff',
		  statusClass:       'checkRendered',
		  containerClass:    'iPhoneCheckContainer',
		  labelOnClass:      'iPhoneCheckLabelOn',
		  labelOffClass:     'iPhoneCheckLabelOff',
		  handleClass:       'iPhoneCheckHandle',
		  handleCenterClass: 'iPhoneCheckHandleCenter',
		  handleRightClass:  'iPhoneCheckHandleRight',
			currentOn: 				 'current-on',
			radioButtons: 			false,
		  statusChange: 		 null
		}, arguments[optionIndex] || {});
		
		this.wrapper = this.options.wrapper;
		this.selector_or_elems = this.options.selector_or_elems;
		this.duration = this.options.duration;
		this.checkedLabel = this.options.checkedLabel;
		this.uncheckedLabel = this.options.uncheckedLabel;
		this.resizeHandle = this.options.resizeHandle;
		this.resizeContainer = this.options.resizeContainer;
		this.background = this.options.background;
		this.statusClass = this.options.statusClass;
		this.containerClass = this.options.containerClass;
		this.labelOnClass = this.options.labelOnClass;
		this.labelOffClass = this.options.labelOffClass;
		this.handleClass = this.options.handleClass;
		this.handleCenterClass = this.options.handleCenterClass;
		this.handleRightClass = this.options.handleRightClass;
		this.currentOn = this.options.currentOn;
		this.radioButtons = this.options.radioButtons;
		
		this.checkBoxes = [];
		this.clicking = null;
		this.dragStartPosition = null;
		this.activeCheckbox = null;
		
	  if (Object.isString(this.selector_or_elems)) {
	    this.elems = $$('#' + this.wrapper + ' ' + this.selector_or_elems);
	  } else {
	    this.elems = [this.selector_or_elems].flatten();
	  }
		this.setup();
	},
	
	setup: function() {
		/* this is the obj setup in intialize */
		this.elems.each(function(elt) {
			if (!elt.match('input[type=checkbox]'))
				return;
			if (elt.hasClassName(this.statusClass))
				return;
			
			var checkBox = new iPhoneCheckBox(elt, this);
			this.checkBoxes.push(checkBox);
	
	    if (this.resizeHandle) {
				checkBox.resizeHandle();
	    }
	
	    if (this.resizeContainer) {
	     	checkBox.resizeContainer();
	    }
	
	    checkBox.setSizeOf();
		
			checkBox.container.observe('mousedown', this.toggleDown.bindAsEventListener(this, checkBox))
			//checkBox.container.observe('mouseup', this.toggleUp.bindAsEventListener(this, checkBox));
			document.observe('mouseup', this.toggleUp.bindAsEventListener(this, checkBox));
			checkBox.container.observe('mousemove', this.moveHandle.bindAsEventListener(this, checkBox));
		}, this);
	},
	
	moveHandle: function(e) {
		var arg = $A(arguments);
		var checkBox = arg.pop();
		if (this.clicking == checkBox.getHandle()) {
		   e.stop();
		   var x = Event.pointerX(e) || e.changedTouches[0].pageX;
		   if (x != this.dragStartPosition) {
		     this.dragging = true;
		   }
		   var p = (x - this.dragStartPosition) / checkBox.rightside;
		   if (p < 0) { p = 0; }
		   if (p > 1) { p = 1; }

		   checkBox.getHandle().setStyle({ left: p * checkBox.rightside + 'px' });
		   checkBox.onlabel.setStyle({ width: p * checkBox.rightside + 4 + 'px' });
		   checkBox.offlabel.setStyle({ width: (1 - p) * checkBox.rightside + 4 + 'px' });
		   checkBox.offspan.setStyle({ 'marginRight': -p * checkBox.rightside + 'px' });
		   checkBox.onspan.setStyle({ 'marginLeft': -(1 - p) * checkBox.rightside + 'px' });
		}
	},
	
	toggleDown: function(e) {
		e.stop();
		var arg = $A(arguments);
		var checkBox = arg.pop();
		this.activeCheckBox = checkBox;
		this.clicking = checkBox.getHandle();
		this.dragStartPosition = Event.pointerX(e) - (Number(checkBox.getHandle().style.left.replace(/px$/, "")) || 0);
		return false;
	},
		
	toggleUp: function(e) {
		var arg = $A(arguments);
		var checkBox = arg.pop();
		console.log(checkBox);
		var elt = checkBox.getInputElt();
    if (iPhoneStyle.clicking == this.handle) {
			e.stop();
      if (!iPhoneStyle.dragging) {
        var is_onstate = elt.checked;
				if (this.radioButtons) {
					if (!elt.checked) {
						this.radioChange(this.activeCheckbox);
					}
				} else {
					elt.writeAttribute('checked', !is_onstate);
				}
      } else {
        var x = Event.pointerX(e) || e.changedTouches[0].pageX;
        var p = (x - this.dragStartPosition) / checkBox.rightside;
        elt.writeAttribute('checked', (p >= 0.5));
      }
      this.clicking = null;
      this.dragging = null;	
			this.activeCheckbox = null;
      this.change(checkBox);
    }
  },

	toggleChange: function(checkBox) {
		checkBox.getInputElt().writeAttribute('checked', !checkBox.getInputElt().checked);
		this.change(checkBox);
	},

	radioChange: function(checkBox) {
		input = $(this.wrapper).down('.' + this.currentOn).firstDescendant();
    input.writeAttribute('checked', !input.checked);
    this.change(this.findCurrentOn());
		input.up().removeClassName(this.currentOn);
		var elt = checkBox.getInputElt();
    elt.up().addClassName(this.currentOn);
		elt.writeAttribute('checked', !elt.checked);
	},
	
	findCurrentOn: function() {
		var box;
		this.checkBoxes.each(function(cb) {
			if(cb.getContainer().hasClassName(this.currentOn))
				box = cb;
		}, this);
		return box;
	},
	
	getCheckboxObj: function(inputElt) {
		var inputReturn = null;
		this.checkBoxes.each(function(input) {
	    if(input.getInputElt().identify() == inputElt.identify())
	        inputReturn = input;
	 	});
		return inputReturn;
	},

	change: function(checkBox) {
		var inputElt = checkBox.getInputElt();
    var is_onstate = inputElt.checked;
    var p = checkBox.handle.positionedOffset().first() / checkBox.rightside;
    new Effect.Tween(null, p, Number(is_onstate), { duration: this.duration / 1000 }, function(p) {
      checkBox.handle.setStyle({ left: p * checkBox.rightside + 'px' });
      checkBox.onlabel.setStyle({ width: p * checkBox.rightside + 4 + 'px' });
      checkBox.offlabel.setStyle({ width: (1 - p) * checkBox.rightside + 4 + 'px' });
      checkBox.offspan.setStyle({ 'marginRight': -p * checkBox.rightside + 'px' });
      checkBox.onspan.setStyle({ 'marginLeft': -(1 - p) * checkBox.rightside + 'px' });
    });
  },

	toString: function() {
		return ( "selector_or_elems: " + this.selector_or_elems + "\n" +
						 "duration: " + this.duration + "\n" +
						 "checkedLabel: " + this.checkedLabel + "\n" +
						 "uncheckedLabel: " + this.uncheckedLabel + "\n" +
						 "resizeHandle: " + this.resizeHandle + "\n" +
						 "resizeContainer:" + this.resizeContainer + "\n" +
						 "background: " + this.background + "\n" +
						 "statusClass: " + this.statusClass + "\n" +
						 "containerClass: " + this.containerClass + "\n" +
						 "labelOnClass: " + this.labelOnClass + "\n" +
						 "labelOffClass: " + this.labelOffClass + "\n" +
						 "handleClass: " + this.handleClass + "\n" +
						 "handleCenterClass: " + this.handleCenterClass + "\n" +
						 "handleRightClass: " + this.handleRightClass + "\n" + 
						 "currentOn: " + this.currentOn + "\n" +
						 "checkBoxes:"  + this.checkBoxes 
					 );
	}

});


var iPhoneCheckBox = Class.create({
	
	initialize: function(input, iPhoneStyle) {
		this.inputElt = input;
		this.iPhoneStyle = iPhoneStyle;
		this.handle  = null;
    this.offlabel  = null;
    this.offspan   = null;
    this.onlabel   = null;
    this.onspan    = null;
    this.container = null;
		this.generate();
	},
	
	generate: function() {
		this.inputElt.addClassName(this.iPhoneStyle.statusClass);
    this.inputElt.setOpacity(0);
    this.inputElt.wrap('div', { 'class': this.iPhoneStyle.containerClass});
    this.inputElt.insert({ 'after': '<div class="' + this.iPhoneStyle.handleClass + '"><div class="' + this.iPhoneStyle.handleRightClass + '"><div class="' + this.iPhoneStyle.handleCenterClass + '"></div></div></div>' })
        .insert({ 'after': '<label class="' + this.iPhoneStyle.labelOnClass + '"><span>' + this.iPhoneStyle.checkedLabel + '</span></label>' })
        .insert({ 'after': '<label class="' + this.iPhoneStyle.labelOffClass + '"><span>'+ this.iPhoneStyle.uncheckedLabel + '</span></label>' });

		this.container = this.inputElt.up();
		this.handle  = this.container.down('.' + this.iPhoneStyle.handleClass);
    this.offlabel = this.inputElt.adjacent('.' + this.iPhoneStyle.labelOffClass).first();
    this.offspan = this.offlabel.down('span');
    this.onlabel = this.inputElt.adjacent('.' + this.iPhoneStyle.labelOnClass).first();
    this.onspan = this.onlabel.down('span');
		if (this.iPhoneStyle.radioButtons && this.inputElt.checked) {
			this.container.addClassName(this.iPhoneStyle.currentOn);
		}
	},
	
	resizeHandle: function() {
		this.min = (this.onlabel.getWidth() < this.offlabel.getWidth()) ? this.onlabel.getWidth() : this.offlabel.getWidth();
    this.handle.setStyle({width: this.min + 'px'});
	},
	
	resizeContainer: function() {
		this.max = (this.onlabel.getWidth() > this.offlabel.getWidth()) ? this.onlabel.getWidth() : this.offlabel.getWidth();
  	this.container.setStyle({width: this.max + this.handle.getWidth() + 12 + 'px'});
	},
	
	setSizeOf: function() {
		this.offlabel.setStyle({ width: this.container.getWidth() - 5  + 'px' });
		
		this.rightside = this.container.getWidth() - this.handle.getWidth() - 3;

    if (this.inputElt.checked) {
      this.handle.setStyle({ left: this.rightside + 'px' });
      this.onlabel.setStyle({ width: this.rightside + 4 + 'px' });
      this.offspan.setStyle({ 'marginRight': this.rightside + 'px' });
    } else {
      this.handle.setStyle({ left: 0 });
      this.onlabel.setStyle({ width: 0 });
      this.onspan.setStyle({ 'marginLeft': -this.rightside + 'px' });
    }
	},
	
	getInputElt: function() {
		return this.inputElt;
	},
	
	getContainer: function() {
		return this.container;
	},
	
	getHandle: function() {
		return this.handle;
	},
	
	toString: function() {
		return ( "handle: " + this.handle + "\n" +
						 "offlabel: " + this.offlabel + "\n" +
						 "offspan: " + this.offspan + "\n" +
						 "onlabel: " + this.onlabel + "\n" + 
						 "onspan: " + this.onspan + "\n" +
						 "container: " + this.container
						);
	}
});