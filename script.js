const USER = 'USER';
const COMPUTER = 'COMPUTER';
const symbols = ['X', '0'];
const players = [USER, COMPUTER];

let adsLoaded = false;

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8]
];

const firstTurn = players[Math.floor(Math.random() * players.length)];
const computerSymbol = symbols[firstTurn === COMPUTER ? 0 : 1];
const userSymbol = symbols[firstTurn === USER ? 0 : 1];

const fieldEl = document.querySelector('#field');
const cells = document.querySelectorAll('.cell');

const choiceModal = document.querySelector('#choice-modal');
const choiceModalText = choiceModal.querySelector('#modal-text');
const modalButtons = choiceModal.querySelectorAll('.button');

const adEl = document.querySelector('#ad');
const adVideoEl = adEl.querySelector('#video-element');
const skipAdBtn = adEl.querySelector('#skip-ad');
const adContainer = adEl.querySelector('#ad-container');
let adDisplayContainer;
let adsLoader;
let adsManager;

let cellsArray = new Array(9);

const redirectUser = (url = 'https://play.works') => window.location = url;

const isAdOpened = () => !adEl.classList.contains('hidden');

const showAd = () => {
    adEl.classList.remove('hidden');
    adVideoEl.play();

};

const closeAd = () => {
    adEl.classList.add('hidden'); 
    adVideoEl.pause(); 
    adVideoEl.currentTime = 0; 
    startGame();
}

const isChoiceModalOpened = () => !choiceModal.classList.contains('hidden');

const openChoiceModal = (text = '') => {
    if (text) choiceModalText.textContent = text; 
    fieldEl.classList.add('disabled'); 
    choiceModal.classList.remove('hidden'); 
};

const closeChoiceModal = () => choiceModal.classList.add('hidden');

const resetField = () => {
    cells.forEach((cell) => {
        cell.textContent = ''; 
        cell.classList.remove('active'); 
    });
    cellsArray = new Array(9); 
};

const checkEnd = () => {
    let xIndexes = [];
    let oIndexes = [];
    for (let i = 0; i < cellsArray.length; i++) {
        if (cellsArray[i] === 'X') xIndexes.push(i);
        if (cellsArray[i] === '0') oIndexes.push(i);
    } 
    let winnerSymbol;
    for (winComb of winningCombinations) { 
        if (winComb.every(cellIndex => xIndexes.indexOf(cellIndex) !== -1)) { 
            winnerSymbol = 'X'; 
            break; 
        } else if (winComb.every(cellIndex => oIndexes.indexOf(cellIndex) !== -1)) { 
            winnerSymbol = '0'; 
            break; 
        }
    };
    if (winnerSymbol) { 
        openChoiceModal(`You ${winnerSymbol === computerSymbol ? 'lose' : 'win'}! Wanna try again?`); 
    } else if (!cellsArray.includes(undefined)) openChoiceModal('Draw. Wanna try again?'); 
    return winnerSymbol;
}

const computerStep = () => {
    if (!cellsArray.includes(undefined)) return; 
    const randomIndex = Math.floor(Math.random() * cells.length); 
    if (cellsArray[randomIndex]) computerStep(); 
    else { 
        cells[randomIndex].textContent = computerSymbol; 
        cellsArray[randomIndex] = computerSymbol; 
        checkEnd(); 
    }
};

const startGame = () => {
    fieldEl.classList.remove('disabled'); 
    resetField(); 
    if (firstTurn === COMPUTER) computerStep(); 
    cells[0].classList.add('active');
};

const findActiveElement = (elementsArray) => elementsArray.find((el) => el.classList.contains('active'));

const onModalSubmit = () => {
    const activeButtonValue = findActiveElement([...modalButtons]).value; 
    if (activeButtonValue === 'yes') { 
        closeChoiceModal(); 
        showAd(); 
    } else redirectUser(); 
};

const onCellSubmit = () => {
    const submittedIndex = [...cells].findIndex(cell => cell.classList.contains('active'));
    if (!cellsArray[submittedIndex]) { 
        cellsArray[submittedIndex] = userSymbol; 
        cells[submittedIndex].textContent = userSymbol;
        const result = checkEnd();
        if (!result) computerStep();
    } else { 
        cells[submittedIndex].classList.add('error'); 
        setTimeout(() => cells[submittedIndex].classList.remove('error'), 500); 
    }
};

