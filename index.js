 
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
    document.getElementById("toggle-quiz").disabled = true;
}

let meaningSpeech = new SpeechSynthesisUtterance();
meaningSpeech.lang = "en";

let scriptSpeech = new SpeechSynthesisUtterance();
scriptSpeech.lang = "ja"; // default - reset on select


let voices = []; // global array of available voices

// render voice select options
if (/apple/i.test(navigator.vendor)) { // safari
    getVoices();
} else if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = getVoices;
} else {
    alert('voice selection not available in this browser')
}

function getVoices() {
    voices = window.speechSynthesis.getVoices(); // list of all voices

    // create options for each language in the voice select drop down
    let scriptVoiceSelect = document.querySelector("#voices");
    voices.forEach((voice, i) => { scriptVoiceSelect.options[i] = new Option(`${voice.name} - { ${voice.lang} } `, i) } );
     
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
    questionNumber = 0;

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

function phraseAndScript(randomIndex) {
    return new Promise(resolve => {
        console.log(randomIndex, questionNumber)
        // set/display next set and speek phrase
        if (randomIndex === questionNumber && !isDelaySkipped) {
            
            document.getElementById("speech-text").innerHTML =  " "; 
            document.getElementById("phrase-text").innerHTML = allArrs[1][randomIndex] ? allArrs[1][randomIndex] : ' ';
            document.getElementById("script-text").innerHTML = allArrs[2][randomIndex] ? allArrs[2][randomIndex] : ' ';
            document.getElementById("phrase-text").classList.add('load');
            document.getElementById("script-text").classList.add('load');
            
            scriptSpeech.text = document.querySelector("#script-text").innerHTML;
            speechSynthesis.speak(scriptSpeech);
        }

        scriptSpeech.onerror = (event) => {
            console.log(`(phrase speech) An error has occurred with the speech synthesis: ${event.error}`);
        }

        setTimeout(() => {
            resolve("sucess!");
            console.log("resolved")
        }, 3000); //timer to allow for speech to finish
    })
}


function meeaning(randomIndex) {
    return new Promise(resolve => {

        
        if (randomIndex === questionNumber && !isDelaySkipped) {
            // set/display next set and speek phrase
            document.getElementById("meaning-text").innerHTML = allArrs[0][randomIndex] ? allArrs[0][randomIndex] : ' ';
            document.getElementById("meaning-text").classList.add('load');
            meaningSpeech.text = document.querySelector("#meaning-text").innerHTML;
            speechSynthesis.speak(meaningSpeech);
        }

        meaningSpeech.onerror = (event) => {
            console.log(`(meaning speech) An error has occurred with the speech synthesis: ${event.error}`);
        }

        setTimeout(() => {
            resolve("sucess!");
            console.log("resolved")
        }, 3000); //timer to allow for speech to finish
    })
}





 

// =========================  
//  DELAY TIME & SPEED RANGE SLIDER  
// =========================

var canPlay = false;        // ensures all input sets have pairs
var isPaused = false;       // interval cycle control
let displayInterval;        // global access to interval handle
let allArrs = [];           // global access to input text

let questionNumber = 0;     // match randomIndex pairs for pause/play/skip (when resumed it does not continue phrase for previous meaning skipped)
let isDelaySkipped = false; // cancel promise when skipping to answer
let isAnswerDisplayed = false; // disable skipping to answer when asnwer is showing

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
document.getElementById("toggle-order").addEventListener("click", () => {
    isMeaningFirst = !isMeaningFirst;
    isMeaningFirst ? document.getElementById("toggle-order").innerHTML = "Toggle Order: 1-2" : document.getElementById("toggle-order").innerHTML = "Toggle Order: 2-1"

    pause();
})

// onclick toggle quiz mode
document.getElementById("toggle-quiz").addEventListener("click", () => {
    isQuizMode = !isQuizMode;
    if (isQuizMode) {
        document.getElementById("toggle-quiz").innerHTML = "Toggle Quiz Mode: O";
        document.getElementById("a").style.display = 'none';
        document.getElementById("s").style.display = 'none';
    } else {
        document.getElementById("toggle-quiz").innerHTML = "Toggle Quiz Mode: I";
        document.getElementById("a").style.display = 'block';
        document.getElementById("s").style.display = 'block';
    }
    
    // disable controls when in quizMode
    document.getElementById("toggle-order").disabled = !document.getElementById("toggle-order").disabled;
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

    allArrs = []
    // split all textarea inputs by line break  
    document.querySelectorAll("textarea").forEach( textarea => {
        allArrs.push(textarea.value.split('\n').filter( function(e) { return e.trim().length > 0; } ));
    })

    // select index to match meaning and phrases
    var randomIndex = Math.floor(Math.random() * allArrs[0].length);
    questionNumber = randomIndex;

    //skip first delay
    if (!isPaused){ // dont show/speak if paused (settings adjusted)
        if ( isQuizMode ){
            quizOrder();
        }else if(isMeaningFirst && !isQuizMode){
            meeaning(randomIndex);
            setTimeout(() => {
                if(!isPaused && !isDelaySkipped){ 
                    isAnswerDisplayed = true;
                    phraseAndScript(randomIndex); 
                }
            }, delayTime); 
            isAnswerDisplayed = false;
        }else{
            phraseAndScript(randomIndex);
            setTimeout(() => {
                if(!isPaused && !isDelaySkipped){ 
                    isAnswerDisplayed = true;
                    meeaning(randomIndex); 
                }
            }, delayTime);
            isAnswerDisplayed = false;
        }

        // cycle all displays 
        if (!isQuizMode) { displayInterval = setInterval(() => {updateDisplay(displayInterval)}, delayTime*2); } 
    }
  
}

var updateDisplay = function(displayInterval){
    console.log("== updateDisplays() ==");
    console.log("delay time:", delayTime);
    
    isDelaySkipped = false; // reset skip for new cycle
    // reset previous display
    document.getElementById("meaning-text").classList.remove('load');
    document.getElementById("phrase-text").classList.remove('load');
    document.getElementById("script-text").classList.remove('load');

    // select index to match meaning adn phrases
    var randomIndex = Math.floor(Math.random() * allArrs[0].length);
    questionNumber = randomIndex;
    if(!isPaused){
        setTimeout(() => {  
            if(isMeaningFirst){
                meeaning( randomIndex);
                setTimeout(() => {
                    if(!isPaused && !isDelaySkipped){ 
                        isAnswerDisplayed = true;
                        phraseAndScript( randomIndex) }
                }, delayTime);  
                isAnswerDisplayed = false;
            }else{
                phraseAndScript( randomIndex)
                setTimeout(() => {
                    if(!isPaused && !isDelaySkipped){ 
                        isAnswerDisplayed = true;
                        meeaning( randomIndex) }
                }, delayTime);
                isAnswerDisplayed = false;
            }
        }, 500); // css transition duration <<< this timer waits for fade out before showing next meaning
    }
};

 
async function quizOrder() {
    console.log('== quiz order ==')

    var randomIndex = Math.floor(Math.random() * allArrs[0].length);
    // questionNumber = randomIndex;

    // reset previous display
    document.getElementById("meaning-text").classList.remove('load');
    document.getElementById("phrase-text").classList.remove('load');
    document.getElementById("script-text").classList.remove('load');
    
    await meeaning(randomIndex);

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

    await phraseAndScript(randomIndex);
    document.getElementById("icon").style.display = 'none'; // clear status icon

    // loop
    if (!isPaused){ quizOrder(); }
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
    if (panel.style.height) {
    //   panel.style.maxHeight = null;
      panel.style.height = null
    } else {
        // panel.style.maxHeight = 0;
    //   panel.style.maxHeight = panel.scrollHeight + "px";
    //   console.log(i, panel.scrollHeight)
        panel.style.height = 'auto';
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
 

 



// keyboard shortcuts
document.addEventListener("keypress", function(event) {
    // P - pause/play
    if (event.key == 'p' ) {
        if (isPaused){
            console.log('P - Play');
            start();
        } else {
            console.log('P - Pause');
            pause();
        }
    }
    // S - skip
    if (event.key == 's' ) {
        if(!isPaused && !isQuizMode){
            console.log('S - Skip');
            pause();
            start();
        }
    }
    // A - answer
    if (event.key == 'a' ) {
        if(!isPaused && !isQuizMode && !isAnswerDisplayed){
            console.log('A - Answer');
            isDelaySkipped = true;
            isAnswerDisplayed = true;

            if (isMeaningFirst) {
                // answer - phrase & script
                document.getElementById("speech-text").innerHTML =  " "; 
                document.getElementById("phrase-text").innerHTML = allArrs[1][questionNumber] ? allArrs[1][questionNumber] : ' ';
                document.getElementById("script-text").innerHTML = allArrs[2][questionNumber] ? allArrs[2][questionNumber] : ' ';
                document.getElementById("phrase-text").classList.add('load');
                document.getElementById("script-text").classList.add('load');
                
                scriptSpeech.text = document.querySelector("#script-text").innerHTML;
                speechSynthesis.speak(scriptSpeech);

                scriptSpeech.onerror = (event) => {
                    console.log(`(phrase speech) An error has occurred with the speech synthesis: ${event.error}`);
                }
                questionNumber++; // temp increase so the original promise does not match key and play (this is reset for new/next question pair)
            } else {
                // answer - meaning
                document.getElementById("meaning-text").innerHTML = allArrs[0][questionNumber] ? allArrs[0][questionNumber] : ' ';
                document.getElementById("meaning-text").classList.add('load');
                meaningSpeech.text = document.querySelector("#meaning-text").innerHTML;
                speechSynthesis.speak(meaningSpeech);
        
                meaningSpeech.onerror = (event) => {
                    console.log(`(meaning speech) An error has occurred with the speech synthesis: ${event.error}`);
                }
                questionNumber++;
            }

        }
    }


});


