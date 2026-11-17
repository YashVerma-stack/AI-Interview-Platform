export const playAudio = (text, onEnd) => {
    if(!window.speechSynthesis) {
        console.error("Speech Synthesis is not supported in this browser");
        onEnd?.();
        return;
    }

    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.volume  = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
        onEnd?.();
    };

    utterance.onerror = (event) => {
        console.error("Speech error:", event.error);
    };

    window.speechSynthesis.cancel();    // stpo previous speech
    window.speechSynthesis.speak(utterance);

};

