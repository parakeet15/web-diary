'use strict';

/**
 * 検索のエラーハンドラ
 * @param {Object} error Error オブジェクト
 */
function search(error) {
  switch (error.name) {
    case 'SyntaxError':
      alert('キーワードが無効です');
      break;
    default:
      console.error(error);
      break;
  }
}

/**
 * ストレージのエラーハンドラ
 * @param {Object} error Error オブジェクト
 */
function storage(error) {
  switch (error.name) {
    case 'QuotaExceededError':
      alert('ローカルストレージの空き容量が不足しています');
      break;
    case 'SecurityError':
      console.error('操作が安全ではありません');
      break;
    default:
      console.error(error);
      break;
  }
}

export { storage, search };