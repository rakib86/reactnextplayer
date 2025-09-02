````markdown
# React Vid Player

A customizable React video player component with advanced controls, keyboard shortcuts, and modern UI.

<p align="center">
  <img src="/assets/player.png" alt="React Vid Player Preview" width="800" />
</p>

## Installation

```bash
npm install reactvidplay
```
````

## Usage

```tsx
import React from "react";
import { ReactVidPlayer } from "reactvidplay";
import "reactvidplay/dist/ReactVidPlayer.css"; // Import CSS

function App() {
  return (
    <div>
      <ReactVidPlayer
        src="https://example.com/video.mp4"
        width="800px"
        height="450px"
        color="#ff0000"
      />
    </div>
  );
}

export default App;
```

## Features

- ✨ Custom video controls with modern design
- ⌨️ Keyboard shortcuts (Space, Arrow keys)
- 🔊 Volume control with slider
- 📱 Picture-in-picture support
- 🖥️ Fullscreen support
- 🎨 Customizable theme color
- 📱 Mobile responsive

## Keyboard Shortcuts

- `Space` → Play/Pause
- `←` → Skip backward 10s
- `→` → Skip forward 10s
- `↑` → Volume up
- `↓` → Volume down

## Props

| Prop         | Type             | Default   | Description                     |
| ------------ | ---------------- | --------- | ------------------------------- |
| src          | string           | required  | Video source URL                |
| controls     | boolean          | true      | Show custom controls            |
| autoplay     | boolean          | false     | Auto play video                 |
| muted        | boolean          | false     | Mute video initially            |
| loop         | boolean          | false     | Loop video                      |
| contextMenu  | boolean          | false     | Enable right-click context menu |
| poster       | string           | -         | Poster image URL                |
| width        | string \| number | '100%'    | Video width                     |
| height       | string \| number | 'auto'    | Video height                    |
| className    | string           | ''        | Additional CSS class            |
| color        | string           | '#ff0000' | Theme color for controls        |
| onPlay       | function         | -         | Called when video starts        |
| onPause      | function         | -         | Called when video pauses        |
| onTimeUpdate | function         | -         | Called on time update           |
| onEnded      | function         | -         | Called when video ends          |

## License

MIT

```
