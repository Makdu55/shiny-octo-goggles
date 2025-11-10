const textOutput = document.getElementById('textOutput');
const startStopBtn = document.getElementById('startStopBtn');
const copyBtn = document.getElementById('copyBtn');
const wordCount = document.getElementById('wordCount');
const clearBtn = document.getElementById('clearBtn');
const historyList = document.getElementById('historyList');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');

let recognition;
let isListening = false;
let accumulatedFinalTranscript = ''; // يخزن النص النهائي عبر جلسات الاستماع

// دعم كل من الواجهتين القياسية والمسبوقة
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    // تعامل فقط مع النتائج الجديدة باستخدام event.resultIndex لمنع التكرار
    recognition.onresult = (event) => {
        let interimTranscript = '';
        // ابدأ من الفهرس الذي يشير إليه الحدث (نتائج جديدة فقط)
        for (let i = event.resultIndex; i < event.results.length; i++) {
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

    recognition.onend = () => {
        // عند انتهاء الجلسة، نحدّث الحالة وواجهة المستخدم لضمان التزامن
        if (isListening) {
            isListening = false;
            startStopBtn.textContent = 'Start';
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        // في حالات خطأ حرِج، تأكد من تحديث الحالة
        isListening = false;
        startStopBtn.textContent = 'Start';
    };
} else {
    // عطل زر البدء إذا لم يكن مدعوماً
    startStopBtn.disabled = true;
    alert('Speech recognition is not supported in this browser.');
}

startStopBtn.addEventListener('click', () => {
    if (!recognition) return; // حماية إضافية
    if (isListening) {
        recognition.stop();
        // التعريف سيُحدّث الزر في onend أيضاً
        startStopBtn.textContent = 'Start';
        isListening = false;
    } else {
        // إضافة مسافة فاصلة إذا لزم الأمر عند بدء جلسة جديدة
        if (accumulatedFinalTranscript && !/\s$/.test(accumulatedFinalTranscript)) {
            accumulatedFinalTranscript += ' ';
        }
        recognition.start();
        startStopBtn.textContent = 'Stop';
        isListening = true;
    }
});

// تحسين النسخ لاستخدام واجهة الحافظة الحديثة مع fallback
copyBtn.addEventListener('click', async () => {
    const text = textOutput.value;
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            alert('Text copied to clipboard!');
        } catch (err) {
            // fallback إلى السلوك القديم إن فشل
            textOutput.select();
            document.execCommand('copy');
            alert('Text copied to clipboard!');
        }
    } else {
        textOutput.select();
        document.execCommand('copy');
        alert('Text copied to clipboard!');
    }
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
        // طبق الفئة أيضاً على العناصر التي تملك أنماط وضع
        document.querySelector('.container')?.classList.remove('dark-mode');
        document.querySelector('.container')?.classList.add('light-mode');
        textOutput.classList.remove('dark-mode');
        textOutput.classList.add('light-mode');
        document.querySelectorAll('.controls button').forEach(btn => {
            btn.classList.remove('dark-mode');
            btn.classList.add('light-mode');
        });
    } else {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        document.querySelector('.container')?.classList.remove('light-mode');
        document.querySelector('.container')?.classList.add('dark-mode');
        textOutput.classList.remove('light-mode');
        textOutput.classList.add('dark-mode');
        document.querySelectorAll('.controls button').forEach(btn => {
            btn.classList.remove('light-mode');
            btn.classList.add('dark-mode');
        });
    }
});
