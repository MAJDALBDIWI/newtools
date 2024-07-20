document.addEventListener("DOMContentLoaded", function () {
    const textInput = document.getElementById("textInput");
    const languageSelect = document.getElementById("languageSelect");
    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");
    const prevButton = document.getElementById("prevButton");
    const nextButton = document.getElementById("nextButton");
    const outputDiv = document.getElementById("output");

    let sentences = [];
    let currentIndex = 0;
    let isPlaying = false;
    let translationEnabled = false;

    function translateText(text, targetLang, callback) {
        // Make a request to Google Translate web page
        const url = `https://translate.google.com/?sl=de&tl=${targetLang}&text=${encodeURIComponent(text)}`;
        fetch(url)
            .then(response => response.text())
            .then(data => {
                const translation = extractTranslation(data);
                callback(translation);
            })
            .catch(error => {
                console.error("Error fetching translation:", error);
                callback("Übersetzung nicht verfügbar");
            });
    }

    function extractTranslation(html) {
        // Extract translation from HTML using regular expressions
        const regex = /<span class="tlid-translation translation">(.*?)<\/span>/;
        const match = regex.exec(html);
        return match ? match[1] : "Übersetzung nicht verfügbar";
    }

    function updateOutput() {
        if (sentences.length > 0) {
            const sentence = sentences[currentIndex];
            outputDiv.innerHTML = `<p><strong>Deutsch:</strong> ${sentence}</p>`;
            const lang = languageSelect.value;
            if (translationEnabled) {
                translateText(sentence, lang, (translatedText) => {
                    outputDiv.innerHTML += `<p><strong>Übersetzung:</strong> ${translatedText}</p>`;
                });
            }
        }
    }

    startButton.addEventListener("click", function () {
        sentences = textInput.value.split(".").map(sentence => sentence.trim()).filter(sentence => sentence.length > 0);
        currentIndex = 0;
        isPlaying = true;
        translationEnabled = true;
        updateOutput();
    });

    stopButton.addEventListener("click", function () {
        isPlaying = false;
    });

    prevButton.addEventListener("click", function () {
        if (currentIndex > 0) {
            currentIndex--;
            updateOutput();
        }
    });

    nextButton.addEventListener("click", function () {
        if (currentIndex < sentences.length - 1) {
            currentIndex++;
            updateOutput();
        }
    });
});
