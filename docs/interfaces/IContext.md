[kcdesign-editor - v1.0.0](../README.md) / [Exports](../modules.md) / IContext

# Interface: IContext

## Hierarchy

- `IWatchable`

  ↳ **`IContext`**

## Table of contents

### Properties

- [env](IContext.md#env)
- [inactive](IContext.md#inactive)

### Accessors

- [curAction](IContext.md#curaction)
- [data](IContext.md#data)
- [escstack](IContext.md#escstack)
- [pluginsMgr](IContext.md#pluginsmgr)
- [repo](IContext.md#repo)
- [selection](IContext.md#selection)
- [storage](IContext.md#storage)
- [toolbox](IContext.md#toolbox)
- [workspace](IContext.md#workspace)

### Methods

- [nextTick](IContext.md#nexttick)
- [registKeyHandler](IContext.md#registkeyhandler)
- [rename](IContext.md#rename)
- [setCurAction](IContext.md#setcuraction)
- [setCustomLoading](IContext.md#setcustomloading)
- [setNet](IContext.md#setnet)
- [setReadonly](IContext.md#setreadonly)
- [updateThumbnail](IContext.md#updatethumbnail)

## Properties

### env

• **env**: [`ContextEnvironment`](../enums/ContextEnvironment.md)

___

### inactive

• **inactive**: `boolean`

## Accessors

### curAction

• `get` **curAction**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

___

### data

• `get` **data**(): `Document`

#### Returns

`Document`

___

### escstack

• `get` **escstack**(): [`IEscStack`](IEscStack.md)

#### Returns

[`IEscStack`](IEscStack.md)

___

### pluginsMgr

• `get` **pluginsMgr**(): [`IPluginsMgr`](IPluginsMgr.md)

#### Returns

[`IPluginsMgr`](IPluginsMgr.md)

___

### repo

• `get` **repo**(): `IRepository`

#### Returns

`IRepository`

___

### selection

• `get` **selection**(): [`ISelection`](ISelection.md)

#### Returns

[`ISelection`](ISelection.md)

___

### storage

• `get` **storage**(): `Map`\<`string`, `string`\>

#### Returns

`Map`\<`string`, `string`\>

___

### toolbox

• `get` **toolbox**(): [`IToolBox`](IToolBox.md)

#### Returns

[`IToolBox`](IToolBox.md)

___

### workspace

• `get` **workspace**(): [`IWorkspace`](IWorkspace.md)

#### Returns

[`IWorkspace`](IWorkspace.md)

## Methods

### nextTick

▸ **nextTick**(`page`, `cb`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `page` | `PageView` |
| `cb` | () => `void` |

#### Returns

`void`

___

### registKeyHandler

▸ **registKeyHandler**(`keyCode`, `handler`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `keyCode` | `string` |
| `handler` | (`event`: `KeyboardEvent`, `context`: [`IContext`](IContext.md)) => `void` |

#### Returns

`void`

___

### rename

▸ **rename**(`name`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |

#### Returns

`void`

___

### setCurAction

▸ **setCurAction**(`uuid`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `uuid` | `string` |

#### Returns

`void`

___

### setCustomLoading

▸ **setCustomLoading**(`show`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `show` | `boolean` |

#### Returns

`void`

___

### setNet

▸ **setNet**(`net`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `net` | [`INet`](INet.md) |

#### Returns

`void`

___

### setReadonly

▸ **setReadonly**(`readonly`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `readonly` | `boolean` |

#### Returns

`void`

___

### updateThumbnail

▸ **updateThumbnail**(): `void`

#### Returns

`void`
