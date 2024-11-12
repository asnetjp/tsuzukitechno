/**
 * @fileoverview 
 * @author SNC
 * @version 1.0.0
 * @customer 
 */

(function($, nokConfig, sncLib) {
    'use strict';
  
    const config = nokConfig.genkaMikomi.fields;
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
      
    // kintone イベント：フィールドを非表示にする
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
      const table = record[config.genkaTB.code].value; // サブテーブルの全レコードを取得
  
      return fetchAllRecords(kishukeimasutaAppId)
      .then(periodRecords => {
        // サブテーブルの各行を処理開始
        for (let i = 0; i < table.length; i++) {
          const keijouMonth = table[i].value[config.genkaTB_keijotsuki.code].value; // 計上月の値を取得
  
          // フィールドに値があるか確認
          if (keijouMonth !== 'undefined' && keijouMonth !== null && keijouMonth !== '' && !isNaN(Date.parse(keijouMonth))) {
            // アプリのすべてのレコードを繰り返し、計上月が期始と期終の間にあるかをチェック
            for (let j = 0; j < periodRecords.length; j++) {
              const startDate = periodRecords[j][kishukeimasutaConfig.kiStart.code].value;
              const endDate = periodRecords[j][kishukeimasutaConfig.kiEnd.code].value;
  
              // 計上月が期始と期終の間にある場合、期の値をサブテーブルの期フィールドに設定
              if (keijouMonth >= startDate && keijouMonth <= endDate) {
                const period = periodRecords[j][kishukeimasutaConfig.ki.code].value;
                const periodStart = periodRecords[j][kishukeimasutaConfig.shukeiStart.code].value;
                const periodEnd = periodRecords[j][kishukeimasutaConfig.shukeiEnd.code].value;
  
                // サブテーブルのフィールドに値を設定
                table[i].value[config.genkaTB_ki.code].value = period;
                table[i].value[config.genkaTB_shukeiStart.code].value = periodStart;
                table[i].value[config.genkaTB_shukeiEnd.code].value = periodEnd;
                break; // 対応するレコードが見つかったらループを抜ける
              }
            }
          } else {
            // 計上月の値がない場合、サブテーブルの期フィールドをクリア
            table[i].value[config.genkaTB_ki.code].value = '';
            table[i].value[config.genkaTB_shukeiStart.code].value = '';
            table[i].value[config.genkaTB_shukeiEnd.code].value = '';
          }
        }
  
        // サブテーブルの更新後、全体のサブテーブルを event.record に戻して変更を確定
        event.record[config.genkaTB.code].value = table;
        return event; // イベント処理を終了するために event を返す
      })
      .catch(error => {
        console.error('エラーが発生しました:', error);
        Swal.fire({
          title: 'Error',
          html: '原価管理見込の保存処理に失敗しました。\n処理を中断しますため、再度実行してください。', // 処理エラー時のメッセージ
          icon: 'error'
        });
        return false;
      });
    });
  })(jQuery, window.nokConfig, window.snc);
  