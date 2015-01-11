/*global webkitSpeechRecognition:false */

'use strict';

var langs = [
    ['Afrikaans', ['af-ZA']],
    ['Bahasa Indonesia', ['id-ID']],
    ['Bahasa Melayu', ['ms-MY']],
    ['Català', ['ca-ES']],
    ['Čeština', ['cs-CZ']],
    ['Deutsch', ['de-DE']],
    ['English', ['en-AU', 'Australia'],
        ['en-CA', 'Canada'],
        ['en-IN', 'India'],
        ['en-NZ', 'New Zealand'],
        ['en-ZA', 'South Africa'],
        ['en-GB', 'United Kingdom'],
        ['en-US', 'United States']
    ],
    ['Español', ['es-AR', 'Argentina'],
        ['es-BO', 'Bolivia'],
        ['es-CL', 'Chile'],
        ['es-CO', 'Colombia'],
        ['es-CR', 'Costa Rica'],
        ['es-EC', 'Ecuador'],
        ['es-SV', 'El Salvador'],
        ['es-ES', 'España'],
        ['es-US', 'Estados Unidos'],
        ['es-GT', 'Guatemala'],
        ['es-HN', 'Honduras'],
        ['es-MX', 'México'],
        ['es-NI', 'Nicaragua'],
        ['es-PA', 'Panamá'],
        ['es-PY', 'Paraguay'],
        ['es-PE', 'Perú'],
        ['es-PR', 'Puerto Rico'],
        ['es-DO', 'República Dominicana'],
        ['es-UY', 'Uruguay'],
        ['es-VE', 'Venezuela']
    ],
    ['Euskara', ['eu-ES']],
    ['Français', ['fr-FR']],
    ['Galego', ['gl-ES']],
    ['Hrvatski', ['hr_HR']],
    ['IsiZulu', ['zu-ZA']],
    ['Íslenska', ['is-IS']],
    ['Italiano', ['it-IT', 'Italia'],
        ['it-CH', 'Svizzera']
    ],
    ['Magyar', ['hu-HU']],
    ['Nederlands', ['nl-NL']],
    ['Norsk bokmål', ['nb-NO']],
    ['Polski', ['pl-PL']],
    ['Português', ['pt-BR', 'Brasil'],
        ['pt-PT', 'Portugal']
    ],
    ['Română', ['ro-RO']],
    ['Slovenčina', ['sk-SK']],
    ['Suomi', ['fi-FI']],
    ['Svenska', ['sv-SE']],
    ['Türkçe', ['tr-TR']],
    ['български', ['bg-BG']],
    ['Pусский', ['ru-RU']],
    ['Српски', ['sr-RS']],
    ['한국어', ['ko-KR']],
    ['中文', ['cmn-Hans-CN', '普通话 (中国大陆)'],
        ['cmn-Hans-HK', '普通话 (香港)'],
        ['cmn-Hant-TW', '中文 (台灣)'],
        ['yue-Hant-HK', '粵語 (香港)']
    ],
    ['日本語', ['ja-JP']],
    ['Lingua latīna', ['la']]
];

var hostname;
var port;
var $finalSpanTranslation = $('#finalSpanTranslation');
var connection;
var sendToMoses;

var init = function(_hostname, _port) {
    hostname = _hostname || '127.0.0.1';
    port = _port || 80;
    
    connection = new WebSocket('ws://' + hostname + ":" + port);

    connection.onopen = function() {
        console.log('connection opened');
    };

    connection.onclose = function() {
        console.log('connection closed');
    };

    connection.onerror = function() {
        console.log('connection error');
    };

    connection.onmessage = function(event) {
        $finalSpanTranslation.text(event.data);
    };

    sendToMoses = function(text) {
        console.log(text);
        connection.send(text);
    };
};

init('localhost', 8001);


var $startButton = $('#startButton');
var $startImg = $('#startImg');
var $selectLanguage = $('#selectLanguage');
var $selectDialect = $('#selectDialect');
var $finalSpan = $('#finalSpan');
var $interimSpan = $('#interimSpan');
var $info = $('#info');
var $copyInfo = $('#copyInfo');
var $copyButton = $('#copyButton');

