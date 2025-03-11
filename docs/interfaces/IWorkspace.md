[kcdesign-editor - v1.0.88](../README.md) / [Exports](../modules.md) / IWorkspace

# Interface: IWorkspace

## Hierarchy

- `IWatchable`

  ↳ **`IWorkspace`**

## Table of contents

### Accessors

- [curScale](IWorkspace.md#curscale)
- [element](IWorkspace.md#element)
- [matrix](IWorkspace.md#matrix)

### Methods

- [doc2view](IWorkspace.md#doc2view)
- [scale](IWorkspace.md#scale)
- [setUserLocalFontList](IWorkspace.md#setuserlocalfontlist)
- [translate](IWorkspace.md#translate)
- [view2doc](IWorkspace.md#view2doc)

## Accessors

### curScale

• `get` **curScale**(): `number`

#### Returns

`number`

___

### element

• `get` **element**(): `undefined` \| `HTMLElement`

文档内容所在dom元素

#### Returns

`undefined` \| `HTMLElement`

___

### matrix

• `get` **matrix**(): `Matrix`

#### Returns

`Matrix`

## Methods

### doc2view

▸ **doc2view**(`point`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | `Object` |
| `point.x` | `number` |
| `point.y` | `number` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

▸ **doc2view**(`x`, `y`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

___

### scale

▸ **scale**(`ratio`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ratio` | `number` |

#### Returns

`void`

___

### setUserLocalFontList

▸ **setUserLocalFontList**(`list`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `list` | `string`[] |

#### Returns

`void`

___

### translate

▸ **translate**(`x`, `y`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`void`

___

### view2doc

▸ **view2doc**(`point`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `point` | `Object` |
| `point.x` | `number` |
| `point.y` | `number` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

▸ **view2doc**(`x`, `y`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `x` | `number` |
| `y` | `number` |
