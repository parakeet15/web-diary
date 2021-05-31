'use strict';

// モジュール
import * as errorHandler from './modules/error-handler.js';
import { removeAllChildren, listStyle, search, dataURLBuilder} from './modules/util.js';

// タイトル
const titleElement = document.getElementsByTagName('title')[0];

// メインコンテンツ
const titleArea = document.getElementById('title-area'),
  contentArea = document.getElementById('content-area'),
  writeDate = document.getElementById('write-date'),
  saveList = document.getElementById('save-list');

// 日記編集ツール
const editTools = {
  button: {
    create: document.getElementById('create-button'),
    save: document.getElementById('save-button'),
    delete: document.getElementById('delete-button'),
    search: document.getElementById('search-button'),
    close: document.getElementById('close-button'),
    info: document.getElementById('info-button')
  },
  li: document.getElementsByClassName('tool'),
  file: document.getElementById('file-element')
}

// 指定したキーに一致する項目をリストから取得する
saveList.getItem = function (key) {
  return this.querySelector(`[data-key="${key}"]`);
}

// リスト内を検索する
editTools.button.search.addEventListener('click', () => {
  const targets = saveList.children;
  const keyword = prompt('検索キーワードを入力してください');
  if (keyword) {
    try {
      search(targets, keyword, 'i');
      editTools.li[5].style.display = 'list-item';
    } catch (error) {
      errorHandler.search(error);
    }
  }
}, false);

// Web Diary に関する情報を表示する
editTools.button.info.addEventListener('click', () => {
  const width = 750;
  const height = 500;
  const x = (window.innerWidth / 2) - (width / 2);
  const y = (window.innerHeight / 2) - (height / 2);
  window.open(`/web-diary/information/`, null, `top=${y},left=${x},width=${width},height=${height}`);
}, false);

// ファイルのアップロード
editTools.file.addEventListener('change', handleFiles, false);

/**
 * ユーザーが選択したファイルを添付する
 * @param {Object} event Event オブジェクト
 */
function handleFiles(event) {
  const file = event.target.files[0];
  const type = file.type.split('/')[0];
  if ((1 * 1024 * 1024) <= file.size) {
    alert('1MB以下のファイルを添付できます');
    editTools.file.value = null;
    return;
  }
  switch (type) {
    case 'video':
      dataURLBuilder(file).then((url) => {
        const videoElement = document.createElement('video');
        videoElement.src = url;
        videoElement.controls = true;
        videoElement.contentEditable = false;
        contentArea.appendChild(videoElement);
      });
      break;
    case 'audio':
      dataURLBuilder(file).then((url) => {
        const audioElement = document.createElement('audio');
        audioElement.src = url;
        audioElement.controls = true;
        audioElement.contentEditable = false;
        contentArea.appendChild(audioElement);
      });
      break;
    case 'image':
      dataURLBuilder(file).then((url) => {
        const imageElement = document.createElement('img');
        imageElement.src = url;
        imageElement.contentEditable = false;
        contentArea.appendChild(imageElement);
      });
      break;
    default:
      alert('未対応の形式です');
      break;
  }
  editTools.file.value = null;
}

/**
 * ローカルストレージに記事を保存する
 * @param {String} key 保存するキーの名称
 */
function save(key) {
  const diary = {
    title: titleArea.value,
    content: contentArea.innerHTML,
    createdAt: new Date(parseInt(key.split('_')[1])).toLocaleString({ timeZone: 'Asia/Tokyo' }),
    updatedAt: new Date().toLocaleString({ timeZone: 'Asia/Tokyo' })
  };
  try {
    localStorage.setItem(key, JSON.stringify(diary));
  } catch (error) {
    errorHandler.storage(error);
    load(saveList.getItem(key) || saveList.firstElementChild);
  }
  addToList(key);
}

/**
 * 保存した日記をリストに追加する
 * @param {String} key キーの名称
 */
