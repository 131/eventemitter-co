"use strict";

const bindthem = require('bindthem');
const co       = require('co');

const forIn    = require('mout/object/forIn');
const guid     = require('mout/random/guid');

class EventEmitter {

  constructor() {
    bindthem(this, [
      'on', 'off', 'once', 'emit',
      'addEvent', 'addListener', 'removeListener', 'removeAllListeners', 'fireEvent'
    ]);

    this.callbacks = {};
  }

  emit(event/*, payload*/)/**
  * @interactive_runner hide
  */ {
    if(!this.callbacks[event])
      return Promise.resolve();

    var chain = [];
    var args = Array.prototype.slice.call(arguments, 1);

    forIn(this.callbacks[event], function(callback) {
      var p = co.apply(callback.ctx, [callback.callback].concat(args));
      chain.push(p);
    });

    return Promise.all(chain);
  }

  on(event, callback, ctx) /**
  * @interactive_runner hide
  */ {
    if(typeof callback != "function")
      return console.log("you try to register a non function in ", event);
    if(!this.callbacks[event])
      this.callbacks[event] = {};
    this.callbacks[event][guid()] = {callback, ctx};
  }

  once(event, callback, ctx) /**
  * @interactive_runner hide
  */ {
    var self = this;
    var once = function() {
      self.off(event, once);
      self.off(event, callback);
    };

    this.on(event, callback, ctx);
    this.on(event, once);
  }

  off(event, callback) /**
  * @interactive_runner hide
  */ {
    if(!event) {
      this.callbacks = {};
    } else if(!callback) {
      this.callbacks[event] = {};
    } else {
      forIn(this.callbacks[event] || {}, function(v, k) {
        if(v.callback == callback)
          delete this.callbacks[event][k];
      }, this);
    }
  }
}

EventEmitter.prototype.addEvent           = EventEmitter.prototype.on;
EventEmitter.prototype.addListener        = EventEmitter.prototype.on;
EventEmitter.prototype.removeListener     = EventEmitter.prototype.off;
EventEmitter.prototype.removeAllListeners = EventEmitter.prototype.off;
EventEmitter.prototype.fireEvent          = EventEmitter.prototype.emit;

module.exports = EventEmitter;
