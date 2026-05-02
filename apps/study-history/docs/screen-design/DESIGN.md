# 勉強記録アプリ - デザインシステム（DESIGN.md）

## 1. デザインコンセプト

**Classic × Modern × Simple**

落ち着いたモノトーン（黒・白・グレー）をベースに、アクセントとして紫を差し込む構成。装飾は最小限に抑え、余白・タイポグラフィ・コントラストで情報の階層を作る。長時間学習を記録するアプリとして、目に優しく、集中を妨げないトーンを目指す。

### デザイン原則

1. **Quiet by default** — 通常時は無彩色中心。色はユーザーの操作・状態変化を伝えるためにだけ使う
2. **One accent** — アクセントカラーは紫一色。多色化しない
3. **Content first** — 学習時間・グラフが主役。UI は脇役
4. **Consistent rhythm** — 余白・角丸・シャドウは一貫したスケールを使う

---

## 2. カラーパレット

### 2.1 ベース（モノトーン）

| トークン | Light Mode | Dark Mode | 用途 |
|---|---|---|---|
| `--color-bg` | `#FFFFFF` | `#0E0E11` | 画面背景 |
| `--color-surface` | `#FAFAFA` | `#16161B` | カード・パネル背景 |
| `--color-surface-alt` | `#F2F2F4` | `#1E1E25` | ホバー・セカンダリ面 |
| `--color-border` | `#E5E5EA` | `#2A2A33` | 区切り線・枠線 |
| `--color-text` | `#0E0E11` | `#F5F5F7` | 本文・見出し |
| `--color-text-muted` | `#6B6B74` | `#9A9AA3` | 補助テキスト |
| `--color-text-subtle` | `#9A9AA3` | `#6B6B74` | プレースホルダー |

### 2.2 アクセント（紫）

クラシックな深みのある紫を採用。鮮やかすぎないトーンで、長時間見ても疲れにくい色域。

| トークン | 値 | 用途 |
|---|---|---|
| `--color-accent-50` | `#F5F2FA` | アクセント背景（最薄） |
| `--color-accent-100` | `#E8E0F4` | バッジ背景・選択中ハイライト |
| `--color-accent-300` | `#B49CD9` | ホバー時の補助色 |
| `--color-accent-500` | `#6B4FBB` | **プライマリ**（ボタン・リンク・アクティブ状態） |
| `--color-accent-700` | `#4B358A` | プライマリホバー |
| `--color-accent-900` | `#2E1F5A` | テキスト on アクセント背景 |

### 2.3 セマンティック

| トークン | 値 | 用途 |
|---|---|---|
| `--color-success` | `#3B7A57` | 保存完了・目標達成 |
| `--color-warning` | `#B8860B` | 離脱警告・注意 |
| `--color-danger` | `#A23B3B` | 削除・破棄 |
| `--color-info` | `--color-accent-500` | 情報（紫を流用） |

### 2.4 使用比率の目安（60-30-10）

- **60%** ベース（白／黒・グレー）
- **30%** サーフェス・テキスト
- **10%** アクセント紫（CTA・アクティブ状態・グラフのキー値）

---

## 3. タイポグラフィ

### 3.1 フォントファミリー

```css
--font-sans: "Inter", "Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-serif: "Cormorant Garamond", "Noto Serif JP", Georgia, serif; /* 見出しでクラシック感を出したい場面のみ */
--font-mono: "JetBrains Mono", "SF Mono", Menlo, monospace; /* タイマー表示専用 */
```

### 3.2 スケール（モバイル基準 / `rem`）

| トークン | サイズ | 行間 | 用途 |
|---|---|---|---|
| `--text-xs` | 0.75rem (12px) | 1.5 | キャプション |
| `--text-sm` | 0.875rem (14px) | 1.5 | 補助テキスト |
| `--text-base` | 1rem (16px) | 1.6 | 本文 |
| `--text-lg` | 1.125rem (18px) | 1.5 | サブ見出し |
| `--text-xl` | 1.5rem (24px) | 1.4 | 画面タイトル |
| `--text-2xl` | 2rem (32px) | 1.3 | セクション見出し |
| `--text-timer` | 4.5rem (72px) | 1 | 計測画面のタイマー（mono、tabular-nums） |

### 3.3 ウェイト

- 400 Regular（本文）
- 500 Medium（ラベル・ボタン）
- 600 SemiBold（見出し）
- 700 Bold（強調・タイマー）

