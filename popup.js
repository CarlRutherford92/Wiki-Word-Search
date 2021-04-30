//write an if statement somewher to use the content of the wordbox as a state function

function setText(){
	chrome.storage.local.get(['hs'],function(result){
		const highScore = result.hs.toString();
		$('#hScore').html('Your high score is ' + highScore);

	})
}

function sendStart(){
	
	console.log('started game')
	chrome.runtime.sendMessage({command:"start"});
    window.close(); // Note: window.close(), not this.close()

}

document.addEventListener('DOMContentLoaded',function(){
	document.getElementById('start').addEventListener('click', sendStart);
	document.getElementById('reStart').addEventListener('click', reStart);
	document.getElementById('popStop').addEventListener('click', sendStop);
	document.getElementById('howTo').addEventListener('click', howTo);

	
});

window.onload = buttonType();

function howTo(){
	window.location.href='howTo.html'
}


function buttonType(){

	setText();
	chrome.storage.local.get(['status'], function(result) {
    	if(result.status === 'start'){
    		$('#start').hide();
    		$('#reStart').show();
    		$('#popStop').show();
   		}else{
    		$('#reStart').hide();
    		$('#start').show();
    		$('#popStop').hide();
    	}
	});
}



function reStart(){
	console.log('started game')
	chrome.runtime.sendMessage({command:"restart"});
	window.close();
}

function sendStop(){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  		chrome.tabs.sendMessage(tabs[0].id, {'status': 'premEnd'});
  		window.close();
	});
}

