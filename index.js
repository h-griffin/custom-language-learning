 


// ====================
//  TEXT TO SPEECH  
// ====================

if ('speechSynthesis' in window) {
    // Speech Synthesis supported 
}else{
    // Speech Synthesis Not Supported 
    alert("Sorry, your browser doesn't support text to speech!");
}

let meaningSpeech = new SpeechSynthesisUtterance();
meaningSpeech.lang = "en";

let scriptSpeech = new SpeechSynthesisUtterance();
scriptSpeech.lang = "ja"; // default - reset on select


let voices = []; // global array of available voices
window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices(); // list of all voices

    // create options for each language in the voice select drop down
    let scriptVoiceSelect = document.querySelector("#voices");
    voices.forEach((voice, i) => (scriptVoiceSelect.options[i] = new Option(`${voice.name} - { ${voice.lang} } `, i)));

    // dynamically select en-US and ja-JP voices
    for(i=0; i < voices.length; i++){
        if(voices[i].lang == 'ja-JP' && voices[i].name == 'Kyoko'){
            scriptSpeech.voice = voices[i];
            scriptVoiceSelect.selectedIndex = i
        }
        if(voices[i].lang == 'en-US' && voices[i].name == 'Samantha'){
            meaningSpeech.voice = voices[i];
        }
    }
};

// update voice & language when new one is selected
document.querySelector("#voices").addEventListener("change", () => {
    scriptSpeech.voice = voices[document.querySelector("#voices").value];
    scriptSpeech.lang = scriptSpeech.voice.lang;
});

// =========================  
//  DELAY TIME RANGE SLIDER  
// =========================

var canPlay = false;
var isPaused = false;
let displayInterval; // global access to interval handle

var delayTime = 2000; // default

function sliderFunction() {
    var slider = document.getElementById("slider"); 

    // update values
    delayTime = slider.value * 1000;
    console.log("updated delay time:", delayTime);

    clearInterval(displayInterval);
    isPaused = true;

    document.querySelector("button").innerHTML = "Resume Learning";

    console.log("slider changed, isPaused:", isPaused);

    document.getElementById("meaning-text").classList.remove('load');
    document.getElementById("phrase-text").classList.remove('load');
    document.getElementById("script-text").classList.remove('load'); 

    document.getElementById("meaning-text").innerHTML = ' ';
    document.getElementById("phrase-text").innerHTML = ' ';
    document.getElementById("script-text").innerHTML = ' ';

}

//  range slider value that follows slider thumb
const allRanges = document.querySelectorAll(".range-wrap");
allRanges.forEach(wrap => {
  const range = wrap.querySelector(".range");
  const bubble = wrap.querySelector(".bubble");

  range.addEventListener("input", () => {
    setBubble(range, bubble);
  });
  setBubble(range, bubble);
});

// value display follows slider thumb
function setBubble(range, bubble) {
  const val = range.value;
  const min = range.min ? range.min : 0;
  const max = range.max ? range.max : 100;
  const newVal = Number(((val - min) * 100) / (max - min));
  bubble.innerHTML = val;

  bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
}

// =========================  
//  DISPLAY & AUDIO CYCLES  
// ========================= 

// get reference to text areas
var meaning = document.getElementById("paste-meaning");
var phrase = document.getElementById("paste-phrase");
var script = document.getElementById("paste-script");

document.querySelector("button").addEventListener("click", () => {start()});

// add oninput listener to all text areas
document.querySelectorAll("textarea").forEach( textarea => {
    textarea.addEventListener("change", () => {canStart()});
})

// disable start button until all fields are filled
function canStart() {
    console.log("== canStart() ==");
 
    meaningText = meaning.value.replace(/^\s+/, '').replace(/\s+$/, '');
    phraseText = phrase.value.replace(/^\s+/, '').replace(/\s+$/, '');
    scriptText = script.value.replace(/^\s+/, '').replace(/\s+$/, '');

    if (meaningText !== '' && phraseText !== '' && scriptText !== ''){
        document.querySelector("button").disabled = false;
        canPlay = true;
    } 
}

