let sentences = [];
let currentIndex = 0;
let recording = false;
let mediaRecorder;
let recordedChunks = [];
let recognition;
let speechSynthesisUtterance;

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

document.getElementById('finish').addEventListener('click', function() {
    displayComparison();
});

document.getElementById('re-record').addEventListener('click', function() {
    document.getElementById('recordedText').classList.add('hidden');
    document.getElementById('recordButton').classList.remove('hidden');
    document.getElementById('re-record').classList.add('hidden');
    document.getElementById('finish').classList.add('hidden');
    displaySentence();
});

function displaySentence() {
    if (currentIndex < sentences.length) {
        const sentence = sentences[currentIndex];
        document.getElementById('currentSentence').innerText = sentence;
        speakText(sentence);
    }
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        speechSynthesisUtterance = new SpeechSynthesisUtterance(text);
        speechSynthesisUtterance.lang = 'de-DE';
        speechSynthesis.speak(speechSynthesisUtterance);
        speechSynthesisUtterance.onend = function() {
            startCountdown();
        };
    } else {
        alert('Speech Synthesis API is not supported in this browser.');
    }
}

function startCountdown() {
    const countdownElem = document.getElementById('countdown');
    countdownElem.classList.remove('hidden');
    let timeLeft = 10;
    countdownElem.innerText = timeLeft;
    const intervalId = setInterval(function() {
        timeLeft--;
        countdownElem.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(intervalId);
            document.getElementById('recordButton').classList.remove('hidden');
            document.getElementById('recording-status').classList.remove('hidden');
            document.getElementById('recording-status').innerText = 'Sie können jetzt aufnehmen!';
            document.getElementById('countdown').classList.add('hidden');
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
        document.getElementById('recordedText').classList.remove('hidden');
        document.getElementById('recordButton').classList.add('hidden');
        document.getElementById('finish').classList.remove('hidden');
        recognition.stop();
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
            const blob = new Blob(recordedChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            audio.play();
            recordedChunks = [];
        };
        mediaRecorder.start();
        recording = true;
        document.getElementById('recording-status').innerText = 'Aufnahme läuft...';
        document.getElementById('recordButton').innerText = 'Stoppen';
    });
}

function stopRecording() {
    mediaRecorder.stop();
    recording = false;
    document.getElementById('recordButton').innerText = 'Aufnehmen';
}

function displayComparison() {
    const originalText = sentences[currentIndex];
    const recordedText = document.getElementById('recordedText').innerText.replace('Ihre Aufnahme: ', '');
    document.getElementById('comparison').classList.remove('hidden');

    const originalWords = originalText.split(' ');
    const recordedWords = recordedText.split(' ');

    let comparisonHtml = '<div>Originaltext: <p>' + originalText + '</p></div>';
    comparisonHtml += '<div>Aufgenommener Text: <p>' + recordedText + '</p></div>';
    comparisonHtml += '<div>Unterschiede: <p>';

    for (let i = 0; i < Math.max(originalWords.length, recordedWords.length); i++) {
        const origWord = originalWords[i] || '';
        const recWord = recordedWords[i] || '';

        if (origWord !== recWord) {
            comparisonHtml += `<span class="incorrect">${origWord || '[missing]}'</span> `;
        } else {
            comparisonHtml += `<span class="correct">${origWord}</span> `;
        }
    }

    comparisonHtml += '</p></div>';
    document.getElementById('comparison').innerHTML = comparisonHtml;
}
