/**
 * @fileoverview
 * @author SNC
 * @version 1.0.0
 * @customer 
 */

(function($, nokConfig, sncLib) {
  'use strict';

  // 非表示にするフィールドのフィールドIDを定義
  const config = nokConfig.yosanData.fields;
  
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

})(jQuery, window.nokConfig, window.snc);
