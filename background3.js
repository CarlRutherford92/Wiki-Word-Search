chrome.storage.local.set({'status': 'noGame', 'selected':'placeHolder'});
var getMe = "word";
let mail = 'mail';


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
	if (message.command) {
		mail = message.command.toString();
		
		switch(mail){
			case 'start':
				startGame();
				break;
			case 'restart':
				resetTimer();
				break;
			case 'end':
				endGame();
				break;
		}
		return true;
	}
})

function postOffice(key,info){
	console.log(key,info + ' postbox');
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  		chrome.tabs.sendMessage(tabs[0].id, {'status': info});
	});
}


function startGame(){
	chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
  		if(tab[0].url == 'https://en.wikipedia.org/wiki/Main_Page'){
  			let url = tab[0].url
  			console.log(url);
  		}else{
  			chrome.tabs.update({url:'https://en.wikipedia.org/wiki/Main_Page'});
  		}
	})
	
	console.log('stfunc');
	postOffice('status', 'start');
	chrome.storage.local.set({'status':'start'});
	chrome.storage.local.set({'score':'0'});
	chrome.storage.local.set({'word':''});
	wordGenerator();
	interval();
}

function wordGenerator(){
	const words= chrome.runtime.getURL('nounlist.txt');
	fetch(words)
	.then(function(response){
		return response.text();
	})
		
	.then(function(data){
		const array = data.split(/\n|\r/g);
		getMe = array[Math.floor(Math.random() * array.length)];
		chrome.storage.local.set({'word': getMe});
		postOffice('word','word');
	})
};



let counter = 0;
chrome.runtime.onMessage.addListener(function(message, sender,sendResponse){
	if (message.wordSelected) {
		if(message.wordSelected.toUpperCase() == getMe.toUpperCase()){
			sendResponse({outcome:'yay'});
			counter = counter+=1;
			chrome.storage.local.set({'score': counter});
			postOffice('score', 'score');
			wordGenerator();
		}else{
			sendResponse({outcome:'nay'});
		};
	return true;
	}
});




const timeLeft = 5;
let time = timeLeft * 60;
let setInter;

function interval(){
	setInter = setInterval(countdownTimer, 1000);
}

function countdownTimer(){
	const mins = Math.floor(time / 60);
	let secs = time % 60;
	secs = secs < 10 ? '0' + secs : secs;
	time--;
	let timer = mins+':'+secs;
	chrome.storage.local.set({'time': timer});
	if(timer == '0:00'){
		chrome.storage.local.get(['hs'], function(result) {
    		if(counter > result.hs){
    			chrome.storage.local.set({'hs':counter});
    			counter = 0;
			}else{
				console.log('hs didnt work');
				counter = 0;
			}
		});
		clearInterval(setInter);
		chrome.storage.local.set({'status':'gameOver'});
		postOffice('status','gameOver');
	}
}

function resetTimer(){
	clearInterval(setInter);
	chrome.storage.local.remove(['time']);
	time = timeLeft * 60;
	chrome.storage.local.set({'score':0});
	counter = 0; 
	startGame();
}

chrome.storage.local.set({'hs': 0});
function endGame(){
	clearInterval(setInter);
	time = timeLeft * 60;
	counter = 0;

}

function test(){
	chrome.storage.local.get(['hs'], function(result) {
		console.log(result.hs);
	})	
}