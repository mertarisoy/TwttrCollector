	
			var getLink = function(username, min_position, type){
				return 'https://twitter.com/' + username + '/' + type + '/users?include_available_features=1&include_entities=1&max_position='+ min_position +'&reset_error_state=false';
			};
			
			var getDataLink = function(username,type){
				return 'https://twitter.com/' + username + '/' + type + '/users';
			};
		
			var getMinPosition = function(username,type){
			
				var link = 'https://twitter.com/' + username + '/'+ type +'';
				
				var min_position = undefined;
				
				//Request
				var min_position_request = new XMLHttpRequest();
				min_position_request.open('GET', link, false);
				min_position_request.onload = function() {
					if (min_position_request.status === 200) {
						
						var min_position_result = min_position_request.responseText;

						var html = $.parseHTML(min_position_result);
						min_position = $($(html).find('[data-min-position]')[0]).attr('data-min-position');
					}
				}
				
				min_position_request.send(null);
				return min_position;
			};
			
			var getUsernames = function (html){
			
				var html = $.parseHTML(html);
				var userNames = $(html).find(".u-linkComplex-target:contains('')");
				
				var users = [];
				userNames.each(function(index, item){
					users.push(item.innerHTML);
				});
				
				return users;
			};	
			
			var getData = function(username, type){
			
				//console.log('getting ' + username + ' ' + type + '...');
				
				
				var users = [];
				var min_position = getMinPosition(username, type);
								
				var hasMore = true;
				var count = 0;
				
				while(min_position && hasMore && count <= max_user_relation_count){
					
					var xhr = new XMLHttpRequest();
					
					xhr.open('GET', count == 0 ? getDataLink(username,type) : getLink(username,min_position,type), false);
					xhr.onload = function (){
						if (xhr.status === 200) {
							var result = xhr.responseText;
							
							var json = JSON.parse(result);
							if(count != 0){
								min_position = json.min_position;
							}
							var newUsers = getUsernames(json.items_html);
							users = users.concat(newUsers);
							count = users.length;
							hasMore = json.has_more_items;
						}
						return users;
							
					};
					
					xhr.send(null);
				}
				
				return users;
			};
			
			var getFollowers = function(username){
				return getData(username,'followers');
			}
			
			var getFollowing = function(username){
				return getData(username,'following');
			}
				
			var fix_console_log = function() {
				var iframe = document.createElement('iframe');
				iframe.style.display = 'none';
				document.body.appendChild(iframe);
				console = iframe.contentWindow.console;
				window.console = console;
			};
			
			fix_console_log();

			
			var source_username = 'ENTER_TWITTER_USERNAME';
			var max_user_relation_count = 200;
			
			var source_followers = getFollowers(source_username);
			//console.log(source_followers.length + ' people will be checked.');
			
			for(var i = 0; i < Math.min(source_followers.length,max_user_relation_count); i++){
			
				//console.log('checking ' + source_followers[i] + '...');
				var following = getFollowing(source_followers[i]);
				
				if(following.length == 0)
					continue;
				
				console.log(source_followers[i] + ":" + following);
			}
