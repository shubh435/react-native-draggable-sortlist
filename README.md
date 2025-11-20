## @shubh435/react-native-draggable-sortlist

Draggable, reorderable image grid for React Native. This repo also contains the example app under `App.tsx`.

### Install (after publishing)

```bash
npm install @shubh435/react-native-draggable-sortlist
# or
yarn add @shubh435/react-native-draggable-sortlist
```

### Usage

```tsx
import {
  DraggableImageGrid,
  DraggableImage,
} from '@shubh435/react-native-draggable-sortlist';

const images: DraggableImage[] = [
  { id: '1', uri: 'https://example.com/photo-1.jpg', label: 'One' },
  { id: '2', uri: 'https://example.com/photo-2.jpg', label: 'Two' },
];

<DraggableImageGrid
  images={images}
  onOrderChange={next => console.log(next)}
  spacing={16}
/>;
```

### Build for publish

```bash
npm run build
```

This emits the compiled code and types into `lib/`. Publishing will run `npm run build` automatically because of the `prepare` script.

### Publish

```bash
npm login
npm publish --access public
```
