const USER = 'USER';
const COMPUTER = 'COMPUTER';
const symbols = ['X', '0'];
const players = [USER, COMPUTER];

let adsLoaded = false;

// по индексу комбинации (начиная с 0)
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

let computerSymbol
let userSymbol;

// достаем поле и клетки
const fieldEl = document.querySelector('#field');
const cells = document.querySelectorAll('.cell');

// достаем все, что нам нужно из модального окна
const choiceModal = document.querySelector('#choice-modal');
const choiceModalText = choiceModal.querySelector('#modal-text');
const modalButtons = choiceModal.querySelectorAll('.button');

// достаем все что нам нужно из блока рекламы
const adEl = document.querySelector('#ad');
const adVideoEl = adEl.querySelector('#video-element');
const skipAdBtn = adEl.querySelector('#skip-ad');
const adContainer = adEl.querySelector('#ad-container');
let adDisplayContainer;
let adsLoader;
let adsManager;

// создаем массив в котором мы будем хранить все значения
let cellsArray = new Array(9);

// функция которая средиректит пользователя при отказе продолжить игру (прикольно будет вставить ссылку на твой гитхаб/резюме)
const redirectUser = (url = 'https://google.com') => window.location = url;

// проверка открыта ли реклама
const isAdOpened = () => !adEl.classList.contains('hidden');

// отображаем рекламный блок
const showAd = () => {
  adEl.classList.remove('hidden'); // убираем скрывающий класс
  adVideoEl.play(); // запускаем видео сразу
};

// закрываем рекламный блок
const closeAd = () => {
  adEl.classList.add('hidden'); // добавляем ему скрывающий класс
  adVideoEl.pause(); // ставим на паузу
  adVideoEl.currentTime = 0; // сбрасываем время
  startGame();
}

// проверка открыта ли модалка
const isChoiceModalOpened = () => !choiceModal.classList.contains('hidden');

// открываем модалку
const openChoiceModal = (text = '') => {
  if (text) choiceModalText.textContent = text; // если текст передается, то подставляем
  fieldEl.classList.add('disabled'); // делаем игровое поле полупрозрачным, как бы выключенным
  choiceModal.classList.remove('hidden'); // показываем модалку
};

// закрываем модалку
const closeChoiceModal = () => choiceModal.classList.add('hidden');

// сброс поля
const resetField = () => {
  cells.forEach((cell) => {
    cell.textContent = ''; // во всех ячейках убираем символы
    cell.classList.remove('active'); // убираем класс у выбранной ячейки
  });
  cellsArray = new Array(9); // обновляем наш массив, где храним все символы
};

// проверка окончания игры
const checkEnd = () => {
  let xIndexes = [];
  let oIndexes = [];
  for (let i = 0; i < cellsArray.length; i++) {
    if (cellsArray[i] === 'X') xIndexes.push(i);
    if (cellsArray[i] === '0') oIndexes.push(i);
  } // получаем массивы с индексами крестиков и ноликов
  let winnerSymbol;
  for (winComb of winningCombinations) { // перебираем все выигрышные комбинации
    if (winComb.every(cellIndex => xIndexes.indexOf(cellIndex) !== -1)) { // проверяем чтобы все индексы из выигрышной комбинации присутствовали в текущих индексах крестиков
      winnerSymbol = 'X'; // если все есть то побеждает Х
      break; // прерываем цикл
    } else if (winComb.every(cellIndex => oIndexes.indexOf(cellIndex) !== -1)) { // та же проверка для ноликов. Происходит если крестики не выиграли
      winnerSymbol = '0'; // если все есть то побеждает 0
      break; // прерываем цикл
    }
  };
  if (winnerSymbol) { // если есть символ победителя
    openChoiceModal(`You ${winnerSymbol === computerSymbol ? 'win' : 'lose'}! Wanna try again?`); // открываем модалку новой игры с текстом
  } else if (!cellsArray.includes(undefined)) openChoiceModal('Draw. Wanna Try again?'); // если никто не выиграл, но все поле заполнено, то показываем модалку ничьи
  return winnerSymbol;
}

// шаг компьютера
const computerStep = () => {
  if (!cellsArray.includes(undefined)) return; // проверяем, если все поле заполнено, то компьютер не будет ходить
  const randomIndex = Math.floor(Math.random() * cells.length); // выбираем случайный индекс
  if (cellsArray[randomIndex]) computerStep(); // если клетка с таким индексом уже занята, то переделываем
  else { // если клетка пустая
    cells[randomIndex].textContent = computerSymbol; // то подставляем в нее символ компьютера
    cellsArray[randomIndex] = computerSymbol; // и обновляем наш массив
    checkEnd(); // проверяем не выиграл ли компьютер / или ничья
  }
};

