var loadedData;
window.dd = function(d) {
	console.log('hä är det data',d);
	for (var i = 0; i < d.Entries.length; i++) {
			  		var id = d.Entries[i].ID;
			  		var updated = parseInt(d.Entries[i].Updated.slice(6,20));
			  		
			  		var summary = d.Entries[i].Summary;
			  		var title = d.Entries[i].Title;
			  		var capevent = d.Entries[i].CapEvent;
			  		var added = (new Date(updated)).getTime();
			  		addNews(title, added, summary, capevent);
			  		
			  	};
};
function write_char(s,div){
				  


				  setTimeout(function(){
				  	var first = s.charAt(0);
				  	if(first != ""){
				  		s = s.slice(1);
				  		div.find("span.spotify").append( '<span>'+first+'</span>' );
				  		write_char(s,div);
				    }else{
				    	
				    }
				  }, Math.round(10+Math.random()*10));

				  


	

			}
	  		

		
			function typewr(s,randid){

			
		

				var div = $("#"+randid);
				write_char(s,div);

				//return 
			}


window.addNews = function(title, added, summary, cap,cls){
				$("#news").prepend('<div class="news_div '+cls+'" id="id_'+added+'"></div>');
				$("#id_"+added).append("<div class='rightdiv' style='float: right; width: 80%'><span class='title'>"+title+"</span> <span class='date' id='"+added+"'>"+timeDifference((new Date()).getTime(),added)+"</span><br>"+summary+"</div>");
				$("#id_"+added).append("<div class='leftfloatdiv' style='float: left; width: 15%'>"+cap+"</div><br style='clear: both'>");
			}

			var evtCount =0;

			window.addEvent = function(fastighet, brunnid){
				var random = Math.round(Math.random()*1000000000);
				$("span.cursor").remove();
				evtCount++;
				if (evtCount%10==0)
				{
					addNews('Allvarlig vattenförorening i Västernorrland',new Date().getTime(),'En tankbil med flamskyddsmedel har vält utanför Örnsköldsvik och kontaminerar intilliggande vattendrag med perflourerade ämnen.','Warn.','deldata');
				}
				$("#fastighetsflode").prepend('<div id='+random+' class="deldata"><span class="spotify"></span><span class="cursor"></span></div>');
				var str = fastighet+' ('+brunnid+')';
				typewr(str,random);
			}

			window.setRisk = function(nummer){
				//$("#riskText").html(nummer);
				$("#risk").css("opacity",nummer);
			}

			function timeDifference(current, previous) {

			    var msPerMinute = 60 * 1000;
			    var msPerHour = msPerMinute * 60;
			    var msPerDay = msPerHour * 24;
			    var msPerMonth = msPerDay * 30;
			    var msPerYear = msPerDay * 365;

			    var elapsed = current - previous;

			    if (elapsed < msPerMinute) {
			         return Math.round(elapsed/1000) + ' seconds ago';   
			    }

			    else if (elapsed < msPerHour) {
			         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
			    }

			    else if (elapsed < msPerDay ) {
			         return Math.round(elapsed/msPerHour ) + ' hours ago';   
			    }

			    else if (elapsed < msPerMonth) {
			        return Math.round(elapsed/msPerDay) + ' days ago';   
			    }

			    else if (elapsed < msPerYear) {
			        return Math.round(elapsed/msPerMonth) + ' months ago';   
			    }

			    else {
			        return Math.round(elapsed/msPerYear ) + ' years ago';   
			    }
			}

$(document).ready(function(){

			


/*
	var jqxhr = $.ajax( "http://api.krisinformation.se/v1/feed?format=jsonp&callback=dd" )
			  .done(function(d) {
			  	
			  	;
			    console.log( "success" + JSON.stringify(d.Entries[0] ));
			  })
			  .fail(function(a,b,c) {
			    console.log( "error" + c);
			  })
			  .always(function() {
			    console.log( "complete" );
			  });
*/
			// $.ajax({
			// 	  url: "feed.json",
			// 	  data: function(d){
			// 	  	console.log(d);
			// 	  },
			// 	  success: success,
			// 	  dataType: "application/json",
			// 	  async: false
			// });

			// setTimeout(function(){

				
			// }, 100);
			setInterval(function() {
		      // Do something every 2 seconds
		      $(".cursor").toggleClass("blink_on");
		      $(".cursor").toggleClass("blink_off");
		      
		}, 500);



			setInterval(function() {
		      // Do something every 2 seconds
		      var added = $(".date");
		      
		      added.each(function(i,s){
		      	var addedTime = $(this).attr('id');
		      	$(this).text(timeDifference((new Date()).getTime(),addedTime));
		      });
		      
		}, 1000);

			
			

			/*var k = 0;
			var up = true;
			setInterval(function(){
				if(k>98) up = false;
				if(k<2) up = true;
				if(up){
					k++;
				}
				else{
					k--;
				}
				setRisk((k%100)/100);
				
			},10);*/

			


});