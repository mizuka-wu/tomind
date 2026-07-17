/**
 * DropExtension — 外部文件拖入扩展
 *
 * 功能：
 * 1. 监听 DOM 拖拽事件（dragenter/dragover/dragleave/drop）
 * 2. 文件类型判断（图片、附件、文件夹）
 * 3. 拖拽到分支 — 添加为子主题
 * 4. 拖拽到画布 — 添加为浮动主题
 *
 * 事件：
 * - drop:file — 文件拖入完成
 * - drop:image — 图片拖入
 * - drop:attachment — 附件拖入
 * - drop:folder — 文件夹拖入
 */

import { createExtension } from '@tomind/core'
import type { ExtensionContext, CommandFn } from '@tomind/core'

// ==================== 类型定义 ====================

interface DropOptions {
  [key: string]: unknown
  enabled?: boolean
}

/** 文件信息 */
interface FileInfo {
  name: string
  type: string
  path?: string
  size: number
}

/** 拖拽位置 */
interface Position {
  x: number
  y: number
}

/** 拖拽状态 */
interface DropState {
  isDragging: boolean
  dropView: any | null
  transferOptions: any | null
  dragTimeout: ReturnType<typeof setTimeout> | null
}

// ==================== 文件类型工具 ====================

const FileTypeTools = {
  isImage(dataTransfer: DataTransfer): boolean {
    if (!this.isFile(dataTransfer)) return false
    return dataTransfer.files[0].type.startsWith('image/')
  },

  isAttachment(dataTransfer: DataTransfer): boolean {
    return this.isFile(dataTransfer) && !this.isImage(dataTransfer)
  },

  isFile(dataTransfer: DataTransfer): boolean {
    return dataTransfer.files.length !== 0
  },

  isFolder(dataTransfer: DataTransfer): boolean {
    return Boolean(
      dataTransfer.files.length && dataTransfer.files[0].type === ''
    )
  },

  isDragEnterFileIllegal(dataTransfer: DataTransfer | null): boolean {
    if (!dataTransfer) return true
    // 应该全部是文件
    if (dataTransfer.types.every((type) => type === 'Files')) {
      // 只支持图片
      const isFileImage = Array.from(dataTransfer.items).every((item: any) => {
        return item.type.startsWith('image/')
      })
      return !isFileImage
    } else {
      return true
    }
  },

  getFileInfo(dataTransfer: DataTransfer): FileInfo | null {
    if (!dataTransfer.files.length) return null
    const file = dataTransfer.files[0]
    return {
      name: file.name,
      type: file.type,
      path: (file as any).path, // Electron 环境
      size: file.size,
    }
  },
}

// ==================== DropExtension ====================

