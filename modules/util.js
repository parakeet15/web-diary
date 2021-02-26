'use strict';

/**
 * 指定した要素の子要素を全削除する
 * @param {HTMLElement} element 
 */
function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * リストアイテムのスタイルを設定する
 * @param {HTMLElement} selectedItem 選択したリストアイテム
 * @param {HTMLCollection} items リストアイテムの配列風オブジェクト
 */
function listStyle(selectedItem, items) {
  for (let item of items) {
    item.style.display = 'flex';
    item.style.backgroundColor = '#ffffff';
  }
  selectedItem.style.backgroundColor = '#eeeeee';
}

/**
 * 指定されたキーワードに一致したリストアイテムをリストに表示する
 * @param {HTMLCollection} targets 検索対象のリスト
 * @param {String} keyword 検索キーワード
 * @param {String} [flags] 正規表現フラグ
 */
function search(targets, keyword, flags) {
  flags = flags || 'ig';
  keyword = new RegExp(keyword.trim(), flags);
  for (let target of targets) {
    const result = keyword.test(target.textContent);
    target.style.display = result ? 'flex' : 'none';
  }
}

/**
 * ファイルのデータを base64 文字列に変換する
 * @param {Object} file File オブジェクト
 * @return {Object} Promise オブジェクト
 */
function dataURLBuilder(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', (event) => {
      resolve(event.target.result);
    }, false);
  });
}

export { removeAllChildren, listStyle, search, dataURLBuilder };