import { Group } from 'leafer-ui'
import type { LayoutResult } from '@tomind/layout'
import type { Renderer } from './renderer'

/**
 * SheetRenderer — 根节点容器
 * 
 * 管理多个子容器，按类型分组：
 * - branch-container — 分支节点
 * - relationship-container — 关系线
 * - boundary-container — 边界框
 * - connection-container — 连接线
 * - select-box-container — 选择框
 * - other-container — 其他
 */
export class SheetRenderer implements Renderer {
  private group: Group | null = null
  private containers = new Map<string, Group>()

  create(parent: Group): void {
    this.group = new Group({ name: 'sheet' })
    parent.add(this.group)

    // 创建子容器
    this.createContainer('branch')
    this.createContainer('relationship')
    this.createContainer('boundary')
    this.createContainer('connection')
    this.createContainer('select-box')
    this.createContainer('other')
  }

  private createContainer(name: string): void {
    if (!this.group) return
    const container = new Group({ name: `${name}-container` })
    this.group.add(container)
    this.containers.set(name, container)
  }

  render(_layout: LayoutResult, _style: Record<string, unknown>): void {
    // SheetRenderer 的渲染由子元素驱动
  }

  /**
   * 添加子元素到指定容器
   */
  addChild(type: string, child: Group): void {
    const container = this.containers.get(type)
    if (container) {
      container.add(child)
    } else {
      // 默认添加到 other 容器
      this.containers.get('other')?.add(child)
    }
  }

  /**
   * 获取指定容器
   */
  getContainer(name: string): Group | undefined {
    return this.containers.get(name)
  }

  destroy(): void {
    this.containers.clear()
    if (this.group) {
      this.group.destroy()
      this.group = null
    }
  }
}