// start cycle display
async function start() {
    isPaused = false;
    document.querySelector("button").innerHTML = "Learning";
    console.log('start, delayTime: ', delayTime)
    
    // remove listener for start button activation
    document.querySelectorAll("textarea").forEach( textarea => {
        textarea.removeEventListener("change", () => {canStart()});
    })

    // loaded <<<<<<
    var allArrs = []
    // split all textarea inputs by line break  
    document.querySelectorAll("textarea").forEach( textarea => {
        allArrs.push(textarea.value.split('\n').filter( function(e) { return e.trim().length > 0; } ));
    })

    // loaded <<<<
    var randomIndex = Math.floor(Math.random() * allArrs[0].length);

    //skip first delay
    if (!isPaused){ // dont show/speak if paused (settings adjusted)
        document.getElementById("meaning-text").innerHTML = allArrs[0][randomIndex] ? allArrs[0][randomIndex] : ' ';
        document.getElementById("meaning-text").classList.add('load');
        meaningSpeech.text = document.querySelector("#meaning-text").innerHTML;
        speechSynthesis.speak(meaningSpeech);

        meaningSpeech.onerror = (event) => {
            console.log(`(meaning speech) An error has occurred with the speech synthesis: ${event.error}`);
        }

        setTimeout(() => {
            // delay phrase and script 2 seconds
            if(!isPaused){
                document.getElementById("phrase-text").innerHTML = allArrs[1][randomIndex] ? allArrs[1][randomIndex] : ' ';
                document.getElementById("script-text").innerHTML = allArrs[2][randomIndex] ? allArrs[2][randomIndex] : ' ';
                document.getElementById("phrase-text").classList.add('load');
                document.getElementById("script-text").classList.add('load');

                scriptSpeech.text = document.querySelector("#script-text").innerHTML;
                speechSynthesis.speak(scriptSpeech);

                scriptSpeech.onerror = (event) => {
                    console.log(`(phrase speech) An error has occurred with the speech synthesis: ${event.error}`);
                }
            }
            
        }, delayTime);  

        // cycle all displays  
        displayInterval = setInterval(() => {updateDisplay(displayInterval, allArrs)}, delayTime*2);
    }
  
}

var updateDisplay = function(displayInterval ,allArrs){
    console.log("== updateDisplays() ==");
    console.log("delay time:", delayTime);
    
    // reset previous display
    document.getElementById("meaning-text").classList.remove('load');
    document.getElementById("phrase-text").classList.remove('load');
    document.getElementById("script-text").classList.remove('load');
    
    if(!isPaused){
        setTimeout(() => {  
            var randomIndex = Math.floor(Math.random() * allArrs[0].length);
            // display current match
            document.getElementById("meaning-text").classList.add('load');
            document.getElementById("meaning-text").innerHTML = allArrs[0][randomIndex] ? allArrs[0][randomIndex] : ' ';
            
            meaningSpeech.text = document.querySelector("#meaning-text").innerHTML;
            speechSynthesis.speak(meaningSpeech);
            meaningSpeech.onerror = (event) => {
                console.log(`(meaning speech) An error has occurred with the speech synthesis: ${event.error}`);
            }
            
            // delay phrase and script from meaning 
            setTimeout(() => {
                if(!isPaused){
                    document.getElementById("phrase-text").classList.add('load');
                    document.getElementById("script-text").classList.add('load');
                    document.getElementById("phrase-text").innerHTML = allArrs[1][randomIndex] ? allArrs[1][randomIndex] : ' ';
                    document.getElementById("script-text").innerHTML = allArrs[2][randomIndex] ? allArrs[2][randomIndex] : ' ';

                    if(!isPaused){
                        scriptSpeech.text = document.querySelector("#script-text").innerHTML;
                        speechSynthesis.speak(scriptSpeech);

                        scriptSpeech.onerror = (event) => {
                            console.log(`(phrase speech) An error has occurred with the speech synthesis: ${event.error}`);
                        }
                    }
                }
                
            }, delayTime);  
        }, 500); // css transition duration <<< this timer waits for fade out before showing next meaning

    }

};

// ================
// ACCORDION
// ================

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = document.querySelector(`.panel.${this.id}`);
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
}


var loadBtn = document.querySelectorAll('.banner div p')
// append prewritten text to text area
loadBtn.forEach(btn => {
    btn.addEventListener('click', () => { 
        // load only text from module selected

        var module = btn.parentElement.children[1].id
        var preloadContainer = document.querySelectorAll(`div.panel.${module} div div.preload small`)

        // add each line to text area
        preloadContainer.forEach(tag => {
            if (tag.parentElement.parentElement.id === 'meaning-container'){
                document.querySelector('textarea#paste-meaning').value += `\n${tag.innerHTML} `
                
                document.querySelector("button").disabled = false;
                canPlay = true;
            }
            if (tag.parentElement.parentElement.id === 'phrase-container'){
                document.querySelector('textarea#paste-phrase').value += `\n${tag.innerHTML} `
                
                document.querySelector("button").disabled = false;
                canPlay = true;
            }
            if (tag.parentElement.parentElement.id === 'script-container'){
                document.querySelector('textarea#paste-script').value += `\n${tag.innerHTML}`
                
                document.querySelector("button").disabled = false;
                canPlay = true;
            }
        });
    })
});
 