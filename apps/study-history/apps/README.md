# 勉強記録アプリ

React + TypeScript + Vite + Dexie.js (IndexedDB) で実装する個人用学習記録アプリ。

## 起動

ローカルにNode/npmをインストールせず、Dockerで起動します。

```sh
cd docker
docker compose up
```

ブラウザで http://localhost:5173 を開く。

初回起動は `node_modules` のインストールに数分かかります。

## ディレクトリ構成

```
apps/
├── docker/                  Dockerfile / docker-compose.yml
├── src/
│   ├── components/          共通UIコンポーネント
│   ├── db/                  Dexie定義・型・クエリ
│   ├── lib/                 時刻ユーティリティ等
│   ├── pages/               画面コンポーネント (SCR-01〜)
│   ├── styles/              トークンCSS・グローバルCSS
│   ├── App.tsx              ルーティング
│   └── main.tsx             エントリ
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 実装状況

| 画面ID | 画面名 | 状態 |
|---|---|---|
| SCR-01 | スタート画面 | ✅ |
| SCR-02 | 計測準備 | ✅ |
| SCR-03 | 計測画面 | ✅ |
| SCR-04 | 計測終了・記録確認 | ✅ |
| SCR-05 | 学習記録一覧 | ✅ |
| SCR-06 | 学習記録 編集 | ✅ |
| SCR-07 | ダッシュボード | ✅ |
| SCR-08 | カテゴリ管理 | ✅ |
| SCR-09 | 目標設定 | ✅ |
| SCR-10 | 離脱警告ダイアログ | ✅ (Timer内に統合) |
