document.addEventListener("DOMContentLoaded", function () {
    const textInput = document.getElementById("textInput");
    const languageSelect = document.getElementById("languageSelect");
    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const outputDiv = document.getElementById("output");
    const audioPlayer = document.getElementById("audioPlayer");
    const pageTitle = document.getElementById("pageTitle");

    let sentences = [];
    let currentIndex = 0;
    let isPlaying = false;

    function translateText(text, targetLang, callback) {
        // Dummy translations; replace with actual translation logic if needed
        const translations = {
            'ar': {
                'Hallo Welt': 'مرحبا بالعالم',
                'Wie geht es Ihnen?': 'كيف حالك؟'
            },
            'tr': {
                'Hallo Welt': 'Merhaba Dünya',
                'Wie geht es Ihnen?': 'Nasılsınız?'
            },
            'uk': {
                'Hallo Welt': 'Привіт Світ',
                'Wie geht es Ihnen?': 'Як справи?'
            }
        };
        const translatedText = translations[targetLang][text] || text;
        callback(translatedText);
    }

    function updateOutput(translation) {
        if (sentences.length > 0) {
            const sentence = sentences[currentIndex];
            outputDiv.innerHTML = `<p><strong>Deutsch:</strong> ${sentence}</p>`;
            outputDiv.innerHTML += `<p><strong>Übersetzung:</strong> ${translation}</p>`;
        }
    }

    function updateAudio(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        speechSynthesis.speak(utterance);
    }

    function handlePlay() {
        if (sentences.length > 0) {
            const sentence = sentences[currentIndex];
            updateAudio(sentence);
            translateText(sentence, languageSelect.value, (translation) => {
                updateOutput(translation);
            });
            isPlaying = true;
        }
    }

    startButton.addEventListener("click", function () {
        sentences = textInput.value.split(".").map(sentence => sentence.trim()).filter(sentence => sentence.length > 0);
        currentIndex = 0;
        isPlaying = true;
        handlePlay();
    });

    stopButton.addEventListener("click", function () {
        speechSynthesis.cancel();
        isPlaying = false;
    });

    prevButton.addEventListener("click", function () {
        if (currentIndex > 0) {
            currentIndex--;
            updateAudio(sentences[currentIndex]);
            translateText(sentences[currentIndex], languageSelect.value, (translation) => {
                updateOutput(translation);
            });
        }
    });

    nextButton.addEventListener("click", function () {
        if (currentIndex < sentences.length - 1) {
            currentIndex++;
            updateAudio(sentences[currentIndex]);
            translateText(sentences[currentIndex], languageSelect.value, (translation) => {
                updateOutput(translation);
            });
        }
    });
});