export const DropExtension = createExtension<DropOptions>({
  name: 'drop',
  type: 'extension',
  defaultOptions: {
    enabled: true,
  },

  onCreate(ctx) {
    // 状态
    const state: DropState = {
      isDragging: false,
      dropView: null,
      transferOptions: null,
      dragTimeout: null,
    }

    // 获取 LeaferView
    const getLeaferView = (): any => {
      let leaferView: any = null
      ctx.emit('getLeaferView', (view: any) => {
        leaferView = view
      })
      return leaferView
    }

    // 获取视口遮罩层
    const getViewPortCover = (): HTMLElement | null => {
      let cover: HTMLElement | null = null
      ctx.emit('getViewPortCover', (el: HTMLElement) => {
        cover = el
      })
      return cover
    }

    // 坐标转换
    const viewportToMindMap = (clientPos: Position): Position => {
      let result = clientPos
      ctx.emit('coordinate:viewportToMindMap', clientPos, (pos: Position) => {
        result = pos
      })
      return result
    }

    // 事件处理器
    let onDragEnter: ((e: DragEvent) => void) | null = null
    let onDragOver: ((e: DragEvent) => void) | null = null
    let onDragLeave: ((e: DragEvent) => void) | null = null
    let onDrop: ((e: DragEvent) => void) | null = null

    // 绑定事件
    const bindEvents = () => {
      const leaferView = getLeaferView()
      if (!leaferView) return

      const el = leaferView.$el as HTMLElement

      onDragEnter = (e: DragEvent) => {
        e.preventDefault()
        if (!state.isDragging && e.dataTransfer) {
          state.isDragging = true
        }
        if (!FileTypeTools.isDragEnterFileIllegal(e.dataTransfer)) {
          if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy'
          }
        }
      }

      onDragOver = (e: DragEvent) => {
        e.preventDefault()
        if (!e.dataTransfer) return

        const realPosition = viewportToMindMap({
          x: e.clientX,
          y: e.clientY,
        })

        // 获取拖拽经过的视图
        let dropView: any = null
        ctx.emit('drop:getDropView', realPosition, (view: any) => {
          dropView = view
        })

        state.dropView = dropView

        // 获取传输选项
        let transferOptions: any = null
        ctx.emit('drop:onDragMoving', dropView, realPosition, (options: any) => {
          transferOptions = options
        })

        state.transferOptions = transferOptions

        // 检测拖拽取消
        clearTimeout(state.dragTimeout!)
        state.dragTimeout = setTimeout(() => {
          dragFinish()
        }, 300)
      }

      onDragLeave = (e: DragEvent) => {
        e.preventDefault()
        // 拖拽离开
      }

      onDrop = (e: DragEvent) => {
        e.preventDefault()
        if (!e.dataTransfer) return

        const realPosition = viewportToMindMap({
          x: e.clientX,
          y: e.clientY,
        })

        // 处理文件
        handleFileDrop(e.dataTransfer, realPosition)
        dragFinish()
      }

      el.addEventListener('dragenter', onDragEnter)
      el.addEventListener('dragover', onDragOver)
      el.addEventListener('dragleave', onDragLeave)
      el.addEventListener('drop', onDrop)
    }

    // 解绑事件
    const unbindEvents = () => {
      const leaferView = getLeaferView()
      if (!leaferView) return

      const el = leaferView.$el as HTMLElement

      if (onDragEnter) el.removeEventListener('dragenter', onDragEnter)
      if (onDragOver) el.removeEventListener('dragover', onDragOver)
      if (onDragLeave) el.removeEventListener('dragleave', onDragLeave)
      if (onDrop) el.removeEventListener('drop', onDrop)

      onDragEnter = null
      onDragOver = null
      onDragLeave = null
      onDrop = null
    }

    // 拖拽完成
    const dragFinish = () => {
      state.isDragging = false
      state.dropView = null
      state.transferOptions = null
      clearTimeout(state.dragTimeout!)
      state.dragTimeout = null

      ctx.emit('drop:finish')
    }

    // 处理文件拖入
    const handleFileDrop = (dataTransfer: DataTransfer, position: Position) => {
      const fileInfo = FileTypeTools.getFileInfo(dataTransfer)
      if (!fileInfo) return

      if (FileTypeTools.isFolder(dataTransfer)) {
        // 文件夹
        handleFolderDrop(fileInfo, position)
      } else if (FileTypeTools.isImage(dataTransfer)) {
        // 图片
        handleImageDrop(dataTransfer, fileInfo, position)
      } else if (FileTypeTools.isAttachment(dataTransfer)) {
        // 附件
        handleAttachmentDrop(dataTransfer, fileInfo, position)
      }
    }

    // 处理文件夹拖入
    const handleFolderDrop = (fileInfo: FileInfo, position: Position) => {
      if (!fileInfo.path) return

      ctx.emit('drop:folder', {
        path: fileInfo.path,
        name: fileInfo.name,
        position,
        dropView: state.dropView,
        transferOptions: state.transferOptions,
      })

      // 如果有 dropView，添加为子主题
      if (state.dropView) {
        ctx.emit('topic:addChild', {
          parentId: state.dropView.id,
          attrs: {
            title: fileInfo.name,
            href: `file://${fileInfo.path}`,
          },
          transferOptions: state.transferOptions,
        })
      } else {
        // 添加为浮动主题
        ctx.emit('topic:addFloating', {
          position,
          attrs: {
            title: fileInfo.name,
            href: `file://${fileInfo.path}`,
          },
        })
      }
    }

    // 处理图片拖入
    const handleImageDrop = (dataTransfer: DataTransfer, fileInfo: FileInfo, position: Position) => {
      ctx.emit('drop:image', {
        file: fileInfo,
        position,
        dropView: state.dropView,
        transferOptions: state.transferOptions,
      })

      // 读取图片
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string

        if (state.dropView) {
          // 添加为子主题
          ctx.emit('topic:addChild', {
            parentId: state.dropView.id,
            attrs: {
              title: fileInfo.name,
              image: { src: dataUrl },
            },
            transferOptions: state.transferOptions,
          })
        } else {
          // 添加为浮动主题
          ctx.emit('topic:addFloating', {
            position,
            attrs: {
              title: fileInfo.name,
              image: { src: dataUrl },
            },
          })
        }
      }
      reader.readAsDataURL(dataTransfer.files[0])
    }

    // 处理附件拖入
    const handleAttachmentDrop = (dataTransfer: DataTransfer, fileInfo: FileInfo, position: Position) => {
      ctx.emit('drop:attachment', {
        file: fileInfo,
        position,
        dropView: state.dropView,
        transferOptions: state.transferOptions,
      })

      // 读取附件
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string

        if (state.dropView) {
          // 添加为子主题
          ctx.emit('topic:addChild', {
            parentId: state.dropView.id,
            attrs: {
              title: fileInfo.name,
              href: dataUrl,
            },
            transferOptions: state.transferOptions,
          })
        } else {
          // 添加为浮动主题
          ctx.emit('topic:addFloating', {
            position,
            attrs: {
              title: fileInfo.name,
              href: dataUrl,
            },
          })
        }
      }
      reader.readAsDataURL(dataTransfer.files[0])
    }

    // 注册命令
    const commands: Record<string, CommandFn> = {
      'drop.bind': () => {
        bindEvents()
        return true
      },
      'drop.unbind': () => {
        unbindEvents()
        return true
      },
    }

    for (const [name, command] of Object.entries(commands)) {
      ctx.registerCommand(name, command)
    }

    // 自动绑定
    bindEvents()

    // 返回清理函数
    return () => {
      for (const name of Object.keys(commands)) {
        ctx.unregisterCommand(name)
      }
      unbindEvents()
    }
  },
})

export default DropExtension
