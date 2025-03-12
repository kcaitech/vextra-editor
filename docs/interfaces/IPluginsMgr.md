[kcdesign-editor - v1.0.88](../README.md) / [Exports](../modules.md) / IPluginsMgr

# Interface: IPluginsMgr

## Table of contents

### Methods

- [regist](IPluginsMgr.md#regist)
- [search](IPluginsMgr.md#search)
- [search2](IPluginsMgr.md#search2)

## Methods

### regist

▸ **regist**(`...plugins`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `...plugins` | [`IPlugin`](IPlugin.md)[] |

#### Returns

`void`

___

### search

▸ **search**(`locate`): [`IPlugin`](IPlugin.md)[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `locate` | [`PluginLocate`](../modules.md#pluginlocate) |

#### Returns

[`IPlugin`](IPlugin.md)[]

___

### search2

▸ **search2**(`locate`): `Object`

#### Parameters

| Name | Type |
| :------ | :------ |
| `locate` | [`PluginLocate`](../modules.md#pluginlocate) |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `begin` | [`IPlugin`](IPlugin.md)[] |
| `end` | [`IPlugin`](IPlugin.md)[] |
