
chrome.storage.local.get(['status'], function(result) {
    if(result.status === 'start'){
    	gameStatus = true;
    	setUp();
    }else{
    	console.log('no game in progress');
    }	
})

let gameStatus = false;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
	console.log('big fat '+ message.status);
	switch(message.status){
		case 'start': 
			gameStatus = true;
			
    		url = window.location;
    		if(url.href === "https://en.wikipedia.org/wiki/Main_Page"){
    			setUp();
   			}else{
   				console.log('still not fixed i guess')
   			}
			break;
		case 'gameOver':
			endModal();
			gameStatus = false;
			$('#gameBar').remove();
			break;
		case 'restart':
			setUp();
			break;
		case 'word':
			setWord();
			break;
		case 'score':
			setScore();
			break;
		case 'premEnd':
			earlyEnd();
		default:
			console.log('default');
	}

})



chrome.storage.onChanged.addListener(function(changes){
	for (key in changes) {
		if (key === 'time'){
			setTime();
		}
	}
})

function setUp(){
	$("input").prop('disabled', true);
	$.get(chrome.extension.getURL('/gameBar.html'), function(gameBar) {
		console.log('made it to setup');
    	$(gameBar).appendTo('body');
    	setScore();
    })
}

function setWord(){
	const word = 'find ';
	chrome.storage.local.get(['word'], function(result) {
    	$('#word').html('find '+ result.word); 	
    	console.log('triggered');
    });
}

function setScore(){
	chrome.storage.local.get(['score'], function(result) {
    	$('#score').html(result.score); 	
    	setWord();
    	
    });
}


function setTime(){
	chrome.storage.local.get(['time'], function(result) {
    	$('#time').html(result.time);
    });
}



window.addEventListener('mouseup', getSelected);
function getSelected(){
	console.log(gameStatus);
	let selectedWord = window.getSelection().toString();
	if(selectedWord.length > 0 && gameStatus == true){
		document.getElementById('gameBar').style.animation = '';
		console.log('bout to sent selected');
		chrome.runtime.sendMessage({'wordSelected': selectedWord},function(response){
			switch(response.outcome){
				case 'yay':
					makeGreen();
					break;
				case 'nay':
					makeRed();
					break;
			}
		})
	}else{
		null;
	}

}

function makeGreen(){
	console.log('made green');
	document.getElementById('gameBar').style.animation = 'green 1s';
}

function makeRed(){
	console.log('made red');
	document.getElementById('gameBar').style.animation = 'red 1s';
}

function endModal(){
	$.get(chrome.extension.getURL('/modal.html'), function(modDiv) {
    	$(modDiv).appendTo('body');
    	setImg();

	});
}

function setImg(){

	const img=chrome.runtime.getURL("images/logoS.png");
	$("#mBox1").attr("src",img);
	chrome.storage.local.get(['score','hs'],function(results){
		const finScore = results.score;
		const highScore =  results.hs;
		const finString = finScore.toString()
		if(finScore > highScore){
			$('#mBox2').html('Congtaulations your new high score is ' + finString);
		}else{
			$('#mBox2').html('Your final score is ' + finString);
		}
	})
}


function earlyEnd(){
	$("input").prop('disabled', false);
	chrome.storage.local.remove(['time','status','score','word']);
	$('#word').remove();	
	gameStatus = false;
	$('#gameBar').remove();
	chrome.runtime.sendMessage({'command':'end'});
}



$('body').on('click','#reBut', function(){
	$('#modDiv').remove();
	chrome.runtime.sendMessage({'command':'restart'});
	
})

$('body').on('click','#stopBut', function(){
	$("input").prop('disabled', false);
	chrome.storage.local.remove(['time','status','score','word']);
	$('#word').remove();
	$('#modDiv').remove();
	chrome.runtime.sendMessage({'command':'end'});

	
})