---

## 4. スペーシング

4px ベースのスケール。

| トークン | 値 |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 24px |
| `--space-6` | 32px |
| `--space-8` | 48px |
| `--space-10` | 64px |
| `--space-12` | 96px |

- カード内パディング：`--space-5`（24px）
- セクション間余白：`--space-8` 〜 `--space-10`
- 画面左右パディング：モバイル `--space-4`、デスクトップ `--space-6`

---

## 5. 角丸・ボーダー・シャドウ

### 5.1 Radius

| トークン | 値 | 用途 |
|---|---|---|
| `--radius-sm` | 6px | バッジ・小さなボタン |
| `--radius-md` | 10px | 入力欄・標準ボタン |
| `--radius-lg` | 16px | カード・モーダル |
| `--radius-full` | 9999px | アバター・丸ボタン |

### 5.2 Border

- 標準：`1px solid var(--color-border)`
- フォーカスリング：`2px solid var(--color-accent-500)` + `outline-offset: 2px`

### 5.3 Shadow（控えめに）

| トークン | 値 |
|---|---|
| `--shadow-sm` | `0 1px 2px rgba(14, 14, 17, 0.04)` |
| `--shadow-md` | `0 4px 12px rgba(14, 14, 17, 0.06)` |
| `--shadow-lg` | `0 12px 32px rgba(14, 14, 17, 0.10)` |

ダークモードでは透明度を上げ、`rgba(0, 0, 0, 0.4)` 程度に調整。

---

## 6. コンポーネント指針

### 6.1 ボタン

| Variant | 背景 | テキスト | 用途 |
|---|---|---|---|
| **Primary** | `--color-accent-500` | `#FFFFFF` | 「勉強をスタート」「保存」など主要CTA |
| **Secondary** | `--color-surface-alt` | `--color-text` | キャンセル・戻る |
| **Ghost** | `transparent` | `--color-text` | メニュー・テキストリンク的用途 |
| **Danger** | `transparent` + border `--color-danger` | `--color-danger` | 削除・破棄 |

- 高さ：標準 44px（タップ領域確保）、小 36px
- パディング：横 `--space-5`
- 角丸：`--radius-md`
- ホバー：背景を一段暗く（accent-700 など）
- アクティブ：`transform: scale(0.98)`

### 6.2 入力欄（Input / Select）

- 高さ 44px、`--radius-md`、`1px` ボーダー
- フォーカス時のみアクセント紫のリングを表示
- プレースホルダーは `--color-text-subtle`

### 6.3 カード

- 背景：`--color-surface`
- ボーダー：`1px solid --color-border`（シャドウは原則使わず、線で区切る "クラシック" な構成）
- 角丸：`--radius-lg`
- パディング：`--space-5`

### 6.4 タイマー表示（SCR-03）

- フォント：`--font-mono`、`font-variant-numeric: tabular-nums`
- サイズ：`--text-timer`（72px、デスクトップでは96px）
- 色：`--color-text`（紫は使わず、無彩色で集中させる）
- 休憩中は `--color-text-muted` に落とし、紫のドットを点滅させて状態を示す

### 6.5 バッジ（カテゴリ）

- 背景：`--color-accent-100`、文字：`--color-accent-900`
- 角丸：`--radius-full`
- パディング：`2px 10px`、`--text-xs`
- 複数選択時に並ぶため、`gap: --space-2`

### 6.6 ダイアログ（SCR-10 離脱警告）

- 背景オーバーレイ：`rgba(14, 14, 17, 0.5)`
- 本体：`--color-surface`、`--radius-lg`、`--shadow-lg`
- 警告アイコンは `--color-warning`、CTA は Danger ボタン

### 6.7 グラフ（SCR-07 ダッシュボード）

- 主役色：`--color-accent-500`
- 副色：`--color-accent-300`、`--color-text-muted`
- カテゴリ別に色分けが必要な円グラフでは、紫を基準に明度違いで展開（多色パレットは作らない）：
  - `#6B4FBB` / `#8A6FD1` / `#B49CD9` / `#D4C5EC` / `#5A4099` / `#3F2A7A`
- グリッド線：`--color-border`、ラベル：`--color-text-muted`

---

## 7. レイアウト

### 7.1 ブレークポイント

| 名前 | 幅 |
|---|---|
| `sm` | 〜 640px（モバイル） |
| `md` | 641 〜 1024px（タブレット） |
| `lg` | 1025px 〜（デスクトップ） |