const changeActiveElement = (key, arrayOfElements) => {
    const indexOfActive = arrayOfElements.findIndex((element) => element.classList.contains('active')); 
    if (indexOfActive === -1) return; 
    arrayOfElements[indexOfActive].classList.remove('active'); 
    switch (key) { 
        case 'ArrowLeft': 
            if (indexOfActive - 1 < 0) {
                arrayOfElements[arrayOfElements.length + (indexOfActive - 1)].classList.add('active');
            } else {
                arrayOfElements[indexOfActive - 1].classList.add('active');
            }
            break;
        case 'ArrowRight': 
            arrayOfElements[(indexOfActive + 1) % arrayOfElements.length].classList.add('active');
            break;
        case 'ArrowUp': 
            if (indexOfActive - 3 < 0) {
                arrayOfElements[arrayOfElements.length + (indexOfActive - 3)].classList.add('active');
            } else {
                arrayOfElements[indexOfActive - 3].classList.add('active');
            }
            break;
        case 'ArrowDown':
            arrayOfElements[(indexOfActive + 3) % arrayOfElements.length].classList.add('active');
            break;
    }
};

const modalEventListener = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) return; 
    if (e.key === 'Enter') onModalSubmit();
    else changeActiveElement(e.key, [...modalButtons]); 
};

const adEventListener = (e) => {
    if (e.key !== 'Escape') return; 
    closeAd(); 
}

const fieldEventListener = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) return; 
    if (e.key === 'Enter') onCellSubmit();
    else changeActiveElement(e.key, [...cells]); 
};

document.onkeyup = (e) => { 
    if (isChoiceModalOpened()) modalEventListener(e); 
    else if (isAdOpened()) adEventListener(e); 
    else fieldEventListener(e); 
};


// ADS PART
const onAdError = (adErrorEvent) => {
  console.error(adErrorEvent.getError());
  if (adsManager) adsManager.destroy();
};

const onAdLoaded = (adEvent) => {
  if (!adEvent.getAd().isLinear()) adVideoEl.play();
}

const onAdsManagerLoaded = (adsManagerLoadedEvent) => {
  adsManager = adsManagerLoadedEvent.getAdsManager(adVideoEl);
  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, adVideoEl.pause);
  adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, adVideoEl.play);
  adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdLoaded);
};

const adContainerClick = () => adVideoEl.paused ? adVideoEl.play() : adVideoEl.pause();

const initializeIMA = () => {
  console.log("initializing IMA");
  adContainer.addEventListener('click', adContainerClick);
  adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, adVideoEl);
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  adsLoader.addEventListener(google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED, onAdsManagerLoaded, false);
  adsLoader.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);
  adVideoEl.addEventListener('ended', () => {
    adsLoader.contentComplete();
    console.log('video ended');
    closeAd();
  });
  let adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = 'http://localhost:8000/ads';
  adsRequest.linearAdSlotWidth = 640;
  adsRequest.linearAdSlotHeight = 360;
  adsRequest.nonLinearAdSlotWidth = 640;
  adsRequest.nonLinearAdSlotHeight = 120;
  adsLoader.requestAds(adsRequest);
};

const loadAds = (e) => {
  if (adsLoaded) return; 
  adsLoaded = true; 
  e.preventDefault(); 

  adVideoEl.load();
  adDisplayContainer.initialize();

  try {
    adsManager.init(adVideoEl.clientWidth, adVideoEl.clientHeight, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    console.log("AdsManager could not be started");
    adVideoEl.play();
  }
};

window.addEventListener('load', () => {
  initializeIMA();
  adVideoEl.addEventListener('play', (e) => {
    loadAds(e);
  });
});

window.addEventListener('resize', () => {
  if (adsManager) {
    adsManager.resize(adVideoEl.clientWidth, adVideoEl.clientHeight, google.ima.ViewMode.NORMAL);
  }
});
