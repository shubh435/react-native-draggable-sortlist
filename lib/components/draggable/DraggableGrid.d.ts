import React from 'react';
import { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';
export interface IdentifiableItem {
    id: string;
}
export type Positions = Record<string, number>;
export interface DraggableGridProps<T extends IdentifiableItem> {
    items: T[];
    renderItem: (params: {
        item: T;
        isActive: boolean;
    }) => React.ReactNode;
    columns?: number;
    spacing?: number;
    isDraggable?: boolean | ((item: T) => boolean);
    style?: StyleProp<ViewStyle>;
    tileStyle?: StyleProp<ViewStyle>;
    onPositionsChange?: (positions: Positions) => void;
    onOrderChange?: (items: T[]) => void;
    testIDPrefix?: string;
}
export declare function DraggableGrid<T extends IdentifiableItem>({ items, renderItem, columns, spacing, isDraggable, style, tileStyle, onPositionsChange, onOrderChange, testIDPrefix, }: DraggableGridProps<T>): React.JSX.Element;
export interface DraggableImage extends IdentifiableItem {
    uri: string;
    label?: string;
}
export interface DraggableImageGridProps extends Omit<DraggableGridProps<DraggableImage>, 'items' | 'renderItem'> {
    images: DraggableImage[];
    imageStyle?: StyleProp<ImageStyle>;
    labelStyle?: StyleProp<TextStyle>;
}
export declare function DraggableImageGrid({ images, imageStyle, labelStyle, ...gridProps }: DraggableImageGridProps): React.JSX.Element;