### 7.2 コンテナ最大幅

- 一覧・ダッシュボード：`max-width: 1120px`、中央寄せ
- 計測画面：`max-width: 560px`、中央寄せ（集中させる）

### 7.3 ナビゲーション

- モバイル：下部タブバー（ホーム / 記録 / ダッシュボード / 設定）
- デスクトップ：左サイドバー or 上部ヘッダー（Phase 1 ではヘッダーで十分）

---

## 8. ダークモード

- `prefers-color-scheme` を初期値とし、ユーザーが手動切替できるトグルを設定画面に置く
- カラー定義は CSS Custom Property で `[data-theme="dark"]` セレクタに上書き
- アクセント紫はダークモードでも同じ値を使用（コントラスト比 4.5:1 を満たすことを確認済み）

---

## 9. アクセシビリティ

- 本文テキストのコントラスト比 **4.5:1 以上**、大きい見出しは **3:1 以上**
- フォーカスインジケータを必ず可視化（`outline` を消さない）
- タップ領域 **44×44px 以上**
- アイコンのみのボタンには `aria-label` を付与
- アニメーションは `prefers-reduced-motion` を尊重

---

## 10. モーション

- 標準トランジション：`150ms cubic-bezier(0.4, 0, 0.2, 1)`
- ページ遷移：`200ms` のフェード
- タイマーの数字更新：トランジションなし（カクつき防止）
- 過剰なアニメーションは避け、状態変化を伝える最小限に留める

---

## 11. アイコン

- ライブラリ：**Lucide** または **Phosphor Icons**（線が細くクラシックな印象）
- サイズ：16 / 20 / 24px
- 色：`currentColor` を継承
- 線の太さ：1.5px で統一

---

## 12. デザイントークン定義例（CSS）

```css
:root {
  /* Color - Base */
  --color-bg: #FFFFFF;
  --color-surface: #FAFAFA;
  --color-surface-alt: #F2F2F4;
  --color-border: #E5E5EA;
  --color-text: #0E0E11;
  --color-text-muted: #6B6B74;
  --color-text-subtle: #9A9AA3;

  /* Color - Accent (Purple) */
  --color-accent-50: #F5F2FA;
  --color-accent-100: #E8E0F4;
  --color-accent-300: #B49CD9;
  --color-accent-500: #6B4FBB;
  --color-accent-700: #4B358A;
  --color-accent-900: #2E1F5A;

  /* Color - Semantic */
  --color-success: #3B7A57;
  --color-warning: #B8860B;
  --color-danger: #A23B3B;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px;
  --space-8: 48px; --space-10: 64px; --space-12: 96px;

  /* Radius */
  --radius-sm: 6px; --radius-md: 10px;
  --radius-lg: 16px; --radius-full: 9999px;

  /* Shadow */
  --shadow-sm: 0 1px 2px rgba(14, 14, 17, 0.04);
  --shadow-md: 0 4px 12px rgba(14, 14, 17, 0.06);
  --shadow-lg: 0 12px 32px rgba(14, 14, 17, 0.10);

  /* Typography */
  --font-sans: "Inter", "Noto Sans JP", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", Menlo, monospace;
}

[data-theme="dark"] {
  --color-bg: #0E0E11;
  --color-surface: #16161B;
  --color-surface-alt: #1E1E25;
  --color-border: #2A2A33;
  --color-text: #F5F5F7;
  --color-text-muted: #9A9AA3;
  --color-text-subtle: #6B6B74;
}
```

---

## 13. 画面別アクセント適用方針

| 画面 | 紫の使い所 |
|---|---|
| SCR-01 ホーム | 「勉強をスタート」CTA のみ |
| SCR-02 計測準備 | 選択中カテゴリのバッジ／開始ボタン |
| SCR-03 計測画面 | 休憩中インジケータの点滅ドット／終了ボタン |
| SCR-04 記録確認 | 達成度の選択中状態／保存ボタン |
| SCR-05 一覧 | 該当行のホバーハイライト |
| SCR-06 編集 | 保存ボタン |
| SCR-07 ダッシュボード | グラフのキー値・期間切替のアクティブタブ |
| SCR-08 カテゴリ管理 | 追加ボタン |
| SCR-09 目標設定 | 進捗バー（達成率） |
| SCR-10 離脱警告 | 使用しない（警告色のみ） |
