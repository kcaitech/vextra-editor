[kcdesign-editor - v1.0.88](README.md) / Exports

# kcdesign-editor - v1.0.88

## Table of contents

### Namespaces

- [ContextEvents](modules/ContextEvents.md)
- [SelectionEvents](modules/SelectionEvents.md)
- [WorkspaceEvents](modules/WorkspaceEvents.md)

### Interfaces

- [IContext](interfaces/IContext.md)
- [IEscStack](interfaces/IEscStack.md)
- [INet](interfaces/INet.md)
- [IPlugin](interfaces/IPlugin.md)
- [IPluginsMgr](interfaces/IPluginsMgr.md)
- [IScout](interfaces/IScout.md)
- [ISelection](interfaces/ISelection.md)
- [ITextSelection](interfaces/ITextSelection.md)
- [IToolBox](interfaces/IToolBox.md)
- [IWorkspace](interfaces/IWorkspace.md)

### Type Aliases

- [DocumentProps](modules.md#documentprops)
- [PluginLocate](modules.md#pluginlocate)

### Variables

- [DocumentVue](modules.md#documentvue)
- [MobileDocumentVue](modules.md#mobiledocumentvue)
- [PreviewVue](modules.md#previewvue)
- [StaticShape](modules.md#staticshape)
- [i18n](modules.md#i18n)

### Functions

- [openDocument](modules.md#opendocument)
- [useComment](modules.md#usecomment)

## Type Aliases

### DocumentProps

Ƭ **DocumentProps**: \{ `fid`: `string` ; `path`: `string` ; `source`: ``"storage"`` ; `storage`: `IStorage` ; `versionId`: `string`  } \| \{ `file`: `File` ; `fmt`: ``"vext"`` \| ``"sketch"`` \| ``"fig"`` ; `source`: ``"file"``  } \| \{ `source`: ``"new"``  }

___

### PluginLocate

Ƭ **PluginLocate**: ``"toolbar.home"`` \| ``"toolbar.home.menu"`` \| ``"toolbar.others"`` \| ``"toolbar.tools"`` \| ``"toolbar.tools.efficient"`` \| ``"navigation"`` \| ``"content"`` \| ``"attributes"`` \| ``"devmode.toolbar.tools"`` \| ``"preview.toolbar.home"`` \| ``"preview.toolbar.others"`` \| ``"content.menu"``

## Variables

### DocumentVue

• `Const` **DocumentVue**: `DefineComponent`\<{}, {}, `any`\> = `_DocumentVue`

___

### MobileDocumentVue

• `Const` **MobileDocumentVue**: `DefineComponent`\<{}, {}, `any`\> = `_MobileDocumentVue`

移动端文档编辑器组件

**`Component`**

___

### PreviewVue

• `Const` **PreviewVue**: `DefineComponent`\<{}, {}, `any`\> = `_PreviewVue`

预览组件

**`Component`**

___

### StaticShape

• `Const` **StaticShape**: `DefineComponent`\<{}, {}, `any`\> = `_StaticShape`

___

### i18n

• `Const` **i18n**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `en` | `__module` |
| `zh` | `__module` |

## Functions

### openDocument

▸ **openDocument**(`props`): `Promise`\<`undefined` \| [`IContext`](interfaces/IContext.md)\>

打开文档

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [`DocumentProps`](modules.md#documentprops) |

#### Returns

`Promise`\<`undefined` \| [`IContext`](interfaces/IContext.md)\>

**`See`**

DocumentProps

___

### useComment

▸ **useComment**(`context`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | `Context` |

#### Returns

`void`