function addToList(key) {
  const listItem = document.createElement('li');
  const container = document.createElement('div');
  listItem.dataset.key = key;
  listItem.className = 'list-item';
  container.className = 'container';
  const videoElements = contentArea.getElementsByTagName('video');
  const imageElements = contentArea.getElementsByTagName('img');
  if (videoElements.length) {
    const video = document.createElement('video');
    video.src = videoElements[0].src;
    video.className = 'thumbnail';
    video.loop = true;
    video.muted = true;
    video.autoplay = true;
    container.appendChild(video);
  } else {
    const image = document.createElement('img');
    image.src = imageElements.length ? imageElements[0].src : './images/no-image.png';
    image.className = 'thumbnail';
    container.appendChild(image);
  }
  const title = document.createElement('h3');
  const text = document.createElement('p');
  title.className = 'list-title';
  text.className = 'list-text';
  title.innerText = titleArea.value || 'Untitled';
  text.innerText = contentArea.textContent || 'No text';
  container.appendChild(title);
  container.appendChild(text);
  const existingItem = saveList.getItem(key);
  const firstItem = saveList.firstElementChild;
  listItem.appendChild(container);
  listItem.onclick = (event) => load(event.currentTarget);
  saveList.insertBefore(listItem, existingItem || firstItem);
  if (existingItem) existingItem.remove();
  load(listItem);
}

// 新規作成
editTools.button.create.addEventListener('click', create, false);

/**
 * 新しく日記を作成する
 */
function create() {
  titleArea.value = null;
  removeAllChildren(contentArea);
  removeAllChildren(writeDate);
  save(`diary_${Date.now()}`);
}

/**
 * 引数に渡されたキーを削除する
 * @param {String} key 削除するキーの名称
 */
function remove(key) {
  localStorage.removeItem(key);
  let existingElement = saveList.getItem(key);
  let lastElement = saveList.lastElementChild;
  let previousElement = null;
  let nextElement = null;
  if (existingElement) {
    previousElement = existingElement.previousElementSibling;
    nextElement = existingElement.nextElementSibling;
    existingElement.remove();
  }
  saveList.childElementCount ? load(nextElement || previousElement || lastElement) : create();
}

/**
 * ローカルストレージから日記のデータを取得して表示する
 * @param {String} key 取得するキーの名称
 */
function output(key) {
  const diary = JSON.parse(localStorage.getItem(key));
  titleArea.value = diary.title;
  contentArea.innerHTML = diary.content;
  writeDate.textContent = diary.updatedAt === diary.createdAt ?
    `Created on ${diary.createdAt}` : `Created on ${diary.createdAt}, Updated on ${diary.updatedAt}`;
  titleElement.text = `${diary.title || 'Untitled'} | Web Diary`;
}

/**
 * 引数に指定された項目のデータを取得して操作する
 * @param {HTMLElement} listItem 
 */
function load(listItem) {
  editTools.li[5].style.display = 'none';
  listStyle(listItem, saveList.children);
  listItem.scrollIntoView({ behavior: 'smooth' });
  const key = listItem.dataset.key;
  try {
    output(key);
    editTools.button.save.onclick = () => save(key);
    editTools.button.delete.onclick = () => remove(key);
    editTools.button.close.onclick = () => {
      listStyle(listItem, saveList.children);
      editTools.li[5].style.display = 'none';
    }
  } catch (error) {
    remove(key);
    console.warn(`“${key}” のデータを取得できませんでした`, error);
  }
}

// 保存されている日記を描画する
window.addEventListener('load', (event) => {
  const items = new Array();
  for (let i = 0; i < localStorage.length; i++) {
    items.push(localStorage.key(i));
  }
  const keys = items
    .filter((item) => /diary_\d+/.test(item))
    .sort((a, b) => parseInt(a.split('_')[1]) - parseInt(b.split('_')[1]));
  if (keys.length === 0) {
    create();
    return;
  }
  keys.forEach((key) => {
    try {
      output(key);
      addToList(key);
    } catch (error) {
      remove(key);
      console.warn(`“${key}” のデータを取得できませんでした`, error);
    }
  });
  console.assert(
    keys.length === saveList.childElementCount,
    'リストの項目数が正しくありません'
  );
});

window.addEventListener('beforeunload', (event) => {
  event.preventDefault();
  event.returnValue = 'このページを離れますか？保存していない編集内容は失われます。';
});
