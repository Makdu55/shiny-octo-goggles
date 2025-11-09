const textOutput = document.getElementById('textOutput');
const startStopBtn = document.getElementById('startStopBtn');
const copyBtn = document.getElementById('copyBtn');
const wordCount = document.getElementById('wordCount');
const clearBtn = document.getElementById('clearBtn');
const historyList = document.getElementById('historyList');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');

let recognition;
let isListening = false;
let accumulatedFinalTranscript = ''; // اضافة: يخزن النص النهائي عبر جلسات الاستماع

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
        let interimTranscript = '';
        // اجمع النتائج النهائية ولا تمسح المحتوى السابق عند إعادة البدء
        for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                accumulatedFinalTranscript += result[0].transcript;
            } else {
                interimTranscript += result[0].transcript;
            }
        }
        // عرض النص المجمع مع النص المؤقت
        textOutput.value = accumulatedFinalTranscript + interimTranscript;
        wordCount.textContent = textOutput.value.trim().split(/\s+/).filter(word => word).length;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
    };
} else {
    alert('Speech recognition is not supported in this browser.');
}

startStopBtn.addEventListener('click', () => {
    if (isListening) {
        recognition.stop();
        startStopBtn.textContent = 'Start';
    } else {
        // إضافة: ضع مسافة بعد البدء إذا لم تنتهِ السلسلة الحالية بمسافة
        if (accumulatedFinalTranscript && !/\s$/.test(accumulatedFinalTranscript)) {
            accumulatedFinalTranscript += ' ';
        }
        recognition.start();
        startStopBtn.textContent = 'Stop';
    }
    isListening = !isListening;
});

copyBtn.addEventListener('click', () => {
    textOutput.select();
    document.execCommand('copy');
    alert('Text copied to clipboard!');
});

// وظيفة لإضافة النص إلى السجل
function addToHistory(text) {
    const listItem = document.createElement('li');
    listItem.textContent = text;
    historyList.appendChild(listItem);
}

// تعديل زر الحذف لإضافة النص إلى السجل قبل الحذف
clearBtn.addEventListener('click', () => {
    if (textOutput.value.trim()) {
        addToHistory(textOutput.value.trim());
    }
    textOutput.value = '';
    wordCount.textContent = 0;
    accumulatedFinalTranscript = ''; // إعادة تعيين المجمع عند المسح
});

textOutput.addEventListener('input', () => {
    wordCount.textContent = textOutput.value.trim().split(/\s+/).filter(word => word).length;
    // إذا لم يكن التطبيق يستمع الآن، نحدّث المجمع بحيث يعكس أي تعديل يدوي
    if (!isListening) {
        accumulatedFinalTranscript = textOutput.value;
    }
});

// التبديل بين الوضع الليلي والوضع العادي
toggleThemeBtn.addEventListener('click', () => {
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (isDarkMode) {
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    }
});
