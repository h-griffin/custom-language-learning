 
// get reference to text areas
var meaning = document.getElementById("paste-meaning")
var phrase = document.getElementById("paste-phrase")
var script = document.getElementById("paste-script")

document.querySelector("button").addEventListener("click", () => {start()});

//add oninput listener to all text areas
document.querySelectorAll("textarea").forEach( textarea => {
    textarea.addEventListener("change", () => {canStart()})
})

// disable start button when all fields are filled
function canStart() {
    console.log("== canStart() ==")
 
    meaningText = meaning.value.replace(/^\s+/, '').replace(/\s+$/, '');
    phraseText = phrase.value.replace(/^\s+/, '').replace(/\s+$/, '');
    scriptText = script.value.replace(/^\s+/, '').replace(/\s+$/, '');

    if (meaningText !== '' && phraseText !== '' && scriptText !== ''){
        document.querySelector("button").disabled = false
    } 
 
}

// start cycle display
async function start() {
    // remove listener for start button activation
    document.querySelectorAll("textarea").forEach( textarea => {
        textarea.removeEventListener("change", () => {canStart()})
    })

    var allArrs = []
    // split all textarea inputs by white space (single words)
    document.querySelectorAll("textarea").forEach( textarea => {
        
        allArrs.push(textarea.value.split('\n').filter( function(e) { return e.trim().length > 0; } ));

    })


    var randomIndex = Math.floor(Math.random() * allArrs[0].length)
    //skip first delay
    document.getElementById("meaning-text").innerHTML = allArrs[0][randomIndex] ? allArrs[0][randomIndex] : ' ';
    setTimeout(() => {
        // delay phrase and script 2 seconds
        document.getElementById("phrase-text").innerHTML = allArrs[1][randomIndex] ? allArrs[1][randomIndex] : ' ';
        document.getElementById("script-text").innerHTML = allArrs[2][randomIndex] ? allArrs[2][randomIndex] : ' ';
    }, 2000);

    // cycle all displays - 5 seconds
    var displayInterval = setInterval(() => {updateDisplay(displayInterval, allArrs)}, 5000);
}

var updateDisplay = function(displayInterval ,allArrs){
    console.log("== setDisplays() ==")

    // reset previous display
    document.getElementById("meaning-text").innerHTML = " ";
    document.getElementById("phrase-text").innerHTML = " ";
    document.getElementById("script-text").innerHTML = " "

    var randomIndex = Math.floor(Math.random() * allArrs[0].length)
 
    // display current match
    document.getElementById("meaning-text").innerHTML = allArrs[0][randomIndex] ? allArrs[0][randomIndex] : ' ';
    setTimeout(() => {
        // delay phrase and script 2 seconds
        document.getElementById("phrase-text").innerHTML = allArrs[1][randomIndex] ? allArrs[1][randomIndex] : ' ';
        document.getElementById("script-text").innerHTML = allArrs[2][randomIndex] ? allArrs[2][randomIndex] : ' ';
    }, 2000);

};
