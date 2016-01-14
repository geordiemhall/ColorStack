// ColorStack
// 
// A simple library for calculating the effective background color of an element
// v0.1
// @geordiemhall
// --------------------------------------------------------------------------------------------


;(function(){

// Imports
// -------------------------

var TinyColor = window.tinycolor


// Constructor
// -------------------------

function ColorStack($element, options){
	var defaults = {
		// depth: -1,
	}

	this.$el = $element
	this.opts = $.extend({}, defaults, options)
}


// Static methods
// -------------------------

ColorStack.getBgColor = function($element, options){
	var c = new ColorStack($element, options)
	return c.getBgColor()
}

ColorStack.getBgColorCss = function($element, options){
	var c = new ColorStack($element, options)
	return c.getBgColorCss()
}

// Public API
// -------------------------

// Tries to calculate the effective background colour of a particular element.
// Returns a TinyColor object
// It tries to search up from the element itself all the way to
// the body, adding the colours using a "normal" Source Over blend
// TODO: Take the background-blend property into account
ColorStack.prototype.getBgColor = function(){
	var self = this

	// Get an array of all background colors
	var elementsStack = self._getElementStack()
	var colorStack = self._getColorStackStack(elementsStack)
	var finalColorPlain = self._flattenColors(colorStack)
	var finalColor = TinyColor.fromRatio(finalColorPlain)

	return finalColor
}

ColorStack.prototype.getBgColorCss = function(){
	return this.getBgColor().toRgbString()
}


// Private methods
// -------------------------

ColorStack.prototype._getElementStack = function(){
	var self = this

	return $(self.$el.parents().get().reverse()).add(self.$el)
}

// Returns an array of plain objects with rgba properties, all normalised between 0 and 1
ColorStack.prototype._getColorStackStack = function($elements){
	var self = this

	return $elements.map(function(){
		var $this = $(this)
		var bgColor = $this.css('background-color')
		return self._getNormalisedRgb(TinyColor(bgColor))
	}).toArray()
}

// Composites the colors together as they would be in CSS
// Takes an array of plain objects with rgba props normalised to 0 and 1,
// in order of "bottom" of stack first
// Returns a single plain object with rgba props
ColorStack.prototype._flattenColors = function(colors){
	var self = this

	var finalColor = colors[0] || { r: 0, g: 0, b: 0, a: 0 }

	// Go up the stack, blending the current color over the backdrop
	_.each(colors, function(d, i){
		if (i === 0) return true // skip the first one since we've already done it above
		finalColor = self._blendNormalisedColors(finalColor, d)
	})

	return finalColor
}

// Returns an object with rgba all between 0 and 1
ColorStack.prototype._getNormalisedRgb = function(color){
	var rgb = color.toRgb()
	return {
		r: rgb.r / 255,
		g: rgb.g / 255,
		b: rgb.b / 255,
		a: rgb.a,
	}
}

// Takes two color objects in the form of rgba where all components are between
// 0 and 1. Eg. solid red would be rgba(1, 0, 0, 1)
// Returns a color object in the same format
ColorStack.prototype._blendNormalisedColors = function(bottom, top){
	var self = this

	var rBottom = bottom.r
	var gBottom = bottom.g
	var bBottom = bottom.b
	var aBottom = bottom.a

	var rTop = top.r
	var gTop = top.g
	var bTop = top.b
	var aTop = top.a

	var finalColor = {
		r: (top.r * top.a) + bottom.r * bottom.a * (1 - top.a),
		g: (top.g * top.a) + bottom.g * bottom.a * (1 - top.a),
		b: (top.b * top.a) + bottom.b * bottom.a * (1 - top.a),
		a: top.a + bottom.a * (1 - top.a),
	}

	return finalColor
}

// Exports
// -------------------------

window.ColorStack = ColorStack

})();