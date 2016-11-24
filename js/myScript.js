(function ($){
	$(function(){

		var url = "http://smktesting.herokuapp.com/";
		var url_img = url + "static/";
		var form = $('#enter-reg');

function delete_cookie ( cookie_name )
{
  var cookie_date = new Date ( );  // Текущая дата и время
  cookie_date.setTime ( cookie_date.getTime() - 1 );
  document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}

function set_cookie ( name, value, exp_y, exp_m, exp_d, path, domain, secure )
{
  var cookie_string = name + "=" + escape ( value );
 
  if ( exp_y )
  {
    var expires = new Date ( exp_y, exp_m, exp_d );
    cookie_string += "; expires=" + expires.toGMTString();
  }
 
  if ( path )
        cookie_string += "; path=" + escape ( path );
 
  if ( domain )
        cookie_string += "; domain=" + escape ( domain );
  
  if ( secure )
        cookie_string += "; secure";
  
  document.cookie = cookie_string;

}

		// возвращает cookie с именем name, если есть, если нет, то undefined
function get_cookie ( cookie_name )
{
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
 
  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}



///// --делаем проверку вошел ли человек, если да, скрываем кнопку зарегестрироваться, и записываем его имя
	if (get_cookie("username")) {
		$(".registr").addClass('hidden_elem');
		$("#logged").text(get_cookie("username"));	
	}
	else{
		$(".entered").addClass('hidden_elem');
	}

	// - первичная загрузка списка продуктов
	$.ajax({
		type: "GET",
		dataType: 'JSON',
		url: url +"api/products",
		success: function(data){

		 		 $.each(data, function(i, val){
		 		 	$('.product-list ul').append("<li><a href='#' class='click' data-rel='"+data[i].id+"'>"+data[i].title+"</a></li>");	
		 		})
		}
	})

////--При клике не продукт в списек продуктов загружаем информацию о продукте и загружаем отзывы
$(document).on('click', '.dropdown-menu li a', function() {
		var elem = $(this);
		var prod_id = elem.attr('data-rel');
		var star_rate = 0;
		$('.rev_create').addClass('active');

		////---информация
		$.ajax({
		   type: "GET",
		   dataType: 'JSON',
		   url: url +"api/products",
		   success: function(data){
		 		
		 		$('.product_details').empty(); // оччищаем див с описанием и заносим туда структуру элементов с данными
		 		$('.product_details').append("<div class='content' data-rel='"+data[prod_id-1].id+"' id='content_"+data[prod_id-1].id+"'><h2>"+data[prod_id-1].title+"</h2><hr><div class='photo'><img src='"+url_img+data[prod_id-1].img+"'></div><h3>Описание продукта</h3><hr><p>"+data[prod_id-1].text+"</p></div>");
		 	}
		})

		////---отзывы
		$.ajax({
		 	type: "GET",
			dataType: 'JSON',
			url: url +"api/reviews/"+prod_id,
			success: function(rev){
				rev.reverse() // реверсируем массив что бы первыми выводились последние добавленные коменты

				$('.product_reviews').empty(); // опять же очищаем див с коментами и каждый добавляем в него поочереди

				$.each(rev, function(i, val){
						$('.product_reviews').append('<div class="comments"><p><span>At: </span>'+rev[i].created_at+'</p><p><span>Оценка: </span>'+rev[i].rate+'</p><p><span>Отзыв: </span>'+rev[i].text+'</p></div>')
						star_rate += rev[i].rate; // плюсуем все звездочки продукта
					})	

		 		var stars = star_rate/rev.length // всего оценок
	 		
	 			$('.product_content .rating').empty(); // очищаем , записываем рейтинг, срднюю оценку и всего голосов
		 		$('.product_content .rating').append("<span data-rel='1' class='star'></span><span  class='star' data-rel='2'></span><span  class='star' data-rel='3'></span><span  class='star' data-rel='4'> </span><span  class='star' data-rel='5'></span><div class='total' >Голосов: <span id='golosov'>"+rev.length+" </span> Средняя оценка: <span id='ocenka'>"+stars.toFixed(1)+"</span></div>")
		 		$(document).ready(function() {

		 			var new_st = document.getElementsByClassName('star');
		 			
		 			for (var i = Math.ceil(stars) - 1; i >= 0; i--) {
		 			 		new_st[i].classList.add('star_set');
		 			};
		 		})
		 	}

		})

   return false;
});


	$('#reg').click(function(e){ // событие при регистрации пользователя

		var username = $('#username').val();
		var password = $('#password').val();

			$.ajax({
		      	type: "POST",
		      	url: url + "api/register/",
		      	data: {
					"username": username,
					"password": password
				},
		      	dataType:'JSON',

		      	success: function( response ) {
		
			        alert('Вы успешно зарегестрировались!');
			        location.reload();

      			}
		   	});

		return false;
		e.preventDefault();
	})

	$('#enter').click(function(e){ // событие при входе пользхователя

		var username = $('#username').val();
		var password = $('#password').val();

		$.ajax({
			type: "POST",
			url: url + "api/login/",
			data: {
				"username": username,
				"password": password
			},

		    dataType:'JSON',
		    success: function( response ) {
			
				if (response['token']) {
					set_cookie('token', response['token'], 2017, 1,1); 
					set_cookie('username', username, 2017, 1,1);
					alert('Вы успешно вошли на сайт!');
					        location.reload();
					}
				else{
					alert('Вы ввели некоректные данные!');
				}
      		}

		})
		return false;
		e.preventDefault()

	})

	$("#logout").click(function(){ // событие при выходе пользователя
		delete_cookie("username");
		delete_cookie("token");
		location.reload();
	})

	var star = $('.rating span') // событие при клике на звездочки. добавляем класс который меняет бекграунд
		star.click(function(){
			star.removeClass('star_set_count');
			$(this).addClass('star_set_count')
			$(this).nextAll('.star').addClass('star_set_count')

		})

	$('#comment').click(function(){ // событие прир отправке комментария

		var comment = '';
		var comment = $('#text_area').val();
		var product_id = $('.content').attr('data-rel');
		var token_id = get_cookie("token");
	
		if (comment != '' && get_cookie("username")){
			var  rate = $('.star_set_count').length*1;
		
			$.ajax({
				type: "POST",
				url: url +"api/reviews/"+product_id, //  http://smktesting.herokuapp.com/api/reviews/1 
				data: {
					"rate": rate, // 2
					"text": comment // some text
				},
				headers: {
			        'Authorization' : "Token "+token_id
			   	},
		    	dataType: 'JSON',
		     	success: function( otv ) {

						alert('Спасибо за оценку!');
		     			$.ajax({ // обновляем все коменты с последним добавленым
							type: "GET",
							dataType: 'JSON',
							url: url +"api/reviews/"+product_id,
							success: function(rev){
									rev.reverse()
									$('.product_reviews').empty();
									$.each(rev, function(i, val){
										$('.product_reviews').append('<div class="comments"><p><span>At: </span>'+rev[i].created_at+'</p><p><span>Оценка: </span>'+rev[i].rate+'</p><p><span>Отзыв: </span>'+rev[i].text+'</p></div>')
									})		 			
							}
						})
	      		}
		   	});
		}
			//проверки при отправке комменатрия
		if(!get_cookie("username")){

			alert("Отзывы разрешено оставлять только зарегестрированым пользователям!");
		}

		if(comment == '' && get_cookie("username")){

			alert("Заполните поле комментария!");
		}
		
	})

	})
}) (jQuery)