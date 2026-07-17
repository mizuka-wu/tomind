import { createPartExtension } from '@tomind/core'
import type { ExtensionContext } from '@tomind/core'
import { Group, Rect } from 'leafer-ui'

interface Position {
  x: number
  y: number
}

/**
 * MouseBoxSelectExtension - 鼠标框选扩展
 * 
 * 职责：
 * - 使用 LeaferJS Rect 绘制半透明蓝色选择框
 * - 监听 DOM 事件处理框选交互
 * - 支持任意方向拖拽（scaleX/scaleY 翻转）
 * - 触发框选事件通知 Selection 模块
 * - 支持视口自动平移
 */
export const MouseBoxSelectExtension = createPartExtension({
  name: 'mouseBoxSelect',

  onCreate(ctx: ExtensionContext) {
    // 状态
    let isProcessing = false
    let startPosition: Position | null = null
    let isSegmentMultiSelect = false
    let hasInitStructure = false

    // LeaferJS 结构
    let multiSelectG: Group | null = null
    let multiSelectRect: Rect | null = null

    // DOM 事件处理器
    let onMouseMoveBound: ((e: MouseEvent) => void) | null = null
    let onMouseUpBound: (() => void) | null = null
    let onMouseOutBound: (() => void) | null = null
    let maskMouseMoveHandler: ((e: MouseEvent) => void) | null = null
    let maskMouseUpHandler: (() => void) | null = null

    // 获取 LeaferView
    const getLeaferView = (): any => {
      // 通过事件获取 LeaferView
      let leaferView: any = null
      ctx.emit('getLeaferView', (view: any) => {
        leaferView = view
      })
      return leaferView
    }

    // 初始化 LeaferJS 结构
    const initLeaferStructure = () => {
      const leaferView = getLeaferView()
      if (!leaferView || hasInitStructure) return

      // 创建选择框容器
      multiSelectG = new Group()
      leaferView.add(multiSelectG)

      // 创建选择框矩形
      multiSelectRect = new Rect({
        fill: '#2ebdff',
        opacity: 0.1,
        stroke: '#2ebdff',
        strokeOpacity: 0.5,
        strokeWidth: 1,
        width: 0,
        height: 0,
      })
      multiSelectG.add(multiSelectRect)

      hasInitStructure = true
    }

    // 注册 DOM 事件
    const registerEvents = (el: HTMLElement) => {
      onMouseMoveBound = (e: MouseEvent) => onLeaferViewMouseMove(e)
      onMouseUpBound = () => offLeaferViewAllMoveEvents()
      onMouseOutBound = () => offLeaferViewAllMoveEvents()

      el.addEventListener('mousemove', onMouseMoveBound)
      el.addEventListener('mouseup', onMouseUpBound)
      el.addEventListener('mouseout', onMouseOutBound)
    }

    // 注销 DOM 事件
    const offLeaferViewAllMoveEvents = () => {
      const leaferView = getLeaferView()
      if (!leaferView) return

      const el = leaferView.$el as HTMLElement
      if (onMouseMoveBound) {
        el.removeEventListener('mousemove', onMouseMoveBound)
        onMouseMoveBound = null
      }
      if (onMouseUpBound) {
        el.removeEventListener('mouseup', onMouseUpBound)
        onMouseUpBound = null
      }
      if (onMouseOutBound) {
        el.removeEventListener('mouseout', onMouseOutBound)
        onMouseOutBound = null
      }
    }

    // 鼠标移动处理
    const onLeaferViewMouseMove = (e: MouseEvent) => {
      if (!startPosition) return

      const leaferView = getLeaferView()
      if (!leaferView) return

      if (!hasInitStructure) {
        initLeaferStructure()
      }

      // 计算移动距离
      const dx = e.clientX - startPosition.x
      const dy = e.clientY - startPosition.y
      const moveDistance = Math.sqrt(dx * dx + dy * dy)

      if (moveDistance > 3) {
        // 显示遮罩层
        const mask = getViewPortCover()
        if (mask) {
          mask.style.display = ''
          mask.style.cursor = 'default'
        }

        // 设置选择框位置
        const containerRect = (leaferView.$el as HTMLElement).getBoundingClientRect()
        if (multiSelectG) {
          multiSelectG.set({
            x: startPosition.x - containerRect.left,
            y: startPosition.y - containerRect.top,
          })
        }

        // 禁用视口自动移动和选择模块
        ctx.emit('viewport:setAutoMove', false)
        ctx.emit('selection:setSilent', true)

        // 注册遮罩层事件
        if (mask) {
          maskMouseMoveHandler = (e: MouseEvent) => onMaskMouseMove(e)
          maskMouseUpHandler = () => onMaskMouseMoveFinish()
          mask.addEventListener('mousemove', maskMouseMoveHandler)
          mask.addEventListener('mouseup', maskMouseUpHandler)
          mask.addEventListener('mouseleave', maskMouseUpHandler)
        }

        isProcessing = true
        ctx.emit('mouseBoxSelect:started', startPosition)
      }
    }

    // 遮罩层鼠标移动
    const onMaskMouseMove = (e: MouseEvent) => {
      if (!isProcessing || !startPosition || !multiSelectG || !multiSelectRect) return

      const leaferView = getLeaferView()
      if (!leaferView) return

      const containerRect = (leaferView.$el as HTMLElement).getBoundingClientRect()

      // 计算方向（支持任意方向拖拽）
      const scaleX = e.clientX - startPosition.x >= 0 ? 1 : -1
      const scaleY = e.clientY - startPosition.y >= 0 ? 1 : -1

      // 设置选择框位置和缩放
      multiSelectG.set({
        scaleX,
        scaleY,
        x: startPosition.x - containerRect.left,
        y: startPosition.y - containerRect.top,
      })

      // 设置选择框大小
      multiSelectRect.set({
        width: Math.abs(e.clientX - startPosition.x),
        height: Math.abs(e.clientY - startPosition.y),
      })

      // 视口自动平移
      ctx.emit('viewport:showMouseInViewPort', {
        x: e.clientX,
        y: e.clientY,
      })

      // 触发框选事件
      if (multiSelectRect.parent) {
        const bounds = multiSelectRect.getBounds('box')
        ctx.emit('mouseBoxSelect:selecting', bounds, isSegmentMultiSelect)
      }
    }

    // 遮罩层鼠标抬起
    const onMaskMouseMoveFinish = () => {
      if (!isProcessing) return

      const leaferView = getLeaferView()
      if (!leaferView) return

      // 清理
      isProcessing = false

      // 恢复视口和选择模块
      ctx.emit('viewport:setAutoMove', true)
      ctx.emit('selection:setSilent', false)
      ctx.emit('selection:notify')

      // 清除选择框
      if (multiSelectG) {
        multiSelectG.clear()
      }

      // 注销遮罩层事件
      const mask = getViewPortCover()
      if (mask && maskMouseMoveHandler) {
        mask.removeEventListener('mousemove', maskMouseMoveHandler)
        mask.removeEventListener('mouseup', maskMouseUpHandler!)
        mask.removeEventListener('mouseleave', maskMouseUpHandler!)
        maskMouseMoveHandler = null
        maskMouseUpHandler = null
        mask.style.display = 'none'
        mask.style.cursor = ''
      }

      // 通知框选结束
      ctx.emit('mouseBoxSelect:ended')
    }

    // 获取视口遮罩层
    const getViewPortCover = (): HTMLElement | null => {
      let cover: HTMLElement | null = null
      ctx.emit('getViewPortCover', (el: HTMLElement) => {
        cover = el
      })
      return cover
    }

    // 开始框选
    const startBoxSelect = (...args: unknown[]) => {
      const [position, segmentMultiSelect] = args as [Position, boolean]

      // 检查是否禁用框选
      const config = getConfig()
      if (config.noMouseMultiSelectBox) return

      startPosition = position
      isSegmentMultiSelect = segmentMultiSelect || false

      const leaferView = getLeaferView()
      if (leaferView) {
        registerEvents(leaferView.$el as HTMLElement)
      }
    }

    // 获取配置
    const getConfig = (): { noMouseMultiSelectBox: boolean } => {
      let config = { noMouseMultiSelectBox: false }
      ctx.emit('getConfig', (c: any) => {
        config = c
      })
      return config
    }

    // 监听事件
    ctx.on('mouseBoxSelect:start', startBoxSelect)

    return () => {
      ctx.off('mouseBoxSelect:start', startBoxSelect)
      offLeaferViewAllMoveEvents()

      // 清理 LeaferJS 结构
      if (multiSelectG) {
        multiSelectG.destroy()
        multiSelectG = null
      }
      multiSelectRect = null
      hasInitStructure = false
    }
  },
})

export default MouseBoxSelectExtension
