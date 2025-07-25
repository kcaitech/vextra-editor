[kcdesign-editor - v1.0.0](../README.md) / [Exports](../modules.md) / IScout

# Interface: IScout

## Table of contents

### Properties

- [isPointInPath](IScout.md#ispointinpath)
- [isPointInShape](IScout.md#ispointinshape)
- [isPointInShape2](IScout.md#ispointinshape2)
- [isPointInStroke](IScout.md#ispointinstroke)
- [isPointInStrokeByWidth](IScout.md#ispointinstrokebywidth)
- [path](IScout.md#path)
- [remove](IScout.md#remove)

### Methods

- [isPointInShapeForPreview](IScout.md#ispointinshapeforpreview)

## Properties

### isPointInPath

• **isPointInPath**: (`d`: `string`, `point`: \{ `x`: `number` ; `y`: `number`  }) => `boolean`

#### Type declaration

▸ (`d`, `point`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `string` |
| `point` | `Object` |
| `point.x` | `number` |
| `point.y` | `number` |

##### Returns

`boolean`

___

### isPointInShape

• **isPointInShape**: (`shape`: `ShapeView`, `point`: \{ `x`: `number` ; `y`: `number`  }) => `boolean`

#### Type declaration

▸ (`shape`, `point`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `shape` | `ShapeView` |
| `point` | `Object` |
| `point.x` | `number` |
| `point.y` | `number` |

##### Returns

`boolean`

___

### isPointInShape2

• **isPointInShape2**: (`shape`: `ShapeView`, `point`: \{ `x`: `number` ; `y`: `number`  }) => `boolean`

#### Type declaration

▸ (`shape`, `point`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `shape` | `ShapeView` |
| `point` | `Object` |
| `point.x` | `number` |
| `point.y` | `number` |

##### Returns

`boolean`

___

### isPointInStroke

• **isPointInStroke**: (`d`: `string`, `point`: \{ `x`: `number` ; `y`: `number`  }, `stroke?`: `number`) => `boolean`

#### Type declaration

▸ (`d`, `point`, `stroke?`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `string` |
| `point` | `Object` |
| `point.x` | `number` |
| `point.y` | `number` |
| `stroke?` | `number` |

##### Returns

`boolean`

___

### isPointInStrokeByWidth

• **isPointInStrokeByWidth**: (`d`: `string`, `point`: \{ `x`: `number` ; `y`: `number`  }, `width`: `number`) => `boolean`

#### Type declaration

▸ (`d`, `point`, `width`): `boolean`

##### Parameters

| Name | Type |
| :------ | :------ |
| `d` | `string` |
| `point` | `Object` |
| `point.x` | `number` |
| `point.y` | `number` |
| `width` | `number` |

##### Returns

`boolean`

___

### path

• **path**: `SVGPathElement`

___

### remove

• **remove**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

## Methods

### isPointInShapeForPreview

▸ **isPointInShapeForPreview**(`shape`, `point`, `d`, `matrix`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shape` | `ShapeView` |
| `point` | `XY` |
| `d` | `string` |
| `matrix` | `Matrix` |

#### Returns

`boolean`
