# React Native Draw Image

Library that allows drawing on an image/view and exporting it as a new image.

## Usage

```javascript
<Draw
    ref={el => (this.draw = el)}
    uri={imageUri}
    strokeColor={strokeColor}
    strokewidth={strokeWidth}
    exportFormat={exportFormat}
    exportQuality={exportQuality}
/>

// to export the image with the drawings as a
// single image
this.draw.export()

// undos the latest drawing made
this.draw.undo()
```

## License

React Native Draw Image is currently licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/).

## Build Automation

[![Build Status GitHub](https://github.com/BeeMargarida/react-native-draw-image/workflows/Main%20Workflow/badge.svg)](https://github.com/BeeMargarida/react-native-draw-image/actions)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://www.apache.org/licenses/)