for (var i = 0; i < langs.length; i++) {
    $selectLanguage[0].options.add(new Option(langs[i][0], i));
}

var showInfo = function(s) {
    if (s) {
        $info.find('p').each(function() {
            console.log($(this).attr('id'));
            if ($(this).attr('id') === s) {
                $(this).css('display', 'inline');
            } else {
                $(this).css('display', 'none');
            }
        });
        $info.show();
    } else {
        $info.hide();
    }
};

var upgrade = function() {
    $startButton.show();
    showInfo('infoUpgrade');
};

var updateCountry = function() {
    for (var i = $selectDialect[0].options.length - 1; i >= 0; i--) {
        $selectDialect[0].remove(i);
    }
    var list = langs[$selectLanguage[0].selectedIndex];
    for (i = 1; i < list.length; i++) {
        $selectDialect[0].options.add(new Option(list[i][1], list[i][0]));
    }
    if (list[1].length === 1) {
        $selectDialect.hide();
    } else {
        $selectDialect.show();
    }
};

$selectLanguage[0].selectedIndex = 18;
updateCountry();
$selectDialect[0].selectedIndex = 0;
showInfo('infoStart');

var finalTranscript = '';
var recognizing = false;
var ignoreOnend;
var startTimestamp;
var recognition;

var twoLine = /\n\n/g;
var oneLine = /\n/g;


var linebreak = function(s) {
    return s.replace(twoLine, '<p></p>').replace(oneLine, '<br>');
};

var firstChar = /\S/;
var capitalize = function(s) {
    return s.replace(firstChar, function(m) {
        return m.toUpperCase();
    });
};

var currentStyle;

var showButtons = function(style) {
    if (style === currentStyle) {
        return;
    }
    currentStyle = style;
    $copyButton.css('display', style);
    $copyInfo.hide();
};

var copyButton = function() {
    if (recognizing) {
        recognizing = false;
        recognition.stop();
    }
    $copyButton.hide();
    $copyInfo.css('display', 'inline-block');
    showInfo('');
};

var startButton = function(event) {
    if (recognizing) {
        recognition.stop();
        return;
    }
    finalTranscript = '';
    recognition.lang = $selectDialect[0].value;
    recognition.start();
    ignoreOnend = false;
    $finalSpan.text('');
    $interimSpan.text('');
    $startImg.attr('src', 'images/mic-slash.gif');
    showInfo('infoAllow');
    showButtons('none');
    startTimestamp = event.timeStamp;
};

if (!('webkitSpeechRecognition' in window)) {
    upgrade();
} else {
    $startButton.show();
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        recognizing = true;
        showInfo('infoSpeakNow');
        $startImg.attr('src', 'images/mic-animate.gif');
    };

    recognition.onerror = function(event) {
        if (event.error === 'no-speech') {
            $startImg.attr('src', 'images/mic.gif');
            showInfo('infoNoSpeech');
            ignoreOnend = true;
        }
        if (event.error === 'audio-capture') {
            $startImg.attr('src', 'images/mic.gif');
            showInfo('infoNoMicrophone');
            ignoreOnend = true;
        }
        if (event.error === 'not-allowed') {
            if (event.timeStamp - startTimestamp < 100) {
                showInfo('infoBlocked');
            } else {
                showInfo('infoDenied');
            }
            ignoreOnend = true;
        }
    };

    recognition.onend = function() {
        recognizing = false;
        if (ignoreOnend) {
            return;
        }

        $startImg.attr('src', 'images/mic.gif');
        if (!finalTranscript) {
            showInfo('infoStartfo');
            return;
        }
        showInfo('');
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
            var range = document.createRange();
            range.selectNode(document.getElementById('finalSpan'));
            window.getSelection().addRange(range);
        }
    };

    recognition.onresult = function(event) {
        var interimTransscript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTransscript += event.results[i][0].transcript;
            }
        }
        finalTranscript = capitalize(finalTranscript);
        $finalSpan.text(linebreak(finalTranscript));
        $interimSpan.text(linebreak(interimTransscript));
        sendToMoses(finalTranscript);
        if (finalTranscript || interimTransscript) {
            showButtons('inline-block');
        }
    };
}

$startButton.click(startButton);
$copyButton.click(copyButton);
$selectLanguage.change(updateCountry);
