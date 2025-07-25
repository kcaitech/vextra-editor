[kcdesign-editor - v1.0.0](../README.md) / [Exports](../modules.md) / DragKit

# Class: DragKit

**`Description`**

主键拖拽集成工具

## Table of contents

### Constructors

- [constructor](DragKit.md#constructor)

### Accessors

- [isDragging](DragKit.md#isdragging)

### Methods

- [start](DragKit.md#start)

## Constructors

### constructor

• **new DragKit**(`options`): [`DragKit`](DragKit.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `options` | `Object` |
| `options.commit?` | `Function` |
| `options.down?` | `Function` |
| `options.move?` | `Function` |
| `options.stop?` | `boolean` |

#### Returns

[`DragKit`](DragKit.md)

## Accessors

### isDragging

• `get` **isDragging**(): `boolean`

#### Returns

`boolean`

## Methods

### start

▸ **start**(`event`, `params?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `MouseEvent` |
| `params?` | `Object` |
| `params.x?` | `number` |
| `params.y?` | `number` |

#### Returns

`void`
