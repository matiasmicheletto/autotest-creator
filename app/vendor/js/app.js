function hideStatus(){
  $('.top-safe-area').addClass( "transparent-status-bar-animation" );
}

function showStatus(){
  $('.top-safe-area').removeClass( "transparent-status-bar-animation transparent-status-bar" );
}

function hideStatusFast(){
  $('.top-safe-area').addClass( "transparent-status-bar transparent-status-bar-animation" );
}

function showStatusFast(){
  $('.top-safe-area').removeClass( "transparent-status-bar transparent-status-bar-animation" );
}

function toggleTheme(){
  $('.top-safe-area').toggleClass( "black-top-safe-area" );
  $('.bottom-safe-area').toggleClass( "black-bottom-safe-area" );
  $('.marvel-device .screen').toggleClass( "black-screen" );

  if($('.top-safe-area img').attr('src') == 'img/status-bar.svg'){
    $('.top-safe-area img').attr('src', 'img/status-bar-white.svg')
  }
  else {
    $('.top-safe-area img').attr('src', 'img/status-bar.svg')
  }
}

function shareActions(){
  $('.top-safe-area').toggleClass( "grey-top-safe-area" );
  $('.bottom-safe-area').toggleClass( "grey-bottom-safe-area" );
  $('.marvel-device .screen').toggleClass( "grey-screen" );
}
