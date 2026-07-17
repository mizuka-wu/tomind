import { markers } from "./markers";
import { GROUP_ORDER } from "./constant";
import { getDefaultOptions } from "../common/utils";
import { groupName, markerName } from "./i18n";

interface MarkerInfo {
  markerId: string;
  groupId?: string;
  name?: string;
  resource?: string;
  hidden: boolean;
  isUserMarker?: boolean;
}

type MarkerMap = Record<string, { id: string; name?: string; markers: MarkerInfo[]; hidden: boolean; isUserMarker?: boolean }>;
type I18nMap = Record<string, Record<string, string>>;

const allMarkerInfoList: MarkerInfo[] = GROUP_ORDER.map(
  (groupId: string) => (markers as MarkerMap)[groupId].markers,
).reduce<MarkerInfo[]>((pre: MarkerInfo[], cur: MarkerInfo[]) => {
  return pre.concat(cur);
}, []);

let userMarkerMap: MarkerMap = {};

export function getMarkerInfoById(markerId: string, options?: Record<string, unknown>): MarkerInfo | null {
  const { lang } = getDefaultOptions(options);
  const markerInfo = allMarkerInfoList.find(
    (info: MarkerInfo) => info.markerId === markerId,
  );
  if (!markerInfo) {
    return null;
  }
  return {
    ...markerInfo,
    name: markerInfo.isUserMarker
      ? (markerInfo.name ?? "")
      : (markerName as I18nMap)[markerId]?.[lang] ?? markerId,
  };
}

export function getGroupInfoById(groupId: string, options?: Record<string, unknown>): MarkerMap[string] | null {
  const resolvedOptions = getDefaultOptions(options);
  const allGroups: MarkerMap = { ...userMarkerMap, ...markers } as MarkerMap;
  const groupInfo = allGroups[groupId];
  if (!groupInfo) {
    return null;
  }
  return {
    ...groupInfo,
    name: groupInfo.isUserMarker
      ? (groupInfo.name ?? "")
      : (groupName as I18nMap)[groupId]?.[resolvedOptions.lang] ?? groupId,
    markers: groupInfo.markers.map((info: MarkerInfo) =>
      getMarkerInfoById(info.markerId, resolvedOptions),
    ) as MarkerInfo[],
  };
}

export function getGroupInfoList(options?: Record<string, unknown>): MarkerMap[string][] {
  const resolvedOptions = getDefaultOptions(options);
  return GROUP_ORDER.map((groupId: string) => (markers as MarkerMap)[groupId])
    .filter((groupInfo: MarkerMap[string]) => !groupInfo.hidden)
    .map((groupInfo: MarkerMap[string]) => {
      return {
        ...groupInfo,
        name: (groupName as I18nMap)[groupInfo.id]?.[resolvedOptions.lang] ?? groupInfo.id,
        markers: groupInfo.markers
          .filter((info: MarkerInfo) => !info.hidden)
          .map((info: MarkerInfo) => getMarkerInfoById(info.markerId, resolvedOptions))
          .filter((info): info is MarkerInfo => info !== null),
      };
    });
}

export function addUserMarkerInfoList(
  markerEntries: Record<string, { name: string; resource: string }>,
  groups?: Record<string, { name: string; markers: string[] }>,
): void {
  const findGroupId = (mid: string): string | undefined => {
    for (const gId in groups) {
      const { markers: groupMarkers } = groups[gId];
      if (Array.isArray(groupMarkers) && groupMarkers.includes(mid)) {
        return gId;
      }
    }
    return undefined;
  };

  for (const markerId in markerEntries) {
    const { name, resource } = markerEntries[markerId];
    allMarkerInfoList.push({
      markerId,
      groupId: groups ? findGroupId(markerId) : undefined,
      name,
      resource,
      hidden: false,
      isUserMarker: true,
    });
  }

  if (groups) {
    for (const groupId in groups) {
      const { name, markers: groupMarkers } = groups[groupId];
      userMarkerMap = {
        ...userMarkerMap,
        [groupId]: {
          id: groupId,
          name,
          markers: groupMarkers
            .map((mid: string) => getMarkerInfoById(mid))
            .filter(Boolean) as MarkerInfo[],
          hidden: false,
          isUserMarker: true,
        },
      };
    }
  }
}

export function isSiblingMarker(markerId1: string, markerId2: string): boolean {
  if (markerId1 === markerId2) {
    return false;
  }
  const markerInfo1 = getMarkerInfoById(markerId1);
  const markerInfo2 = getMarkerInfoById(markerId2);
  if (!markerInfo1 || !markerInfo2) {
    return false;
  }
  return markerInfo1.groupId === markerInfo2.groupId;
}

export function indexOf(markerId: string): number {
  return allMarkerInfoList.findIndex(
    (info: MarkerInfo) => info.markerId === markerId,
  );
}
