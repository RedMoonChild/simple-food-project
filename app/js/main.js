$(function(){
  $('.categories__menu-item').each(function() {
    const $svg = $(this).find('svg');
    const $path = $svg.find('g > path');
    const originalColor = $path.attr('fill');

    $('.categories__menu-link').on('click', function() {
      if ($('.categories__menu-link').hasClass('mixitup-control-active')) {
        $path.attr('fill', '#ffffff');
      } 
    });
  });

  const mixer = mixitup('.categories__dishes');

});
