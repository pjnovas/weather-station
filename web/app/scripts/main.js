import currentState from './currentState';
import last24 from './last24';
import Handlebars from 'handlebars';

Handlebars.registerHelper('isPositive', function(value, context) {
  if(value > 0) {
    return context.fn(this);
  } else {
    return context.inverse(this);
  }
});

Handlebars.registerHelper('round1', function(value) {
  return (value > 0 ? '+' : '-') + Math.abs(value).toFixed(2);
});

$(document).ready(function(){
  currentState.load();

  const render = $(window).width() >= 1000;

  last24.load(render, data => {
    currentState.calculateTrending(data);
  });

  if (!render) {
    $('canvas').hide();
  }
});
