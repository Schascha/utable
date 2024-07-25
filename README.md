# uTable

[![Build](https://github.com/Schascha/utable/actions/workflows/build.yml/badge.svg)](https://github.com/Schascha/utable/actions)

> Just a responsive table plugin

## Installation

```sh
npm install @schascha/utable
```

```js
import { UTable } from '@schascha/utable';

const table = new UTable('table', {
	// Options
});
```

## Configuration

| Option               | Type     | Default        | Description                             |
| -------------------- | -------- | -------------- | --------------------------------------- |
| `buttons`            | boolean  | `true`         | Enable or disable buttons               |
| `overlays`           | boolean  | `true`         | Enable or disable overlays              |
| `sticky`             | boolean  | `true`         | Enable or disable sticky observer       |
| `width`              | string   | `auto`         | Width of the table, auto or fixed       |
| `classButtonLeft`    | string   | `button-left`  | Class name for left button              |
| `classButtonRight`   | string   | `button-right` | Class name for right button             |
| `classOverlayLeft`   | string   | `scroll-left`  | Class name for left overlay             |
| `classOverlayRight`  | string   | `scroll-right` | Class name for right overlay            |
| `classScroller`      | string   | `scroller`     | Class name for scroller                 |
| `classSticky`        | string   | `is-sticky`    | Class name if table header is sticky    |
| `classTop`           | string   | `top`          | Class name for top element              |
| `classTrack`         | string   | `track`        | Class name for track element            |
| `classWrapper`       | string   | `utable`       | Class name for wrapper element          |
| `textButtonLeft`     | string   | `Left`         | Text for left button                    |
| `textButtonRight`    | string   | `Right`        | Text for right button                   |
| `titleButtonLeft`    | string   | `Scroll left`  | Title for left button                   |
| `titleButtonRight`   | string   | `Scroll right` | Title for right button                  |
| `onClickButtonLeft`  | function | -              | Callback function on left button click  |
| `onClickButtonRight` | function | -              | Callback function on right button click |
| `onScroll`           | function | -              | Callback function on scroll             |
| `onScrollend`        | function | -              | Callback function on scroll end         |

## Styles

The table is highly customizable and does not force you to embed styles. You can rewrite CSS classes or deactivate features, like buttons or overlay, via the module configuration. Just use it as you need it for your layout.

You find a example here: [utable.css](docs/utable.css)
