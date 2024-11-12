/**
 * @fileoverview 
 * @author SNC
 * @version 1.0.0
 * @customer 
 */

(function($, nokConfig, sncLib) {
  'use strict';

  const config = nokConfig.mitsumori.fields;
  const kishukeimasutaAppId = nokConfig.kishukeimasuta.app;
  const kishukeimasutaConfig = nokConfig.kishukeimasuta.fields;

  // アプリのレコードを分割して取得する関数
  function fetchAllRecords(appId) {
    const allRecords = [];
    const limit = 500; // kintone の一度に取得できる最大レコード数
    const query = '';
    let hasMoreRecords = true;
    let offset = 0;

    return new Promise((resolve, reject) => {
      function fetchRecords() {
        sncLib.kintone.rest.getAllRecords(appId, query, offset, limit).then(resp => {
          // 取得したレコードを allRecords に結合する
          allRecords.push(...resp);

          // オフセットを更新し、次のレコードを取得
          offset += limit;

          // 取得したレコード数が limit 未満の場合、これ以上レコードがないことを示す
          if (resp.length < limit) {
            hasMoreRecords = false;
          }

          if (hasMoreRecords) {
            fetchRecords(); // まだレコードがあれば次のリクエストを実行
          } else {
            resolve(allRecords); // 全レコードを取得完了後、resolve
          }
        })
        .catch(error => {
          console.error('レコード取得中にエラーが発生しました:', error);
          reject(); // エラー発生時に reject
        });
      };
      // レコードの取得を開始
      fetchRecords(); 
    });
  };

  // 期間内のフィールドを更新するかどうかを判断する
  function shouldUpdatePeriodFields(record, dateField, startDate, endDate) {
    const dateValue = record[dateField].value;
    let haveToUpdate = false;
    let haveToClear = false;

    //予定日がない場合はクリアする
    if(dateValue === '' || dateValue === null || dateValue === 'undefined' || isNaN(Date.parse(dateValue))){
      haveToClear = true;
    }
    //予定日がある場合には期間内かをチェックする
    else if (dateValue !== 'undefined' && dateValue !== null && !isNaN(Date.parse(dateValue))) {
      if ((dateValue >= startDate && dateValue <= endDate) || dateValue === '') {
        haveToUpdate = true;
      }
    }
    //非更新対象
    else{
      haveToUpdate = false;
    }
    return { haveToUpdate, haveToClear };
  };
  

  //　フィールドを非表示にする
  kintone.events.on([
    'app.record.create.show',
    'app.record.edit.show',
    'app.record.index.edit.show',
    'app.record.index.show',
    'app.record.detail.show',
    'app.record.print.show'
  ], function(event) {
      // フィールドの表示/非表示設定
      sncLib.nok.util.setAppFieldsShown(config);
      return event;
  });

  // レコード作成または編集時にトリガーされるイベント
  kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'], function(event) {
    const record = event.record;

    return fetchAllRecords(kishukeimasutaAppId)
    .then(periodRecords => {
      // アプリのすべてのレコードを繰り返し、受注/売上予定日が期始と期終の間にあるかをチェック
      for (let j = 0; j < periodRecords.length; j++) {
          // 期を取得する
          const period = periodRecords[j][kishukeimasutaConfig.ki.code].value;
          // 期の開始日と終了日を取得する
          const startDate = periodRecords[j][kishukeimasutaConfig.kiStart.code].value;
          const endDate = periodRecords[j][kishukeimasutaConfig.kiEnd.code].value;
          // 期の集計開始日と集計終了日を取得する
          const periodStart = periodRecords[j][kishukeimasutaConfig.shukeiStart.code].value;
          const periodEnd = periodRecords[j][kishukeimasutaConfig.shukeiEnd.code].value;

          // 受注予定日を更新するかどうかを判断する
          const jyuchuyoteibiResult = shouldUpdatePeriodFields(record, 'cf_受注日', startDate, endDate);
          if (jyuchuyoteibiResult.haveToUpdate) {
            // 受注予定日を更新する
            record[config.kiJuchu.code].value = period;
            record[config.shukeiStartJuchu.code].value = periodStart;
            record[config.shukeiEndJuchu.code].value = periodEnd;
          } else if (jyuchuyoteibiResult.haveToClear) {
            // 受注予定日をクリアする
            record[config.kiJuchu.code].value = '';
            record[config.shukeiStartJuchu.code].value = '';
            record[config.shukeiEndJuchu.code].value = '';
          }

          // 売上予定日を更新するかどうかを判断する
          const uriageyoteibiResult = shouldUpdatePeriodFields(record, 'nok_売上予定日', startDate, endDate);
          if (uriageyoteibiResult.haveToUpdate) {
            // 売上予定日を更新する
            record[config.kiUriage.code].value = period;
            record[config.shukeiStartUriage.code].value = periodStart;
            record[config.shukeiEndUriage.code].value = periodEnd;
          } else if (uriageyoteibiResult.haveToClear) {
            // 売上予定日をクリアする
            record[config.kiUriage.code].value = '';
            record[config.shukeiStartUriage.code].value = '';
            record[config.shukeiEndUriage.code].value = '';
          }
        };
        return event; // イベント処理を終了するために event を返す
    })
    .catch(error => {
      // エラーが発生した場合の処理
      console.error('エラーが発生しました:', error);
      Swal.fire({
        title: 'Error',
        html: '見積管理の保存処理に失敗しました。\n処理を中断しますため、再度実行してください。', // 処理エラー時のメッセージ,
        icon: 'error'
      });
      return false;
    });
  });
})(jQuery, window.nokConfig, window.snc)
