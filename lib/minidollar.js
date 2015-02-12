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

    if (isJSON(value)) {
      value = JSON.parse(value);
    } else if (/^-?\d+(\.\d+)?$/.test(value)) {
      value = parseFloat(value);
    } else if (value === 'false') {
      value = false;
    } else if (value === 'true') {
      value = true;
    } else if (value === 'null') {
      value = null;
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
  if (Array.isArray(element)) {
    element = element.map(wrap);
  }

  var first = Array.isArray(element) ? element[0] : element;

  element.toggle = all(element, function(current, args) {
    element[current.style.display === 'none' ? 'show' : 'hide'].call(null, args);
  });

  element.show = all(element, function(current, args) {
    current.style.display = args[0] || 'block';
  });

  element.hide = all(element, function(current) {
    current.style.display = 'none';
  });

  element.data = function(prop) {
    var data = params(first.dataset);

    return arguments.length === 1 ? data[camelcase(prop)] : data;
  };

  if (first !== element) {
    element.classList = first.classList;

    element.getAttribute = first.getAttribute.bind(first);

    element.setAttribute = all(element, function(current, args) {
      current.setAttribute.apply(current, args);
    });
  }

  return element;
}

module.exports = function(selector) {
  if (filter(selector)) {
    return wrap(slice(document.querySelectorAll(selector)));
  }

  switch (selector.charAt()) {
    case '#':
      return wrap(document.getElementById(selector.substr(1)));

    case '@':
      return wrap(slice(document.getElementsByName(selector.substr(1))));

    case '*':
      return wrap(slice(document.getElementsByTagName(selector.substr(1))));

    case '.':
      return wrap(slice(document.getElementsByClassName(selector.substr(1))));
  }
};
