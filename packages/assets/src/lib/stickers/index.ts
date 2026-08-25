import { getDefaultOptions } from "../common/utils";
import { groupName as _groupName } from "./i18n";
import { stickers } from "./stickers";

type I18nMap = Record<string, Record<string, string>>;
const groupName: I18nMap = _groupName;

export function getGroupInfoList(options?: Record<string, unknown>) {
  const resolvedOptions = getDefaultOptions(options);
  return stickers.map((group: { id: string; items: { name: string }[] }) => {
    return {
      name: groupName[group.id]?.[resolvedOptions.lang] ?? group.id,
      items: group.items.map((item: { name: string }) => {
        return {
          name: item.name,
          resource: `stickers/${item.name}.app`,
        };
      }),
    };
  });
}
