[kcdesign-editor - v1.0.0](README.md) / Exports

# kcdesign-editor - v1.0.0

## Table of contents

### References

- [MobileDocumentVue](modules.md#mobiledocumentvue)
- [PreviewVue](modules.md#previewvue)
- [StaticShape](modules.md#staticshape)
- [View](modules.md#view)

### Namespaces

- [ContextEvents](modules/ContextEvents.md)
- [SelectionEvents](modules/SelectionEvents.md)
- [WorkspaceEvents](modules/WorkspaceEvents.md)

### Enumerations

- [ContextEnvironment](enums/ContextEnvironment.md)

### Classes

- [DragKit](classes/DragKit.md)
- [ShapeDescContext](classes/ShapeDescContext.md)

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
- [DocumentRootInfo](modules.md#documentrootinfo)
- [PluginLocate](modules.md#pluginlocate)

### Variables

- [DocumentVue](modules.md#documentvue)
- [i18n](modules.md#i18n)
- [supportedFormats](modules.md#supportedformats)

### Functions

- [exportDocument](modules.md#exportdocument)
- [initModule](modules.md#initmodule)
- [openDocument](modules.md#opendocument)

## References

### MobileDocumentVue

Renames and re-exports [DocumentVue](modules.md#documentvue)

___

### PreviewVue

Renames and re-exports [DocumentVue](modules.md#documentvue)

___

### StaticShape

Renames and re-exports [DocumentVue](modules.md#documentvue)

___

### View

Renames and re-exports [DocumentVue](modules.md#documentvue)

## Type Aliases

### DocumentProps

Ƭ **DocumentProps**: \{ `fid`: `string` ; `path`: `string` ; `source`: ``"storage"`` ; `storage`: `IO.IStorage` ; `versionId`: `string`  } \| \{ `file`: `File` ; `fmt`: ``"vext"`` \| ``"sketch"`` \| ``"fig"`` \| ``"svg"`` ; `source`: ``"file"``  } \| \{ `source`: ``"new"``  }

___

### DocumentRootInfo

Ƭ **DocumentRootInfo**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `id` | `string` |
| `name` | `string` |

___

### PluginLocate

Ƭ **PluginLocate**: ``"toolbar.home"`` \| ``"toolbar.home.menu"`` \| ``"toolbar.others"`` \| ``"toolbar.tools"`` \| ``"toolbar.tools.efficient"`` \| ``"navigation"`` \| ``"content"`` \| ``"attributes"`` \| ``"devmode.toolbar.tools"`` \| ``"preview.toolbar.home"`` \| ``"preview.toolbar.others"`` \| ``"content.menu.copy_link_to_selection"`` \| ``"content.menu"``

## Variables

### DocumentVue

• `Const` **DocumentVue**: `DefineComponent`\<{}, {}, `any`\>

___

### i18n

• `Const` **i18n**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `en` | `__module` |
| `zh` | `__module` |

___

### supportedFormats

• `Const` **supportedFormats**: `string`[]

## Functions

### exportDocument

▸ **exportDocument**(`context`): `Promise`\<`Blob`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | [`IContext`](interfaces/IContext.md) |

#### Returns

`Promise`\<`Blob`\>

___

### initModule

▸ **initModule**(`measure?`, `text2path?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `measure?` | (`text`: `string`, `font`: `string`) => `undefined` \| `TextMetrics` |
| `text2path?` | (`font`: `string`, `fontSize`: `number`, `italic`: `boolean`, `weight`: `number`, `charCode`: `number`) => `string` |

#### Returns

`void`

___

### openDocument

▸ **openDocument**(`props`, `repoCreator?`): `Promise`\<`undefined` \| [`IContext`](interfaces/IContext.md)\>

打开文档

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `props` | [`DocumentProps`](modules.md#documentprops) | `undefined` |
| `repoCreator` | (`data`: `Document`, `guard`: `TransactDataGuard`) => `IRepository` | `createRepo` |

#### Returns

`Promise`\<`undefined` \| [`IContext`](interfaces/IContext.md)\>

**`See`**

DocumentProps
