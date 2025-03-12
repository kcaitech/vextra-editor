[kcdesign-editor - v1.0.88](../README.md) / [Exports](../modules.md) / ISelection

# Interface: ISelection

## Hierarchy

- `IWatchable`

  ↳ **`ISelection`**

## Table of contents

### Accessors

- [hoveredShape](ISelection.md#hoveredshape)
- [selectedPage](ISelection.md#selectedpage)
- [selectedShapes](ISelection.md#selectedshapes)
- [textSelection](ISelection.md#textselection)

### Methods

- [locateShape](ISelection.md#locateshape)
- [selectPage](ISelection.md#selectpage)
- [selectShape](ISelection.md#selectshape)
- [userSelectionData](ISelection.md#userselectiondata)

## Accessors

### hoveredShape

• `get` **hoveredShape**(): `undefined` \| `ShapeView`

#### Returns

`undefined` \| `ShapeView`

___

### selectedPage

• `get` **selectedPage**(): `undefined` \| `PageView`

#### Returns

`undefined` \| `PageView`

___

### selectedShapes

• `get` **selectedShapes**(): `ShapeView`[]

#### Returns

`ShapeView`[]

___

### textSelection

• `get` **textSelection**(): [`ITextSelection`](ITextSelection.md)

#### Returns

[`ITextSelection`](ITextSelection.md)

## Methods

### locateShape

▸ **locateShape**(`shapes`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shapes` | `ShapeView`[] |

#### Returns

`void`

___

### selectPage

▸ **selectPage**(`p`): `Promise`\<`undefined` \| `PageView`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `p` | `string` \| `PageView` |

#### Returns

`Promise`\<`undefined` \| `PageView`\>

___

### selectShape

▸ **selectShape**(`shape?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `shape?` | `ShapeView` |

#### Returns

`void`

___

### userSelectionData

▸ **userSelectionData**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `DocSelectionData`[] |

#### Returns

`void`
