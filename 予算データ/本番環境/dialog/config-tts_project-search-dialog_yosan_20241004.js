/**
 * @fileoverview 単一ルックアップ検索ダイアログ 設定情報
 * @author SNC
 * @version 1.0.0
 * @customer XXXXX（2023-05-25）
 */
(function (config) {
    'use strict';
    // グローバル変数
    window.ssdConfig = window.ssdConfig || {
        dialogs: [
            // =============================
            // 1つ目のダイアログ設定
            // =============================
            {
                // ダイアログ要素生成コンテンツDIV要素ID（任意文字列、重複禁止）
                id: 'ssd_single_id_0',
                // 検索対象先AppId
                app: config.shubetsuMaster.app,
                // 検索先アプリのデータ取得フィールドコード（※ユニーク値限定）
                sourceField: 'cf_項目コード',
                // 自アプリのセット対象フィールドコード（ルックアップフィールド限定）
                targetField: 'cf_項目コード',
                // 検索ダイアログの設定
                config: {
                    title: '項目コード検索ダイアログ',     // タイトル
                    spaceId: 'project_search', // ダイアログ要素作成用のスペースId
                    maxResults: 20000,               // 最大取得件数　overSearchResultsメッセージも合わせて変更すること
                    searchOpenDialog: false,        // 検索ダイアログ表示時に検索を行うかどうか
                    // initQuery: 'cf_登録用途 in ("得意先（請求先）")',                  // 初期条件のクエリ
                    defaultCondition: 'and',         // and/orで設定　デフォルト検索条件がand検索かor検索か
                    // 検索対象フィールドの設定
                    // キーは重複禁止
                    // キー（任意）: {
                    //  label:検索項目ラベル名
                    //  code:検索対象アプリ先のフィールドコード
                    //  type: フィールドタイプ　※2022/09/12 対象フィールドタイプはテキスト、ドロップダウン、日付
                    //  val: 選択肢（ドロップダウンの場合のみ使用、使用しない場合はnull）
                    //  init: 初期設定（使用しない場合はnull） {　
                    //    code: 自アプリのフィールドコード（テキストの場合のみ使用、使用しない場合はnull）
                    //    set: 初期設定値（ドロップダウンの場合のみ使用、使用しない場合はnull）
                    //    date: 指定期間（日付の場合のみ使用、使用しない場合はnull）
                    //        （yesterday, today, tomorrow, lastWeek, week, nextWeek, lastMonth, month, nextMonth, lastYear, year, nextYear）
                    //  }
                    // }
                    searchFieldConfig: {
                        kubun: {
                            label: '区分',
                            code: 'cf_区分',
                            type: 'select',
                            val: [
                                '受注',
                                '売上',
                                '原価',
                                '売上純利益',
                                '売上純利益率',
                                '人件費',
                                '固定費',
                                '変動費',
                                '共通費',
                                '一般管理費配賦',
                                '営業利益',
                            ],
                            init: {
                                code: null,
                                set: [
                                ]
                            }
                        },
                    },
                    // 検索結果テーブルに表示されるフィールドの設定
                    // {
                    //  label:列名（任意）
                    //  code:フィールドコード
                    //  type:フィールドタイプを設定（https://developer.cybozu.io/hc/ja/articles/202166330-%E3%83%95%E3%82%A3%E3%83%BC%E3%83%AB%E3%83%89%E5%BD%A2%E5%BC%8F）
                    //  ※2021/11/19 対象外フィールドタイプは以下
                    //    FILE,SUBTABLE,REFERENCE_TABLE,CATEGORY,STATUS,STATUS_ASSIGNEE,
                    // }
                    showTableColumn: [
                        {
                            label: '項目コード',
                            code: 'cf_項目コード',
                            type: 'NUMBER',
                        },
                        {
                            label: '区分',
                            code: 'cf_区分',
                            type: 'SINGLE_LINE_TEXT',
                        },
                        {
                            label: '科目',
                            code: 'cf_科目',
                            type: 'SINGLE_LINE_TEXT',
                        },
                        {
                            label: '項目順連番',
                            code: 'cf_項目順連番',
                            type: 'NUMBER',
                        },
                    ],
                    // フッター部分に配置するオプションボタン設定
                    // 新規登録画面への遷移機能限定
                    // {
                    //  id:ボタンId（重複禁止）
                    //  appId:遷移先
                    //  label:ボタン表示名（任意）
                    //  target:他アプリ遷移後値セットフィールドコード（ルックアップフィールド限定）
                    //  source:自アプリ値参照フィールドコード
                    //  checkField:他アプリの戻り処理用チェックボックスフィールドコード
                    // }

                    optionBtn: [
                        // {
                        //     id: 'kokyaku_create_btn',
                        //     appId: config.kokyaku.app,
                        //     label: '新規得意先作成',
                        //     target: 'nok_担当者検索',
                        //     source: 'nok_担当者ID',
                        //     checkField: 'nok_営業確認'
                        // },
                    ]
                },
                // 検索ボタンの設定（ダイアログ表示用）
                btnConfig: {
                    // キー（任意）: {
                    //  spaceId:ボタン配置スペースId
                    //  id:ボタンId（重複禁止）
                    //  label:ボタン表示名（任意）
                    // }
                    searchBtn: {
                        spaceId: 'project_search',
                        id: 'projectSearch',
                        label: '項目コード検索'
                    }
                },
                // メッセージ設定
                messages: {
                    'exceedSearchResults': '検索結果が20000件を超えています。<br> 検索条件を入力して再度検索して下さい。',
                },
            },
        ],

        // =============================
        // 共通設定
        // =============================

        messages: {
            'noResult': '対象レコードが存在しません',
            'errorGetRecord': 'レコードの取得に失敗しました',
            'leaveTheScreenEndOfTheSearch': '検索終了まで画面はそのままにしてください',
        }
    }
})(window.nokConfig);
