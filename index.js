 
 
// ====================
//  TEXT TO SPEECH  
// ====================

if ('speechSynthesis' in window) {
    // Speech Synthesis supported 
}else{
    // Speech Synthesis Not Supported 
    alert("Sorry, your browser doesn't support text to speech!");
}

if ("webkitSpeechRecognition" in window) {

} else {
    alert("Speech Recognition Not Available")
    document.getElementById("scoreButton").disabled = true;
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

// update speed when selected
document.querySelector("#slider2").addEventListener('change', () => {
    meaningSpeech.rate = document.querySelector("#slider2").value
    scriptSpeech.rate = document.querySelector("#slider2").value
})

// update voice & language when new one is selected
document.querySelector("#voices").addEventListener("change", () => {
    scriptSpeech.voice = voices[document.querySelector("#voices").value];
    scriptSpeech.lang = scriptSpeech.voice.lang;
});


// ================
// HELPER FUNCTIONS
// ================

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function play() {
    var audio = new Audio('./assets/ping-82822.mp3');
    audio.play();
}

function pause() {
    // clear interval cycle
    clearInterval(displayInterval);
    isPaused = true;

    // change button text
    document.querySelector("button").innerHTML = "Resume Learning";
    console.log("control button clicked, isPaused:", isPaused);

    // clear screen display
    document.getElementById("meaning-text").classList.remove('load');
    document.getElementById("phrase-text").classList.remove('load');
    document.getElementById("script-text").classList.remove('load'); 

    document.getElementById("meaning-text").innerHTML = ' ';
    document.getElementById("phrase-text").innerHTML = ' ';
    document.getElementById("script-text").innerHTML = ' ';

    document.querySelector("#icon").style.display = "none";
    document.querySelector("#status").style.display = "none";

    recognition.abort();
} 

function phraseAndScript(allArrs, randomIndex) {
    return new Promise(resolve => {
        
        // set/display next set and speek phrase
        document.getElementById("speech-text").innerHTML =  " "; 
        document.getElementById("phrase-text").innerHTML = allArrs[1][randomIndex] ? allArrs[1][randomIndex] : ' ';
        document.getElementById("script-text").innerHTML = allArrs[2][randomIndex] ? allArrs[2][randomIndex] : ' ';
        document.getElementById("phrase-text").classList.add('load');
        document.getElementById("script-text").classList.add('load');

        scriptSpeech.text = document.querySelector("#script-text").innerHTML;
        speechSynthesis.speak(scriptSpeech);

        scriptSpeech.onerror = (event) => {
            console.log(`(phrase speech) An error has occurred with the speech synthesis: ${event.error}`);
        }

        setTimeout(() => {
            resolve("sucess!");
        }, 3000); //timer to allow for speech to finish
    })
}


function meeaning(allArrs, randomIndex) {
    return new Promise(resolve => {

        // set/display next set and speek phrase
        document.getElementById("meaning-text").innerHTML = allArrs[0][randomIndex] ? allArrs[0][randomIndex] : ' ';
        document.getElementById("meaning-text").classList.add('load');
        meaningSpeech.text = document.querySelector("#meaning-text").innerHTML;
        speechSynthesis.speak(meaningSpeech);

        meaningSpeech.onerror = (event) => {
            console.log(`(meaning speech) An error has occurred with the speech synthesis: ${event.error}`);
        }

        setTimeout(() => {
            resolve("sucess!");
        }, 3000); //timer to allow for speech to finish
    })
}





 

// =========================  
//  DELAY TIME & SPEED RANGE SLIDER  
// =========================

var canPlay = false;        // ensures all sets have pairs
var isPaused = false;       // interval cycle control
let displayInterval;        // global access to interval handle

// defualt control settings
var delayTime = 5000;  
var speechspeed = 1.0;  
let isQuizMode = false;     // quizmode control
var isMeaningFirst = true;  // order control

// quiz mode settings
let final_transcript = "";  // speech to text result
let quizscore = 0;          // quiz mode session score

function delaySlider() {
    var slider = document.getElementById("slider"); 

    // update values
    delayTime = slider.value * 1000;
    console.log("updated delay time:", delayTime);

    pause();

}
function speedSlider() {
    var slider = document.getElementById("slider2"); 

    // update values
    speechspeed = slider.value * 1000;
    console.log("updated speed time:", speechspeed);

    pause();
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

const allRanges2 = document.querySelectorAll(".range-wrap2");
allRanges2.forEach(wrap => {
  const range = wrap.querySelector(".range2");
  const bubble = wrap.querySelector(".bubble2");

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
//  SET DISPLAY ORDER  
// ========================= 

// onclick toggle meaning/phrase order
document.getElementById("listen").addEventListener("click", () => {
    isMeaningFirst = !isMeaningFirst;

    pause();
})

// onclick toggle quiz mode
document.getElementById("scoreButton").addEventListener("click", () => {
    isQuizMode = !isQuizMode;
    
    // disable controls when in quizMode
    document.getElementById("listen").disabled = !document.getElementById("listen").disabled;
    document.getElementById("slider").disabled = !document.getElementById("slider").disabled;
    
    // show score counter when in quizMode 
    isQuizMode ? document.getElementById("score").style.display = 'block' : document.getElementById("score").style.display = 'none'
    isQuizMode ? document.getElementById("delay-bubble").style.display = 'none' : document.getElementById("delay-bubble").style.display = 'block'
    
    pause();
})


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
 
    // clear whitespace
    meaningText = meaning.value.replace(/^\s+/, '').replace(/\s+$/, '');
    phraseText = phrase.value.replace(/^\s+/, '').replace(/\s+$/, '');
    scriptText = script.value.replace(/^\s+/, '').replace(/\s+$/, '');

    if (meaningText !== '' && phraseText !== '' && scriptText !== ''){
        document.querySelector("button").disabled = false;
        canPlay = true;
    }

}

// start display cycle 
async function start() {
    isPaused = false;
    document.querySelector("button").innerHTML = "Learning";
    console.log('start, delayTime: ', delayTime)
    
    // remove listener for start button activation
    document.querySelectorAll("textarea").forEach( textarea => {
        textarea.removeEventListener("change", () => {canStart()});
    })

    var allArrs = []
    // split all textarea inputs by line break  
    document.querySelectorAll("textarea").forEach( textarea => {
        allArrs.push(textarea.value.split('\n').filter( function(e) { return e.trim().length > 0; } ));
    })

    // select index to match meaning and phrases
    var randomIndex = Math.floor(Math.random() * allArrs[0].length);

    //skip first delay
    if (!isPaused){ // dont show/speak if paused (settings adjusted)
        if ( isQuizMode ){
            quizOrder(allArrs);
        }else if(isMeaningFirst && !isQuizMode){
            meeaning(allArrs, randomIndex);
            setTimeout(() => {
                if(!isPaused){ phraseAndScript(allArrs, randomIndex) }
            }, delayTime); 
        }else{
            phraseAndScript(allArrs, randomIndex);
            setTimeout(() => {
                if(!isPaused){ meeaning(allArrs, randomIndex) }
            }, delayTime);
        }

        // cycle all displays 
        if (!isQuizMode) { displayInterval = setInterval(() => {updateDisplay(displayInterval, allArrs)}, delayTime*2); } 
    }
  
}

var updateDisplay = function(displayInterval ,allArrs){
    console.log("== updateDisplays() ==");
    console.log("delay time:", delayTime);
    
    // reset previous display
    document.getElementById("meaning-text").classList.remove('load');
    document.getElementById("phrase-text").classList.remove('load');
    document.getElementById("script-text").classList.remove('load');

    // select index to match meaning adn phrases
    var randomIndex = Math.floor(Math.random() * allArrs[0].length);
    if(!isPaused){
        setTimeout(() => {  
            if(isMeaningFirst){
                meeaning(allArrs, randomIndex);
                setTimeout(() => {
                    if(!isPaused){ phraseAndScript(allArrs, randomIndex) }
                }, delayTime);  
            }else{
                phraseAndScript(allArrs, randomIndex)
                setTimeout(() => {
                    if(!isPaused){ meeaning(allArrs, randomIndex) }
                }, delayTime);
            }
        }, 500); // css transition duration <<< this timer waits for fade out before showing next meaning
    }
};

 
async function quizOrder(allArrs) {
    console.log('== quiz order ==')

    var randomIndex = Math.floor(Math.random() * allArrs[0].length);

    // reset previous display
    document.getElementById("meaning-text").classList.remove('load');
    document.getElementById("phrase-text").classList.remove('load');
    document.getElementById("script-text").classList.remove('load');
    
    await meeaning(allArrs, randomIndex);

    await listen(); 

    if (final_transcript.includes(allArrs[2][randomIndex])) {   
        play();
        quizscore++;
        document.getElementById("score").innerHTML = quizscore;
        document.getElementById("icon").innerHTML = "&#9989;" // check

    } else {
        document.getElementById("icon").innerHTML = "&#10060;" // x
        await delay(1000);
    }

    await phraseAndScript(allArrs, randomIndex);
    document.getElementById("icon").style.display = 'none'; // clear status icon

    // loop
    if (!isPaused){ quizOrder(allArrs); }
}


window.SpeechRecognition = window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true;
recognition.lang = scriptSpeech.lang; // match script/speech lang with speech recodnition language 

async function listen() {
    // reset previous speech result
    document.getElementById("speech-text").innerHTML =  "";
    document.getElementById("speech-text").style.opacity = "0";
    document.querySelector("#icon").style.display = "none";

    final_transcript = '';

    return new Promise(resolve => {
    
        document.querySelector("#icon").innerHTML = "&#128066;"; // ear
        document.querySelector("#status").style.display = "block";
        document.querySelector("#icon").style.display = "block";
        recognition.start();
        
        setTimeout(() => {
            recognition.stop();
            document.querySelector("#status").style.display = "none"; // clear css timer
            resolve("sucess!");
        }, 7000); //timer to allow for speech to finish
    })
}


recognition.onresult = (event) => {
    let interim_transcript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            final_transcript = event.results[i][0].transcript;
            // recognition.stop();
        } else {
            interim_transcript += event.results[i][0].transcript;
        }
    }

    document.getElementById("speech-text").innerHTML = final_transcript;
    document.getElementById("speech-text").style.color = "red";
    document.getElementById("speech-text").style.opacity = "1";
};

recognition.onerror = (event) => {
    console.log(`(speech recodnition) An error has occurred with the speech recodnition: ${event.error}`);
}


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
 

 






