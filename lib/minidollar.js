'use strict';

var filter = RegExp.prototype.test.bind(/[\s\[\]~+:>]/),
    slice = Function.prototype.call.bind(Array.prototype.slice);

var isJSON = RegExp.prototype.test.bind(/^(?:\{[\s\S]*\}|\[[\s\S]*\])$/);

function camelcase(prop) {
  return prop.replace(/-([a-z])/g, function(match) {
    return match.substr(1).toUpperCase();
  });
}

function params(obj) {
  var map = {};

  for (var key in obj) {
    var value = obj[key];

    if (value === 'null') {
      value = null;
    } else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (/^-?\d+(\.\d+)?$/.test(value)) {
      value = parseFloat(value);
    } else if (isJSON(value)) {
      value = JSON.parse(value);
    }

    map[key] = value;
  }

  return map;
}

function all(nodes, callback) {
  return function() {
    var args = slice(arguments);

    nodes.forEach(function(node) {
      callback(node, args);
    });
  };
}

function wrap(element) {
  var instance = Array.isArray(element) ? element : [element];

  // collection
  if (!(element instanceof Element)) {
    instance.each = function(callback) {
      instance.forEach(function(element) {
        callback(wrap(element));
      });
    };
  }

  // visibility
  instance.toggle = all(instance, function(current, args) {
    instance[current.style.display === 'none' ? 'show' : 'hide'].call(null, args);
  });

  instance.show = all(instance, function(current, args) {
    current.style.display = args[0] || 'block';
  });

  instance.hide = all(instance, function(current) {
    current.style.display = 'none';
  });

  // data-attributes
  var data;

  instance.data = function(prop) {
    data = data || params(instance[0].dataset);

    return arguments.length === 1 ? data[camelcase(prop)] : data;
  };

  // common-attribtues
  instance.attr = instance[0].getAttribute.bind(instance[0]);

  // class-manipulation API
  var classList = instance[0].classList;

  instance.addClass = classList.add.bind(classList);
  instance.hasClass = classList.contains.bind(classList);
  instance.toggleClass = classList.toggle.bind(classList);
  instance.removeClass = classList.remove.bind(classList);

  return instance;
}

module.exports = function(selector) {
  if (filter(selector)) {
    return wrap(slice(document.querySelectorAll(selector)));
  }

  switch (selector.charAt()) {
    case '#':
      return wrap([document.getElementById(selector.substr(1))]);

    case '@':
      return wrap(slice(document.getElementsByName(selector.substr(1))));

    case '*':
      return wrap(slice(document.getElementsByTagName(selector.substr(1))));

    case '.':
      return wrap(slice(document.getElementsByClassName(selector.substr(1))));
  }
};
