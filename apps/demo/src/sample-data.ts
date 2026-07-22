import type { NodeDesc } from '@tomind/schema'
import { createAttributeTitleFromPlainText } from '@tomind/schema'

function createTopic(id: string, title: string, children: NodeDesc[] = []): NodeDesc {
  return {
    id,
    type: 'topic',
    attrs: {
      title,
      attributeTitle: createAttributeTitleFromPlainText(title),
    },
    children: {
      attached: children,
    },
  }
}

export function createSampleDoc(): NodeDesc {
  const subTopics = [
    createTopic('sub-1', '子主题 1'),
    createTopic('sub-2', '子主题 2'),
    createTopic('sub-3', '子主题 3'),
  ]

  const mainTopics = [
    createTopic('main-1', '主分支 1', subTopics),
    createTopic('main-2', '主分支 2'),
    createTopic('main-3', '主分支 3'),
  ]

  const centralTopic = createTopic('central', '中心主题', mainTopics)

  return {
    id: 'root',
    type: 'root',
    attrs: {
      title: '思维导图 Demo',
      attributeTitle: createAttributeTitleFromPlainText('思维导图 Demo'),
    },
    children: {
      attached: [centralTopic],
    },
  }
}
