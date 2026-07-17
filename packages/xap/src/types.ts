/**
 * XAP 系统 — 资源管理器
 *
 * 统一管理资源加载、生成、链接解析和资产数据
 */

/** 资源类型 */
export enum XAPType {
  IMAGE = 'image',
  ATTACHMENT = 'attachment',
  STICKER = 'sticker',
}

/** 链接预览（预留） */
export interface XAPLinkPreview {
  /** 原始 URL */
  url: string
  /** 显示名称 */
  title: string
  /** 描述 */
  description?: string
  /** 图标 URL */
  icon?: string
  /** 预览图 URL */
  image?: string
}

/** 资产项 */
export interface AssetItem {
  /** 唯一标识 */
  id: string
  /** 显示名称（支持国际化） */
  name: string
  /** 资源路径 */
  resource: string
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否用户自定义 */
  isUserAsset?: boolean
  /** 额外属性 */
  [key: string]: unknown
}

/** 资产分组 */
export interface AssetGroup {
  /** 分组 ID */
  id: string
  /** 分组名称 */
  name: string
  /** 分组内资产列表 */
  items: AssetItem[]
  /** 是否隐藏 */
  hidden?: boolean
}

/** 资产查询选项 */
export interface AssetQueryOptions {
  /** 语言 */
  lang?: string
  /** 是否包含隐藏项 */
  includeHidden?: boolean
}

/** 资产提供者接口 */
export interface AssetProvider {
  /** 获取分组列表 */
  getGroupInfoList: (options?: AssetQueryOptions) => AssetGroup[]
  /** 根据 ID 获取资产信息 */
  getInfoById: (id: string, options?: AssetQueryOptions) => AssetItem | undefined
  /** 添加用户自定义资产 */
  addUserAssets?: (items: AssetItem[], groups: Record<string, AssetGroup>) => void
}

/** 资产管理器 */
export interface AssetsManager {
  /** 贴纸 */
  stickers?: AssetProvider
  /** 标记 */
  markers?: AssetProvider
  /** 插图 */
  illustrations?: AssetProvider
  /** 附加组件 */
  addons?: AssetProvider
}

/**
 * XAP 系统接口
 *
 * @example
 * ```typescript
 * const xap: XAPSystem = {
 *   loader: async (resource) => `/assets/${resource}`,
 *   generator: async (file) => `xap:resources/${hash}.${ext}`,
 *   linkResolver: async (url) => ({ url, title: 'Example', icon: '...' }),
 *   assets: {
 *     markers: { getGroupInfoList: () => [...], getInfoById: (id) => ... },
 *     stickers: { getGroupInfoList: () => [...], getInfoById: (id) => ... },
 *   },
 * }
 * ```
 */
export interface XAPSystem {
  /**
   * 资源加载器
   * @param resource - 资源路径（如 `xap:resources/hash.png`、`markers/tagMarkers/tag-red.svg`）
   * @returns 实际可访问的 URL
   */
  loader: (resource: string) => Promise<string>

  /**
   * 资源生成器
   * @param file - 文件对象
   * @returns 资源路径（如 `xap:resources/hash.ext`）
   */
  generator: (file: File) => Promise<string>

  /**
   * 链接解析器（预留）
   * @param url - URL
   * @returns 链接预览信息
   */
  linkResolver?: (url: string) => Promise<XAPLinkPreview>

  /**
   * 资产数据管理器
   */
  assets?: AssetsManager
}

/** 判断是否 XAP 资源 */
export function isXapResource(resource: string): boolean {
  return resource.startsWith('xap:')
}
