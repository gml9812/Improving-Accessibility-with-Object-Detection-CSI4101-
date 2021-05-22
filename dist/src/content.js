console.log("CONTENT SCRIPT LOADED.")

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action == 'link created'){
		var map = {};
		console.log("link creation message received.")
		document.addEventListener("keydown", (key) => {
			map[key.key] = key.type == "keydown";
			if (map['Control'] && map['1']){
				console.log("ctrl + 1 is pressed.");
			} else if (map['Control'] &&map['2']){
				console.log("ctrl + 2 is pressed.");
			} else if (map['Control'] && map['3']){
				console.log("ctrl + 3 is pressed.");
			} else if (map['Control'] && map['4']){
				console.log("ctrl + 4 is pressed.");
			} else if (map['Control'] && map['5']){
				console.log("ctrl + 5 is pressed.");
			}
		});
		document.addEventListener("keyup", (key) => {
			map[key.key] = false;
		})
	}
});

