let sentences = [];
let currentIndex = 0;
let recording = false;
let mediaRecorder;
let recordedChunks = [];
let recognition;

document.getElementById('startButton').addEventListener('click', function() {
    const textInput = document.getElementById('textInput').value;
    sentences = textInput.split('.').map(sentence => sentence.trim()).filter(sentence => sentence.length > 0);
    currentIndex = 0;
    document.getElementById('input-section').classList.add('hidden');
    document.getElementById('sentence-section').classList.remove('hidden');
    displaySentence();
});

document.getElementById('recordButton').addEventListener('click', function() {
    if (!recording) {
        startRecording();
    } else {
        stopRecording();
    }
});

document.getElementById('playRecorded').addEventListener('click', function() {
    playRecordedAudio();
});

function displaySentence() {
    if (currentIndex < sentences.length) {
        const sentence = sentences[currentIndex];
        document.getElementById('currentSentence').innerText = sentence;
        speakText(sentence);
    }
}

function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    speechSynthesis.speak(utterance);
    utterance.onend = function() {
        startCountdown();
    };
}

function startCountdown() {
    const countdownElem = document.getElementById('countdown');
    countdownElem.classList.remove('hidden');
    let timeLeft = 15;
    countdownElem.innerText = timeLeft;
    const intervalId = setInterval(function() {
        timeLeft--;
        countdownElem.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(intervalId);
            document.getElementById('recordButton').classList.remove('hidden');
            document.getElementById('recording-status').classList.remove('hidden');
            document.getElementById('recording-status').innerText = 'Sie können jetzt aufnehmen!';
            document.getElementById('currentSentence').classList.add('hidden');
            startSpeechRecognition();
        }
    }, 1000);
}

function startSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
        alert('Speech Recognition API is not supported in this browser.');
        return;
    }
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.interimResults = false;
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('recordedText').innerText = 'Ihre Aufnahme: ' + transcript;
        compareTexts(sentences[currentIndex], transcript);
    };
    recognition.onerror = function(event) {
        document.getElementById('recording-status').innerText = 'Fehler beim Aufnehmen.';
    };
    recognition.start();
}

function startRecording() {
    const stream = navigator.mediaDevices.getUserMedia({ audio: true });
    stream.then(function(mediaStream) {
        mediaRecorder = new MediaRecorder(mediaStream);
        mediaRecorder.ondataavailable = function(event) {
            recordedChunks.push(event.data);
        };
        mediaRecorder.onstop = function() {
            const blob = new Blob(recordedChunks, { type: 'audio/webm' });
            const audioURL = URL.createObjectURL(blob);
            document.getElementById('playRecorded').classList.remove('hidden');
            document.getElementById('recording-status').innerText = 'Aufnahme beendet! Sie können die Aufnahme jetzt abspielen.';
            recordedChunks = [];
            document.getElementById('recordedText').innerText = 'Ihre Aufnahme: ' + audioURL;
        };
        mediaRecorder.start();
        recording = true;
        document.getElementById('recordButton').innerText = 'Stoppen';
        document.getElementById('recording-status').innerText = 'Aufnahme läuft...';
    });
}

function stopRecording() {
    mediaRecorder.stop();
    recording = false;
    document.getElementById('recordButton').innerText = 'Aufnehmen';
}

function playRecordedAudio() {
    const audioElement = document.createElement('audio');
    audioElement.src = document.getElementById('recordedText').innerText.split(' ')[2];
    audioElement.controls = true;
    document.getElementById('recordedText').appendChild(audioElement);
    audioElement.play();
}

function compareTexts(originalText, recordedText) {
    // Basic text comparison
    let originalWords = originalText.split(' ');
    let recordedWords = recordedText.split(' ');
    let differences = originalWords.filter((word, index) => word !== (recordedWords[index] || ''));

    let differencesHtml = differences.length ? `Unterschiede: ${differences.join(', ')}` : 'Keine Unterschiede gefunden.';
    document.getElementById('differences').innerHTML = differencesHtml;
    document.getElementById('differences').classList.remove('hidden');
}
