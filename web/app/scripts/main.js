import currentState from './currentState';
import last24 from './last24';

$(document).ready(function(){
  currentState.load();

  if ($(window).width() >= 1000){
    last24.load();
  }
  else {
    $('canvas').hide();
  }
});
