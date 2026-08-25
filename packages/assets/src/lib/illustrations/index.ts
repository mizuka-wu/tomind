import { getDefaultOptions } from "../common/utils";
import { groupName as _groupName } from "./i18n";
import { illustrations } from "./illustrations";

type I18nMap = Record<string, Record<string, string>>;
const groupName: I18nMap = _groupName;

export function getGroupInfoList(options?: Record<string, unknown>) {
  const { lang } = getDefaultOptions(options);
  return illustrations.map((group: { id: string; items: { name: string }[] }) => ({
    name: groupName[group.id]?.[lang] ?? group.id,
    items: group.items.map((item: { name: string }) => ({
      name: item.name,
      resource: `illustrations/${item.name}.app`,
    })),
  }));
}