// начало игры
const startGame = () => {
  const firstTurn = players[Math.floor(Math.random() * players.length)];
  computerSymbol = symbols[firstTurn === COMPUTER ? 0 : 1]; // получаем символы, которыми ходят компьютер и пользователь
  userSymbol = symbols[firstTurn === USER ? 0 : 1];
  fieldEl.classList.remove('disabled'); // делаем поле "активным" (убираем прозрачность)
  resetField(); // сбрасываем поле
  if (firstTurn === COMPUTER) computerStep(); // если первый ход компьютера, то он ходит
  cells[0].classList.add('active'); // выставляем первую клетку активной
};

// ищем активный элемент по переданному массиву
const findActiveElement = (elementsArray) => elementsArray.find((el) => el.classList.contains('active'));

// на сабмит модалки событие (Энтер нажали)
const onModalSubmit = () => {
  const activeButtonValue = findActiveElement([...modalButtons]).value; // получаем значение кнопки, на которую нажали
  if (activeButtonValue === 'yes') { // если это кнопка "Да"
    closeChoiceModal(); // закрываем модалку
    showAd(); // показываем рекламу
  } else redirectUser(); // если пользователь отказался, то редиректим
};

// на сабмит какой-то ячеки (ход пользователя)
const onCellSubmit = () => {
  const submittedIndex = [...cells].findIndex(cell => cell.classList.contains('active')); // ищем индекс активной ячейки
  if (!cellsArray[submittedIndex]) { // если в нашем массиве со значениями такого нет
    cellsArray[submittedIndex] = userSymbol; // вставляем в наш массив символ пользователя
    cells[submittedIndex].textContent = userSymbol;// вставляем в ячейку символ пользователя
    const result = checkEnd(); // проверяем не выиграл ли пользователь
    if (!result) computerStep(); // если не выиграл, то ходит компьютер
  } else { // если клетка уже занята (в массиве есть значение)
    cells[submittedIndex].classList.add('error'); // добавляем класс ошибки (красная подсветка)
    setTimeout(() => cells[submittedIndex].classList.remove('error'), 500); // убираем ее через полсекунды
  }
};

// меняем активный элемент
const changeActiveElement = (key, arrayOfElements) => {
  const indexOfActive = arrayOfElements.findIndex((element) => element.classList.contains('active')); // получаем индекс активного элемента
  if (indexOfActive === -1) return; // если активного элемента нет, прерываем
  arrayOfElements[indexOfActive].classList.remove('active'); // убираем "активный" класс
  switch (key) { // смотрим какое событие произошло
    case 'ArrowLeft': // если левая стрелка, то делаем активным предыдущий эл-т по индексу в массиве (а если это был нулевой, то перемещаем в конец)
      if (indexOfActive - 1 < 0) {
        arrayOfElements[arrayOfElements.length + (indexOfActive - 1)].classList.add('active');
      } else {
        arrayOfElements[indexOfActive - 1].classList.add('active');
      }
      break;
    case 'ArrowRight': // на правую стрелку делаем активным следующий эл-т массива, а если был последним, то сделаем активным первый
      arrayOfElements[(indexOfActive + 1) % arrayOfElements.length].classList.add('active');
      break;
    case 'ArrowUp': // на стрелку вверх принцип тот же только сразу на 3 индекса передвигаем
      if (indexOfActive - 3 < 0) {
        arrayOfElements[arrayOfElements.length + (indexOfActive - 3)].classList.add('active');
      } else {
        arrayOfElements[indexOfActive - 3].classList.add('active');
      }
      break;
    case 'ArrowDown': // на стрелку вниз принцип тот же только сразу на 3 индекса передвигаем
      arrayOfElements[(indexOfActive + 3) % arrayOfElements.length].classList.add('active');
      break;
  }
};

// отлавливаем события модалки
const modalEventListener = (e) => {
  if (!['ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) return; // слушаем только стрелки влево вправо и энтер
  if (e.key === 'Enter') onModalSubmit(); // если энтер, то вызываем функцию сабмита модалки
  else changeActiveElement(e.key, [...modalButtons]); // иначе (стрелки влево вправо) - переключаем активный элемент
};

// отлавливаем события рекламы
const adEventListener = (e) => {
  if (e.key !== 'Escape') return; // слушаем только эскейп
  closeAd(); // закрываем рекламу
}

// отлавливаем события поля
const fieldEventListener = (e) => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) return; // слушаем все стрелки и энтер
  if (e.key === 'Enter') onCellSubmit(); // если энтер, то воспринимаем, как ход пользователя
  else changeActiveElement(e.key, [...cells]); // иначе (стрелки) - меняем активный элемент
};

document.onkeyup = (e) => { // слушаем клики по клавиатуре
  if (isChoiceModalOpened()) modalEventListener(e); // если открыта модалка, то обработчик модалки ставим
  else if (isAdOpened()) adEventListener(e); // если открыта реклама, то обрабатываем как рекламу
  else fieldEventListener(e); // иначе воспринимаем как события по полю и подрубаем тот обработчик
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
  if (adsLoaded) return; // запрещаем загрузку рекламы, если она уже загружена
  adsLoaded = true; // проставлем флаг, что реклама загружена
  e.preventDefault(); // предотвращаем включение видео дефолтное

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
