import {creator as shapeCreator, GroupShape, Shape,} from "@kcdesign/data"
import {BaseCreator} from "./base"
import {getRectBox, mergeRectBox} from "../utils"
import {ColVector3D} from "../matrix"

// 将父元素的属性合并到子元素
export function mergeAttributes(parent: BaseCreator, child: BaseCreator) {
    const parentShape = parent.shape
    const childShape = child.shape
    if (!parentShape || !childShape) return;

    // 合并transform
    child.transform = parent.transform.clone().addTransform(child.transform)
    child.updateShapeAttrByTransform()
    // 合并透明度
    if (parent.attributes.opacity) {
        if (child.attributes.opacity) child.attributes.opacity *= parent.attributes.opacity;
        else child.attributes.opacity = parent.attributes.opacity;
    }
    // 合并id
    if (parent.localAttributes.id) {
        if (child.localAttributes.id) child.localAttributes.id = parent.localAttributes.id + child.localAttributes.id;
        else child.localAttributes.id = parent.localAttributes.id;
    }

    child.updateShapeStyle()
}

export class GroupCreator extends BaseCreator {
    createShape() {
        this.shape = shapeCreator.newGroupShape("编组", this.style)
    }

    afterChildrenCreateShape(): void {
        if (!this.shape) return;
        const children: {
            shape: Shape,
            creator: BaseCreator,
        }[] = this.children.filter(child => child.shape).map(child => {
            return {
                shape: child.shape!,
                creator: child,
            }
        })

        if (children.length === 0) { // 空的group，移除自身
            this.remove()
            return
        }

        const reservedAttributes = ["fill", "stroke"] // 保留属性，有则不会被子级替代
        const isReserved = reservedAttributes.some(attr => attr in this.attributes)
        if (!isReserved && children.length === 1) { // 用子元素替代自身
            mergeAttributes(this, children[0].creator)
            this.replaceWithChildren()
            return
        }

        const groupShape = this.shape as GroupShape
        groupShape.childs.push(...children.map(child => child.shape))

        const childShapeBoxes = children.map(child => {
            const childShape = child.shape
            const childCreator = child.creator
            return getRectBox(childShape.frame.x, childShape.frame.y, childShape.frame.width, childShape.frame.height, childCreator.transform)
        })
        const childesShapeBox = mergeRectBox(...childShapeBoxes) // 合并所有子元素的包围盒

        // 根据子元素包围盒更新groupShape的宽高
        groupShape.frame.width = childesShapeBox.w
        groupShape.frame.height = childesShapeBox.h

        // 将子元素包围盒偏移至groupShape的左上角
        for (const child of children) {
            child.creator.transform.translate({vector: new ColVector3D([-childesShapeBox.lt.x, -childesShapeBox.lt.y, 0])})
            child.creator.updateShapeAttrByTransform()
        }
        // 将groupShape偏移至子元素包围盒原来的位置
        groupShape.frame.x += childesShapeBox.lt.x
        groupShape.frame.y += childesShapeBox.lt.y
    }
}
