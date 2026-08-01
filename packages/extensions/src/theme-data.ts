/**
 * 迁移自 snowbrush-render 的主题数据
 * 自动生成，请勿手动编辑
 */

import type { ThemeData } from '@tomind/style'

/** 颜色主题数据 */
export interface ColorThemeData {
  id: string
  tags: string[]
  theme: ThemeData
}

/** 骨架主题数据 */
export interface SkeletonThemeData {
  id: string
  structureStyle?: Record<string, string>
  theme: ThemeData
}

/** 颜色主题列表 */
export const COLOR_THEMES: ColorThemeData[] = [
  {
    "id": "a8a3a3f8-de6b-43c6-9f10-259e176c4721",
    "tags": [
      "Light Grayish"
    ],
    "theme": {
      "map": {
        "id": "3eb0284a-4e05-416e-ac43-23eea8451aea",
        "properties": {
          "fillColor": "#eee8e6",
          "multiLineColors": "",
          "color-list": "#eee8e6 #2d221f"
        }
      },
      "centralTopic": {
        "id": "4a26300c-d7dd-40b0-89aa-216aecdc3ddb",
        "properties": {
          "fillColor": "#c1aba5",
          "lineColor": "#88675e"
        }
      },
      "mainTopic": {
        "id": "552e6934-fcd9-4801-9086-dde311598963",
        "properties": {
          "fillColor": "#c1aba5"
        }
      },
      "subTopic": {
        "id": "9c3d9625-7515-4f11-bf35-de728ae97154",
        "properties": {
          "fillColor": "#e6ddda"
        }
      },
      "floatingTopic": {
        "id": "ac25e4a7-ff3c-46d4-bcaf-aa20af0574ee",
        "properties": {
          "fillColor": "#c1aba5",
          "borderColor": "#88675e"
        }
      },
      "summaryTopic": {
        "id": "4edab5f1-129c-40a8-ae00-a4194c742cac",
        "properties": {
          "fillColor": "#9eb4b9",
          "borderColor": "#9eb4b9"
        }
      },
      "calloutTopic": {
        "id": "983e385f-e797-4838-a5f9-5b59579a698a",
        "properties": {
          "fillColor": "#9eb4b9",
          "borderColor": "#9eb4b9"
        }
      },
      "importantTopic": {
        "id": "6519d5ee-6a8b-4319-9303-0e181717fd77",
        "properties": {
          "fillColor": "#000b0f",
          "borderColor": "#88675e"
        }
      },
      "minorTopic": {
        "id": "831ef6bd-362a-44f6-860b-de1662eaf29f",
        "properties": {
          "fillColor": "#005476",
          "borderColor": "#005476"
        }
      },
      "boundary": {
        "id": "30dc8802-e6ee-4054-a4c2-4aa4f30607e8",
        "properties": {
          "fillColor": "#9eb4b9",
          "lineColor": "#9eb4b9"
        }
      },
      "summary": {
        "id": "aceab167-7c7a-46ba-90d9-cf9440829909",
        "properties": {
          "lineColor": "#9eb4b9"
        }
      },
      "relationship": {
        "id": "95d81296-92b7-40bd-9cd1-5399dedf7f9a",
        "properties": {
          "lineColor": "#9eb4b9"
        }
      }
    }
  },
  {
    "id": "589874b1-365e-45d0-85bf-137bd697569b",
    "tags": [
      "Light Grayish"
    ],
    "theme": {
      "map": {
        "id": "d04c9e1a-0c78-470d-ab10-773e8e9aaa8d",
        "properties": {
          "fillColor": "#efede5",
          "multiLineColors": "",
          "color-list": "#efede5 #302c1d"
        }
      },
      "centralTopic": {
        "id": "d5f45f8e-059c-4d41-8458-00754458895e",
        "properties": {
          "fillColor": "#c6bea1",
          "lineColor": "#908357"
        }
      },
      "mainTopic": {
        "id": "2663036e-ec22-4b2c-b440-d65d7ee585f6",
        "properties": {
          "fillColor": "#c6bea1"
        }
      },
      "subTopic": {
        "id": "30d19b18-783d-4061-b09b-311b25e56c5a",
        "properties": {
          "fillColor": "#e7e4d8"
        }
      },
      "floatingTopic": {
        "id": "743243e8-8630-4024-b080-68d2ab2396fe",
        "properties": {
          "fillColor": "#c6bea1",
          "borderColor": "#908357"
        }
      },
      "summaryTopic": {
        "id": "c849b111-eb15-46e0-ab1d-b565d1ae9eab",
        "properties": {
          "fillColor": "#a2a2af",
          "borderColor": "#a2a2af"
        }
      },
      "calloutTopic": {
        "id": "fbffc3ef-bf14-49db-af20-0a15c597cb20",
        "properties": {
          "fillColor": "#a2a2af",
          "borderColor": "#a2a2af"
        }
      },
      "importantTopic": {
        "id": "fbd07ccd-b7ed-4fab-8c21-cf32daffd1a0",
        "properties": {
          "fillColor": "#191532",
          "borderColor": "#908357"
        }
      },
      "minorTopic": {
        "id": "d39fae57-172d-4519-8600-da7834f8dfa3",
        "properties": {
          "fillColor": "#3e337b",
          "borderColor": "#3e337b"
        }
      },
      "boundary": {
        "id": "884a4a63-9f00-46f0-b3cf-966acb583759",
        "properties": {
          "fillColor": "#a2a2af",
          "lineColor": "#a2a2af"
        }
      },
      "summary": {
        "id": "b318ed59-c769-4098-93ab-a492546d7ff6",
        "properties": {
          "lineColor": "#a2a2af"
        }
      },
      "relationship": {
        "id": "75ca1f1f-4d55-486d-966d-4470a038fdb4",
        "properties": {
          "lineColor": "#a2a2af"
        }
      }
    }
  },
  {
    "id": "3f889ac5-9e74-49dd-b4cf-fbe8b4b48066",
    "tags": [
      "Light Grayish"
    ],
    "theme": {
      "map": {
        "id": "5a4ff022-e498-4740-908f-1e37d818fdee",
        "properties": {
          "fillColor": "#e7ede9",
          "multiLineColors": "",
          "color-list": "#e7ede9 #18211b"
        }
      },
      "centralTopic": {
        "id": "23d3ae79-06f2-46d5-b046-970cf6d3ee79",
        "properties": {
          "fillColor": "#9db6a5",
          "lineColor": "#5a7964"
        }
      },
      "mainTopic": {
        "id": "da3a52a2-fc4f-41d7-9ea9-3bde8d5274ed",
        "properties": {
          "fillColor": "#9db6a5"
        }
      },
      "subTopic": {
        "id": "c64eeaa2-91b0-48d5-8bfc-d43f3b8ac80f",
        "properties": {
          "fillColor": "#d7e1da"
        }
      },
      "floatingTopic": {
        "id": "4a02751c-fbf7-4c93-b9c4-112daff0b2e4",
        "properties": {
          "fillColor": "#9db6a5",
          "borderColor": "#5a7964"
        }
      },
      "summaryTopic": {
        "id": "e49b491a-9574-431a-863c-d31282b6910f",
        "properties": {
          "fillColor": "#bdacb0",
          "borderColor": "#bdacb0"
        }
      },
      "calloutTopic": {
        "id": "378d47da-e581-4277-85ab-fc623397da5a",
        "properties": {
          "fillColor": "#bdacb0",
          "borderColor": "#bdacb0"
        }
      },
      "importantTopic": {
        "id": "6965e89b-1ea4-4165-b7d6-0b1ca8c2a82c",
        "properties": {
          "fillColor": "#320a1f",
          "borderColor": "#5a7964"
        }
      },
      "minorTopic": {
        "id": "33101aed-5ec1-40e8-b862-739d3d811828",
        "properties": {
          "fillColor": "#861d55",
          "borderColor": "#861d55"
        }
      },
      "boundary": {
        "id": "ec6f5ac4-cac5-483a-8fe2-f11d700627ca",
        "properties": {
          "fillColor": "#bdacb0",
          "lineColor": "#bdacb0"
        }
      },
      "summary": {
        "id": "32ac8567-8f37-4334-909c-aa1efc1a300b",
        "properties": {
          "lineColor": "#bdacb0"
        }
      },
      "relationship": {
        "id": "3b6726e8-be2a-4b38-be33-58d582d8ebd7",
        "properties": {
          "lineColor": "#bdacb0"
        }
      }
    }
  },
  {
    "id": "5cc2c51f-1d59-44cb-952b-eae4aa07f3a1",
    "tags": [
      "Light Grayish"
    ],
    "theme": {
      "map": {
        "id": "1d7850da-154a-42e2-9de1-37ee2f2347b1",
        "properties": {
          "fillColor": "#e7eced",
          "multiLineColors": "",
          "color-list": "#e7eced #1a2224"
        }
      },
      "centralTopic": {
        "id": "7cdc1347-f5e7-444d-9c0b-b8fc04ebcab8",
        "properties": {
          "fillColor": "#9eb4b9",
          "lineColor": "#5a767d"
        }
      },
      "mainTopic": {
        "id": "a37ba9f6-1156-408d-9ffb-1066156bc8b0",
        "properties": {
          "fillColor": "#9eb4b9"
        }
      },
      "subTopic": {
        "id": "2e6edaff-0f7d-4b72-a6bb-3745906f02bb",
        "properties": {
          "fillColor": "#d9e1e3"
        }
      },
      "floatingTopic": {
        "id": "926487da-ddba-45fe-8317-9fa103ce571c",
        "properties": {
          "fillColor": "#9eb4b9",
          "borderColor": "#5a767d"
        }
      },
      "summaryTopic": {
        "id": "e2e802f2-6872-4706-8b2c-956f7609af7e",
        "properties": {
          "fillColor": "#c1aba5",
          "borderColor": "#c1aba5"
        }
      },
      "calloutTopic": {
        "id": "a409d129-2a7c-4216-bd2c-34230d6136e5",
        "properties": {
          "fillColor": "#c1aba5",
          "borderColor": "#c1aba5"
        }
      },
      "importantTopic": {
        "id": "76183ec0-7804-4282-b0d3-b6971df5d412",
        "properties": {
          "fillColor": "#531d0e",
          "borderColor": "#5a767d"
        }
      },
      "minorTopic": {
        "id": "1f5b1c64-71e6-4a61-9708-ca3bc82cc860",
        "properties": {
          "fillColor": "#ab3d1d",
          "borderColor": "#ab3d1d"
        }
      },
      "boundary": {
        "id": "eac1b5d2-8ceb-40d6-bed6-7bb37bd79560",
        "properties": {
          "fillColor": "#c1aba5",
          "lineColor": "#c1aba5"
        }
      },
      "summary": {
        "id": "ef84f575-989f-47aa-8407-73215d590802",
        "properties": {
          "lineColor": "#c1aba5"
        }
      },
      "relationship": {
        "id": "8ad80808-ab88-4fca-8fd0-1cd7ba0c9cdd",
        "properties": {
          "lineColor": "#c1aba5"
        }
      }
    }
  },
  {
    "id": "01856bdb-ea78-4c8f-9e7e-9cf4764ee328",
    "tags": [
      "Light Grayish"
    ],
    "theme": {
      "map": {
        "id": "6c5a2f26-aca7-4635-99e9-fa7b6a9d0ab0",
        "properties": {
          "fillColor": "#e9e9ec",
          "multiLineColors": "",
          "color-list": "#e9e9ec #1a1a1e"
        }
      },
      "centralTopic": {
        "id": "313caad2-f783-4cf6-ab76-8968c8d1bd39",
        "properties": {
          "fillColor": "#a2a2af",
          "lineColor": "#606070"
        }
      },
      "mainTopic": {
        "id": "0110159d-27a6-47cc-8667-99e8886f9bc9",
        "properties": {
          "fillColor": "#a2a2af"
        }
      },
      "subTopic": {
        "id": "09245897-c476-4b36-97e2-46e70b76cd57",
        "properties": {
          "fillColor": "#d8d8de"
        }
      },
      "floatingTopic": {
        "id": "7e449d0d-4518-45ad-bcc2-2c7b18a3cc81",
        "properties": {
          "fillColor": "#a2a2af",
          "borderColor": "#606070"
        }
      },
      "summaryTopic": {
        "id": "f47407c6-a0c6-45ac-8db0-191f4e90790d",
        "properties": {
          "fillColor": "#c6bea1",
          "borderColor": "#c6bea1"
        }
      },
      "calloutTopic": {
        "id": "c65112fa-e5cb-4f77-95b2-72a202ffa1dc",
        "properties": {
          "fillColor": "#c6bea1",
          "borderColor": "#c6bea1"
        }
      },
      "importantTopic": {
        "id": "c1ffe465-5fa7-4de5-9430-2ffffd8593ea",
        "properties": {
          "fillColor": "#4c3f00",
          "borderColor": "#606070"
        }
      },
      "minorTopic": {
        "id": "79f7327f-81c8-480b-b319-9af2a37ae766",
        "properties": {
          "fillColor": "#b39300",
          "borderColor": "#b39300"
        }
      },
      "boundary": {
        "id": "0422d849-d5c6-45ba-9270-a65f7d44371e",
        "properties": {
          "fillColor": "#c6bea1",
          "lineColor": "#c6bea1"
        }
      },
      "summary": {
        "id": "3ba107bd-93cf-4aed-a76c-fd0b3a274d7a",
        "properties": {
          "lineColor": "#c6bea1"
        }
      },
      "relationship": {
        "id": "6844ec4e-c361-40e4-929f-458147b69cb9",
        "properties": {
          "lineColor": "#c6bea1"
        }
      }
    }
  },
  {
    "id": "aaef1851-9cda-40fa-a371-a4859d4aa356",
    "tags": [
      "Light Grayish"
    ],
    "theme": {
      "map": {
        "id": "4a728405-c580-4112-9943-6beff60645aa",
        "properties": {
          "fillColor": "#ece8e9",
          "multiLineColors": "",
          "color-list": "#ece8e9 #2c2325"
        }
      },
      "centralTopic": {
        "id": "af26f86a-d979-4e04-ad70-4fe59855ef2f",
        "properties": {
          "fillColor": "#bdacb0",
          "lineColor": "#82676d"
        }
      },
      "mainTopic": {
        "id": "8c0b3d75-6b62-44b4-9915-61c25859760e",
        "properties": {
          "fillColor": "#bdacb0"
        }
      },
      "subTopic": {
        "id": "a6731320-99de-4d1c-8a30-3460b49dbebf",
        "properties": {
          "fillColor": "#e3dcde"
        }
      },
      "floatingTopic": {
        "id": "7d7c7da2-61b7-4e97-b76e-1c8342bfeea2",
        "properties": {
          "fillColor": "#bdacb0",
          "borderColor": "#82676d"
        }
      },
      "summaryTopic": {
        "id": "e4428ca0-5f7d-4b80-97b2-b6d1ab3843a0",
        "properties": {
          "fillColor": "#9db6a5",
          "borderColor": "#9db6a5"
        }
      },
      "calloutTopic": {
        "id": "b21b7a52-b5e4-401a-ac83-c5d2909585ac",
        "properties": {
          "fillColor": "#9db6a5",
          "borderColor": "#9db6a5"
        }
      },
      "importantTopic": {
        "id": "49503060-dc06-4f99-a4dc-f727da1ebd44",
        "properties": {
          "fillColor": "#000f08",
          "borderColor": "#82676d"
        }
      },
      "minorTopic": {
        "id": "05780e1c-8370-4358-8e6a-cb74a29b90ff",
        "properties": {
          "fillColor": "#007243",
          "borderColor": "#007243"
        }
      },
      "boundary": {
        "id": "f98a466e-429b-493a-bff8-7f887bb0b26e",
        "properties": {
          "fillColor": "#9db6a5",
          "lineColor": "#9db6a5"
        }
      },
      "summary": {
        "id": "1280e806-9343-4719-908d-1da06784d908",
        "properties": {
          "lineColor": "#9db6a5"
        }
      },
      "relationship": {
        "id": "80d3cc04-5af5-4301-abea-f1a1ac1b6c32",
        "properties": {
          "lineColor": "#9db6a5"
        }
      }
    }
  },
  {
    "id": "b1edf1ce-cb85-493d-88e1-a47caa6c24a1",
    "tags": [
      "Light Dark"
    ],
    "theme": {
      "map": {
        "id": "3e8030e4-45ec-4196-8755-66cd5d4c71a7",
        "properties": {
          "fillColor": "#2d221f",
          "multiLineColors": "",
          "color-list": "#eee8e6 #2d221f"
        }
      },
      "centralTopic": {
        "id": "48033c89-e6dd-49ed-8081-b203bf452c35",
        "properties": {
          "fillColor": "#c1aba5",
          "lineColor": "#eee8e6"
        }
      },
      "mainTopic": {
        "id": "c49cb1e5-c437-43c3-b565-69a922d8681f",
        "properties": {
          "fillColor": "#c1aba5"
        }
      },
      "subTopic": {
        "id": "bb4af8e9-03a7-4c1e-b3c5-dce2443d218b",
        "properties": {
          "fillColor": "#40302c"
        }
      },
      "floatingTopic": {
        "id": "b7bfde10-f5ff-48fc-83f6-d161f00253ad",
        "properties": {
          "fillColor": "#c1aba5",
          "borderColor": "#eee8e6"
        }
      },
      "summaryTopic": {
        "id": "70a1f682-ca2c-4ac4-8ed6-2d41d8acbc8d",
        "properties": {
          "fillColor": "#9eb4b9",
          "borderColor": "#9eb4b9"
        }
      },
      "calloutTopic": {
        "id": "c7da8943-815b-4297-9be3-7cf490b1dc90",
        "properties": {
          "fillColor": "#9eb4b9",
          "borderColor": "#9eb4b9"
        }
      },
      "importantTopic": {
        "id": "faf46c60-3bae-4901-999c-e86e39916186",
        "properties": {
          "fillColor": "#c2dfe6",
          "borderColor": "#eee8e6"
        }
      },
      "minorTopic": {
        "id": "2d6dccf5-9fc5-42ed-9791-210e43b2e33b",
        "properties": {
          "fillColor": "#79baca",
          "borderColor": "#79baca"
        }
      },
      "boundary": {
        "id": "8633de7e-a72c-4c8e-a180-3bfaf4784bad",
        "properties": {
          "fillColor": "#9eb4b9",
          "lineColor": "#9eb4b9"
        }
      },
      "summary": {
        "id": "3d8a12d4-0b8b-46b2-8c42-d36713674c52",
        "properties": {
          "lineColor": "#9eb4b9"
        }
      },
      "relationship": {
        "id": "c2cc1cd3-905e-4c78-b9c0-0d1d174a8da0",
        "properties": {
          "lineColor": "#9eb4b9"
        }
      }
    }
  },
  {
    "id": "67681e99-d444-411a-96aa-2dd254f66294",
    "tags": [
      "Light Dark"
    ],
    "theme": {
      "map": {
        "id": "7a6fb754-6073-4828-98b2-3b96af374bf5",
        "properties": {
          "fillColor": "#302c1d",
          "multiLineColors": "",
          "color-list": "#efede5 #302c1d"
        }
      },
      "centralTopic": {
        "id": "36e53c7f-0957-4eab-b139-08e5afbe719c",
        "properties": {
          "fillColor": "#c6bea1",
          "lineColor": "#efede5"
        }
      },
      "mainTopic": {
        "id": "4ec20a18-7c98-4c29-bc67-bbe3e2dbcac7",
        "properties": {
          "fillColor": "#c6bea1"
        }
      },
      "subTopic": {
        "id": "04f33048-563f-4fee-9a3e-4e5429a91235",
        "properties": {
          "fillColor": "#433e29"
        }
      },
      "floatingTopic": {
        "id": "222cedda-fb05-4226-b845-c85c7ed501ff",
        "properties": {
          "fillColor": "#c6bea1",
          "borderColor": "#efede5"
        }
      },
      "summaryTopic": {
        "id": "7fe58bfb-1869-4dfa-a5bf-2e542b84aaa8",
        "properties": {
          "fillColor": "#a2a2af",
          "borderColor": "#a2a2af"
        }
      },
      "calloutTopic": {
        "id": "07805487-198f-443f-a7cc-0b5a6808ad02",
        "properties": {
          "fillColor": "#a2a2af",
          "borderColor": "#a2a2af"
        }
      },
      "importantTopic": {
        "id": "4d6a509c-cee3-4d50-9fb6-10041d286f76",
        "properties": {
          "fillColor": "#e0dfec",
          "borderColor": "#efede5"
        }
      },
      "minorTopic": {
        "id": "81ba865a-9028-47e5-a7c6-48da99356cda",
        "properties": {
          "fillColor": "#a29fc7",
          "borderColor": "#a29fc7"
        }
      },
      "boundary": {
        "id": "a18c6dd8-0926-49b3-a23f-77c47ed069cf",
        "properties": {
          "fillColor": "#a2a2af",
          "lineColor": "#a2a2af"
        }
      },
      "summary": {
        "id": "62e2971d-4ec4-4f03-a591-17ca8cb49de8",
        "properties": {
          "lineColor": "#a2a2af"
        }
      },
      "relationship": {
        "id": "a2e50503-3415-4ea6-a166-77455c92e41f",
        "properties": {
          "lineColor": "#a2a2af"
        }
      }
    }
  },
  {
    "id": "0c29d43c-7703-45f4-8257-162e95eadc89",
    "tags": [
      "Light Dark"
    ],
    "theme": {
      "map": {
        "id": "296f7ee2-46b0-4ac4-bd36-eb6488d38a77",
        "properties": {
          "fillColor": "#18211b",
          "multiLineColors": "",
          "color-list": "#e7ede9 #18211b"
        }
      },
      "centralTopic": {
        "id": "e80b728e-b409-4182-be0f-43818223a669",
        "properties": {
          "fillColor": "#9db6a5",
          "lineColor": "#e7ede9"
        }
      },
      "mainTopic": {
        "id": "6d1f7f9a-7470-4af0-8204-b42fc2c053b6",
        "properties": {
          "fillColor": "#9db6a5"
        }
      },
      "subTopic": {
        "id": "5c207591-d902-4e60-b2f3-01f80a303c23",
        "properties": {
          "fillColor": "#26332a"
        }
      },
      "floatingTopic": {
        "id": "7cf182a8-f05d-4634-8d49-8d596892876c",
        "properties": {
          "fillColor": "#9db6a5",
          "borderColor": "#e7ede9"
        }
      },
      "summaryTopic": {
        "id": "fcd8dfc8-55c2-48e2-a00d-6a8ed4912fd2",
        "properties": {
          "fillColor": "#bdacb0",
          "borderColor": "#bdacb0"
        }
      },
      "calloutTopic": {
        "id": "4df1c268-ce00-4e03-87e1-cfa4e26a7446",
        "properties": {
          "fillColor": "#bdacb0",
          "borderColor": "#bdacb0"
        }
      },
      "importantTopic": {
        "id": "52dc09bd-d5f5-4707-9854-3ebc6146ab09",
        "properties": {
          "fillColor": "#f6e9ed",
          "borderColor": "#e7ede9"
        }
      },
      "minorTopic": {
        "id": "cc83e6f9-93cf-462d-b23e-9bb70977b077",
        "properties": {
          "fillColor": "#daa0b3",
          "borderColor": "#daa0b3"
        }
      },
      "boundary": {
        "id": "bb7212ae-6791-47ad-a3c2-6214f783f34e",
        "properties": {
          "fillColor": "#bdacb0",
          "lineColor": "#bdacb0"
        }
      },
      "summary": {
        "id": "54e34aa5-ae8b-4d2f-b231-58afe2b613e5",
        "properties": {
          "lineColor": "#bdacb0"
        }
      },
      "relationship": {
        "id": "98989079-4a5d-46a4-99d5-46da90b48f5a",
        "properties": {
          "lineColor": "#bdacb0"
        }
      }
    }
  },
  {
    "id": "8218c89e-97ad-44f5-afaf-66e61ade240c",
    "tags": [
      "Light Dark"
    ],
    "theme": {
      "map": {
        "id": "fd3c2aa9-cc1c-4e73-91b9-d91cb62050a4",
        "properties": {
          "fillColor": "#1a2224",
          "multiLineColors": "",
          "color-list": "#e7eced #1a2224"
        }
      },
      "centralTopic": {
        "id": "6541fc15-a99b-4ca3-9f90-35eb416893c6",
        "properties": {
          "fillColor": "#9eb4b9",
          "lineColor": "#e7eced"
        }
      },
      "mainTopic": {
        "id": "19a31d88-305a-4efd-a08a-7b71929782dd",
        "properties": {
          "fillColor": "#9eb4b9"
        }
      },
      "subTopic": {
        "id": "9b1fa84d-2800-4255-8664-8759e920ac85",
        "properties": {
          "fillColor": "#273336"
        }
      },
      "floatingTopic": {
        "id": "9438b999-aa88-4cbd-b75c-b7dae47baf3c",
        "properties": {
          "fillColor": "#9eb4b9",
          "borderColor": "#e7eced"
        }
      },
      "summaryTopic": {
        "id": "2244772c-ee6b-4ece-88f7-0a5dc4e5ab42",
        "properties": {
          "fillColor": "#c1aba5",
          "borderColor": "#c1aba5"
        }
      },
      "calloutTopic": {
        "id": "6f56518b-ca96-433b-87b3-2e94a7bc16fa",
        "properties": {
          "fillColor": "#c1aba5",
          "borderColor": "#c1aba5"
        }
      },
      "importantTopic": {
        "id": "d7885580-a3c3-428c-9295-6515f5c5b31c",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#e7eced"
        }
      },
      "minorTopic": {
        "id": "82087ed4-e1b8-4a2c-8350-3c591eca5000",
        "properties": {
          "fillColor": "#ffb99e",
          "borderColor": "#ffb99e"
        }
      },
      "boundary": {
        "id": "a12ce9c5-8136-4682-82c7-cfeb8278509b",
        "properties": {
          "fillColor": "#c1aba5",
          "lineColor": "#c1aba5"
        }
      },
      "summary": {
        "id": "2d62f34c-3a5b-4451-ba13-09fad23cf67a",
        "properties": {
          "lineColor": "#c1aba5"
        }
      },
      "relationship": {
        "id": "f6b964f0-a91f-4a43-83f1-0f5893d74607",
        "properties": {
          "lineColor": "#c1aba5"
        }
      }
    }
  },
  {
    "id": "197112fd-b7cf-4576-9400-b8fab54f2d6f",
    "tags": [
      "Light Dark"
    ],
    "theme": {
      "map": {
        "id": "10c285eb-00ad-4bdd-b0d9-563a1ededb92",
        "properties": {
          "fillColor": "#1a1a1e",
          "multiLineColors": "",
          "color-list": "#e9e9ec #1a1a1e"
        }
      },
      "centralTopic": {
        "id": "6f997aea-355b-4209-b4fe-4d986914acdd",
        "properties": {
          "fillColor": "#a2a2af",
          "lineColor": "#e9e9ec"
        }
      },
      "mainTopic": {
        "id": "04b82d03-9dba-497d-954d-d6480bc24dd3",
        "properties": {
          "fillColor": "#a2a2af"
        }
      },
      "subTopic": {
        "id": "ed294d04-928b-419d-935d-614c18fb0024",
        "properties": {
          "fillColor": "#28282e"
        }
      },
      "floatingTopic": {
        "id": "589fc7f0-0759-4067-92ec-11a35d2b1ff8",
        "properties": {
          "fillColor": "#a2a2af",
          "borderColor": "#e9e9ec"
        }
      },
      "summaryTopic": {
        "id": "94d513ce-c89d-4339-a54a-9947f4307747",
        "properties": {
          "fillColor": "#c6bea1",
          "borderColor": "#c6bea1"
        }
      },
      "calloutTopic": {
        "id": "6cb44f02-cf32-4ad8-82e9-f0d4c3bba9f4",
        "properties": {
          "fillColor": "#c6bea1",
          "borderColor": "#c6bea1"
        }
      },
      "importantTopic": {
        "id": "31f82625-66fb-4731-9afb-c5987d16ec4f",
        "properties": {
          "fillColor": "#fefbf1",
          "borderColor": "#e9e9ec"
        }
      },
      "minorTopic": {
        "id": "9257d553-4b24-4591-9151-8279ec5593a9",
        "properties": {
          "fillColor": "#fbe68f",
          "borderColor": "#fbe68f"
        }
      },
      "boundary": {
        "id": "f525a636-8f78-4df6-8ae8-e180f2c79797",
        "properties": {
          "fillColor": "#c6bea1",
          "lineColor": "#c6bea1"
        }
      },
      "summary": {
        "id": "f81dd7bd-0ff2-480d-803e-2ad77eb9b416",
        "properties": {
          "lineColor": "#c6bea1"
        }
      },
      "relationship": {
        "id": "60fe2b66-033f-4aea-8dd7-e96dab6972d7",
        "properties": {
          "lineColor": "#c6bea1"
        }
      }
    }
  },
  {
    "id": "55798f4e-b66b-409c-bf4d-cb1c2696da95",
    "tags": [
      "Light Dark"
    ],
    "theme": {
      "map": {
        "id": "832875ae-f9dc-42be-8c3d-9f83272a69e5",
        "properties": {
          "fillColor": "#2c2325",
          "multiLineColors": "",
          "color-list": "#ece8e9 #2c2325"
        }
      },
      "centralTopic": {
        "id": "cce15cef-1e51-4f30-a01e-7599de0787c5",
        "properties": {
          "fillColor": "#bdacb0",
          "lineColor": "#ece8e9"
        }
      },
      "mainTopic": {
        "id": "44016490-4fdc-4e28-b22a-0a30bd995a52",
        "properties": {
          "fillColor": "#bdacb0"
        }
      },
      "subTopic": {
        "id": "031fb9f5-06b3-42dd-8461-cdef876ebe92",
        "properties": {
          "fillColor": "#3d3134"
        }
      },
      "floatingTopic": {
        "id": "adcf7c81-6a4e-40cb-a73a-f5cd76c0c3c9",
        "properties": {
          "fillColor": "#bdacb0",
          "borderColor": "#ece8e9"
        }
      },
      "summaryTopic": {
        "id": "c9cb40d5-aeb5-4816-bdd6-ec7fcf9bdbdf",
        "properties": {
          "fillColor": "#9db6a5",
          "borderColor": "#9db6a5"
        }
      },
      "calloutTopic": {
        "id": "f1312aee-9ef6-4d4d-b01b-86e1cd8b4eab",
        "properties": {
          "fillColor": "#9db6a5",
          "borderColor": "#9db6a5"
        }
      },
      "importantTopic": {
        "id": "0a5c7861-0064-4bac-8d75-6b3b206e69ac",
        "properties": {
          "fillColor": "#e5f5e9",
          "borderColor": "#ece8e9"
        }
      },
      "minorTopic": {
        "id": "495e11c9-20e8-4c05-b115-e22f4d9f2b76",
        "properties": {
          "fillColor": "#9cd9ac",
          "borderColor": "#9cd9ac"
        }
      },
      "boundary": {
        "id": "0db09107-27e2-4f02-802a-d37f37c48a5f",
        "properties": {
          "fillColor": "#9db6a5",
          "lineColor": "#9db6a5"
        }
      },
      "summary": {
        "id": "f942bce4-ed85-4a22-a675-1498f25669f3",
        "properties": {
          "lineColor": "#9db6a5"
        }
      },
      "relationship": {
        "id": "558ca616-3d97-411d-bfc6-2c52ad6d7d89",
        "properties": {
          "lineColor": "#9db6a5"
        }
      }
    }
  },
  {
    "id": "0d1f9990-68ae-47eb-ba9d-26494b8ffbcf",
    "tags": [
      "Light Colorful"
    ],
    "theme": {
      "map": {
        "id": "3eff5bb6-fb06-4b48-9164-5031d7a80f68",
        "properties": {
          "fillColor": "#efe6c6",
          "multiLineColors": "",
          "color-list": "#ffffff #201e14"
        }
      },
      "centralTopic": {
        "id": "8afd410f-d8c8-4601-b76a-e924cc7f9a60",
        "properties": {
          "fillColor": "#ab9446",
          "lineColor": "#201e14"
        }
      },
      "mainTopic": {
        "id": "d5128cb8-1f37-4cac-9655-45d4d4b4f85e",
        "properties": {
          "fillColor": "#ab9446"
        }
      },
      "subTopic": {
        "id": "f9ad35cd-209a-4ddf-8cf5-0025cf388b4f",
        "properties": {
          "fillColor": "#ab9446"
        }
      },
      "floatingTopic": {
        "id": "3d362181-29fb-41a6-a4da-a7c303c471a6",
        "properties": {
          "fillColor": "#ab9446",
          "borderColor": "#ab9446"
        }
      },
      "summaryTopic": {
        "id": "c7f5f3ce-c141-4427-9af7-1c64e08a1ce5",
        "properties": {
          "fillColor": "#2a7b76",
          "borderColor": "#2a7b76"
        }
      },
      "calloutTopic": {
        "id": "75dc3474-8aab-4442-aeb8-c0732fe685c4",
        "properties": {
          "fillColor": "#2a7b76",
          "borderColor": "#2a7b76"
        }
      },
      "importantTopic": {
        "id": "5b59c98a-e428-455d-890d-6e21446c6703",
        "properties": {
          "fillColor": "#100d20",
          "borderColor": "#201e14"
        }
      },
      "minorTopic": {
        "id": "163a7326-ece5-43cc-a850-b0030e728444",
        "properties": {
          "fillColor": "#342b68",
          "borderColor": "#342b68"
        }
      },
      "boundary": {
        "id": "752492b1-f4b3-4cc9-ae13-daffc9b60350",
        "properties": {
          "fillColor": "#2a7b76",
          "lineColor": "#2a7b76"
        }
      },
      "summary": {
        "id": "f0088cb9-bc18-488f-87f7-017f344ac49d",
        "properties": {
          "lineColor": "#2a7b76"
        }
      },
      "relationship": {
        "id": "230250d6-7f04-46bc-919c-7b3db830bbe9",
        "properties": {
          "lineColor": "#2a7b76"
        }
      }
    }
  },
  {
    "id": "2850be78-b977-461f-9526-182c4a4af2c8",
    "tags": [
      "Light Colorful"
    ],
    "theme": {
      "map": {
        "id": "77722f90-9044-472c-aa8b-d67300c0264b",
        "properties": {
          "fillColor": "#c4e0cb",
          "multiLineColors": "",
          "color-list": "#fffeff #0e120f"
        }
      },
      "centralTopic": {
        "id": "6e19df5b-90b1-4cf9-87de-bc0cd0c7df8c",
        "properties": {
          "fillColor": "#4f8766",
          "lineColor": "#0e120f"
        }
      },
      "mainTopic": {
        "id": "fc2c1801-2218-40c2-9fcf-7c67c965b42b",
        "properties": {
          "fillColor": "#4f8766"
        }
      },
      "subTopic": {
        "id": "459673ce-1b69-4297-b45b-ff64dff1ba60",
        "properties": {
          "fillColor": "#4f8766"
        }
      },
      "floatingTopic": {
        "id": "bc7c9acb-0814-4896-9a60-d5e20e5fb164",
        "properties": {
          "fillColor": "#4f8766",
          "borderColor": "#4f8766"
        }
      },
      "summaryTopic": {
        "id": "b1127cc2-db8e-4ffa-8220-9d8dba233b81",
        "properties": {
          "fillColor": "#34597d",
          "borderColor": "#34597d"
        }
      },
      "calloutTopic": {
        "id": "dfdbcee1-2990-4795-8c35-74956d73fdd4",
        "properties": {
          "fillColor": "#34597d",
          "borderColor": "#34597d"
        }
      },
      "importantTopic": {
        "id": "e797df7d-e0dd-44d3-9ec9-22041df9df37",
        "properties": {
          "fillColor": "#1d0612",
          "borderColor": "#0e120f"
        }
      },
      "minorTopic": {
        "id": "96e052bc-a7c0-4b73-ab0c-7d40913ecda9",
        "properties": {
          "fillColor": "#711847",
          "borderColor": "#711847"
        }
      },
      "boundary": {
        "id": "efaaed80-15c9-442c-8d87-15d8fb0761a8",
        "properties": {
          "fillColor": "#34597d",
          "lineColor": "#34597d"
        }
      },
      "summary": {
        "id": "85d6d5e9-a846-4f49-b89e-54d9c8b36a4d",
        "properties": {
          "lineColor": "#34597d"
        }
      },
      "relationship": {
        "id": "da334b5f-abb7-4a8c-b490-ad3343c99b9a",
        "properties": {
          "lineColor": "#34597d"
        }
      }
    }
  },
  {
    "id": "35333fe8-fb29-4e04-b121-9d64a1acbcd9",
    "tags": [
      "Light Colorful"
    ],
    "theme": {
      "map": {
        "id": "334213a4-c4d4-4c7f-b0bf-22ce069a249c",
        "properties": {
          "fillColor": "#c6dde2",
          "multiLineColors": "",
          "color-list": "#ffffff #0f1415"
        }
      },
      "centralTopic": {
        "id": "4a24ff42-21c5-4070-a71a-5bbfa179fb5a",
        "properties": {
          "fillColor": "#246a7d",
          "lineColor": "#0f1415"
        }
      },
      "mainTopic": {
        "id": "9b19bb79-1b51-4a85-874a-7ed56ec62fca",
        "properties": {
          "fillColor": "#246a7d"
        }
      },
      "subTopic": {
        "id": "d4654f73-3fa2-46da-adcb-dfc14fa98a77",
        "properties": {
          "fillColor": "#246a7d"
        }
      },
      "floatingTopic": {
        "id": "b59a1a3e-bbd6-4cd1-807f-38079585ae2e",
        "properties": {
          "fillColor": "#246a7d",
          "borderColor": "#246a7d"
        }
      },
      "summaryTopic": {
        "id": "15ada865-88fd-4a63-9fa2-6597a14c8fe7",
        "properties": {
          "fillColor": "#6c4a71",
          "borderColor": "#6c4a71"
        }
      },
      "calloutTopic": {
        "id": "c04edf6e-b0a5-4e38-88f9-e68011df1e44",
        "properties": {
          "fillColor": "#6c4a71",
          "borderColor": "#6c4a71"
        }
      },
      "importantTopic": {
        "id": "e9209673-b43d-41e2-9855-56b1cc9842a6",
        "properties": {
          "fillColor": "#3d160a",
          "borderColor": "#0f1415"
        }
      },
      "minorTopic": {
        "id": "8265eda9-0f50-441d-b0e9-bae481aea9e8",
        "properties": {
          "fillColor": "#953519",
          "borderColor": "#953519"
        }
      },
      "boundary": {
        "id": "5f37caf2-95a0-41a1-b19f-a2f4557c9310",
        "properties": {
          "fillColor": "#6c4a71",
          "lineColor": "#6c4a71"
        }
      },
      "summary": {
        "id": "e1597b0c-e21b-44d1-b316-d64eddf937d2",
        "properties": {
          "lineColor": "#6c4a71"
        }
      },
      "relationship": {
        "id": "a4a860c2-a98e-40a0-9ce0-4a881d36b973",
        "properties": {
          "lineColor": "#6c4a71"
        }
      }
    }
  },
  {
    "id": "a456ef16-1724-4b24-9db6-c3a18fc8602b",
    "tags": [
      "Light Colorful"
    ],
    "theme": {
      "map": {
        "id": "007fd590-e17e-4aa5-8397-5bfe1c82f1eb",
        "properties": {
          "fillColor": "#c9cad5",
          "multiLineColors": "",
          "color-list": "#ffffff #0e0e10"
        }
      },
      "centralTopic": {
        "id": "e75a66b4-6d9c-4549-b87e-bdba3cc4d1b1",
        "properties": {
          "fillColor": "#54527c",
          "lineColor": "#0e0e10"
        }
      },
      "mainTopic": {
        "id": "d691c24d-8999-4873-ad3d-cf862910445e",
        "properties": {
          "fillColor": "#54527c"
        }
      },
      "subTopic": {
        "id": "211618e4-24c6-4500-b6e2-4879138be48b",
        "properties": {
          "fillColor": "#54527c"
        }
      },
      "floatingTopic": {
        "id": "d09b6b15-f394-4750-b843-fd0b15041bd9",
        "properties": {
          "fillColor": "#54527c",
          "borderColor": "#54527c"
        }
      },
      "summaryTopic": {
        "id": "6521eb8e-ca50-433c-805f-ffd691c79d3f",
        "properties": {
          "fillColor": "#a35a5c",
          "borderColor": "#a35a5c"
        }
      },
      "calloutTopic": {
        "id": "756eb022-29a5-406f-8ce8-b6e9ae6fbc76",
        "properties": {
          "fillColor": "#a35a5c",
          "borderColor": "#a35a5c"
        }
      },
      "importantTopic": {
        "id": "29cf5588-dea5-4f92-96c6-40cdb0aac653",
        "properties": {
          "fillColor": "#332a00",
          "borderColor": "#0e0e10"
        }
      },
      "minorTopic": {
        "id": "3570da29-fc7a-4bb8-9363-a8a4f93c75cf",
        "properties": {
          "fillColor": "#997e00",
          "borderColor": "#997e00"
        }
      },
      "boundary": {
        "id": "01bc3f74-55e6-4fa4-8b07-d0bd852f1021",
        "properties": {
          "fillColor": "#a35a5c",
          "lineColor": "#a35a5c"
        }
      },
      "summary": {
        "id": "34a0cc4e-2e16-46bd-9fcf-612ae7164b4f",
        "properties": {
          "lineColor": "#a35a5c"
        }
      },
      "relationship": {
        "id": "fa54fb6b-aad6-45e9-ba2c-7efc57a9ac3a",
        "properties": {
          "lineColor": "#a35a5c"
        }
      }
    }
  },
  {
    "id": "d769894d-e3e1-41cc-93ab-9f260dc44541",
    "tags": [
      "Light Colorful"
    ],
    "theme": {
      "map": {
        "id": "32ce73f5-d26d-431c-95f3-1ecf4a509f53",
        "properties": {
          "fillColor": "#d0c8d1",
          "multiLineColors": "",
          "color-list": "#fefefe #0d0b0d"
        }
      },
      "centralTopic": {
        "id": "61719f64-96bb-4110-8bfd-ed762cb4227d",
        "properties": {
          "fillColor": "#6c4a71",
          "lineColor": "#0d0b0d"
        }
      },
      "mainTopic": {
        "id": "6bd9d76d-5f6b-43ff-af0d-0100111c4aa7",
        "properties": {
          "fillColor": "#6c4a71"
        }
      },
      "subTopic": {
        "id": "cc8c9492-e1ef-4390-be41-0960e120ab74",
        "properties": {
          "fillColor": "#6c4a71"
        }
      },
      "floatingTopic": {
        "id": "ddfb8ef7-b29b-4114-b565-7eb8de609d99",
        "properties": {
          "fillColor": "#6c4a71",
          "borderColor": "#6c4a71"
        }
      },
      "summaryTopic": {
        "id": "962bab9e-30a1-4c8c-9088-5f629cfa1002",
        "properties": {
          "fillColor": "#af6954",
          "borderColor": "#af6954"
        }
      },
      "calloutTopic": {
        "id": "e01c300a-662b-4971-87ce-f772a1129352",
        "properties": {
          "fillColor": "#af6954",
          "borderColor": "#af6954"
        }
      },
      "importantTopic": {
        "id": "c0741f8e-cc49-4e97-b13c-bd921e79c39f",
        "properties": {
          "fillColor": "#0d0f00",
          "borderColor": "#0d0b0d"
        }
      },
      "minorTopic": {
        "id": "687b6bb5-5b2b-4028-a04d-8496f86c22a8",
        "properties": {
          "fillColor": "#5d6a00",
          "borderColor": "#5d6a00"
        }
      },
      "boundary": {
        "id": "543ddb35-282e-46b7-9409-b33b1d2ce30c",
        "properties": {
          "fillColor": "#af6954",
          "lineColor": "#af6954"
        }
      },
      "summary": {
        "id": "91851ba8-80ed-4b94-a51a-3434ed29dc06",
        "properties": {
          "lineColor": "#af6954"
        }
      },
      "relationship": {
        "id": "3f682d2b-b797-4904-9329-9bf153a1ecd0",
        "properties": {
          "lineColor": "#af6954"
        }
      }
    }
  },
  {
    "id": "3afdd9a5-7768-495d-a42b-486723bf3fc7",
    "tags": [
      "Light Colorful"
    ],
    "theme": {
      "map": {
        "id": "4336071a-6945-465c-ae75-6ca80701bd55",
        "properties": {
          "fillColor": "#e4d5d9",
          "multiLineColors": "",
          "color-list": "#ffffff #1e1819"
        }
      },
      "centralTopic": {
        "id": "47dfaaa8-ccbb-4dba-a46b-85f8e0bd641d",
        "properties": {
          "fillColor": "#8b4f65",
          "lineColor": "#1e1819"
        }
      },
      "mainTopic": {
        "id": "fb21e5bc-af2f-4ec4-81ca-fa0625600161",
        "properties": {
          "fillColor": "#8b4f65"
        }
      },
      "subTopic": {
        "id": "0de2df62-e118-4579-af13-9ceecc95c3c7",
        "properties": {
          "fillColor": "#8b4f65"
        }
      },
      "floatingTopic": {
        "id": "b6249232-9404-4d52-86ba-b8d281049df7",
        "properties": {
          "fillColor": "#8b4f65",
          "borderColor": "#8b4f65"
        }
      },
      "summaryTopic": {
        "id": "bed50b85-8d16-455d-8b5d-d82763916f3c",
        "properties": {
          "fillColor": "#b37f46",
          "borderColor": "#b37f46"
        }
      },
      "calloutTopic": {
        "id": "143393c0-cffb-4d94-8f4c-653eb36f6836",
        "properties": {
          "fillColor": "#b37f46",
          "borderColor": "#b37f46"
        }
      },
      "importantTopic": {
        "id": "37cb15ce-0214-4384-b3e9-2ca0eb2ad7f8",
        "properties": {
          "fillColor": "#000f08",
          "borderColor": "#1e1819"
        }
      },
      "minorTopic": {
        "id": "16d327c8-cd32-4ff5-b4f0-d4ec8504bb18",
        "properties": {
          "fillColor": "#005834",
          "borderColor": "#005834"
        }
      },
      "boundary": {
        "id": "028ff592-599a-4e53-b1c6-2e26897d72fa",
        "properties": {
          "fillColor": "#b37f46",
          "lineColor": "#b37f46"
        }
      },
      "summary": {
        "id": "8211d7e7-2644-40f3-ac0d-19b825b1d9bc",
        "properties": {
          "lineColor": "#b37f46"
        }
      },
      "relationship": {
        "id": "50392c72-8f0b-45eb-8752-2f7beea51cf0",
        "properties": {
          "lineColor": "#b37f46"
        }
      }
    }
  },
  {
    "id": "e05d413a-8205-4a5a-8e22-653a0f5b8117",
    "tags": [
      "Vivid Light"
    ],
    "theme": {
      "map": {
        "id": "7dfda34b-206a-40fe-9dbd-f46e31d86ea0",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #29090e"
        }
      },
      "centralTopic": {
        "id": "a08d1f8a-2ee9-492e-85bb-3272a6b4ba2f",
        "properties": {
          "fillColor": "#a61d39",
          "lineColor": "#4a1019"
        }
      },
      "mainTopic": {
        "id": "29672d00-9e28-4b90-80d3-ba13476d8f3a",
        "properties": {
          "fillColor": "#d02f48"
        }
      },
      "subTopic": {
        "id": "b5bdf67f-9902-4179-86a1-ae2888342cc3",
        "properties": {
          "fillColor": "#e5e5e5"
        }
      },
      "floatingTopic": {
        "id": "35f165da-9f53-4013-84e4-457bea5c6eab",
        "properties": {
          "fillColor": "#d02f48",
          "borderColor": "#4a1019"
        }
      },
      "summaryTopic": {
        "id": "a977a0ba-0580-4181-8170-e84ebd22f271",
        "properties": {
          "fillColor": "#d0678e",
          "borderColor": "#d0678e"
        }
      },
      "calloutTopic": {
        "id": "82e3e051-b459-4440-8c42-0fc306a62ca5",
        "properties": {
          "fillColor": "#d0678e",
          "borderColor": "#d0678e"
        }
      },
      "importantTopic": {
        "id": "9a01a37a-1d5f-4d4d-94a8-5e9e7dd3b338",
        "properties": {
          "fillColor": "#004746",
          "borderColor": "#4a1019"
        }
      },
      "minorTopic": {
        "id": "5df7d04a-6735-48e5-9fec-82814674bc0e",
        "properties": {
          "fillColor": "#00827c",
          "borderColor": "#00827c"
        }
      },
      "boundary": {
        "id": "d54e579b-6d2b-4806-b321-2a8a84e98102",
        "properties": {
          "fillColor": "#d0678e",
          "lineColor": "#d0678e"
        }
      },
      "summary": {
        "id": "5854aa1b-8bb2-4a20-9f15-dd078181f4d9",
        "properties": {
          "lineColor": "#d0678e"
        }
      },
      "relationship": {
        "id": "e1375bda-008a-4c64-90ec-1d7032e3395a",
        "properties": {
          "lineColor": "#d0678e"
        }
      }
    }
  },
  {
    "id": "f10c6de7-d910-4609-a374-56f63df5af60",
    "tags": [
      "Vivid Light"
    ],
    "theme": {
      "map": {
        "id": "1d5b9743-1cbd-47d7-af11-ba432aa07167",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #211c00"
        }
      },
      "centralTopic": {
        "id": "0cbc5c61-455a-46ce-a28c-01cc5a013962",
        "properties": {
          "fillColor": "#b39300",
          "lineColor": "#4c4000"
        }
      },
      "mainTopic": {
        "id": "ce072b50-2cb0-455f-b1d5-2b8c53f2ae95",
        "properties": {
          "fillColor": "#eec900"
        }
      },
      "subTopic": {
        "id": "12f6c1f6-0d38-4258-b701-44e9a1872b91",
        "properties": {
          "fillColor": "#e5e5e5"
        }
      },
      "floatingTopic": {
        "id": "7e4b2b5d-53d6-445c-9768-19dad5edb5df",
        "properties": {
          "fillColor": "#eec900",
          "borderColor": "#4c4000"
        }
      },
      "summaryTopic": {
        "id": "01e0e9de-8a16-47c1-945f-6d77c732ed78",
        "properties": {
          "fillColor": "#ffad36",
          "borderColor": "#ffad36"
        }
      },
      "calloutTopic": {
        "id": "509479fa-682d-4926-a296-3a526ef7ab2f",
        "properties": {
          "fillColor": "#ffad36",
          "borderColor": "#ffad36"
        }
      },
      "importantTopic": {
        "id": "82b75cbe-7b79-43ab-bc77-af52042d508a",
        "properties": {
          "fillColor": "#322d51",
          "borderColor": "#4c4000"
        }
      },
      "minorTopic": {
        "id": "f0823fd3-e948-4709-b908-320d884c55b0",
        "properties": {
          "fillColor": "#534c98",
          "borderColor": "#534c98"
        }
      },
      "boundary": {
        "id": "ea51fcee-bea7-4ae8-bf43-0ae7cb4a86ab",
        "properties": {
          "fillColor": "#ffad36",
          "lineColor": "#ffad36"
        }
      },
      "summary": {
        "id": "54548c2a-af44-4a91-95b4-132d15865d4e",
        "properties": {
          "lineColor": "#ffad36"
        }
      },
      "relationship": {
        "id": "feeb9b5e-7ec7-4e64-8dfe-69c54461d564",
        "properties": {
          "lineColor": "#ffad36"
        }
      }
    }
  },
  {
    "id": "4a075a5b-9865-461c-a0d0-b6eac8160671",
    "tags": [
      "Vivid Light"
    ],
    "theme": {
      "map": {
        "id": "70aaf6c8-2a42-48ec-852b-acf2e3c6e7bd",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #000f08"
        }
      },
      "centralTopic": {
        "id": "a4582243-2b4f-47b4-b0d8-2177b78e3a40",
        "properties": {
          "fillColor": "#007243",
          "lineColor": "#004c2a"
        }
      },
      "mainTopic": {
        "id": "16863411-6815-4c0e-a94b-3b9bd333ece7",
        "properties": {
          "fillColor": "#00a15a"
        }
      },
      "subTopic": {
        "id": "045859df-ebbb-4e89-867c-c397dadc4d98",
        "properties": {
          "fillColor": "#e5e5e5"
        }
      },
      "floatingTopic": {
        "id": "e15d09d2-3a9c-452e-9578-877167b3769f",
        "properties": {
          "fillColor": "#00a15a",
          "borderColor": "#004c2a"
        }
      },
      "summaryTopic": {
        "id": "cccf503e-3e50-4df6-a5b4-c5ccce000b6a",
        "properties": {
          "fillColor": "#b7c82b",
          "borderColor": "#b7c82b"
        }
      },
      "calloutTopic": {
        "id": "5c91a680-80a7-4671-88c0-969bd6a52a23",
        "properties": {
          "fillColor": "#b7c82b",
          "borderColor": "#b7c82b"
        }
      },
      "importantTopic": {
        "id": "1c9432d9-1355-4c39-aed0-b404901e97ed",
        "properties": {
          "fillColor": "#612d46",
          "borderColor": "#004c2a"
        }
      },
      "minorTopic": {
        "id": "c98894a3-1bde-49e5-907e-b107a440dfd1",
        "properties": {
          "fillColor": "#a33c6a",
          "borderColor": "#a33c6a"
        }
      },
      "boundary": {
        "id": "1a9902fc-7b90-4eb8-b6b8-b41df20b6be1",
        "properties": {
          "fillColor": "#b7c82b",
          "lineColor": "#b7c82b"
        }
      },
      "summary": {
        "id": "592cc614-0d56-4824-8c64-28f991ef4fb2",
        "properties": {
          "lineColor": "#b7c82b"
        }
      },
      "relationship": {
        "id": "38461eac-c0ed-4436-9661-68a723adccdc",
        "properties": {
          "lineColor": "#b7c82b"
        }
      }
    }
  },
  {
    "id": "bc38d71a-3d5b-4779-85cd-a8250f4a7532",
    "tags": [
      "Vivid Light"
    ],
    "theme": {
      "map": {
        "id": "2b1adbd8-9d94-4cf8-9f36-c51988382e4a",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #000b0f"
        }
      },
      "centralTopic": {
        "id": "062d1a93-9cd8-4316-96a1-cc9f9288a00d",
        "properties": {
          "fillColor": "#005476",
          "lineColor": "#00374c"
        }
      },
      "mainTopic": {
        "id": "f076daa9-c5cd-47e6-9b71-01521354b946",
        "properties": {
          "fillColor": "#00709b"
        }
      },
      "subTopic": {
        "id": "504ca4d5-ba84-45fc-bb9a-b991df1e47b8",
        "properties": {
          "fillColor": "#e5e5e5"
        }
      },
      "floatingTopic": {
        "id": "554bc2d5-2bf1-47cb-9011-2739587f82f5",
        "properties": {
          "fillColor": "#00709b",
          "borderColor": "#00374c"
        }
      },
      "summaryTopic": {
        "id": "9f05daf3-2f75-4873-8c64-a09493cfae09",
        "properties": {
          "fillColor": "#00aa9f",
          "borderColor": "#00aa9f"
        }
      },
      "calloutTopic": {
        "id": "024e8fcc-bc02-404f-b3e9-a8789778e7ce",
        "properties": {
          "fillColor": "#00aa9f",
          "borderColor": "#00aa9f"
        }
      },
      "importantTopic": {
        "id": "c5f679e7-4f1b-4e0c-aeaf-b16378352338",
        "properties": {
          "fillColor": "#75362a",
          "borderColor": "#00374c"
        }
      },
      "minorTopic": {
        "id": "d8ded8db-c664-495e-b475-9cfc0c5ce214",
        "properties": {
          "fillColor": "#cc572e",
          "borderColor": "#cc572e"
        }
      },
      "boundary": {
        "id": "12929d07-cacf-4acf-92a9-09f34f0839e7",
        "properties": {
          "fillColor": "#00aa9f",
          "lineColor": "#00aa9f"
        }
      },
      "summary": {
        "id": "e5e12ec1-7ba9-4c01-a462-fecc6f34885f",
        "properties": {
          "lineColor": "#00aa9f"
        }
      },
      "relationship": {
        "id": "01faf8cf-4e4f-48df-9298-d2b0dabf8202",
        "properties": {
          "lineColor": "#00aa9f"
        }
      }
    }
  },
  {
    "id": "98c4e16d-be50-4219-bee6-2b7c0a90a8d1",
    "tags": [
      "Vivid Light"
    ],
    "theme": {
      "map": {
        "id": "dd8f2394-48e0-458b-b36e-5c04b8b739f4",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #00080f"
        }
      },
      "centralTopic": {
        "id": "d2db7ddf-e59e-43d9-ba15-81fce6a954ca",
        "properties": {
          "fillColor": "#004280",
          "lineColor": "#002a4c"
        }
      },
      "mainTopic": {
        "id": "732886b4-33ce-4f4a-99b6-367e94c6552f",
        "properties": {
          "fillColor": "#005ba5"
        }
      },
      "subTopic": {
        "id": "ac1d2614-6793-470f-898b-520efc0f45be",
        "properties": {
          "fillColor": "#e5e5e5"
        }
      },
      "floatingTopic": {
        "id": "6dc977ed-3e31-4805-bc40-67620f499439",
        "properties": {
          "fillColor": "#005ba5",
          "borderColor": "#002a4c"
        }
      },
      "summaryTopic": {
        "id": "e7abc275-f92d-40e4-b478-daff31d7a685",
        "properties": {
          "fillColor": "#0098b9",
          "borderColor": "#0098b9"
        }
      },
      "calloutTopic": {
        "id": "a073a7cf-c872-48c6-8ca3-e7a03ed9030f",
        "properties": {
          "fillColor": "#0098b9",
          "borderColor": "#0098b9"
        }
      },
      "importantTopic": {
        "id": "74eb6103-4ed2-46b8-ad4f-7be74fb88dce",
        "properties": {
          "fillColor": "#794d1c",
          "borderColor": "#002a4c"
        }
      },
      "minorTopic": {
        "id": "c09ba9a6-f28d-4313-bba4-f5636f5b2f0e",
        "properties": {
          "fillColor": "#e19215",
          "borderColor": "#e19215"
        }
      },
      "boundary": {
        "id": "15f96920-297a-413a-b88a-11a1fee8d9df",
        "properties": {
          "fillColor": "#0098b9",
          "lineColor": "#0098b9"
        }
      },
      "summary": {
        "id": "04169383-b44f-409b-ad44-a02e20b8e8b9",
        "properties": {
          "lineColor": "#0098b9"
        }
      },
      "relationship": {
        "id": "8451a9ae-7399-4cda-87b4-57733fc13026",
        "properties": {
          "lineColor": "#0098b9"
        }
      }
    }
  },
  {
    "id": "316080a2-af89-4149-81c2-535c6bf81de1",
    "tags": [
      "Vivid Light"
    ],
    "theme": {
      "map": {
        "id": "cf28695f-cc81-4b40-a6b1-3b31db707139",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #0a040a"
        }
      },
      "centralTopic": {
        "id": "0fa1a741-2653-421f-b511-767ba3e7804c",
        "properties": {
          "fillColor": "#612469",
          "lineColor": "#331536"
        }
      },
      "mainTopic": {
        "id": "9ba9cc12-9d78-448b-9333-1faffc6eedf4",
        "properties": {
          "fillColor": "#81378a"
        }
      },
      "subTopic": {
        "id": "f1c48014-2631-4895-a9d3-ed32952ceb30",
        "properties": {
          "fillColor": "#e5e5e5"
        }
      },
      "floatingTopic": {
        "id": "5e92b47d-f331-4a2c-b6a6-6d8923fefbb8",
        "properties": {
          "fillColor": "#81378a",
          "borderColor": "#331536"
        }
      },
      "summaryTopic": {
        "id": "6b6b0c5d-ca45-4757-a39b-9aff3eb883f1",
        "properties": {
          "fillColor": "#7574bc",
          "borderColor": "#7574bc"
        }
      },
      "calloutTopic": {
        "id": "c1842566-951f-4e31-85f2-1f97e7fb261e",
        "properties": {
          "fillColor": "#7574bc",
          "borderColor": "#7574bc"
        }
      },
      "importantTopic": {
        "id": "2217ac0f-7fa0-4012-8ade-8928869a97fe",
        "properties": {
          "fillColor": "#525b20",
          "borderColor": "#331536"
        }
      },
      "minorTopic": {
        "id": "f0b0af6c-5caa-4cf3-b42f-4a9e7d9c4277",
        "properties": {
          "fillColor": "#9cad00",
          "borderColor": "#9cad00"
        }
      },
      "boundary": {
        "id": "f02fa75f-2c1d-42b9-ab92-abb226624edb",
        "properties": {
          "fillColor": "#7574bc",
          "lineColor": "#7574bc"
        }
      },
      "summary": {
        "id": "85dceb21-853f-4c9f-a1f7-a10ff5c80c37",
        "properties": {
          "lineColor": "#7574bc"
        }
      },
      "relationship": {
        "id": "89ef813a-54cc-42b6-92e3-cc78ae8761ba",
        "properties": {
          "lineColor": "#7574bc"
        }
      }
    }
  },
  {
    "id": "fa020019-3089-4dc8-bf16-92613ed55001",
    "tags": [
      "Vivid Dark"
    ],
    "theme": {
      "map": {
        "id": "63a834f6-b597-4b78-8258-295d5ff5b628",
        "properties": {
          "fillColor": "#140407",
          "multiLineColors": "",
          "color-list": "#fcf2f4 #140407"
        }
      },
      "centralTopic": {
        "id": "7f93b1f7-256b-4925-bb5b-f91f270bde6f",
        "properties": {
          "fillColor": "#ef6c70",
          "lineColor": "#fdf1f1"
        }
      },
      "mainTopic": {
        "id": "71d47f45-6d09-4542-af63-960bbfbf3e41",
        "properties": {
          "fillColor": "#d02f48"
        }
      },
      "subTopic": {
        "id": "de73d923-b380-4654-ad54-7c9bf89aaeec",
        "properties": {
          "fillColor": "#7c1c2b"
        }
      },
      "floatingTopic": {
        "id": "29831ee5-3245-43db-bc3b-3369d18538c7",
        "properties": {
          "fillColor": "#d02f48",
          "borderColor": "#fdf1f1"
        }
      },
      "summaryTopic": {
        "id": "b085828e-1c1b-41ae-bf8f-5461c19c57b2",
        "properties": {
          "fillColor": "#a33c6a",
          "borderColor": "#a33c6a"
        }
      },
      "calloutTopic": {
        "id": "6d8ef9a3-74e3-413e-976a-2887ec9cc7cb",
        "properties": {
          "fillColor": "#a33c6a",
          "borderColor": "#a33c6a"
        }
      },
      "importantTopic": {
        "id": "e1381a1a-d5c0-4db2-a228-e01c1dbf9c79",
        "properties": {
          "fillColor": "#7eccc1",
          "borderColor": "#fdf1f1"
        }
      },
      "minorTopic": {
        "id": "eb83b5c2-e32a-444e-8f88-1aab71d4525e",
        "properties": {
          "fillColor": "#00aa9f",
          "borderColor": "#00aa9f"
        }
      },
      "boundary": {
        "id": "670e6940-2637-4920-ba62-2a94c8b819ff",
        "properties": {
          "fillColor": "#a33c6a",
          "lineColor": "#a33c6a"
        }
      },
      "summary": {
        "id": "fefe79cd-9a43-4c89-ac48-b0c9aa2797f9",
        "properties": {
          "lineColor": "#a33c6a"
        }
      },
      "relationship": {
        "id": "fa720471-bf2b-487f-b37f-9e8ad5b48792",
        "properties": {
          "lineColor": "#a33c6a"
        }
      }
    }
  },
  {
    "id": "6f8195d4-f39e-482a-afff-0ae1681583d0",
    "tags": [
      "Vivid Dark"
    ],
    "theme": {
      "map": {
        "id": "5596aeda-6797-46ea-8ba9-844d5a284fe4",
        "properties": {
          "fillColor": "#0a0800",
          "multiLineColors": "",
          "color-list": "#fffcef #0a0800"
        }
      },
      "centralTopic": {
        "id": "16e3ffd9-90f7-4a96-ae66-87498aaa0373",
        "properties": {
          "fillColor": "#fad831",
          "lineColor": "#fefcf0"
        }
      },
      "mainTopic": {
        "id": "deaf3d54-8ab7-4bda-9863-e7543e7b6e53",
        "properties": {
          "fillColor": "#eec900"
        }
      },
      "subTopic": {
        "id": "ab92ca39-c1f4-4772-a0c0-fbf4260df0da",
        "properties": {
          "fillColor": "#887200"
        }
      },
      "floatingTopic": {
        "id": "7bed8adf-7684-489b-a285-d4804f7b0d45",
        "properties": {
          "fillColor": "#eec900",
          "borderColor": "#fefcf0"
        }
      },
      "summaryTopic": {
        "id": "ae8c9107-fed5-4a93-a3a8-fb60c26b030f",
        "properties": {
          "fillColor": "#e19215",
          "borderColor": "#e19215"
        }
      },
      "calloutTopic": {
        "id": "c7d2c49f-c98a-4474-964c-37f1a45b7114",
        "properties": {
          "fillColor": "#e19215",
          "borderColor": "#e19215"
        }
      },
      "importantTopic": {
        "id": "e1bc49f3-2f18-4a1c-8654-0d6a49f9adcd",
        "properties": {
          "fillColor": "#a29fc7",
          "borderColor": "#fefcf0"
        }
      },
      "minorTopic": {
        "id": "dc28c791-4217-4774-bf80-572d52587e4e",
        "properties": {
          "fillColor": "#7574bc",
          "borderColor": "#7574bc"
        }
      },
      "boundary": {
        "id": "6af9240b-a722-4b55-8999-96813d0ccd4d",
        "properties": {
          "fillColor": "#e19215",
          "lineColor": "#e19215"
        }
      },
      "summary": {
        "id": "1e5d6e17-7549-4689-9eb9-4f1917eaa330",
        "properties": {
          "lineColor": "#e19215"
        }
      },
      "relationship": {
        "id": "a22f254b-bf39-4937-a5e2-b98256d8d39c",
        "properties": {
          "lineColor": "#e19215"
        }
      }
    }
  },
  {
    "id": "705f7e7f-76db-4d8e-85a3-a973b1f9b10a",
    "tags": [
      "Vivid Dark"
    ],
    "theme": {
      "map": {
        "id": "37f427ba-622b-40da-a193-1566283616d5",
        "properties": {
          "fillColor": "#090a00",
          "multiLineColors": "",
          "color-list": "#fdffef #090a00"
        }
      },
      "centralTopic": {
        "id": "64e6e02b-3850-41da-903b-9866b5a9c895",
        "properties": {
          "fillColor": "#b7c82b",
          "lineColor": "#fbfcf2"
        }
      },
      "mainTopic": {
        "id": "5cd7f7c5-81cb-49e1-8eb4-8c65641d8877",
        "properties": {
          "fillColor": "#a8bb00"
        }
      },
      "subTopic": {
        "id": "d6ee0e5d-6417-40df-93d0-61f7a8776a56",
        "properties": {
          "fillColor": "#4c5400"
        }
      },
      "floatingTopic": {
        "id": "ef92cb1a-34c8-40e0-8dfb-d252a72b7fbc",
        "properties": {
          "fillColor": "#a8bb00",
          "borderColor": "#fbfcf2"
        }
      },
      "summaryTopic": {
        "id": "6260ff2e-f6fe-48d3-a38f-20f91c612f71",
        "properties": {
          "fillColor": "#debc03",
          "borderColor": "#debc03"
        }
      },
      "calloutTopic": {
        "id": "40f42026-b237-4975-ab51-2a896149c589",
        "properties": {
          "fillColor": "#debc03",
          "borderColor": "#debc03"
        }
      },
      "importantTopic": {
        "id": "997d6906-4229-4753-9bd6-2d931d1c1afd",
        "properties": {
          "fillColor": "#b89ab8",
          "borderColor": "#fbfcf2"
        }
      },
      "minorTopic": {
        "id": "3e78dcf8-50d0-4465-9cd0-2f191f278b32",
        "properties": {
          "fillColor": "#a165a8",
          "borderColor": "#a165a8"
        }
      },
      "boundary": {
        "id": "dc445051-0cbf-47a7-b356-c46a6e0f5b6b",
        "properties": {
          "fillColor": "#debc03",
          "lineColor": "#debc03"
        }
      },
      "summary": {
        "id": "998f7102-0934-4c81-9080-b96c77918eb7",
        "properties": {
          "lineColor": "#debc03"
        }
      },
      "relationship": {
        "id": "613b2727-a3e6-47e2-9bde-8d18be16f327",
        "properties": {
          "lineColor": "#debc03"
        }
      }
    }
  },
  {
    "id": "206fba05-6207-45d1-8efb-daef0bc887a9",
    "tags": [
      "Vivid Dark"
    ],
    "theme": {
      "map": {
        "id": "6f0b1360-6cce-40fd-bdfd-d63f4811b00e",
        "properties": {
          "fillColor": "#00070a",
          "multiLineColors": "",
          "color-list": "#effaff #00070a"
        }
      },
      "centralTopic": {
        "id": "1ace777b-4f17-4185-92c7-d41a0f3857e8",
        "properties": {
          "fillColor": "#0098b9",
          "lineColor": "#b9f2ff"
        }
      },
      "mainTopic": {
        "id": "f358228b-c1fc-4767-b33d-8370eebc7ba3",
        "properties": {
          "fillColor": "#00709b"
        }
      },
      "subTopic": {
        "id": "966db9c4-7079-4ffe-a768-96c18adade7b",
        "properties": {
          "fillColor": "#002634"
        }
      },
      "floatingTopic": {
        "id": "27e60fd2-f025-4b38-8569-ffd6898d9d6b",
        "properties": {
          "fillColor": "#00709b",
          "borderColor": "#b9f2ff"
        }
      },
      "summaryTopic": {
        "id": "ec742507-5524-45d4-9cda-0657e787f832",
        "properties": {
          "fillColor": "#00827c",
          "borderColor": "#00827c"
        }
      },
      "calloutTopic": {
        "id": "b049da80-4ff2-40be-91f1-b8f631722665",
        "properties": {
          "fillColor": "#00827c",
          "borderColor": "#00827c"
        }
      },
      "importantTopic": {
        "id": "c55b58b3-cf72-4e3d-8e9c-386026b57b93",
        "properties": {
          "fillColor": "#ffb99e",
          "borderColor": "#b9f2ff"
        }
      },
      "minorTopic": {
        "id": "18b19684-b361-421e-a0ef-b447a28a26dc",
        "properties": {
          "fillColor": "#fa8155",
          "borderColor": "#fa8155"
        }
      },
      "boundary": {
        "id": "cf19d1eb-d5b0-4edc-9913-5c0a0b039418",
        "properties": {
          "fillColor": "#00827c",
          "lineColor": "#00827c"
        }
      },
      "summary": {
        "id": "9cb435f6-e8ec-4909-8eee-1565cf5b28c7",
        "properties": {
          "lineColor": "#00827c"
        }
      },
      "relationship": {
        "id": "59b5df60-69df-4a13-bad9-eb65653c1f06",
        "properties": {
          "lineColor": "#00827c"
        }
      }
    }
  },
  {
    "id": "305e5f99-7dd4-4d6e-a760-286b025e1c31",
    "tags": [
      "Vivid Dark"
    ],
    "theme": {
      "map": {
        "id": "409e8e69-ec8b-439a-add3-c50548afda67",
        "properties": {
          "fillColor": "#030306",
          "multiLineColors": "",
          "color-list": "#f5f4fa #030306"
        }
      },
      "centralTopic": {
        "id": "5cb3fcf9-ea49-47bd-9617-711dd65f2bbf",
        "properties": {
          "fillColor": "#7574bc",
          "lineColor": "#f4f4fa"
        }
      },
      "mainTopic": {
        "id": "940ae893-8f5e-49cd-9346-af2bd5eafcec",
        "properties": {
          "fillColor": "#534aa0"
        }
      },
      "subTopic": {
        "id": "c808b0bc-2f66-45cb-8bda-5f73c7d381fc",
        "properties": {
          "fillColor": "#2e295a"
        }
      },
      "floatingTopic": {
        "id": "712d79e9-fa75-490d-b607-b460fdbd69c1",
        "properties": {
          "fillColor": "#534aa0",
          "borderColor": "#f4f4fa"
        }
      },
      "summaryTopic": {
        "id": "bf4ca3e0-4bc9-463f-9089-c4b2c7c23016",
        "properties": {
          "fillColor": "#005b9b",
          "borderColor": "#005b9b"
        }
      },
      "calloutTopic": {
        "id": "ea074446-60ad-4510-85e7-ad72f3f7e09e",
        "properties": {
          "fillColor": "#005b9b",
          "borderColor": "#005b9b"
        }
      },
      "importantTopic": {
        "id": "5b081b1a-9d97-40b7-89c4-d525df3de3cd",
        "properties": {
          "fillColor": "#fbe68f",
          "borderColor": "#f4f4fa"
        }
      },
      "minorTopic": {
        "id": "182b08e5-4450-42ab-99cc-3a2551bf59b2",
        "properties": {
          "fillColor": "#fad831",
          "borderColor": "#fad831"
        }
      },
      "boundary": {
        "id": "f1ac3d18-e757-4504-b569-a56bb3469b7c",
        "properties": {
          "fillColor": "#005b9b",
          "lineColor": "#005b9b"
        }
      },
      "summary": {
        "id": "1ff08219-e4d7-4d2a-863d-4589c4be1f76",
        "properties": {
          "lineColor": "#005b9b"
        }
      },
      "relationship": {
        "id": "60de17f2-647d-4bea-bc12-6a89627b71c9",
        "properties": {
          "lineColor": "#005b9b"
        }
      }
    }
  },
  {
    "id": "1b6b0cfd-94e7-4d98-b1e5-0a941d956c8b",
    "tags": [
      "Vivid Dark"
    ],
    "theme": {
      "map": {
        "id": "11a6c48b-4728-48cf-9cfa-4615694efa69",
        "properties": {
          "fillColor": "#080205",
          "multiLineColors": "",
          "color-list": "#fbf2f7 #080205"
        }
      },
      "centralTopic": {
        "id": "9b801a69-5b26-4f06-974c-2c7350e09db4",
        "properties": {
          "fillColor": "#d0678e",
          "lineColor": "#fbf3f6"
        }
      },
      "mainTopic": {
        "id": "70994210-6d66-4970-8915-1f98b27614b4",
        "properties": {
          "fillColor": "#ad2e6c"
        }
      },
      "subTopic": {
        "id": "786e2e28-e637-4f91-9197-ba107382b488",
        "properties": {
          "fillColor": "#5c1839"
        }
      },
      "floatingTopic": {
        "id": "9b1d2cb2-ec5b-4963-b885-d1614ecfae47",
        "properties": {
          "fillColor": "#ad2e6c",
          "borderColor": "#fbf3f6"
        }
      },
      "summaryTopic": {
        "id": "77d9506f-2ee6-43d2-b32c-7fd9f0e77a07",
        "properties": {
          "fillColor": "#7c3d84",
          "borderColor": "#7c3d84"
        }
      },
      "calloutTopic": {
        "id": "c19a9fba-79c6-457d-b0f8-8cf8e374f9b7",
        "properties": {
          "fillColor": "#7c3d84",
          "borderColor": "#7c3d84"
        }
      },
      "importantTopic": {
        "id": "5c423414-b02a-4791-9888-a16f4f037250",
        "properties": {
          "fillColor": "#9cd9ac",
          "borderColor": "#fbf3f6"
        }
      },
      "minorTopic": {
        "id": "96966af2-9571-4ca1-a259-f3ace307250a",
        "properties": {
          "fillColor": "#41b879",
          "borderColor": "#41b879"
        }
      },
      "boundary": {
        "id": "7e027565-73cd-4a39-a27a-aea1472fb8c8",
        "properties": {
          "fillColor": "#7c3d84",
          "lineColor": "#7c3d84"
        }
      },
      "summary": {
        "id": "1a342110-546f-47a5-9d5a-6f4224e9502d",
        "properties": {
          "lineColor": "#7c3d84"
        }
      },
      "relationship": {
        "id": "b25c2ba0-1ff6-48ea-978b-85e04a3e4b2c",
        "properties": {
          "lineColor": "#7c3d84"
        }
      }
    }
  },
  {
    "id": "4c9b43b9-f5d7-41ac-8e76-64a92eb690f6",
    "tags": [
      "Vivid Colorful"
    ],
    "theme": {
      "map": {
        "id": "4396b1a1-89cf-4c95-a827-efec86f1875e",
        "properties": {
          "fillColor": "#d02f48",
          "multiLineColors": "",
          "color-list": "#ffffff #3e0e15"
        }
      },
      "centralTopic": {
        "id": "8bf3408f-697e-41a8-bfc8-afcadd57a1e8",
        "properties": {
          "fillColor": "#3e0e15",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "bfed31e1-b56a-487a-8bf1-ad90b6a99780",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "ce47ce5b-3288-4cf7-8002-22a141b75537",
        "properties": {
          "fillColor": "#7c1c2b"
        }
      },
      "floatingTopic": {
        "id": "0e833269-1feb-42a1-a0fe-badc12e3cb9c",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "0ec51759-61dd-496a-af0e-ecadcd2051f2",
        "properties": {
          "fillColor": "#3e0e15",
          "borderColor": "#3e0e15"
        }
      },
      "calloutTopic": {
        "id": "94545262-ffff-4712-bb2f-1f90a689bd98",
        "properties": {
          "fillColor": "#3e0e15",
          "borderColor": "#3e0e15"
        }
      },
      "importantTopic": {
        "id": "52e482ba-4c17-4f0e-a099-2a1f46bbe534",
        "properties": {
          "fillColor": "#005ba5",
          "borderColor": "#ffffff"
        }
      },
      "minorTopic": {
        "id": "b314a122-6986-4f53-a885-cb11e5796bdb",
        "properties": {
          "fillColor": "#81378a",
          "borderColor": "#81378a"
        }
      },
      "boundary": {
        "id": "473cd799-7b70-47dd-80fa-55b529f858eb",
        "properties": {
          "fillColor": "#3e0e15",
          "lineColor": "#3e0e15"
        }
      },
      "summary": {
        "id": "2ef2523d-7c8c-43b3-9c6c-d28d2dee8b63",
        "properties": {
          "lineColor": "#3e0e15"
        }
      },
      "relationship": {
        "id": "0fe33a74-555c-4ea7-8bb7-78b0921dc613",
        "properties": {
          "lineColor": "#3e0e15"
        }
      }
    }
  },
  {
    "id": "144bc4c6-7907-4c94-ac64-d1a672780975",
    "tags": [
      "Vivid Colorful"
    ],
    "theme": {
      "map": {
        "id": "90e8e763-3c82-4d72-8505-4f0749d55b53",
        "properties": {
          "fillColor": "#eec900",
          "multiLineColors": "",
          "color-list": "#FFFFFF #3d3300"
        }
      },
      "centralTopic": {
        "id": "eb89e53d-322e-4d1d-a95c-8734ccce5239",
        "properties": {
          "fillColor": "#f0e6af",
          "lineColor": "#3d3300"
        }
      },
      "mainTopic": {
        "id": "9a863c26-4f61-4ca3-908c-a1748c2b835a",
        "properties": {
          "fillColor": "#3d3300"
        }
      },
      "subTopic": {
        "id": "4ab3a220-f251-49c2-924e-9dfb428a2954",
        "properties": {
          "fillColor": "#7f6b00"
        }
      },
      "floatingTopic": {
        "id": "f6a67b27-6131-4e16-b2aa-b5a7c0bedf47",
        "properties": {
          "fillColor": "#3d3300",
          "borderColor": "#3d3300"
        }
      },
      "summaryTopic": {
        "id": "272a782f-f381-4a1f-af91-d434b8ab0f08",
        "properties": {
          "fillColor": "#f0e6af",
          "borderColor": "#f0e6af"
        }
      },
      "calloutTopic": {
        "id": "9a619705-eb7e-47a4-96fb-91a6693e49f2",
        "properties": {
          "fillColor": "#f0e6af",
          "borderColor": "#f0e6af"
        }
      },
      "importantTopic": {
        "id": "179a26df-aa53-4b0c-a22d-efa88f6381ec",
        "properties": {
          "fillColor": "#ad2e6c",
          "borderColor": "#3d3300"
        }
      },
      "minorTopic": {
        "id": "b5fe01ff-a8d1-41a8-a2e2-aecb5ee03d29",
        "properties": {
          "fillColor": "#e95b23",
          "borderColor": "#e95b23"
        }
      },
      "boundary": {
        "id": "7906c63e-cea9-427d-8290-328c4a946e37",
        "properties": {
          "fillColor": "#f0e6af",
          "lineColor": "#f0e6af"
        }
      },
      "summary": {
        "id": "24b5f4e5-4624-4085-ac2e-9732dd7fa689",
        "properties": {
          "lineColor": "#f0e6af"
        }
      },
      "relationship": {
        "id": "62474cb4-78d9-4643-9cde-00db36e0828a",
        "properties": {
          "lineColor": "#f0e6af"
        }
      }
    }
  },
  {
    "id": "6c40e65f-36ce-4aeb-b7a1-a075dceb6bc4",
    "tags": [
      "Vivid Colorful"
    ],
    "theme": {
      "map": {
        "id": "826995af-e307-42b4-a4d4-7ca1c6c5e8e6",
        "properties": {
          "fillColor": "#a8bb00",
          "multiLineColors": "",
          "color-list": "#FFFFFF #363d00"
        }
      },
      "centralTopic": {
        "id": "0f1984af-2c87-4c44-80e3-0e8c5d3d9684",
        "properties": {
          "fillColor": "#dfe984",
          "lineColor": "#363d00"
        }
      },
      "mainTopic": {
        "id": "b462ee30-42c1-495b-bd03-0a964575803f",
        "properties": {
          "fillColor": "#363d00"
        }
      },
      "subTopic": {
        "id": "fe83c23a-aa91-4bbc-88b5-5667c51c04e3",
        "properties": {
          "fillColor": "#727f00"
        }
      },
      "floatingTopic": {
        "id": "3259da11-a385-48d7-b638-b61288139ed8",
        "properties": {
          "fillColor": "#363d00",
          "borderColor": "#363d00"
        }
      },
      "summaryTopic": {
        "id": "55bee8f7-4b99-45fc-b831-bbc4ddbc52f0",
        "properties": {
          "fillColor": "#dfe984",
          "borderColor": "#dfe984"
        }
      },
      "calloutTopic": {
        "id": "405bea46-ddff-4dae-b468-1c5f7b91027a",
        "properties": {
          "fillColor": "#dfe984",
          "borderColor": "#dfe984"
        }
      },
      "importantTopic": {
        "id": "ce639415-7986-4d6b-905a-517d39916f1d",
        "properties": {
          "fillColor": "#d02f48",
          "borderColor": "#363d00"
        }
      },
      "minorTopic": {
        "id": "889255cb-e399-4493-aaf5-eaee37c8e65b",
        "properties": {
          "fillColor": "#f49d00",
          "borderColor": "#f49d00"
        }
      },
      "boundary": {
        "id": "f8f90265-230b-4fd7-8e15-9a74fcb9e951",
        "properties": {
          "fillColor": "#dfe984",
          "lineColor": "#dfe984"
        }
      },
      "summary": {
        "id": "421c2011-06c3-4279-b17c-dd4a65ab4b1a",
        "properties": {
          "lineColor": "#dfe984"
        }
      },
      "relationship": {
        "id": "6c91e124-ffa0-4933-8241-3814d0d553af",
        "properties": {
          "lineColor": "#dfe984"
        }
      }
    }
  },
  {
    "id": "b0797032-82a4-48a6-a9d6-c7ea2f61f0ef",
    "tags": [
      "Vivid Colorful"
    ],
    "theme": {
      "map": {
        "id": "97c61998-8c06-40eb-95c7-83bb51ded5f8",
        "properties": {
          "fillColor": "#005ba5",
          "multiLineColors": "",
          "color-list": "#d8edfe #002a4c"
        }
      },
      "centralTopic": {
        "id": "15384e57-4c16-4d27-9319-48e109089cc2",
        "properties": {
          "fillColor": "#002a4c",
          "lineColor": "#d8edfe"
        }
      },
      "mainTopic": {
        "id": "34fc0cd7-d082-4eb2-ac87-8e4013596aed",
        "properties": {
          "fillColor": "#d8edfe"
        }
      },
      "subTopic": {
        "id": "dd923aa6-1b60-4e50-b934-fcfaedf9fee8",
        "properties": {
          "fillColor": "#005499"
        }
      },
      "floatingTopic": {
        "id": "3c2e6ff0-cf93-4604-ab00-5a6b5f3e3f43",
        "properties": {
          "fillColor": "#d8edfe",
          "borderColor": "#d8edfe"
        }
      },
      "summaryTopic": {
        "id": "2b1f6053-0e6e-4fa4-a860-aaa4a46c8aea",
        "properties": {
          "fillColor": "#002a4c",
          "borderColor": "#002a4c"
        }
      },
      "calloutTopic": {
        "id": "bf89c841-673d-495a-9612-7305e7fbf109",
        "properties": {
          "fillColor": "#002a4c",
          "borderColor": "#002a4c"
        }
      },
      "importantTopic": {
        "id": "e0bfd9ab-3714-4739-adfa-627cb4f766fb",
        "properties": {
          "fillColor": "#a8bb00",
          "borderColor": "#d8edfe"
        }
      },
      "minorTopic": {
        "id": "073c2601-a882-4571-a5ae-f373e16a37bb",
        "properties": {
          "fillColor": "#00857f",
          "borderColor": "#00857f"
        }
      },
      "boundary": {
        "id": "4f4b10b0-7057-4fbc-8ec2-222c9b5caea1",
        "properties": {
          "fillColor": "#002a4c",
          "lineColor": "#002a4c"
        }
      },
      "summary": {
        "id": "813f078b-febc-49e5-ab34-dd895de4511f",
        "properties": {
          "lineColor": "#002a4c"
        }
      },
      "relationship": {
        "id": "1155a1c8-e8fa-4378-9c06-5f2e5ba706ef",
        "properties": {
          "lineColor": "#002a4c"
        }
      }
    }
  },
  {
    "id": "3f5081f4-c842-4479-9bf0-c9524aad52fe",
    "tags": [
      "Vivid Colorful"
    ],
    "theme": {
      "map": {
        "id": "9988937c-be5a-4a03-98e4-33d7435cfd6d",
        "properties": {
          "fillColor": "#534aa0",
          "multiLineColors": "",
          "color-list": "#ffffff #1b1834"
        }
      },
      "centralTopic": {
        "id": "35a812d5-d3ec-4dce-81fa-30d82b2f6eb8",
        "properties": {
          "fillColor": "#1b1834",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "d41902d4-7c7b-42b4-bdcf-2560edb7d269",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "c5e8929e-e7d8-406b-9b2c-e1c188e4b7cf",
        "properties": {
          "fillColor": "#363068"
        }
      },
      "floatingTopic": {
        "id": "596ea5b5-7da0-49c5-bc9a-ff961ce31dd9",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "ec7495fe-9b91-4dbf-b5d2-a28a82378955",
        "properties": {
          "fillColor": "#1b1834",
          "borderColor": "#1b1834"
        }
      },
      "calloutTopic": {
        "id": "20c9121e-1ffc-4089-aeb5-90be6692143e",
        "properties": {
          "fillColor": "#1b1834",
          "borderColor": "#1b1834"
        }
      },
      "importantTopic": {
        "id": "ad34099f-9cf3-437d-a3a1-01ea3d456ef5",
        "properties": {
          "fillColor": "#00a15a",
          "borderColor": "#ffffff"
        }
      },
      "minorTopic": {
        "id": "074d9504-f2c2-4aa3-8416-0639ef6737c8",
        "properties": {
          "fillColor": "#00709b",
          "borderColor": "#00709b"
        }
      },
      "boundary": {
        "id": "764753ff-d2b2-4c9c-9004-2c676464c975",
        "properties": {
          "fillColor": "#1b1834",
          "lineColor": "#1b1834"
        }
      },
      "summary": {
        "id": "ed47c741-fc36-4bd4-9d1f-a1e74cb7ec6d",
        "properties": {
          "lineColor": "#1b1834"
        }
      },
      "relationship": {
        "id": "ddbf10b0-ce48-4027-906a-cc9f8987b5e9",
        "properties": {
          "lineColor": "#1b1834"
        }
      }
    }
  },
  {
    "id": "30c99e08-2988-4daa-b169-b769bdff80b9",
    "tags": [
      "Vivid Colorful"
    ],
    "theme": {
      "map": {
        "id": "7de3dc8a-dda4-41d4-baa3-bc24beb97ef1",
        "properties": {
          "fillColor": "#81378a",
          "multiLineColors": "",
          "color-list": "#fbf7fb #331536"
        }
      },
      "centralTopic": {
        "id": "41cf3ec0-0703-45e8-b36c-0ec8b35f75f7",
        "properties": {
          "fillColor": "#331536",
          "lineColor": "#fbf7fb"
        }
      },
      "mainTopic": {
        "id": "e4ded620-bdb7-45e6-8254-e9f2846ddd1d",
        "properties": {
          "fillColor": "#fbf7fb"
        }
      },
      "subTopic": {
        "id": "b20abca0-a8dc-4241-b70f-7b13981f2be6",
        "properties": {
          "fillColor": "#662b6d"
        }
      },
      "floatingTopic": {
        "id": "51da0bfe-d2d0-4100-8d82-af2bd6da4254",
        "properties": {
          "fillColor": "#fbf7fb",
          "borderColor": "#fbf7fb"
        }
      },
      "summaryTopic": {
        "id": "b3545091-f4ef-4fee-8c59-982098aecece",
        "properties": {
          "fillColor": "#331536",
          "borderColor": "#331536"
        }
      },
      "calloutTopic": {
        "id": "42df647f-198e-4a92-935a-7a5f7423e002",
        "properties": {
          "fillColor": "#331536",
          "borderColor": "#331536"
        }
      },
      "importantTopic": {
        "id": "3d77abf9-bba1-4600-9a55-bf608aa18dbc",
        "properties": {
          "fillColor": "#00857f",
          "borderColor": "#fbf7fb"
        }
      },
      "minorTopic": {
        "id": "9a021239-0b99-45d9-aa9d-2714212e22e2",
        "properties": {
          "fillColor": "#005ba5",
          "borderColor": "#005ba5"
        }
      },
      "boundary": {
        "id": "a9b41b90-8e5d-4165-8080-69c6d7b4dde4",
        "properties": {
          "fillColor": "#331536",
          "lineColor": "#331536"
        }
      },
      "summary": {
        "id": "37a2b546-9455-447d-9402-8390a5d445c2",
        "properties": {
          "lineColor": "#331536"
        }
      },
      "relationship": {
        "id": "3073f1f2-58e1-469b-b86b-38ee032ef08a",
        "properties": {
          "lineColor": "#331536"
        }
      }
    }
  },
  {
    "id": "0df8cd54-91cd-4160-9747-229e0171d358",
    "tags": [
      "Gray",
      "Gray Light"
    ],
    "theme": {
      "map": {
        "id": "6937b410-f764-4f35-add8-29a218ec50e8",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #232323"
        }
      },
      "centralTopic": {
        "id": "7944ad3e-ae12-4059-b495-c2fbf9c95ef6",
        "properties": {
          "fillColor": "#bcbcbc",
          "lineColor": "#232323"
        }
      },
      "mainTopic": {
        "id": "fcb911a8-2125-4e49-b171-8e9464d5ca78",
        "properties": {
          "fillColor": "#d6d6d6"
        }
      },
      "subTopic": {
        "id": "d23dde20-ca5c-4879-93a4-ea2311418929",
        "properties": {
          "fillColor": "#d6d6d6"
        }
      },
      "floatingTopic": {
        "id": "b65c4610-5900-444a-bd26-ada5d5a25ca6",
        "properties": {
          "fillColor": "#d6d6d6",
          "borderColor": "#232323"
        }
      },
      "summaryTopic": {
        "id": "9e1e6d98-2819-40b5-b79f-35679cee9d57",
        "properties": {
          "fillColor": "#a3a3a3",
          "borderColor": "#a3a3a3"
        }
      },
      "calloutTopic": {
        "id": "0201dfbf-73e9-4f3f-9d01-d3755796e93a",
        "properties": {
          "fillColor": "#a3a3a3",
          "borderColor": "#a3a3a3"
        }
      },
      "importantTopic": {
        "id": "a98edc1f-6e73-4167-a12f-46a5d2519503",
        "properties": {
          "fillColor": "#d02f48",
          "borderColor": "#232323"
        }
      },
      "minorTopic": {
        "id": "0d99a55d-accc-453d-bde4-55ba3694c296",
        "properties": {
          "fillColor": "#f49d00",
          "borderColor": "#f49d00"
        }
      },
      "boundary": {
        "id": "fefd7223-1de6-4bf4-8a76-2dead5c14816",
        "properties": {
          "fillColor": "#a3a3a3",
          "lineColor": "#a3a3a3"
        }
      },
      "summary": {
        "id": "20a13280-20e7-420e-97e8-635ad443e35b",
        "properties": {
          "lineColor": "#a3a3a3"
        }
      },
      "relationship": {
        "id": "b9716233-cadc-4929-9e0b-43a88d4561b0",
        "properties": {
          "lineColor": "#a3a3a3"
        }
      }
    }
  },
  {
    "id": "cdab15a6-d17e-41af-802e-a9d7c353b0ac",
    "tags": [
      "Gray",
      "Gray Light"
    ],
    "theme": {
      "map": {
        "id": "ccfef49e-1fa6-4551-85ed-d75a92e59b79",
        "properties": {
          "fillColor": "#ededed",
          "multiLineColors": "",
          "color-list": "#ededed #080808"
        }
      },
      "centralTopic": {
        "id": "5bf4ddb5-8be9-4731-b441-2cabf25aff88",
        "properties": {
          "fillColor": "#a1a1a1",
          "lineColor": "#080808"
        }
      },
      "mainTopic": {
        "id": "e9bad82d-7d7b-4b0b-a3ea-aaf06b89ea1b",
        "properties": {
          "fillColor": "#bbbbbb"
        }
      },
      "subTopic": {
        "id": "c479d38d-ba35-4bf4-963e-0896e142a508",
        "properties": {
          "fillColor": "#bbbbbb"
        }
      },
      "floatingTopic": {
        "id": "adfcaee2-6459-45d3-a5e2-69c01fd2e5ba",
        "properties": {
          "fillColor": "#bbbbbb",
          "borderColor": "#080808"
        }
      },
      "summaryTopic": {
        "id": "8e4f9354-ad87-4d05-82af-fad272eaf02e",
        "properties": {
          "fillColor": "#888888",
          "borderColor": "#888888"
        }
      },
      "calloutTopic": {
        "id": "5ad033c9-e98a-4426-81da-519779f2b35c",
        "properties": {
          "fillColor": "#888888",
          "borderColor": "#888888"
        }
      },
      "importantTopic": {
        "id": "98d4791f-72bd-47a0-a64f-5cb15be96e05",
        "properties": {
          "fillColor": "#d02f48",
          "borderColor": "#080808"
        }
      },
      "minorTopic": {
        "id": "e6f11aa2-6205-490b-bbfb-8a28d7c5b876",
        "properties": {
          "fillColor": "#f49d00",
          "borderColor": "#f49d00"
        }
      },
      "boundary": {
        "id": "4084a053-113d-455c-b8a2-6f4dfc31c7e2",
        "properties": {
          "fillColor": "#888888",
          "lineColor": "#888888"
        }
      },
      "summary": {
        "id": "8759927c-b2fa-45f0-8c14-0aabf93c9a65",
        "properties": {
          "lineColor": "#888888"
        }
      },
      "relationship": {
        "id": "cff0efcc-f044-4009-80ff-7c4acec1411e",
        "properties": {
          "lineColor": "#888888"
        }
      }
    }
  },
  {
    "id": "3e8a7f6a-ca70-4942-8088-fc9126b09638",
    "tags": [
      "Gray",
      "Gray Light"
    ],
    "theme": {
      "map": {
        "id": "80190039-9520-4a0d-84c3-a56ac8086db9",
        "properties": {
          "fillColor": "#d3d3d3",
          "multiLineColors": "",
          "color-list": "#d3d3d3 #070707"
        }
      },
      "centralTopic": {
        "id": "2b727927-aac6-4022-87c1-9076c68c4f33",
        "properties": {
          "fillColor": "#878787",
          "lineColor": "#070707"
        }
      },
      "mainTopic": {
        "id": "53297bb8-ee8e-4d12-9ee0-dba58ef1047a",
        "properties": {
          "fillColor": "#a1a1a1"
        }
      },
      "subTopic": {
        "id": "007baeae-1b43-43af-9ac2-87cf39dbfb85",
        "properties": {
          "fillColor": "#a1a1a1"
        }
      },
      "floatingTopic": {
        "id": "5788e08e-2390-46a5-af2c-a8a3881a9400",
        "properties": {
          "fillColor": "#a1a1a1",
          "borderColor": "#070707"
        }
      },
      "summaryTopic": {
        "id": "bb9c2ae9-2195-410f-bd63-2ba59eefb84e",
        "properties": {
          "fillColor": "#6d6d6d",
          "borderColor": "#6d6d6d"
        }
      },
      "calloutTopic": {
        "id": "710359cd-5c44-40a9-9501-be3e46dfcd32",
        "properties": {
          "fillColor": "#6d6d6d",
          "borderColor": "#6d6d6d"
        }
      },
      "importantTopic": {
        "id": "8606e446-6b17-4118-b71f-be2851eae9e3",
        "properties": {
          "fillColor": "#d02f48",
          "borderColor": "#070707"
        }
      },
      "minorTopic": {
        "id": "4bb560cf-396b-4ad6-83b6-3d613c5323c5",
        "properties": {
          "fillColor": "#f49d00",
          "borderColor": "#f49d00"
        }
      },
      "boundary": {
        "id": "8da5d2ff-30ce-405b-a135-82260b517f30",
        "properties": {
          "fillColor": "#6d6d6d",
          "lineColor": "#6d6d6d"
        }
      },
      "summary": {
        "id": "b978108d-41e1-4dca-a0f2-dd8493a4ddf4",
        "properties": {
          "lineColor": "#6d6d6d"
        }
      },
      "relationship": {
        "id": "a62e8ed5-4022-4079-ae5c-7070d60ad2e9",
        "properties": {
          "lineColor": "#6d6d6d"
        }
      }
    }
  },
  {
    "id": "b2199c71-bd9b-4b77-b4ce-01907d9fe0c7",
    "tags": [
      "Gray",
      "Gray Dark"
    ],
    "theme": {
      "map": {
        "id": "8e6748b1-7e9b-4286-9b7d-c1b8df9b2416",
        "properties": {
          "fillColor": "#393939",
          "multiLineColors": "",
          "color-list": "#ffffff #393939"
        }
      },
      "centralTopic": {
        "id": "af856d39-b2cc-455c-b080-fd8f28fcf671",
        "properties": {
          "fillColor": "#868686",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "e4fa8bf6-4fc5-4569-b909-0b064f58c5bc",
        "properties": {
          "fillColor": "#6d6d6d"
        }
      },
      "subTopic": {
        "id": "db4f8b53-72bd-45db-acb9-8b3b055f9b46",
        "properties": {
          "fillColor": "#6d6d6d"
        }
      },
      "floatingTopic": {
        "id": "09aa651a-b2db-4e77-8037-4a872bcb6522",
        "properties": {
          "fillColor": "#6d6d6d",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "932dba00-3386-4425-a4ce-92b056914012",
        "properties": {
          "fillColor": "#a0a0a0",
          "borderColor": "#a0a0a0"
        }
      },
      "calloutTopic": {
        "id": "cab487fd-be9f-4e85-aa9b-68fd6fbc6860",
        "properties": {
          "fillColor": "#a0a0a0",
          "borderColor": "#a0a0a0"
        }
      },
      "importantTopic": {
        "id": "29004ad0-65d5-4b13-92ca-df32034b000f",
        "properties": {
          "fillColor": "#a61d39",
          "borderColor": "#ffffff"
        }
      },
      "minorTopic": {
        "id": "ae7a86c3-02a5-45ca-b01d-49561fcc2f49",
        "properties": {
          "fillColor": "#b16c00",
          "borderColor": "#b16c00"
        }
      },
      "boundary": {
        "id": "77d256fc-2f82-4b7f-8d2b-0a026c39555f",
        "properties": {
          "fillColor": "#a0a0a0",
          "lineColor": "#a0a0a0"
        }
      },
      "summary": {
        "id": "ef74fefa-4289-46e8-b4f0-5a5acabc9c72",
        "properties": {
          "lineColor": "#a0a0a0"
        }
      },
      "relationship": {
        "id": "61d5e82b-cf05-4ded-897f-98f7c6260385",
        "properties": {
          "lineColor": "#a0a0a0"
        }
      }
    }
  },
  {
    "id": "86060f1c-c8d1-47dd-9d85-8b200341fe45",
    "tags": [
      "Gray",
      "Gray Dark"
    ],
    "theme": {
      "map": {
        "id": "bbd0a2b3-a8b5-4b5e-aff2-240153eb4d58",
        "properties": {
          "fillColor": "#202020",
          "multiLineColors": "",
          "color-list": "#ffffff #202020"
        }
      },
      "centralTopic": {
        "id": "4e6ac9bf-94af-43db-9236-5adaa4e20d89",
        "properties": {
          "fillColor": "#6d6d6d",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "2d73dd8f-e52e-4ec0-a13b-e4adaa724145",
        "properties": {
          "fillColor": "#545454"
        }
      },
      "subTopic": {
        "id": "582c5cbc-a0c1-4197-b5f8-483faf6427ee",
        "properties": {
          "fillColor": "#545454"
        }
      },
      "floatingTopic": {
        "id": "39f7ceef-652b-4c71-9eea-844b391266a9",
        "properties": {
          "fillColor": "#545454",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "1c837e58-61d5-4317-90d1-a5415ee01cac",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787"
        }
      },
      "calloutTopic": {
        "id": "01403111-2902-4a5d-903d-cb7816e99a19",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787"
        }
      },
      "importantTopic": {
        "id": "511f8e9c-519d-4eb8-ae8b-8257174c03ef",
        "properties": {
          "fillColor": "#a61d39",
          "borderColor": "#ffffff"
        }
      },
      "minorTopic": {
        "id": "09be6e8c-fe83-496d-820d-c05c0d9141fd",
        "properties": {
          "fillColor": "#b16c00",
          "borderColor": "#b16c00"
        }
      },
      "boundary": {
        "id": "4bcb24e1-d878-48ec-b5aa-69888b81287d",
        "properties": {
          "fillColor": "#878787",
          "lineColor": "#878787"
        }
      },
      "summary": {
        "id": "3ff3e3e0-0071-4a0f-b06b-8f2409add0f7",
        "properties": {
          "lineColor": "#878787"
        }
      },
      "relationship": {
        "id": "7d621555-5cd7-4e93-bc13-c7adc5f08a27",
        "properties": {
          "lineColor": "#878787"
        }
      }
    }
  },
  {
    "id": "723815a9-c06c-412b-a7bd-9be493e18d96",
    "tags": [
      "Gray",
      "Gray Dark"
    ],
    "theme": {
      "map": {
        "id": "96888388-9615-4088-9e28-5d4c0d2facc6",
        "properties": {
          "fillColor": "#080808",
          "multiLineColors": "",
          "color-list": "#eeeeee #080808"
        }
      },
      "centralTopic": {
        "id": "4c525148-7b0e-4b15-8bf9-a87f4c471798",
        "properties": {
          "fillColor": "#555555",
          "lineColor": "#eeeeee"
        }
      },
      "mainTopic": {
        "id": "ac9de06c-6e71-4ccd-8956-a92d4293e197",
        "properties": {
          "fillColor": "#3c3c3c"
        }
      },
      "subTopic": {
        "id": "8ac07e3c-0c12-4feb-b678-6d3d53f70ce5",
        "properties": {
          "fillColor": "#3c3c3c"
        }
      },
      "floatingTopic": {
        "id": "e93beb02-c6a8-44fa-9aba-d1e2123fb507",
        "properties": {
          "fillColor": "#3c3c3c",
          "borderColor": "#eeeeee"
        }
      },
      "summaryTopic": {
        "id": "46e9b74c-7ddc-4e15-8b8c-c18c46cbbbf5",
        "properties": {
          "fillColor": "#6f6f6f",
          "borderColor": "#6f6f6f"
        }
      },
      "calloutTopic": {
        "id": "b826b438-c25e-4426-83a6-31e3ea997166",
        "properties": {
          "fillColor": "#6f6f6f",
          "borderColor": "#6f6f6f"
        }
      },
      "importantTopic": {
        "id": "6d3c8248-99c8-4922-8292-85b0c55d21ee",
        "properties": {
          "fillColor": "#a61d39",
          "borderColor": "#eeeeee"
        }
      },
      "minorTopic": {
        "id": "4ac96465-e913-4085-940e-0074baae7dd7",
        "properties": {
          "fillColor": "#b16c00",
          "borderColor": "#b16c00"
        }
      },
      "boundary": {
        "id": "2c312668-54e8-45e8-880b-f69e0e5826dd",
        "properties": {
          "fillColor": "#6f6f6f",
          "lineColor": "#6f6f6f"
        }
      },
      "summary": {
        "id": "72ef7447-d0ca-40db-b942-6a6c27c3abd6",
        "properties": {
          "lineColor": "#6f6f6f"
        }
      },
      "relationship": {
        "id": "caa66700-cd16-41c7-8ac2-6b679b4cfced",
        "properties": {
          "lineColor": "#6f6f6f"
        }
      }
    }
  },
  {
    "id": "0ded5a08-2094-483e-852e-7d0fab0c9cf6",
    "tags": [
      "Classic"
    ],
    "theme": {
      "map": {
        "id": "93611d50-9047-49ab-bdd4-1400503a16fe",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "436c92c3-e695-4025-9538-a1887edd1d23",
        "properties": {
          "fillColor": "#e53935",
          "lineColor": "#141414"
        }
      },
      "mainTopic": {
        "id": "32d3763d-bc15-45d5-9bb8-bb3997804577",
        "properties": {
          "fillColor": "#EEEEEE"
        }
      },
      "subTopic": {
        "id": "8807b5a7-e7dc-40a2-abee-08530fae6e4f",
        "properties": {
          "fillColor": "#EEEEEE"
        }
      },
      "floatingTopic": {
        "id": "7ba5e272-c653-42d9-9eb6-0eeeaf78503a",
        "properties": {
          "fillColor": "#3949AB",
          "borderColor": "#141414"
        }
      },
      "summaryTopic": {
        "id": "21f9f629-8c8b-49af-821c-6eb8a8f6bd8c",
        "properties": {
          "fillColor": "#3949AB",
          "borderColor": "#3949AB"
        }
      },
      "calloutTopic": {
        "id": "edc87721-6dd6-45ca-b9cb-bb5f4e6f9174",
        "properties": {
          "fillColor": "#3949AB",
          "borderColor": "#3949AB"
        }
      },
      "importantTopic": {
        "id": "268d6e02-64cb-4e1e-b89f-951c92255d2b",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#141414"
        }
      },
      "minorTopic": {
        "id": "aca2164e-2ae9-4f38-b4c9-53b8a7c3aeb2",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "boundary": {
        "id": "6e246f84-43f7-46e3-a646-5d268d48d476",
        "properties": {
          "fillColor": "#3949AB",
          "lineColor": "#3949AB"
        }
      },
      "summary": {
        "id": "4d88fd08-80c0-4901-a7be-4c766493f03c",
        "properties": {
          "lineColor": "#3949AB"
        }
      },
      "relationship": {
        "id": "ab974fd6-7e83-4ee3-af7f-81369e3fcc1c",
        "properties": {
          "lineColor": "#3949AB"
        }
      }
    }
  },
  {
    "id": "2d0dfcb9-8fa6-4ee3-a2de-19a3f10c7257",
    "tags": [
      "Classic"
    ],
    "theme": {
      "map": {
        "id": "f083f1f5-9a32-43c2-b483-156282ecf298",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "387cd834-c9a1-4b58-b768-f3ac2b6d94ba",
        "properties": {
          "fillColor": "#C0CA33",
          "lineColor": "#141414"
        }
      },
      "mainTopic": {
        "id": "bc72079f-b747-4587-9656-c2628ad5dbd5",
        "properties": {
          "fillColor": "#EEEEEE"
        }
      },
      "subTopic": {
        "id": "4cf25f19-c8d6-4876-a98f-d0e44b3d0cfd",
        "properties": {
          "fillColor": "#EEEEEE"
        }
      },
      "floatingTopic": {
        "id": "a86c8bb5-8304-42fb-986c-13e07967fe4c",
        "properties": {
          "fillColor": "#D81B60",
          "borderColor": "#141414"
        }
      },
      "summaryTopic": {
        "id": "b83684b7-ce03-48a3-8937-04e25e2c9474",
        "properties": {
          "fillColor": "#D81B60",
          "borderColor": "#D81B60"
        }
      },
      "calloutTopic": {
        "id": "c9feebcc-63fb-41ed-8346-6049fe5d2350",
        "properties": {
          "fillColor": "#D81B60",
          "borderColor": "#D81B60"
        }
      },
      "importantTopic": {
        "id": "1569d0d8-0d71-4a8d-80e2-ab276a0093fa",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#141414"
        }
      },
      "minorTopic": {
        "id": "99dcb196-9011-4834-8021-5e2d78e889e0",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "boundary": {
        "id": "586b8c13-ef8b-47b0-b144-b1f62b5e5e12",
        "properties": {
          "fillColor": "#D81B60",
          "lineColor": "#D81B60"
        }
      },
      "summary": {
        "id": "2b7034ca-3522-4780-9a72-3e38c1bec2ff",
        "properties": {
          "lineColor": "#D81B60"
        }
      },
      "relationship": {
        "id": "44b92061-380e-4776-93db-8f9f7bc57909",
        "properties": {
          "lineColor": "#D81B60"
        }
      }
    }
  },
  {
    "id": "05db3f7d-5a17-4a42-8198-f6b444089830",
    "tags": [
      "Classic"
    ],
    "theme": {
      "map": {
        "id": "067e1025-424b-4ceb-810a-7fcf5bb3f1d5",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "590d0278-8b85-4ae8-8a1c-bb135e322456",
        "properties": {
          "fillColor": "#00897B",
          "lineColor": "#141414"
        }
      },
      "mainTopic": {
        "id": "66d5f124-ac97-46cb-b98b-27a7f8bb8bcc",
        "properties": {
          "fillColor": "#EEEEEE"
        }
      },
      "subTopic": {
        "id": "575deb56-9a77-44c7-ae3b-1c92b69e8665",
        "properties": {
          "fillColor": "#EEEEEE"
        }
      },
      "floatingTopic": {
        "id": "fcfa863e-fca1-487b-b976-e9347e9a6bd1",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#141414"
        }
      },
      "summaryTopic": {
        "id": "da087d8b-d4a9-4bc3-a393-1424c34c1b98",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "calloutTopic": {
        "id": "3c6e69a0-7536-4495-92de-5b8636b1c234",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "importantTopic": {
        "id": "9b11aa87-dca5-4e9f-b13d-af1d008120b5",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#141414"
        }
      },
      "minorTopic": {
        "id": "e5c6147e-441f-4f97-8c54-44e250ccc048",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "boundary": {
        "id": "1533b304-c632-41c8-894e-c23b2fd67326",
        "properties": {
          "fillColor": "#FB8C00",
          "lineColor": "#FB8C00"
        }
      },
      "summary": {
        "id": "fdeeeefc-6221-4ede-8b51-0121c99b423e",
        "properties": {
          "lineColor": "#FB8C00"
        }
      },
      "relationship": {
        "id": "78c3fa48-1e5e-4c1a-96b4-951a7fa1469b",
        "properties": {
          "lineColor": "#FB8C00"
        }
      }
    }
  },
  {
    "id": "3d99443a-9c07-4c29-a2f8-36c52af438cc",
    "tags": [
      "Classic"
    ],
    "theme": {
      "map": {
        "id": "c2859f0d-1c35-472f-8285-6750be8c3e51",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "54240bb3-6087-4de5-81d4-9eb4d7960ff3",
        "properties": {
          "fillColor": "#1E88E5",
          "lineColor": "#141414"
        }
      },
      "mainTopic": {
        "id": "414ef8e2-aff8-4397-a2af-c9a83a338627",
        "properties": {
          "fillColor": "#EEEEEE"
        }
      },
      "subTopic": {
        "id": "9222c408-4696-4d9a-a05e-41a38724d766",
        "properties": {
          "fillColor": "#EEEEEE"
        }
      },
      "floatingTopic": {
        "id": "47999c37-663b-49fe-bb75-d126cb308787",
        "properties": {
          "fillColor": "#43A047",
          "borderColor": "#141414"
        }
      },
      "summaryTopic": {
        "id": "c1d122ad-5606-4f53-af64-6a49416fb59b",
        "properties": {
          "fillColor": "#43A047",
          "borderColor": "#43A047"
        }
      },
      "calloutTopic": {
        "id": "c43a3a8b-f3fd-49ed-9d86-bc28163710d8",
        "properties": {
          "fillColor": "#43A047",
          "borderColor": "#43A047"
        }
      },
      "importantTopic": {
        "id": "f880b768-6a42-46ed-a4a3-3695061e912e",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#141414"
        }
      },
      "minorTopic": {
        "id": "00206978-9bb8-4c85-9573-64b55871844c",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "boundary": {
        "id": "6ca7dc7b-0ebd-46a6-b103-5a9d1a1de411",
        "properties": {
          "fillColor": "#43A047",
          "lineColor": "#43A047"
        }
      },
      "summary": {
        "id": "5e9cbcb6-a4ce-402a-adfa-93f5067e522b",
        "properties": {
          "lineColor": "#43A047"
        }
      },
      "relationship": {
        "id": "790d88af-6ae4-4b9f-8ef2-0513f27310bb",
        "properties": {
          "lineColor": "#43A047"
        }
      }
    }
  },
  {
    "id": "f079c1b6-809d-4e96-a846-bac157e0b71f",
    "tags": [
      "Classic"
    ],
    "theme": {
      "map": {
        "id": "3a4ea242-31a9-46e0-82f8-4ba4082397c4",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "02642d12-6d6c-45f9-8842-f33500b259c6",
        "properties": {
          "fillColor": "#3949AB",
          "lineColor": "#141414"
        }
      },
      "mainTopic": {
        "id": "9191cd68-6e6c-43d9-ba55-e9270fe6ac6e",
        "properties": {
          "fillColor": "#EEEEEE"
        }
      },
      "subTopic": {
        "id": "6aa37fa9-1801-4068-b0c7-92d266cac2a6",
        "properties": {
          "fillColor": "#EEEEEE"
        }
      },
      "floatingTopic": {
        "id": "1a284823-9613-4aca-8f97-4353beba5c3a",
        "properties": {
          "fillColor": "#00897B",
          "borderColor": "#141414"
        }
      },
      "summaryTopic": {
        "id": "4213db3d-9ad9-4870-bcec-eb413de0e844",
        "properties": {
          "fillColor": "#00897B",
          "borderColor": "#00897B"
        }
      },
      "calloutTopic": {
        "id": "54fd82ca-7551-4e62-aabf-9314cf25c504",
        "properties": {
          "fillColor": "#00897B",
          "borderColor": "#00897B"
        }
      },
      "importantTopic": {
        "id": "41bb4031-e761-4181-8211-f21e40d0e863",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#141414"
        }
      },
      "minorTopic": {
        "id": "9635044c-7653-4f7d-8891-d6acbb53464f",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "boundary": {
        "id": "0b661b60-f9e2-458a-9dac-5fca6c424c3b",
        "properties": {
          "fillColor": "#00897B",
          "lineColor": "#00897B"
        }
      },
      "summary": {
        "id": "140b9ac4-861b-4aa3-945f-ee6dbdfa88c1",
        "properties": {
          "lineColor": "#00897B"
        }
      },
      "relationship": {
        "id": "4bb833fa-5ee5-445b-977a-d49983ee0eb9",
        "properties": {
          "lineColor": "#00897B"
        }
      }
    }
  },
  {
    "id": "9a56b3ee-cf69-4983-aff2-cb9e012abb50",
    "tags": [
      "Classic"
    ],
    "theme": {
      "map": {
        "id": "7aeb2d83-56f6-4a10-8356-fa5617496748",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "c80f97c2-79d0-41d4-8c79-13dc06fd8e60",
        "properties": {
          "fillColor": "#8E24AA",
          "lineColor": "#141414"
        }
      },
      "mainTopic": {
        "id": "4488cbbd-2073-4133-9148-7304a0404117",
        "properties": {
          "fillColor": "#EEEEEE"
        }
      },
      "subTopic": {
        "id": "7a9a2c3d-feb1-4902-ac70-852f5f9f49e3",
        "properties": {
          "fillColor": "#EEEEEE"
        }
      },
      "floatingTopic": {
        "id": "75825b05-73dd-4c2a-b203-fc4a9edaa83f",
        "properties": {
          "fillColor": "#00ACC1",
          "borderColor": "#141414"
        }
      },
      "summaryTopic": {
        "id": "c2d01b12-9c4c-4024-a066-262cb05720d4",
        "properties": {
          "fillColor": "#00ACC1",
          "borderColor": "#00ACC1"
        }
      },
      "calloutTopic": {
        "id": "a2d85483-7ee5-49de-8e45-56cc2a7d64ca",
        "properties": {
          "fillColor": "#00ACC1",
          "borderColor": "#00ACC1"
        }
      },
      "importantTopic": {
        "id": "b423a26b-e9b8-4a24-956b-b414be40472f",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#141414"
        }
      },
      "minorTopic": {
        "id": "16d55976-2658-457c-b823-4ea97e51877e",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "boundary": {
        "id": "15ff8f2d-5ce6-4899-8be5-57c56d864aa3",
        "properties": {
          "fillColor": "#00ACC1",
          "lineColor": "#00ACC1"
        }
      },
      "summary": {
        "id": "07008db7-4dc2-4ad6-8d1a-c5868ad8ca59",
        "properties": {
          "lineColor": "#00ACC1"
        }
      },
      "relationship": {
        "id": "08bfc137-1336-4ba0-9985-639500c71df5",
        "properties": {
          "lineColor": "#00ACC1"
        }
      }
    }
  },
  {
    "id": "17ebd166-0e5d-4f89-b6f5-033748707e16",
    "tags": [
      "Classic Colorful"
    ],
    "theme": {
      "map": {
        "id": "aed0befc-d404-457f-bd20-03d07cce84db",
        "properties": {
          "fillColor": "#ffe0e5",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "59418bbd-8db2-44c1-911c-4f7102885ea1",
        "properties": {
          "fillColor": "#2196F3",
          "borderColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "24a5b49f-83fa-482e-a809-988722e8c812",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "9c69560f-ba12-495e-98a2-cf90585fb190",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "cee4f597-6f82-4b83-9b6b-2e6b1456ec41",
        "properties": {
          "fillColor": "#2196F3",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "1e6cd794-62fa-47fe-8fe9-333366a45eeb",
        "properties": {
          "fillColor": "#2196F3",
          "borderColor": "#2196F3"
        }
      },
      "calloutTopic": {
        "id": "84f3ad58-7734-4df7-bf79-2b2776d9a322",
        "properties": {
          "fillColor": "#2196F3",
          "borderColor": "#2196F3"
        }
      },
      "importantTopic": {
        "id": "38adb605-d8a8-49bc-8e21-9dedaee617f7",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#2196F3"
        }
      },
      "minorTopic": {
        "id": "0d949952-9323-4fde-9291-6be5a365d73b",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "boundary": {
        "id": "b887bb24-47d4-4d8f-8d66-28d8f6cc4933",
        "properties": {
          "fillColor": "#2196F3",
          "lineColor": "#2196F3"
        }
      },
      "summary": {
        "id": "7535cf2a-eab1-4aa7-970d-a7481d825946",
        "properties": {
          "lineColor": "#2196F3"
        }
      },
      "relationship": {
        "id": "8a3f33fa-4e29-465f-9e68-10d4916e0d0a",
        "properties": {
          "lineColor": "#2196F3"
        }
      }
    }
  },
  {
    "id": "02fa7487-4c92-47a4-8caa-3a0aa5fe1a73",
    "tags": [
      "Classic Colorful"
    ],
    "theme": {
      "map": {
        "id": "dc3bc3ef-7f3e-46f4-9358-7263b4e39585",
        "properties": {
          "fillColor": "#ffefd5",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "eb83a8be-7606-4bf2-b3d0-d2cbfeac526e",
        "properties": {
          "fillColor": "#3F51B5",
          "borderColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "3057fc0e-c41d-4d23-acf7-355d676d4193",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "366f6c8c-dac3-42c1-be03-dfa10b866954",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "fe82baac-7ccb-4c27-9994-b987085efa79",
        "properties": {
          "fillColor": "#3F51B5",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "e83df6d7-c85f-4724-8278-051b607547e2",
        "properties": {
          "fillColor": "#3F51B5",
          "borderColor": "#3F51B5"
        }
      },
      "calloutTopic": {
        "id": "bbaf2644-a917-4dd7-8559-1b65a1baf3b0",
        "properties": {
          "fillColor": "#3F51B5",
          "borderColor": "#3F51B5"
        }
      },
      "importantTopic": {
        "id": "290d2ea4-728e-450d-90b5-176df9f177f2",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#3F51B5"
        }
      },
      "minorTopic": {
        "id": "115ec22e-24e8-4f28-a07f-4c3352b3ec50",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "boundary": {
        "id": "c81aa9cf-4455-489d-9c2b-e730def1fe6f",
        "properties": {
          "fillColor": "#3F51B5",
          "lineColor": "#3F51B5"
        }
      },
      "summary": {
        "id": "67418cfe-e7ed-4a3b-a238-90726c803fe1",
        "properties": {
          "lineColor": "#3F51B5"
        }
      },
      "relationship": {
        "id": "3562a620-adb3-48da-a4f7-8c2d9ed14d82",
        "properties": {
          "lineColor": "#3F51B5"
        }
      }
    }
  },
  {
    "id": "ec3c5319-d776-4f9c-b514-cdc3ce21f8d8",
    "tags": [
      "Classic Colorful"
    ],
    "theme": {
      "map": {
        "id": "92ea7e99-8898-43bd-8fb1-885deffd7e50",
        "properties": {
          "fillColor": "#d8efee",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "0fe67dd8-0766-4139-9270-bae74a89111b",
        "properties": {
          "fillColor": "#f44336",
          "borderColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "418afb72-9697-4ddb-8e9a-fffac34883b8",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "c0690c4c-882c-4e69-85f6-f9c69c72496f",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "9558a1f4-1274-4c50-95e9-4ab7b19ff285",
        "properties": {
          "fillColor": "#f44336",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "6abdced8-22e2-4c00-9e0d-615d2cdd0b79",
        "properties": {
          "fillColor": "#f44336",
          "borderColor": "#f44336"
        }
      },
      "calloutTopic": {
        "id": "023c38da-2ea2-4474-8cb7-bed62b1b9321",
        "properties": {
          "fillColor": "#f44336",
          "borderColor": "#f44336"
        }
      },
      "importantTopic": {
        "id": "f88be956-b74d-4d74-b9fd-26ad7425b352",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#f44336"
        }
      },
      "minorTopic": {
        "id": "4c42bcb7-832f-46cc-a827-c8df87b04771",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "boundary": {
        "id": "5aaca968-9dc9-44bb-9509-c25525c40e9c",
        "properties": {
          "fillColor": "#f44336",
          "lineColor": "#f44336"
        }
      },
      "summary": {
        "id": "56db9875-5931-4ffc-a05b-e5f0b9992fdc",
        "properties": {
          "lineColor": "#f44336"
        }
      },
      "relationship": {
        "id": "9203df8a-efe3-4b7c-940a-67d32d7cc784",
        "properties": {
          "lineColor": "#f44336"
        }
      }
    }
  },
  {
    "id": "cce5fd14-214a-4c0c-934a-33b8ceda15ae",
    "tags": [
      "Classic Colorful"
    ],
    "theme": {
      "map": {
        "id": "1f922cf3-8eff-4d52-98fe-45ab9469e574",
        "properties": {
          "fillColor": "#d6f5f9",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "b1e81c4f-0a02-4820-bda9-67eabe34f587",
        "properties": {
          "fillColor": "#FF9800",
          "borderColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "37a895a1-d871-4715-817b-73b642b31765",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "163e7c2a-3487-42db-a291-f22a3c397948",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "6fb91adf-5095-4259-84e9-cc19ab0a624b",
        "properties": {
          "fillColor": "#FF9800",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "98ec9a27-d64c-4fb2-af5d-8a101614885a",
        "properties": {
          "fillColor": "#FF9800",
          "borderColor": "#FF9800"
        }
      },
      "calloutTopic": {
        "id": "5d353d82-61bd-40a5-8d6f-525926252b38",
        "properties": {
          "fillColor": "#FF9800",
          "borderColor": "#FF9800"
        }
      },
      "importantTopic": {
        "id": "f82b3699-dec2-474b-85dd-33bdf0804a05",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#FF9800"
        }
      },
      "minorTopic": {
        "id": "82c437b8-cffc-405f-bd90-69fdc06e0f5a",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "boundary": {
        "id": "563e2f73-6fee-45e3-b3f0-19b93658a1b6",
        "properties": {
          "fillColor": "#FF9800",
          "lineColor": "#FF9800"
        }
      },
      "summary": {
        "id": "8182b66b-9d72-4a1b-8dc5-9eff64a8886c",
        "properties": {
          "lineColor": "#FF9800"
        }
      },
      "relationship": {
        "id": "9a9e6791-3ff4-41da-add8-08443f9233e3",
        "properties": {
          "lineColor": "#FF9800"
        }
      }
    }
  },
  {
    "id": "e48a5858-41ed-4cae-9586-120a317f105c",
    "tags": [
      "Classic Colorful"
    ],
    "theme": {
      "map": {
        "id": "7f8b94b1-bd6b-4bb2-ae58-de7406d92bca",
        "properties": {
          "fillColor": "#d9edfc",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "40fa57ed-e0e1-48d7-a92c-a5408067426c",
        "properties": {
          "fillColor": "#CDDC39",
          "borderColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "74b8b894-183b-4334-b3eb-670849abb49a",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "6084bfcb-7ad3-4d07-807f-085ae566b7e2",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "e9700314-9fcc-497b-9beb-3298d5289057",
        "properties": {
          "fillColor": "#CDDC39",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "73e96310-8919-4dc8-aef8-64ce95d8953c",
        "properties": {
          "fillColor": "#CDDC39",
          "borderColor": "#CDDC39"
        }
      },
      "calloutTopic": {
        "id": "5c90f154-8617-4678-ac32-6ef0efebbbf6",
        "properties": {
          "fillColor": "#CDDC39",
          "borderColor": "#CDDC39"
        }
      },
      "importantTopic": {
        "id": "96c1a906-7a54-46f3-b98b-a7cd404566a4",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#CDDC39"
        }
      },
      "minorTopic": {
        "id": "0103e95b-1ed6-43f0-8494-e343c052f6b5",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "boundary": {
        "id": "e751c504-7714-4462-b833-3a906155cd6f",
        "properties": {
          "fillColor": "#CDDC39",
          "lineColor": "#CDDC39"
        }
      },
      "summary": {
        "id": "48e6d2df-f5b9-4a94-8cef-99b289f88adf",
        "properties": {
          "lineColor": "#CDDC39"
        }
      },
      "relationship": {
        "id": "f6a53122-9341-406e-8c80-6e7c21e3d9c7",
        "properties": {
          "lineColor": "#CDDC39"
        }
      }
    }
  },
  {
    "id": "2b9fc63a-9c2d-4d22-a8a9-0075b22edc65",
    "tags": [
      "Classic Colorful"
    ],
    "theme": {
      "map": {
        "id": "aa33ba6e-1754-49c2-b83f-520b99310e01",
        "properties": {
          "fillColor": "#efddf2",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "7bb491e7-fb1f-43f7-b2ac-60442fa1c67c",
        "properties": {
          "fillColor": "#009688",
          "borderColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "3f11d0b9-369f-4ca4-8c91-3f074e12903f",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "3c890339-128d-48ad-918b-b488c9a26055",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "984c97d8-b607-4c4d-aac5-9445a1186168",
        "properties": {
          "fillColor": "#009688",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "0dd70be8-a271-427a-9f48-db182a86f7ac",
        "properties": {
          "fillColor": "#009688",
          "borderColor": "#009688"
        }
      },
      "calloutTopic": {
        "id": "998b1d41-6b4c-4149-8435-244421b4414e",
        "properties": {
          "fillColor": "#009688",
          "borderColor": "#009688"
        }
      },
      "importantTopic": {
        "id": "2bd9584e-98ea-4b84-946b-bb90aec6c599",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#009688"
        }
      },
      "minorTopic": {
        "id": "af4427c6-d1d3-4514-86e5-2ae85de2e1b3",
        "properties": {
          "fillColor": "#FB8C00",
          "borderColor": "#FB8C00"
        }
      },
      "boundary": {
        "id": "0c805418-4178-47b5-bd0a-f6fb110b9a86",
        "properties": {
          "fillColor": "#009688",
          "lineColor": "#009688"
        }
      },
      "summary": {
        "id": "533af0e1-fef0-4601-ac92-f51a6be5eae6",
        "properties": {
          "lineColor": "#009688"
        }
      },
      "relationship": {
        "id": "4e44af1f-7564-47b7-a04c-6342f67e5605",
        "properties": {
          "lineColor": "#009688"
        }
      }
    }
  },
  {
    "id": "56cbeebc-e1c8-4fb5-97cd-33628fcb7630",
    "tags": [
      "Mono"
    ],
    "theme": {
      "map": {
        "id": "2839b45b-88d4-4342-8ce5-71e00777d601",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "c552aa98-1919-4b9c-bc34-7c6869cbd538",
        "properties": {
          "fillColor": "#f44336",
          "lineColor": "#f44336"
        }
      },
      "mainTopic": {
        "id": "ddacce95-5e8b-4beb-815c-185d5ae275d8",
        "properties": {
          "fillColor": "#f44336"
        }
      },
      "subTopic": {
        "id": "cb63ceb4-63af-4edd-97aa-c1ca7dd48e9c",
        "properties": {
          "fillColor": "#f44336"
        }
      },
      "floatingTopic": {
        "id": "ed1e2b03-2f99-458f-a158-ae1d9027d20d",
        "properties": {
          "fillColor": "#f44336",
          "borderColor": "#f44336"
        }
      },
      "summaryTopic": {
        "id": "f37ec4e1-6bd4-4e98-8b07-dca3261fc0e3",
        "properties": {
          "fillColor": "#f44336",
          "borderColor": "#f44336"
        }
      },
      "calloutTopic": {
        "id": "656e9009-58b6-4a56-80c0-7ca452de23d3",
        "properties": {
          "fillColor": "#f44336",
          "borderColor": "#f44336"
        }
      },
      "importantTopic": {
        "id": "017f0140-2bab-444f-8743-2d8cd0d2e41d",
        "properties": {
          "fillColor": "#212121",
          "borderColor": "#f44336"
        }
      },
      "minorTopic": {
        "id": "c75e1992-177d-4438-850f-9087712cff22",
        "properties": {
          "fillColor": "#757575",
          "borderColor": "#757575"
        }
      },
      "boundary": {
        "id": "41b84770-9e01-4816-bbb3-eae1093f68bd",
        "properties": {
          "fillColor": "#f44336",
          "lineColor": "#f44336"
        }
      },
      "summary": {
        "id": "fd0eebb7-7a59-4154-b972-6e6e4bac0816",
        "properties": {
          "lineColor": "#f44336"
        }
      },
      "relationship": {
        "id": "d8f0e55b-fce7-4101-aa75-aa361629dd80",
        "properties": {
          "lineColor": "#f44336"
        }
      }
    }
  },
  {
    "id": "d3ed92b7-e409-411a-ad22-ad15bfd5cff1",
    "tags": [
      "Mono"
    ],
    "theme": {
      "map": {
        "id": "53e244c1-6dc1-439f-babd-7d305c3b2341",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "5f137996-50e9-4ab3-bebe-fcc40cbfb999",
        "properties": {
          "fillColor": "#FF9800",
          "lineColor": "#FF9800"
        }
      },
      "mainTopic": {
        "id": "6137b356-b801-4c01-ab2f-05745630834d",
        "properties": {
          "fillColor": "#FF9800"
        }
      },
      "subTopic": {
        "id": "508c4ade-9b08-4225-b6e1-a1b3e1695e06",
        "properties": {
          "fillColor": "#FF9800"
        }
      },
      "floatingTopic": {
        "id": "e45d3bb7-c2f2-4284-b89a-06b50cdc74cc",
        "properties": {
          "fillColor": "#FF9800",
          "borderColor": "#FF9800"
        }
      },
      "summaryTopic": {
        "id": "12775e12-e972-47d3-91f3-1d68d55bc0d4",
        "properties": {
          "fillColor": "#FF9800",
          "borderColor": "#FF9800"
        }
      },
      "calloutTopic": {
        "id": "8954d858-6188-4277-b23c-47d0428070e6",
        "properties": {
          "fillColor": "#FF9800",
          "borderColor": "#FF9800"
        }
      },
      "importantTopic": {
        "id": "7cdcc286-0e62-4a90-85a1-5b084ee80868",
        "properties": {
          "fillColor": "#212121",
          "borderColor": "#FF9800"
        }
      },
      "minorTopic": {
        "id": "f5b885ff-00c1-41fd-b11a-c68d9bb4f58a",
        "properties": {
          "fillColor": "#757575",
          "borderColor": "#757575"
        }
      },
      "boundary": {
        "id": "5b1ce8a8-fadf-4c33-8d44-223a58288ed4",
        "properties": {
          "fillColor": "#FF9800",
          "lineColor": "#FF9800"
        }
      },
      "summary": {
        "id": "45df728b-fb72-4b3c-bf12-1669b841cd5d",
        "properties": {
          "lineColor": "#FF9800"
        }
      },
      "relationship": {
        "id": "ab1ddc7e-573e-4396-a6a7-10014092fd40",
        "properties": {
          "lineColor": "#FF9800"
        }
      }
    }
  },
  {
    "id": "d36adc4f-be8a-4b01-9258-80e8c458381d",
    "tags": [
      "Mono"
    ],
    "theme": {
      "map": {
        "id": "609e5c72-c3d0-445b-a74a-253fd4d533c6",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "3696d118-8b41-4da1-904e-0b8286edaefb",
        "properties": {
          "fillColor": "#4CAF50",
          "lineColor": "#4CAF50"
        }
      },
      "mainTopic": {
        "id": "e2d16d2d-0738-4506-beb2-e452976230a5",
        "properties": {
          "fillColor": "#4CAF50"
        }
      },
      "subTopic": {
        "id": "c9abb481-66ba-42d5-9898-f760ae6fa3f7",
        "properties": {
          "fillColor": "#4CAF50"
        }
      },
      "floatingTopic": {
        "id": "10e19fa5-7cb0-445b-829f-a0528dbc3a10",
        "properties": {
          "fillColor": "#4CAF50",
          "borderColor": "#4CAF50"
        }
      },
      "summaryTopic": {
        "id": "119f8cf0-2112-4e54-bdf8-ff3eed422adf",
        "properties": {
          "fillColor": "#4CAF50",
          "borderColor": "#4CAF50"
        }
      },
      "calloutTopic": {
        "id": "05287aa9-9641-4a88-a580-406bdacea74b",
        "properties": {
          "fillColor": "#4CAF50",
          "borderColor": "#4CAF50"
        }
      },
      "importantTopic": {
        "id": "b963bbde-bf6c-4325-a933-99dfabf69c51",
        "properties": {
          "fillColor": "#212121",
          "borderColor": "#4CAF50"
        }
      },
      "minorTopic": {
        "id": "6058ce6a-43a6-4dc5-b901-71df1654629a",
        "properties": {
          "fillColor": "#757575",
          "borderColor": "#757575"
        }
      },
      "boundary": {
        "id": "e954a6e2-c103-4992-85e7-7756b785002a",
        "properties": {
          "fillColor": "#4CAF50",
          "lineColor": "#4CAF50"
        }
      },
      "summary": {
        "id": "cca8bee8-0467-4c12-a65f-c402828710b5",
        "properties": {
          "lineColor": "#4CAF50"
        }
      },
      "relationship": {
        "id": "b2ede3b5-f975-46ee-8c25-49cff8745494",
        "properties": {
          "lineColor": "#4CAF50"
        }
      }
    }
  },
  {
    "id": "3220c924-f0b8-45f3-8c01-123d656ae59e",
    "tags": [
      "Mono"
    ],
    "theme": {
      "map": {
        "id": "7f6a0c8e-57a0-4cbe-af85-ac08157ace7b",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "b8e90046-61c8-4546-b665-ac245c7f3058",
        "properties": {
          "fillColor": "#2196F3",
          "lineColor": "#2196F3"
        }
      },
      "mainTopic": {
        "id": "c4302984-30f2-4b16-92d8-f61b1443c136",
        "properties": {
          "fillColor": "#2196F3"
        }
      },
      "subTopic": {
        "id": "49e1c995-aa23-4f4e-9798-301fbc17baf9",
        "properties": {
          "fillColor": "#2196F3"
        }
      },
      "floatingTopic": {
        "id": "deaf2522-9a62-409b-b249-0b902c744384",
        "properties": {
          "fillColor": "#2196F3",
          "borderColor": "#2196F3"
        }
      },
      "summaryTopic": {
        "id": "6d47a155-3e6e-4cf2-8556-c80c0788b109",
        "properties": {
          "fillColor": "#2196F3",
          "borderColor": "#2196F3"
        }
      },
      "calloutTopic": {
        "id": "93552cba-d7c7-465b-97e3-cdd549388f69",
        "properties": {
          "fillColor": "#2196F3",
          "borderColor": "#2196F3"
        }
      },
      "importantTopic": {
        "id": "057e83d9-e887-4ae2-9a4f-9e55a4948581",
        "properties": {
          "fillColor": "#212121",
          "borderColor": "#2196F3"
        }
      },
      "minorTopic": {
        "id": "b6e2cf94-3c5e-45a8-a446-d5d6d917fa15",
        "properties": {
          "fillColor": "#757575",
          "borderColor": "#757575"
        }
      },
      "boundary": {
        "id": "9dcbe564-bb69-42b6-a05e-8fcce16a4655",
        "properties": {
          "fillColor": "#2196F3",
          "lineColor": "#2196F3"
        }
      },
      "summary": {
        "id": "022777b8-bf28-4841-9344-4d337fd37c36",
        "properties": {
          "lineColor": "#2196F3"
        }
      },
      "relationship": {
        "id": "98fb1ca6-8087-4fe1-8b32-03ee9daa2ce8",
        "properties": {
          "lineColor": "#2196F3"
        }
      }
    }
  },
  {
    "id": "05fd175a-0055-4b8b-a42a-42d44a5498fb",
    "tags": [
      "Mono"
    ],
    "theme": {
      "map": {
        "id": "fdc19c8a-80c1-4309-a6b7-597ac0e144ee",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "beb3bc99-e060-4db2-b4c1-37332045741d",
        "properties": {
          "fillColor": "#3F51B5",
          "lineColor": "#3F51B5"
        }
      },
      "mainTopic": {
        "id": "4868acaa-3708-44af-bd14-c3b6446fd8fb",
        "properties": {
          "fillColor": "#3F51B5"
        }
      },
      "subTopic": {
        "id": "f2dccfe6-bc5b-4be0-9aeb-84bbefa0c1cf",
        "properties": {
          "fillColor": "#3F51B5"
        }
      },
      "floatingTopic": {
        "id": "08ba0512-c7d7-408b-a4c1-088bb687df55",
        "properties": {
          "fillColor": "#3F51B5",
          "borderColor": "#3F51B5"
        }
      },
      "summaryTopic": {
        "id": "1075284f-adba-4148-bca8-6e87c2580402",
        "properties": {
          "fillColor": "#3F51B5",
          "borderColor": "#3F51B5"
        }
      },
      "calloutTopic": {
        "id": "96fcd292-fa55-4997-b92a-0fac1a83a58b",
        "properties": {
          "fillColor": "#3F51B5",
          "borderColor": "#3F51B5"
        }
      },
      "importantTopic": {
        "id": "1752baa2-ecd9-469a-8a22-40a595fd3715",
        "properties": {
          "fillColor": "#212121",
          "borderColor": "#3F51B5"
        }
      },
      "minorTopic": {
        "id": "d5d3be70-6947-4c75-95a9-51a78419e7b6",
        "properties": {
          "fillColor": "#757575",
          "borderColor": "#757575"
        }
      },
      "boundary": {
        "id": "e33847b5-93ee-4378-9925-a1eb5834ef1b",
        "properties": {
          "fillColor": "#3F51B5",
          "lineColor": "#3F51B5"
        }
      },
      "summary": {
        "id": "1bfad9db-7555-45f1-b7af-37e27405908c",
        "properties": {
          "lineColor": "#3F51B5"
        }
      },
      "relationship": {
        "id": "04d65606-3703-4c87-97d1-e4b52ea7cbee",
        "properties": {
          "lineColor": "#3F51B5"
        }
      }
    }
  },
  {
    "id": "5f222841-a675-4324-92cb-af12e3e30349",
    "tags": [
      "Mono"
    ],
    "theme": {
      "map": {
        "id": "2116a8a0-b904-49aa-82be-1f452e3725e0",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #141414"
        }
      },
      "centralTopic": {
        "id": "fae26a27-dfa7-405b-8a46-688d92477d60",
        "properties": {
          "fillColor": "#E91E63",
          "lineColor": "#E91E63"
        }
      },
      "mainTopic": {
        "id": "5195baad-678f-41fd-8eb4-5b6b9265d153",
        "properties": {
          "fillColor": "#E91E63"
        }
      },
      "subTopic": {
        "id": "9e83bb32-a859-434f-a535-38045b7926b0",
        "properties": {
          "fillColor": "#E91E63"
        }
      },
      "floatingTopic": {
        "id": "a31588b3-8dd0-4f51-888b-6217a16aaff1",
        "properties": {
          "fillColor": "#E91E63",
          "borderColor": "#E91E63"
        }
      },
      "summaryTopic": {
        "id": "e5728e13-394c-4f26-90b5-1fe9148b400c",
        "properties": {
          "fillColor": "#E91E63",
          "borderColor": "#E91E63"
        }
      },
      "calloutTopic": {
        "id": "63402608-45be-454b-80e6-d523932eca62",
        "properties": {
          "fillColor": "#E91E63",
          "borderColor": "#E91E63"
        }
      },
      "importantTopic": {
        "id": "210fdba2-9456-4be7-a2dd-0fcd3c71690a",
        "properties": {
          "fillColor": "#212121",
          "borderColor": "#E91E63"
        }
      },
      "minorTopic": {
        "id": "4fbf2f37-8478-4630-a7cf-d1dad4862cd5",
        "properties": {
          "fillColor": "#757575",
          "borderColor": "#757575"
        }
      },
      "boundary": {
        "id": "f3b2db9a-9a0d-46a3-8836-0bd7d136adc1",
        "properties": {
          "fillColor": "#E91E63",
          "lineColor": "#E91E63"
        }
      },
      "summary": {
        "id": "1e9d1bff-51a7-4399-9020-d935b794fc73",
        "properties": {
          "lineColor": "#E91E63"
        }
      },
      "relationship": {
        "id": "087fd0ea-8488-4275-9c2b-09367e08ba14",
        "properties": {
          "lineColor": "#E91E63"
        }
      }
    }
  },
  {
    "id": "e11694a8-b2e6-46a7-9cc8-52985e175aa5",
    "tags": [
      "Rainbow",
      "Rainbow Light"
    ],
    "theme": {
      "map": {
        "id": "f332b4d1-bdda-40fc-930f-664f07776ada",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "#fa8155 #ffad36 #b7c82b #0098b9 #7574bc #a165a8",
          "color-list": " "
        }
      },
      "centralTopic": {
        "id": "e19080ad-349b-45d6-ada9-59926caf1fa3",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ef6c70",
          "lineColor": "#fa8155"
        }
      },
      "mainTopic": {
        "id": "b5258771-2998-4a27-ad65-71fbb63c52e0",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "df0f934d-fb08-4d26-a982-ee2644516f3f",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "434b1155-70a4-4d5c-bb21-51971e822be6",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787",
          "lineColor": "#878787"
        }
      },
      "summaryTopic": {
        "id": "cbf0993e-9ba8-42fd-a44b-c9db163876af",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787",
          "lineColor": "#878787"
        }
      },
      "calloutTopic": {
        "id": "0c250858-5d0c-45c7-aa06-47b64f4f0fb3",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787"
        }
      },
      "importantTopic": {
        "id": "880deb96-3445-4ad2-8a73-acd7d7196f4f",
        "properties": {
          "fillColor": "#d02f48",
          "borderColor": "#d02f48"
        }
      },
      "minorTopic": {
        "id": "291a1067-8721-40f3-b6d8-ca8f8f571d0c",
        "properties": {
          "fillColor": "#f49d00",
          "borderColor": "#f49d00"
        }
      },
      "boundary": {
        "id": "3f0c79c3-0852-498a-8a28-7bb83876f996",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#878787"
        }
      },
      "summary": {
        "id": "a48f2fd3-f4da-451c-ac43-0c03b833c20d",
        "properties": {
          "lineColor": "#878787"
        }
      },
      "relationship": {
        "id": "6a306a30-9949-429e-8f9c-8f3d03c0fb02",
        "properties": {
          "lineColor": "#878787"
        }
      }
    }
  },
  {
    "id": "f7ad81e6-c222-490f-abfa-7d79f8a4c7d8",
    "tags": [
      "Rainbow",
      "Rainbow Light"
    ],
    "theme": {
      "map": {
        "id": "36688a4b-3bf6-4805-9e63-0fae14a5d7bf",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "#2196F3 #1E88E5 #1976D2 #1565C0 #0D47A1 #283593",
          "color-list": " "
        }
      },
      "centralTopic": {
        "id": "ffacd990-57e5-4992-b097-23f9e7e52003",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#64B5F6",
          "lineColor": "#2196F3"
        }
      },
      "mainTopic": {
        "id": "f6c56d13-5596-4266-8d5c-b744c4b14da7",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "8b7f0dba-a494-4682-a617-468c43492df9",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "2e3d053b-c55a-4a55-adee-95631c602733",
        "properties": {
          "fillColor": "#78909C",
          "borderColor": "#78909C",
          "lineColor": "#78909C"
        }
      },
      "summaryTopic": {
        "id": "38b35cce-8492-445d-a0a3-c18d29d1406a",
        "properties": {
          "fillColor": "#78909C",
          "borderColor": "#78909C",
          "lineColor": "#78909C"
        }
      },
      "calloutTopic": {
        "id": "c5613774-c7fe-43b6-ab19-22aefe4a26e9",
        "properties": {
          "fillColor": "#78909C",
          "borderColor": "#78909C"
        }
      },
      "importantTopic": {
        "id": "5734334a-91e0-4431-9229-d8e131ccc32e",
        "properties": {
          "fillColor": "#e53935",
          "borderColor": "#e53935"
        }
      },
      "minorTopic": {
        "id": "15bd271e-434e-4dbf-8741-aa84e708ca03",
        "properties": {
          "fillColor": "#C0CA33",
          "borderColor": "#C0CA33"
        }
      },
      "boundary": {
        "id": "82d4d7a4-75f9-442a-a804-082a65537b60",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#78909C"
        }
      },
      "summary": {
        "id": "6e54dfca-9cfc-47b8-a441-04d7b98c4081",
        "properties": {
          "lineColor": "#78909C"
        }
      },
      "relationship": {
        "id": "543357ee-f377-4f77-94a5-78acaeaf50e7",
        "properties": {
          "lineColor": "#78909C"
        }
      }
    }
  },
  {
    "id": "4d7ab769-f439-46db-9cde-76844dd97aa2",
    "tags": [
      "Rainbow",
      "Rainbow Light"
    ],
    "theme": {
      "map": {
        "id": "03dcbc19-3201-4378-8aaf-9acb14e99001",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "#e8c2bf #f4d4b0 #d8ddad #a6d4cc #afc0d1 #c8b9c9",
          "color-list": " "
        }
      },
      "centralTopic": {
        "id": "f4617e57-b24e-4a0b-a742-a80620cc571b",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#dec4ca",
          "lineColor": "#e8c2bf"
        }
      },
      "mainTopic": {
        "id": "4bec0aa5-74d2-4c42-9664-606e1d23b374",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "5b91ddbf-0077-4626-b787-e1f0119ddc6b",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "c3091337-67a9-4cba-b6ae-c5caae51e1fc",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787",
          "lineColor": "#878787"
        }
      },
      "summaryTopic": {
        "id": "c85713a1-706a-499b-9343-8d0989281222",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787",
          "lineColor": "#878787"
        }
      },
      "calloutTopic": {
        "id": "e2e26762-dec8-414e-89f7-a6eb781450f5",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787"
        }
      },
      "importantTopic": {
        "id": "ef343f28-4ec5-4f80-afbb-8d1e18d8a4f3",
        "properties": {
          "fillColor": "#d02f48",
          "borderColor": "#d02f48"
        }
      },
      "minorTopic": {
        "id": "05e08b7c-67b4-4202-af7c-16010fe21edd",
        "properties": {
          "fillColor": "#f49d00",
          "borderColor": "#f49d00"
        }
      },
      "boundary": {
        "id": "124fcb74-2e0e-4b9a-8c47-e5484369bca9",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#878787"
        }
      },
      "summary": {
        "id": "eae34bcf-3cc1-43d6-a474-7acda69cba0a",
        "properties": {
          "lineColor": "#878787"
        }
      },
      "relationship": {
        "id": "94fc45cf-4926-4437-8f8e-6d71861a9e20",
        "properties": {
          "lineColor": "#878787"
        }
      }
    }
  },
  {
    "id": "3c5253a3-9bc9-4e59-beb2-08143296d9bf",
    "tags": [
      "Rainbow",
      "Rainbow Light"
    ],
    "theme": {
      "map": {
        "id": "6996d98e-755d-4ee9-9fbb-ea3dac9aa000",
        "properties": {
          "fillColor": "#f1f1f1",
          "multiLineColors": "#005b9b #534c98 #7c3d84 #a33c6a #c53f4d #cc572e",
          "color-list": " "
        }
      },
      "centralTopic": {
        "id": "caea077a-e172-4e34-8a6b-db2826e0381a",
        "properties": {
          "fillColor": "#f1f1f1",
          "borderColor": "#00827c",
          "lineColor": "#005b9b"
        }
      },
      "mainTopic": {
        "id": "bfa82027-10fa-4d9f-a7ac-2b6dc5fa977e",
        "properties": {
          "fillColor": "#f1f1f1"
        }
      },
      "subTopic": {
        "id": "f24bd01a-4e6c-4026-ae8e-f1c13f6f03b7",
        "properties": {
          "fillColor": "#f1f1f1"
        }
      },
      "floatingTopic": {
        "id": "2e9aef97-bc33-4dfe-83a7-2c27d01ee2f2",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787",
          "lineColor": "#878787"
        }
      },
      "summaryTopic": {
        "id": "f63bd2ba-0060-4db4-ac7b-e4ab7abbcaa0",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787",
          "lineColor": "#878787"
        }
      },
      "calloutTopic": {
        "id": "765f43e3-92b3-4799-99a8-7e0badc9dd8f",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787"
        }
      },
      "importantTopic": {
        "id": "37aad9d0-7179-4b19-8b03-c01cc01276a6",
        "properties": {
          "fillColor": "#d02f48",
          "borderColor": "#d02f48"
        }
      },
      "minorTopic": {
        "id": "e9bcc9ae-4986-4166-b2c0-e3c3723ff752",
        "properties": {
          "fillColor": "#f49d00",
          "borderColor": "#f49d00"
        }
      },
      "boundary": {
        "id": "536f2e3f-e07a-440a-aae2-648b817ab512",
        "properties": {
          "fillColor": "#f1f1f1",
          "lineColor": "#878787"
        }
      },
      "summary": {
        "id": "c5e755e2-16b8-4aaa-a8c8-aee9338444d7",
        "properties": {
          "lineColor": "#878787"
        }
      },
      "relationship": {
        "id": "04edfc30-8ccc-41b0-af3b-928adeadf41e",
        "properties": {
          "lineColor": "#878787"
        }
      }
    }
  },
  {
    "id": "a33ee4c3-0fde-45ba-8157-5eb369f79e68",
    "tags": [
      "Rainbow",
      "Rainbow Dark"
    ],
    "theme": {
      "map": {
        "id": "ca0e6eeb-d1b4-4214-bbe8-b27b2ce91b14",
        "properties": {
          "fillColor": "#3c3c3c",
          "multiLineColors": "#ffa787 #f19896 #dec4ca #5bafc4 #ffbe71 #d98ea5",
          "color-list": " "
        }
      },
      "centralTopic": {
        "id": "55d29e53-fa99-49f3-8e11-04283bdaa240",
        "properties": {
          "fillColor": "#3c3c3c",
          "borderColor": "#85ce9e",
          "lineColor": "#ffa787"
        }
      },
      "mainTopic": {
        "id": "7fc35401-ae92-473d-a09e-d5303f4055a7",
        "properties": {
          "fillColor": "#3c3c3c"
        }
      },
      "subTopic": {
        "id": "9cef2920-14bf-4d6c-a740-8c39139f6444",
        "properties": {
          "fillColor": "#3c3c3c"
        }
      },
      "floatingTopic": {
        "id": "de9b6d81-03a7-44e4-9bf2-6a351f83fa84",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787",
          "lineColor": "#878787"
        }
      },
      "summaryTopic": {
        "id": "f7db5eae-a21d-491a-bcfc-c0035d4eda9e",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787",
          "lineColor": "#878787"
        }
      },
      "calloutTopic": {
        "id": "1e433612-ff8c-49ab-a9a7-bec69d3381d3",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787"
        }
      },
      "importantTopic": {
        "id": "f827ce9c-9acf-4c73-8e71-2b8135e25a3a",
        "properties": {
          "fillColor": "#d02f48",
          "borderColor": "#d02f48"
        }
      },
      "minorTopic": {
        "id": "ef3fb743-517f-4bc6-b0e8-af569303e8b6",
        "properties": {
          "fillColor": "#f49d00",
          "borderColor": "#f49d00"
        }
      },
      "boundary": {
        "id": "458c6b80-257e-4bc4-8b2d-1fedd11771de",
        "properties": {
          "fillColor": "#3c3c3c",
          "lineColor": "#878787"
        }
      },
      "summary": {
        "id": "8c5935fd-357c-4c0b-bb10-5d832e087d15",
        "properties": {
          "lineColor": "#878787"
        }
      },
      "relationship": {
        "id": "cc697d81-945f-4921-aae7-2e817f741b00",
        "properties": {
          "lineColor": "#878787"
        }
      }
    }
  },
  {
    "id": "ad92e2f2-0ce9-4c5a-8655-daf72076fe37",
    "tags": [
      "Rainbow",
      "Rainbow Dark"
    ],
    "theme": {
      "map": {
        "id": "f18d76de-ac2f-4112-bf15-7014ed420849",
        "properties": {
          "fillColor": "#272727",
          "multiLineColors": "#f2d96e #ffbe71 #fa8155 #a61d39 #c53f4d #ffa787",
          "color-list": " "
        }
      },
      "centralTopic": {
        "id": "4483a4a1-2779-4ed7-a661-c3a1606d5e9a",
        "properties": {
          "fillColor": "#272727",
          "borderColor": "#ca8281",
          "lineColor": "#dba66b"
        }
      },
      "mainTopic": {
        "id": "a2a6829f-6991-4832-96ac-a6782cc6b62a",
        "properties": {
          "fillColor": "#272727"
        }
      },
      "subTopic": {
        "id": "6ba5eb2e-3278-435f-8657-4521b338dfaf",
        "properties": {
          "fillColor": "#272727"
        }
      },
      "floatingTopic": {
        "id": "afeace88-c05c-4e1a-b3e3-375923e43720",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787",
          "lineColor": "#878787"
        }
      },
      "summaryTopic": {
        "id": "e073310f-818b-452d-9acc-5053eefda0aa",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787",
          "lineColor": "#878787"
        }
      },
      "calloutTopic": {
        "id": "95ba54d5-ff5b-48b8-a868-390bb9dc6006",
        "properties": {
          "fillColor": "#878787",
          "borderColor": "#878787"
        }
      },
      "importantTopic": {
        "id": "23243cf8-4a0b-4a1d-9c48-e8c9648eb830",
        "properties": {
          "fillColor": "#d02f48",
          "borderColor": "#d02f48"
        }
      },
      "minorTopic": {
        "id": "9e2ecf69-7394-4e4b-a57c-d2ee57384d5b",
        "properties": {
          "fillColor": "#f49d00",
          "borderColor": "#f49d00"
        }
      },
      "boundary": {
        "id": "012cb2d1-8abb-4726-8a9f-340088eb7665",
        "properties": {
          "fillColor": "#272727",
          "lineColor": "#878787"
        }
      },
      "summary": {
        "id": "1eae6b93-0625-4bbc-8993-d554c3a2f068",
        "properties": {
          "lineColor": "#878787"
        }
      },
      "relationship": {
        "id": "ddc1ccbc-da37-4eaf-9cf4-68077f7574e5",
        "properties": {
          "lineColor": "#878787"
        }
      }
    }
  },
  {
    "id": "902bcc3b-9ad2-42e9-84c6-f14c33dd55de",
    "tags": [],
    "theme": {
      "map": {
        "id": "4a538b8d-27c3-44b8-ad7e-b8b755d13d5a",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": " "
        }
      },
      "centralTopic": {
        "id": "74405305-8cc4-4293-8202-a14f6a75eaa8",
        "properties": {
          "fillColor": "#d0d0d0",
          "borderColor": "#333333",
          "lineColor": "#333333"
        }
      },
      "mainTopic": {
        "id": "5c6d476f-7d46-4dde-b3e1-381de4ecba19",
        "properties": {
          "fillColor": "#d0d0d0"
        }
      },
      "subTopic": {
        "id": "4085e594-f0b7-4ca9-9816-18ec64d0261f",
        "properties": {
          "fillColor": "#d0d0d0"
        }
      },
      "floatingTopic": {
        "id": "2712235d-c9d0-4627-9375-11b364ea6f2e",
        "properties": {
          "fillColor": "#d0d0d0",
          "borderColor": "#333333",
          "lineColor": "#333333"
        }
      },
      "summaryTopic": {
        "id": "0894d6bc-28af-4822-afaf-2105428a7a0b",
        "properties": {
          "fillColor": "#d0d0d0",
          "borderColor": "#333333",
          "lineColor": "#333333"
        }
      },
      "calloutTopic": {
        "id": "96c0b642-9c22-4131-8954-c04e4a7f0ce3",
        "properties": {
          "fillColor": "#d0d0d0",
          "borderColor": "#333333"
        }
      },
      "importantTopic": {
        "id": "51d24e21-8300-42d8-ac68-cf5faf4235e9",
        "properties": {
          "fillColor": "#d0d0d0",
          "borderColor": "#333333"
        }
      },
      "minorTopic": {
        "id": "b98ccb84-2f62-4b61-ae72-65d20e7a913f",
        "properties": {
          "fillColor": "#d0d0d0",
          "borderColor": "#333333"
        }
      },
      "boundary": {
        "id": "48f274a0-74c0-4c53-83db-68a9f724747f",
        "properties": {
          "fillColor": "#d0d0d0",
          "lineColor": "#333333"
        }
      },
      "summary": {
        "id": "5070ad1e-d805-405d-af09-38a688c795bc",
        "properties": {
          "lineColor": "#333333"
        }
      },
      "relationship": {
        "id": "9df7385c-551e-4908-808e-d23d71f7c99b",
        "properties": {
          "lineColor": "#333333"
        }
      }
    }
  },
  {
    "id": "Rainbow-#000229-MULTI_LINE_COLORS",
    "tags": [
      "Rainbow",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "85df1fab-189e-436a-88d1-8cb6a8b7710b",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "#F9423A #F6A04D #F3D321 #00BC7B #486AFF #4D49BE",
          "color-list": "#000229 #D9D34E #52CC83 #4D86DB #99142F #245570"
        }
      },
      "centralTopic": {
        "id": "662faee7-aa82-4077-8772-7d804e850f82",
        "properties": {
          "fillColor": "#000229",
          "lineColor": "#000229"
        }
      },
      "mainTopic": {
        "id": "94207879-2318-419c-8044-d7d66c25b1d0",
        "properties": {}
      },
      "subTopic": {
        "id": "bde22721-9d73-4020-81ed-6185ceb9c33e",
        "properties": {}
      },
      "floatingTopic": {
        "id": "ad107113-607c-409a-bfb0-99928c40a653",
        "properties": {
          "fillColor": "#EEEBEE",
          "borderColor": "#EEEBEE"
        }
      },
      "summaryTopic": {
        "id": "f4e67a6b-e061-425b-83d5-4ee6c1538661",
        "properties": {
          "fillColor": "#000229",
          "borderColor": "#000229"
        }
      },
      "calloutTopic": {
        "id": "e68712ad-afca-4439-922e-593d2f3d49f3",
        "properties": {
          "fillColor": "#000229",
          "borderColor": "#000229"
        }
      },
      "importantTopic": {
        "id": "e8316675-fbe9-49fe-8421-0fe7f31b80b4",
        "properties": {
          "fillColor": "#A10000",
          "borderColor": "#A10000"
        }
      },
      "minorTopic": {
        "id": "6054aba3-51a4-4792-a643-2f4f7e8437aa",
        "properties": {
          "fillColor": "#A37600",
          "borderColor": "#A37600"
        }
      },
      "boundary": {
        "id": "b743c899-a1e0-4630-ae23-183782fa4c1e",
        "properties": {
          "fillColor": "#000229",
          "lineColor": "#000229"
        }
      },
      "summary": {
        "id": "8f651d64-a901-4c4b-ba33-d2bbc47aa0f5",
        "properties": {
          "lineColor": "#000229"
        }
      },
      "relationship": {
        "id": "9e6b94c1-c491-4479-88e1-e5d8dd95362f",
        "properties": {
          "lineColor": "#000229"
        }
      }
    }
  },
  {
    "id": "Rainbow-#D9D34E-MULTI_LINE_COLORS",
    "tags": [
      "Rainbow",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "ccc4571d-ef87-4613-9f80-c115d1e970ad",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "#ffa787 #f19896 #dec4ca #5bafc4 #ffbe71 #d98ea5",
          "color-list": "#000229 #D9D34E #52CC83 #4D86DB #99142F #245570"
        }
      },
      "centralTopic": {
        "id": "f634a702-f86b-4cd5-bc93-715ce59096ac",
        "properties": {
          "fillColor": "#D9D34E",
          "lineColor": "#D9D34E"
        }
      },
      "mainTopic": {
        "id": "2c34119d-fb02-4cae-aae5-20d1cda56ffb",
        "properties": {}
      },
      "subTopic": {
        "id": "bfb9888e-9213-4aee-9a58-50de0e54a490",
        "properties": {}
      },
      "floatingTopic": {
        "id": "d95ae3d8-fcdb-43d1-856c-8d264a3892d7",
        "properties": {
          "fillColor": "#EEEBEE",
          "borderColor": "#EEEBEE"
        }
      },
      "summaryTopic": {
        "id": "653c9579-8a3e-48a8-bddf-04e2bcf9512a",
        "properties": {
          "fillColor": "#D9D34E",
          "borderColor": "#D9D34E"
        }
      },
      "calloutTopic": {
        "id": "44abf6e2-376a-40eb-b7ee-2d0cce4918e7",
        "properties": {
          "fillColor": "#D9D34E",
          "borderColor": "#D9D34E"
        }
      },
      "importantTopic": {
        "id": "bb5d6906-9c2c-4e69-be87-e11fba7c0f79",
        "properties": {
          "fillColor": "#D24ED9",
          "borderColor": "#D24ED9"
        }
      },
      "minorTopic": {
        "id": "342de310-a5d5-4260-a5f0-27bbfe5913a4",
        "properties": {
          "fillColor": "#4ED9D2",
          "borderColor": "#4ED9D2"
        }
      },
      "boundary": {
        "id": "d84458d6-2aba-4982-b6fa-36b9238fa21f",
        "properties": {
          "fillColor": "#D9D34E",
          "lineColor": "#D9D34E"
        }
      },
      "summary": {
        "id": "80d50ec0-0493-4df0-81e9-637ad9fffd95",
        "properties": {
          "lineColor": "#D9D34E"
        }
      },
      "relationship": {
        "id": "45e33654-3489-4373-a94c-78e2764c1cc3",
        "properties": {
          "lineColor": "#D9D34E"
        }
      }
    }
  },
  {
    "id": "Rainbow-#52CC83-MULTI_LINE_COLORS",
    "tags": [
      "Rainbow",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "78cf5217-013a-4446-a59f-7b1f98345b4d",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "#E7C2C0 #F3D4B2 #D8DCAF #A8D4CC #B0C0D0 #C8BAC9",
          "color-list": "#000229 #D9D34E #52CC83 #4D86DB #99142F #245570"
        }
      },
      "centralTopic": {
        "id": "985e9868-0ed1-4dd2-b1bf-3597d1ec7f60",
        "properties": {
          "fillColor": "#52CC83",
          "lineColor": "#52CC83"
        }
      },
      "mainTopic": {
        "id": "5c8ca088-c4e9-442d-9bab-a9fc27a9ed4d",
        "properties": {}
      },
      "subTopic": {
        "id": "7a2cf95d-6c3a-4dee-adb3-b503e974d191",
        "properties": {}
      },
      "floatingTopic": {
        "id": "1ad5bf15-a33e-4089-97cd-093252937d52",
        "properties": {
          "fillColor": "#EEEBEE",
          "borderColor": "#EEEBEE"
        }
      },
      "summaryTopic": {
        "id": "90ec54ca-c29a-44f7-bd45-96eec9818f92",
        "properties": {
          "fillColor": "#52CC83",
          "borderColor": "#52CC83"
        }
      },
      "calloutTopic": {
        "id": "652dbcd3-e817-4a1c-b849-2e17f5253840",
        "properties": {
          "fillColor": "#52CC83",
          "borderColor": "#52CC83"
        }
      },
      "importantTopic": {
        "id": "c367568c-9ce3-4b9c-b209-20ab7f6b2b0f",
        "properties": {
          "fillColor": "#CC8352",
          "borderColor": "#CC8352"
        }
      },
      "minorTopic": {
        "id": "1e71e5b2-bccf-4d99-bd13-7697667117a4",
        "properties": {
          "fillColor": "#8352CC",
          "borderColor": "#8352CC"
        }
      },
      "boundary": {
        "id": "18cee297-892d-491b-9918-755f6bce69b0",
        "properties": {
          "fillColor": "#52CC83",
          "lineColor": "#52CC83"
        }
      },
      "summary": {
        "id": "a7e22da0-3234-4ef3-8537-271c16801306",
        "properties": {
          "lineColor": "#52CC83"
        }
      },
      "relationship": {
        "id": "c09b6d39-0e4a-4929-81dd-1b8b8d0137a6",
        "properties": {
          "lineColor": "#52CC83"
        }
      }
    }
  },
  {
    "id": "Rainbow-#4D86DB-MULTI_LINE_COLORS",
    "tags": [
      "Rainbow",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "1f449353-e735-46c8-b461-cd69d0ab2f0b",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "#D3BD6C #ADB66B #76B18A #54A39B #5192A4 #7878A0",
          "color-list": "#000229 #D9D34E #52CC83 #4D86DB #99142F #245570"
        }
      },
      "centralTopic": {
        "id": "33fd7aa2-5a9f-426b-89e7-7a3cfd429be5",
        "properties": {
          "fillColor": "#4D86DB",
          "lineColor": "#4D86DB"
        }
      },
      "mainTopic": {
        "id": "52edd7b8-45fc-4211-8952-f8bd05020d3e",
        "properties": {}
      },
      "subTopic": {
        "id": "53b4face-4c3c-4bc2-ac04-69b31140441a",
        "properties": {}
      },
      "floatingTopic": {
        "id": "7eea0b66-c3bb-4513-ba55-b6c1a4e67fd6",
        "properties": {
          "fillColor": "#EEEBEE",
          "borderColor": "#EEEBEE"
        }
      },
      "summaryTopic": {
        "id": "b1016136-375f-4b79-9c6d-aefe3af4e729",
        "properties": {
          "fillColor": "#4D86DB",
          "borderColor": "#4D86DB"
        }
      },
      "calloutTopic": {
        "id": "cf02931c-0521-4a7d-9599-1d4005c7bfa1",
        "properties": {
          "fillColor": "#4D86DB",
          "borderColor": "#4D86DB"
        }
      },
      "importantTopic": {
        "id": "b6301e53-287b-467e-b383-d318b593e085",
        "properties": {
          "fillColor": "#86DB4D",
          "borderColor": "#86DB4D"
        }
      },
      "minorTopic": {
        "id": "dd86129b-65c4-4fbf-bd70-528ae8729f98",
        "properties": {
          "fillColor": "#DB4D86",
          "borderColor": "#DB4D86"
        }
      },
      "boundary": {
        "id": "2edeff00-f448-4452-83ff-50170e907fa6",
        "properties": {
          "fillColor": "#4D86DB",
          "lineColor": "#4D86DB"
        }
      },
      "summary": {
        "id": "d363d329-75df-4fc7-b933-2219c4ece78b",
        "properties": {
          "lineColor": "#4D86DB"
        }
      },
      "relationship": {
        "id": "9e1cba9c-1793-493b-8ece-bdb40209d07c",
        "properties": {
          "lineColor": "#4D86DB"
        }
      }
    }
  },
  {
    "id": "Rainbow-#99142F-MULTI_LINE_COLORS",
    "tags": [
      "Rainbow",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "bbf5e4f3-7d0c-4c2f-ae84-09a15e4597a1",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "#F2D96E #FFBE71 #FA8155 #A61D39 #C53F4D #FFA787",
          "color-list": "#000229 #D9D34E #52CC83 #4D86DB #99142F #245570"
        }
      },
      "centralTopic": {
        "id": "e78b99b1-f07b-400f-99ff-471681a6bd49",
        "properties": {
          "fillColor": "#99142F",
          "lineColor": "#99142F"
        }
      },
      "mainTopic": {
        "id": "38df0947-8cc5-48d9-aa4d-5287fb310078",
        "properties": {}
      },
      "subTopic": {
        "id": "07b6c102-25e0-438c-b7f1-08ae24a83ddd",
        "properties": {}
      },
      "floatingTopic": {
        "id": "7c2bde90-d504-4ce6-bf14-743e4e8ddacf",
        "properties": {
          "fillColor": "#EEEBEE",
          "borderColor": "#EEEBEE"
        }
      },
      "summaryTopic": {
        "id": "d9788f4b-0617-4d44-a8e9-c73a651788d8",
        "properties": {
          "fillColor": "#99142F",
          "borderColor": "#99142F"
        }
      },
      "calloutTopic": {
        "id": "712624b2-b83e-49b8-8169-a839d23777c8",
        "properties": {
          "fillColor": "#99142F",
          "borderColor": "#99142F"
        }
      },
      "importantTopic": {
        "id": "06cbab54-d140-4dbe-b7cf-b3d19f982184",
        "properties": {
          "fillColor": "#142F99",
          "borderColor": "#142F99"
        }
      },
      "minorTopic": {
        "id": "a2f939d5-6c9b-44b0-a024-a485163f8a3b",
        "properties": {
          "fillColor": "#2F9914",
          "borderColor": "#2F9914"
        }
      },
      "boundary": {
        "id": "df08b3f1-3bb1-40ce-a4d3-6987e87adb59",
        "properties": {
          "fillColor": "#99142F",
          "lineColor": "#99142F"
        }
      },
      "summary": {
        "id": "a70e5ad0-9787-4f33-a7ef-fbb2b24caf44",
        "properties": {
          "lineColor": "#99142F"
        }
      },
      "relationship": {
        "id": "a7912647-5655-4f49-a8dd-61811a34d1a9",
        "properties": {
          "lineColor": "#99142F"
        }
      }
    }
  },
  {
    "id": "Rainbow-#245570-MULTI_LINE_COLORS",
    "tags": [
      "Rainbow",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "f8d47ee6-801b-4fc2-85ce-42e7ed446395",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "#0B5D99 #534E96 #7B4083 #A23E6A #C34150 #CA5835",
          "color-list": "#000229 #D9D34E #52CC83 #4D86DB #99142F #245570"
        }
      },
      "centralTopic": {
        "id": "6ec8a762-d10e-4b61-844b-4d276d241112",
        "properties": {
          "fillColor": "#245570",
          "lineColor": "#245570"
        }
      },
      "mainTopic": {
        "id": "d994c823-4ddf-49ef-8587-160df7520635",
        "properties": {}
      },
      "subTopic": {
        "id": "c61bc93e-747a-4b4d-b085-b119059c1529",
        "properties": {}
      },
      "floatingTopic": {
        "id": "59bf7902-7ee3-40ea-92ad-a233907d2a71",
        "properties": {
          "fillColor": "#EEEBEE",
          "borderColor": "#EEEBEE"
        }
      },
      "summaryTopic": {
        "id": "b1152d63-96f4-4e12-96a6-58dfed5be592",
        "properties": {
          "fillColor": "#245570",
          "borderColor": "#245570"
        }
      },
      "calloutTopic": {
        "id": "3c73cfae-9188-4f66-9164-740ce0de2521",
        "properties": {
          "fillColor": "#245570",
          "borderColor": "#245570"
        }
      },
      "importantTopic": {
        "id": "ebcc3e8b-10f1-4a2c-9274-8ee10f68971c",
        "properties": {
          "fillColor": "#557024",
          "borderColor": "#557024"
        }
      },
      "minorTopic": {
        "id": "45a62f00-31c4-4423-ae00-940314f77dc1",
        "properties": {
          "fillColor": "#702455",
          "borderColor": "#702455"
        }
      },
      "boundary": {
        "id": "55b89eb4-c7ce-4f04-8183-3e89b89e93ef",
        "properties": {
          "fillColor": "#245570",
          "lineColor": "#245570"
        }
      },
      "summary": {
        "id": "8f93368d-cff8-403b-9055-0b1f2ffc2a48",
        "properties": {
          "lineColor": "#245570"
        }
      },
      "relationship": {
        "id": "51c2d908-c68d-494e-b614-49a655c858af",
        "properties": {
          "lineColor": "#245570"
        }
      }
    }
  },
  {
    "id": "Energy-#FFFFFF-TYPE_A",
    "tags": [
      "Energy",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "b7f808ec-1958-4535-825a-0b49d093b0da",
        "properties": {
          "fillColor": "#FFFFFF",
          "multiLineColors": "",
          "color-list": "#FFFFFF #F2F2F2 #F22816 #F2B807 #233ED9 #0D0D0D"
        }
      },
      "centralTopic": {
        "id": "84ca3478-d684-4a52-8648-484b38f8f4f7",
        "properties": {
          "fillColor": "#0D0D0D",
          "lineColor": "#0D0D0D"
        }
      },
      "mainTopic": {
        "id": "2b2d4eb8-27d0-4196-b828-968233a0ef41",
        "properties": {
          "fillColor": "#233ED9"
        }
      },
      "subTopic": {
        "id": "3e630536-d212-4c35-a8fa-fcb942f2c0b6",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "65645caa-6a98-4ef2-a974-02605dc84de7",
        "properties": {
          "fillColor": "#F22816",
          "borderColor": "#F22816"
        }
      },
      "summaryTopic": {
        "id": "65521700-77f9-47ce-973a-0c1897ab92cf",
        "properties": {
          "fillColor": "#233ED9",
          "borderColor": "#233ED9"
        }
      },
      "calloutTopic": {
        "id": "bae70408-ae27-4e1b-93c9-61ea63a0bcdd",
        "properties": {
          "fillColor": "#233ED9",
          "borderColor": "#233ED9"
        }
      },
      "importantTopic": {
        "id": "5e46b01b-35d1-4ddc-9246-3e9f86f57017",
        "properties": {
          "fillColor": "#F22816",
          "borderColor": "#F22816"
        }
      },
      "minorTopic": {
        "id": "04aa9f66-2201-48b2-bb81-9e1cf8bc72a0",
        "properties": {
          "fillColor": "#0D0D0D",
          "borderColor": "#0D0D0D"
        }
      },
      "boundary": {
        "id": "3f665095-764c-4014-92c2-590cd6d63cee",
        "properties": {
          "fillColor": "#0D0D0D",
          "lineColor": "#0D0D0D"
        }
      },
      "summary": {
        "id": "60436011-b0e2-4ff1-a8e5-35a53f3cb188",
        "properties": {
          "lineColor": "#0D0D0D"
        }
      },
      "relationship": {
        "id": "411e1762-04fa-4a1a-83c1-8f22e3caa396",
        "properties": {
          "lineColor": "#0D0D0D"
        }
      }
    }
  },
  {
    "id": "Energy-#F2F2F2-TYPE_A",
    "tags": [
      "Energy",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "97ab4201-9692-4c55-9556-939c07d8b80d",
        "properties": {
          "fillColor": "#F2F2F2",
          "multiLineColors": "",
          "color-list": "#FFFFFF #F2F2F2 #F22816 #F2B807 #233ED9 #0D0D0D"
        }
      },
      "centralTopic": {
        "id": "1bf69535-4e8d-41ea-aa21-bc56856257f3",
        "properties": {
          "fillColor": "#0D0D0D",
          "lineColor": "#0D0D0D"
        }
      },
      "mainTopic": {
        "id": "2754a9b8-b199-49dd-854e-4e05af5096a0",
        "properties": {
          "fillColor": "#233ED9"
        }
      },
      "subTopic": {
        "id": "f9751905-f5fb-4d6d-913c-bfbd31818eb5",
        "properties": {
          "fillColor": "#ebebeb"
        }
      },
      "floatingTopic": {
        "id": "728f5a2b-433e-4990-94dc-1ec9f6e486a8",
        "properties": {
          "fillColor": "#F22816",
          "borderColor": "#F22816"
        }
      },
      "summaryTopic": {
        "id": "77b7d159-642a-4d7e-bcdb-281c22a786bf",
        "properties": {
          "fillColor": "#233ED9",
          "borderColor": "#233ED9"
        }
      },
      "calloutTopic": {
        "id": "5d91e8e9-7e87-450c-b007-576f0080dd95",
        "properties": {
          "fillColor": "#233ED9",
          "borderColor": "#233ED9"
        }
      },
      "importantTopic": {
        "id": "59733907-6934-4de8-ab96-9123d0b9952e",
        "properties": {
          "fillColor": "#F22816",
          "borderColor": "#F22816"
        }
      },
      "minorTopic": {
        "id": "a19f2272-29bb-41b6-bb75-3fbfbb3cf19d",
        "properties": {
          "fillColor": "#0D0D0D",
          "borderColor": "#0D0D0D"
        }
      },
      "boundary": {
        "id": "49dd75f7-6a46-4e0a-8be5-4516e4cda9f5",
        "properties": {
          "fillColor": "#0D0D0D",
          "lineColor": "#0D0D0D"
        }
      },
      "summary": {
        "id": "009a10c2-b35f-4ff2-a721-e97897dad212",
        "properties": {
          "lineColor": "#0D0D0D"
        }
      },
      "relationship": {
        "id": "db072190-f8c7-4366-9d91-552f8de536cd",
        "properties": {
          "lineColor": "#0D0D0D"
        }
      }
    }
  },
  {
    "id": "Energy-#F22816-TYPE_C",
    "tags": [
      "Energy",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "e1fbc914-4022-4e36-8661-57db5e6b3aa8",
        "properties": {
          "fillColor": "#0D0D0D",
          "multiLineColors": "",
          "color-list": "#FFFFFF #F2F2F2 #F22816 #F2B807 #233ED9 #0D0D0D"
        }
      },
      "centralTopic": {
        "id": "1c1970b5-285b-4b90-bb3f-18933a5f5e47",
        "properties": {
          "fillColor": "#F22816",
          "lineColor": "#F22816"
        }
      },
      "mainTopic": {
        "id": "e8571be6-399d-4e4c-af88-f5a61cf9de4b",
        "properties": {
          "fillColor": "#FFFFFF"
        }
      },
      "subTopic": {
        "id": "db8b5384-e287-44ee-9aa0-2b397e29eb70",
        "properties": {
          "fillColor": "#262626"
        }
      },
      "floatingTopic": {
        "id": "905b6826-c260-481c-90cf-b197b2a23ae1",
        "properties": {
          "fillColor": "#F2F2F2",
          "borderColor": "#F2F2F2"
        }
      },
      "summaryTopic": {
        "id": "a6930312-c109-4dba-8352-5edf7cfd8d4f",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "calloutTopic": {
        "id": "5755c4fc-5bde-497d-a95c-1f89bbfd26b6",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "importantTopic": {
        "id": "49d44bd8-794d-4e6a-a510-ce0dc6b275f2",
        "properties": {
          "fillColor": "#F2F2F2",
          "borderColor": "#F2F2F2"
        }
      },
      "minorTopic": {
        "id": "aaa5ede3-d121-435a-a73f-9ab6c1bc61e2",
        "properties": {
          "fillColor": "#F22816",
          "borderColor": "#F22816"
        }
      },
      "boundary": {
        "id": "6335f1ef-8e05-4013-9ef8-1271a691fdee",
        "properties": {
          "fillColor": "#F22816",
          "lineColor": "#F22816"
        }
      },
      "summary": {
        "id": "cf5a4085-c4ce-4a21-9103-59a42202e543",
        "properties": {
          "lineColor": "#F22816"
        }
      },
      "relationship": {
        "id": "234e31f3-b2b4-4716-8f3e-2cad66b4cc6f",
        "properties": {
          "lineColor": "#F22816"
        }
      }
    }
  },
  {
    "id": "Energy-#F2B807-TYPE_C",
    "tags": [
      "Energy",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "3361c665-e2f3-4101-b739-95310e01b617",
        "properties": {
          "fillColor": "#0D0D0D",
          "multiLineColors": "",
          "color-list": "#FFFFFF #F2F2F2 #F22816 #F2B807 #233ED9 #0D0D0D"
        }
      },
      "centralTopic": {
        "id": "cc422b8c-aa01-446a-bbde-dd24cddff1bb",
        "properties": {
          "fillColor": "#F2B807",
          "lineColor": "#F2B807"
        }
      },
      "mainTopic": {
        "id": "26cea45c-d618-4a36-ac35-350bb327271e",
        "properties": {
          "fillColor": "#FFFFFF"
        }
      },
      "subTopic": {
        "id": "22f1eef6-1f46-40b5-94bd-ad2e4d35ddbc",
        "properties": {
          "fillColor": "#262626"
        }
      },
      "floatingTopic": {
        "id": "72e951ff-4169-4648-8998-1180df8c2ce9",
        "properties": {
          "fillColor": "#F2F2F2",
          "borderColor": "#F2F2F2"
        }
      },
      "summaryTopic": {
        "id": "a6ecc3bf-4098-4423-a4b2-48299a33cb73",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "calloutTopic": {
        "id": "e6b764db-316c-4d44-b2ee-167077b0b5c8",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "importantTopic": {
        "id": "ae36fd10-fe02-461d-aba6-d4887416218a",
        "properties": {
          "fillColor": "#F2F2F2",
          "borderColor": "#F2F2F2"
        }
      },
      "minorTopic": {
        "id": "f5bc8deb-56bd-4876-8b14-f4a23e3ef7e3",
        "properties": {
          "fillColor": "#F2B807",
          "borderColor": "#F2B807"
        }
      },
      "boundary": {
        "id": "e24994ee-e878-4232-9bfe-267ca5b307bd",
        "properties": {
          "fillColor": "#F2B807",
          "lineColor": "#F2B807"
        }
      },
      "summary": {
        "id": "a073511e-16ab-4072-a6d6-f068d9093127",
        "properties": {
          "lineColor": "#F2B807"
        }
      },
      "relationship": {
        "id": "067527f4-88e2-49c9-bacd-3d0f06624d8c",
        "properties": {
          "lineColor": "#F2B807"
        }
      }
    }
  },
  {
    "id": "Energy-#233ED9-TYPE_A",
    "tags": [
      "Energy",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "c6776517-a590-47ec-b758-08c0a72d5df0",
        "properties": {
          "fillColor": "#FFFFFF",
          "multiLineColors": "",
          "color-list": "#FFFFFF #F2F2F2 #F22816 #F2B807 #233ED9 #0D0D0D"
        }
      },
      "centralTopic": {
        "id": "f70bdbaa-da31-4af3-a843-95c3a53f79bb",
        "properties": {
          "fillColor": "#233ED9",
          "lineColor": "#233ED9"
        }
      },
      "mainTopic": {
        "id": "91581770-3d03-455f-a08e-47cd32fb078a",
        "properties": {
          "fillColor": "#0D0D0D"
        }
      },
      "subTopic": {
        "id": "11137f87-725f-4ac4-b2f6-12ca08b6f055",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "191c8f32-067c-4d6e-b1e7-f7b3d5fd2499",
        "properties": {
          "fillColor": "#F22816",
          "borderColor": "#F22816"
        }
      },
      "summaryTopic": {
        "id": "42e0e7e8-338a-4f45-85f4-0ab46f0c038b",
        "properties": {
          "fillColor": "#0D0D0D",
          "borderColor": "#0D0D0D"
        }
      },
      "calloutTopic": {
        "id": "9db3544b-b534-465e-9f14-8271b7cd1701",
        "properties": {
          "fillColor": "#0D0D0D",
          "borderColor": "#0D0D0D"
        }
      },
      "importantTopic": {
        "id": "6123b7ff-d536-4c27-89bf-f8365e80a2e3",
        "properties": {
          "fillColor": "#F22816",
          "borderColor": "#F22816"
        }
      },
      "minorTopic": {
        "id": "a0894ee0-f6f1-4bbe-b235-e97408a1bd40",
        "properties": {
          "fillColor": "#233ED9",
          "borderColor": "#233ED9"
        }
      },
      "boundary": {
        "id": "e77437d0-1255-4c86-888a-b9f5009bc82d",
        "properties": {
          "fillColor": "#233ED9",
          "lineColor": "#233ED9"
        }
      },
      "summary": {
        "id": "fb175bda-9989-4365-9122-5ee6815bb22e",
        "properties": {
          "lineColor": "#233ED9"
        }
      },
      "relationship": {
        "id": "71600f70-59f1-4473-b30f-462dd46163cb",
        "properties": {
          "lineColor": "#233ED9"
        }
      }
    }
  },
  {
    "id": "Energy-#0D0D0D-TYPE_C",
    "tags": [
      "Energy",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "92dfe423-2807-4f1f-a705-cca6ecd6fffa",
        "properties": {
          "fillColor": "#0D0D0D",
          "multiLineColors": "",
          "color-list": "#FFFFFF #F2F2F2 #F22816 #F2B807 #233ED9 #0D0D0D"
        }
      },
      "centralTopic": {
        "id": "9f36db6a-4191-4b7b-a466-5b2b4f688060",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "mainTopic": {
        "id": "5a62b723-1610-4d7c-b83c-4095fca76e24",
        "properties": {
          "fillColor": "#F2F2F2"
        }
      },
      "subTopic": {
        "id": "4933fbf5-5027-43fb-8b90-23bcfe48f116",
        "properties": {
          "fillColor": "#262626"
        }
      },
      "floatingTopic": {
        "id": "77912a4f-5dd6-4305-90ee-f9aaf1598087",
        "properties": {
          "fillColor": "#F2B807",
          "borderColor": "#F2B807"
        }
      },
      "summaryTopic": {
        "id": "83b1b465-c641-40e8-bc08-da170774a3d2",
        "properties": {
          "fillColor": "#F2F2F2",
          "borderColor": "#F2F2F2"
        }
      },
      "calloutTopic": {
        "id": "0214f52e-b4c9-47a1-a272-20b14d332d43",
        "properties": {
          "fillColor": "#F2F2F2",
          "borderColor": "#F2F2F2"
        }
      },
      "importantTopic": {
        "id": "f9d88d44-c36c-4dfc-bbac-13bafc8d5e93",
        "properties": {
          "fillColor": "#F2B807",
          "borderColor": "#F2B807"
        }
      },
      "minorTopic": {
        "id": "cf891e64-78e6-47e3-81a4-31380491b7b7",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "boundary": {
        "id": "cebc1162-6492-4799-aed8-5dc7acdec964",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "summary": {
        "id": "d40ca546-7ec8-4c78-a8b6-27675fc81899",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      },
      "relationship": {
        "id": "ebd78aa3-7685-40e0-87e3-45ab3c7a3057",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      }
    }
  },
  {
    "id": "Energy-#FFFFFF-MULTI_LINE_COLORS",
    "tags": [
      "Energy",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "42277d7e-1fca-49ae-877c-23beacbb43a9",
        "properties": {
          "fillColor": "#FFFFFF",
          "multiLineColors": "#F22816 #F2B807 #233ED9",
          "color-list": "#FFFFFF #F2F2F2 #F22816 #F2B807 #233ED9 #0D0D0D"
        }
      },
      "centralTopic": {
        "id": "c5028449-c60b-4492-9325-54b1f49fd7c9",
        "properties": {
          "fillColor": "#0D0D0D",
          "lineColor": "#0D0D0D"
        }
      },
      "mainTopic": {
        "id": "e351f37a-700f-47bf-892e-314c40be8973",
        "properties": {}
      },
      "subTopic": {
        "id": "25a12af6-7ea7-43eb-a8de-889e0976e037",
        "properties": {}
      },
      "floatingTopic": {
        "id": "257643ff-74e2-4e8b-b7c5-478fdbb6bc8c",
        "properties": {
          "fillColor": "#F22816",
          "borderColor": "#F22816"
        }
      },
      "summaryTopic": {
        "id": "020e274e-9076-4d57-9437-1c954cee7afc",
        "properties": {
          "fillColor": "#233ED9",
          "borderColor": "#233ED9"
        }
      },
      "calloutTopic": {
        "id": "897dbef1-75b8-477c-bcb0-1b6458486e8b",
        "properties": {
          "fillColor": "#233ED9",
          "borderColor": "#233ED9"
        }
      },
      "importantTopic": {
        "id": "c07ee611-0cfd-498f-819f-2059e1333faf",
        "properties": {
          "fillColor": "#dff116",
          "borderColor": "#dff116"
        }
      },
      "minorTopic": {
        "id": "86b044f3-97bb-4662-b2b7-d74e061a6631",
        "properties": {
          "fillColor": "#0d0d0d",
          "borderColor": "#0d0d0d"
        }
      },
      "boundary": {
        "id": "c4cb24ab-b3e7-4c24-93f4-cbfa415fde0b",
        "properties": {
          "fillColor": "#0D0D0D",
          "lineColor": "#0D0D0D"
        }
      },
      "summary": {
        "id": "900fe2e1-0e8d-46be-b937-93630640cb91",
        "properties": {
          "lineColor": "#0D0D0D"
        }
      },
      "relationship": {
        "id": "6389bcd6-a9a9-4823-91f3-405327aff6c0",
        "properties": {
          "lineColor": "#0D0D0D"
        }
      }
    }
  },
  {
    "id": "Energy-#0D0D0D-MULTI_LINE_COLORS",
    "tags": [
      "Energy",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "301045a1-c466-4ef1-ad2b-1106e8564b88",
        "properties": {
          "fillColor": "#0D0D0D",
          "multiLineColors": "#F2F2F2 #F22816 #F2B807 #233ED9",
          "color-list": "#FFFFFF #F2F2F2 #F22816 #F2B807 #233ED9 #0D0D0D"
        }
      },
      "centralTopic": {
        "id": "b80fcef6-df8f-43f8-9aa4-c76cff347431",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "mainTopic": {
        "id": "f451d6da-8563-4a4f-8837-7ec3bc9f9fd4",
        "properties": {}
      },
      "subTopic": {
        "id": "3bc47c3c-da91-423d-9b3c-3f541569dd65",
        "properties": {}
      },
      "floatingTopic": {
        "id": "adaf1ba4-2400-45c7-bbc2-aead5db095ca",
        "properties": {
          "fillColor": "#F2B807",
          "borderColor": "#F2B807"
        }
      },
      "summaryTopic": {
        "id": "625900a4-d81d-4292-bff6-7bd1662c3da8",
        "properties": {
          "fillColor": "#F2F2F2",
          "borderColor": "#F2F2F2"
        }
      },
      "calloutTopic": {
        "id": "5452492b-ddae-432b-8106-78f3748dbdda",
        "properties": {
          "fillColor": "#F2F2F2",
          "borderColor": "#F2F2F2"
        }
      },
      "importantTopic": {
        "id": "5a6e167e-9fd1-4531-bf9c-c40a87100e98",
        "properties": {
          "fillColor": "#41f207",
          "borderColor": "#41f207"
        }
      },
      "minorTopic": {
        "id": "001b74d1-1690-4e52-9b92-1b96ed480c0f",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "boundary": {
        "id": "6bfe3cec-7447-4ef9-80bb-6bf4c7b73f33",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "summary": {
        "id": "904c2e51-b07a-4884-88f5-96c314d00e71",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      },
      "relationship": {
        "id": "27a1ea34-3e06-4ad1-ad87-360d0d75431a",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      }
    }
  },
  {
    "id": "Freshness-#f0f0f0-TYPE_A",
    "tags": [
      "Freshness",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "aa135906-bb26-44c4-bde1-18822afbdb7a",
        "properties": {
          "fillColor": "#f0f0f0",
          "multiLineColors": "",
          "color-list": "#f0f0f0 #F2BDC7 #F2DC6B #5BA683 #B796D9 #3C74A6"
        }
      },
      "centralTopic": {
        "id": "2acfdfdc-4c5b-4fac-8d08-46890e7f41c4",
        "properties": {
          "fillColor": "#3C74A6",
          "lineColor": "#3C74A6"
        }
      },
      "mainTopic": {
        "id": "b55797fb-6274-43ab-85a1-92b601993e58",
        "properties": {
          "fillColor": "#B796D9"
        }
      },
      "subTopic": {
        "id": "68dda7bf-d84b-4358-8657-cec2b582bb49",
        "properties": {
          "fillColor": "#e8e8e8"
        }
      },
      "floatingTopic": {
        "id": "c0d9b9a3-afec-46b5-92f1-fd34b85c51bd",
        "properties": {
          "fillColor": "#F2BDC7",
          "borderColor": "#F2BDC7"
        }
      },
      "summaryTopic": {
        "id": "2a4c8a6e-da7f-43e9-8ed9-a79fcf4898eb",
        "properties": {
          "fillColor": "#B796D9",
          "borderColor": "#B796D9"
        }
      },
      "calloutTopic": {
        "id": "1d26ea53-790b-4588-968b-3bf80c5ba975",
        "properties": {
          "fillColor": "#B796D9",
          "borderColor": "#B796D9"
        }
      },
      "importantTopic": {
        "id": "45fa716a-ab14-486a-a7b8-3f650b00dd18",
        "properties": {
          "fillColor": "#5BA683",
          "borderColor": "#5BA683"
        }
      },
      "minorTopic": {
        "id": "3879188f-2b74-46c7-bf8a-1689ea006e8f",
        "properties": {
          "fillColor": "#3C74A6",
          "borderColor": "#3C74A6"
        }
      },
      "boundary": {
        "id": "b21c1cd0-e1ff-4780-8a96-3a4331fc86ff",
        "properties": {
          "fillColor": "#3C74A6",
          "lineColor": "#3C74A6"
        }
      },
      "summary": {
        "id": "886f970b-cbf6-4e90-ad8d-d6b226e22bdb",
        "properties": {
          "lineColor": "#3C74A6"
        }
      },
      "relationship": {
        "id": "7a27fb5f-548a-4095-b6a8-611dbd8519cd",
        "properties": {
          "lineColor": "#3C74A6"
        }
      }
    }
  },
  {
    "id": "Freshness-#F2BDC7-TYPE_A",
    "tags": [
      "Freshness",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "ca433761-746d-468d-8889-fa20e3161c5e",
        "properties": {
          "fillColor": "#F2BDC7",
          "multiLineColors": "",
          "color-list": "#f0f0f0 #F2BDC7 #F2DC6B #5BA683 #B796D9 #3C74A6"
        }
      },
      "centralTopic": {
        "id": "13f8d2ab-3c04-4607-9ced-99df12640c3a",
        "properties": {
          "fillColor": "#3C74A6",
          "lineColor": "#3C74A6"
        }
      },
      "mainTopic": {
        "id": "1dc27aab-ac01-467a-ab90-a3ee072c53be",
        "properties": {
          "fillColor": "#5BA683"
        }
      },
      "subTopic": {
        "id": "6051c350-747b-417d-b411-171b6bbff421",
        "properties": {
          "fillColor": "#eb9cab"
        }
      },
      "floatingTopic": {
        "id": "761a00e6-4af4-48d9-9189-6aba398b7d18",
        "properties": {
          "fillColor": "#f0f0f0",
          "borderColor": "#f0f0f0"
        }
      },
      "summaryTopic": {
        "id": "3494a3b4-44da-4d62-b7d5-96dd0c4abe77",
        "properties": {
          "fillColor": "#5BA683",
          "borderColor": "#5BA683"
        }
      },
      "calloutTopic": {
        "id": "e2dab9c0-6b84-43f2-8e3a-8d290953daab",
        "properties": {
          "fillColor": "#5BA683",
          "borderColor": "#5BA683"
        }
      },
      "importantTopic": {
        "id": "8087a58f-7db1-4a40-ad2d-38700b6bf26d",
        "properties": {
          "fillColor": "#B796D9",
          "borderColor": "#B796D9"
        }
      },
      "minorTopic": {
        "id": "b179773e-081b-41f7-90a7-1467a07762cb",
        "properties": {
          "fillColor": "#3C74A6",
          "borderColor": "#3C74A6"
        }
      },
      "boundary": {
        "id": "2dfd2edd-1a1c-4712-81a4-91e369309b5f",
        "properties": {
          "fillColor": "#3C74A6",
          "lineColor": "#3C74A6"
        }
      },
      "summary": {
        "id": "c009daf6-1482-4818-b92e-acb97ae3f59a",
        "properties": {
          "lineColor": "#3C74A6"
        }
      },
      "relationship": {
        "id": "20284036-3d66-48d4-9f23-93c4a367b03a",
        "properties": {
          "lineColor": "#3C74A6"
        }
      }
    }
  },
  {
    "id": "Freshness-#F2DC6B-TYPE_B",
    "tags": [
      "Freshness",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "25129d68-831b-44c8-8f28-009f4608f337",
        "properties": {
          "fillColor": "#F2DC6B",
          "multiLineColors": "",
          "color-list": "#f0f0f0 #F2BDC7 #F2DC6B #5BA683 #B796D9 #3C74A6"
        }
      },
      "centralTopic": {
        "id": "2c6de4cb-20f5-42dc-96cd-f49536ca666c",
        "properties": {
          "fillColor": "#3C74A6",
          "lineColor": "#3C74A6"
        }
      },
      "mainTopic": {
        "id": "38ab0b8a-3670-4ead-8a4e-dd06e36f50ef",
        "properties": {
          "fillColor": "#3C74A6"
        }
      },
      "subTopic": {
        "id": "ee95799a-4381-4d5b-9099-c475f4c1f394",
        "properties": {
          "fillColor": "#558dbf"
        }
      },
      "floatingTopic": {
        "id": "e24971c0-42a1-4633-8ae1-6914a96f479b",
        "properties": {
          "fillColor": "#3C74A6",
          "borderColor": "#3C74A6"
        }
      },
      "summaryTopic": {
        "id": "1bc3c9ad-daac-4135-b821-97dd9ec53972",
        "properties": {
          "fillColor": "#3C74A6",
          "borderColor": "#3C74A6"
        }
      },
      "calloutTopic": {
        "id": "3b8ee249-bf81-4f31-be62-a77f7abc12f2",
        "properties": {
          "fillColor": "#3C74A6",
          "borderColor": "#3C74A6"
        }
      },
      "importantTopic": {
        "id": "3a9c63c7-68d3-4912-9531-3d580ba10a9d",
        "properties": {
          "fillColor": "#6b81f2",
          "borderColor": "#6b81f2"
        }
      },
      "minorTopic": {
        "id": "b0385577-c37d-4bca-83a7-7e5894d6fb6b",
        "properties": {
          "fillColor": "#ba6bf2",
          "borderColor": "#ba6bf2"
        }
      },
      "boundary": {
        "id": "b1400c70-f0b3-43c8-9ded-f4cf201d4a46",
        "properties": {
          "fillColor": "#3C74A6",
          "lineColor": "#3C74A6"
        }
      },
      "summary": {
        "id": "a6d0cdbd-b796-4e86-bc96-bb4d614359e8",
        "properties": {
          "lineColor": "#3C74A6"
        }
      },
      "relationship": {
        "id": "ae2e8a65-1f19-4347-9224-a237d0840999",
        "properties": {
          "lineColor": "#3C74A6"
        }
      }
    }
  },
  {
    "id": "Freshness-#5BA683-TYPE_B",
    "tags": [
      "Freshness",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "1404db3c-1f24-4c3d-bb78-0c3b4e297885",
        "properties": {
          "fillColor": "#5BA683",
          "multiLineColors": "",
          "color-list": "#f0f0f0 #F2BDC7 #F2DC6B #5BA683 #B796D9 #3C74A6"
        }
      },
      "centralTopic": {
        "id": "b6fe256b-971e-4909-b3ed-babb409ecaba",
        "properties": {
          "fillColor": "#f0f0f0",
          "lineColor": "#f0f0f0"
        }
      },
      "mainTopic": {
        "id": "2df79699-af1f-4275-9ae9-36da2ba164ef",
        "properties": {
          "fillColor": "#F2DC6B"
        }
      },
      "subTopic": {
        "id": "60fcec29-1807-4703-a6d2-88cc5aff8f3d",
        "properties": {
          "fillColor": "#fff584"
        }
      },
      "floatingTopic": {
        "id": "187c5d62-fe61-4f1d-879c-464da06157d7",
        "properties": {
          "fillColor": "#F2BDC7",
          "borderColor": "#F2BDC7"
        }
      },
      "summaryTopic": {
        "id": "cca404b0-fe79-4ecf-a5fe-18e6c77da138",
        "properties": {
          "fillColor": "#F2DC6B",
          "borderColor": "#F2DC6B"
        }
      },
      "calloutTopic": {
        "id": "c2b307f1-f4dc-4bed-9526-bea1ed513853",
        "properties": {
          "fillColor": "#F2DC6B",
          "borderColor": "#F2DC6B"
        }
      },
      "importantTopic": {
        "id": "fe1c23c5-b04e-41d2-8be7-1e7e225fb479",
        "properties": {
          "fillColor": "#a65a7d",
          "borderColor": "#a65a7d"
        }
      },
      "minorTopic": {
        "id": "215c6b44-93f8-4750-99c6-82a20924395b",
        "properties": {
          "fillColor": "#a56f5a",
          "borderColor": "#a56f5a"
        }
      },
      "boundary": {
        "id": "2d75d417-e8b9-4458-a15a-4db2ad51801b",
        "properties": {
          "fillColor": "#f0f0f0",
          "lineColor": "#f0f0f0"
        }
      },
      "summary": {
        "id": "869342d0-e86c-42a7-9721-182364b5f9e7",
        "properties": {
          "lineColor": "#f0f0f0"
        }
      },
      "relationship": {
        "id": "29020de0-7584-47bc-bd8f-b403c287a542",
        "properties": {
          "lineColor": "#f0f0f0"
        }
      }
    }
  },
  {
    "id": "Freshness-#B796D9-TYPE_B",
    "tags": [
      "Freshness",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "fa7d21a3-34a5-49a0-8b48-98414b7d39dd",
        "properties": {
          "fillColor": "#B796D9",
          "multiLineColors": "",
          "color-list": "#f0f0f0 #F2BDC7 #F2DC6B #5BA683 #B796D9 #3C74A6"
        }
      },
      "centralTopic": {
        "id": "23d87a08-d315-4f13-89c9-9e2a474dd4f3",
        "properties": {
          "fillColor": "#f0f0f0",
          "lineColor": "#f0f0f0"
        }
      },
      "mainTopic": {
        "id": "3ab6a1a3-6030-4de0-a0b3-24a4615544f9",
        "properties": {
          "fillColor": "#3C74A6"
        }
      },
      "subTopic": {
        "id": "b7b3a6f9-9c84-4107-99f5-6e9271b7646c",
        "properties": {
          "fillColor": "#558dbf"
        }
      },
      "floatingTopic": {
        "id": "46c3736e-27d3-4a06-a8b1-bb1e1e162d08",
        "properties": {
          "fillColor": "#F2DC6B",
          "borderColor": "#F2DC6B"
        }
      },
      "summaryTopic": {
        "id": "10309be9-ce4e-4418-8a80-b317fc3d1e7d",
        "properties": {
          "fillColor": "#3C74A6",
          "borderColor": "#3C74A6"
        }
      },
      "calloutTopic": {
        "id": "ccb086a1-23d4-41af-a87d-0623c3fba543",
        "properties": {
          "fillColor": "#3C74A6",
          "borderColor": "#3C74A6"
        }
      },
      "importantTopic": {
        "id": "6341c912-8638-47e1-8e24-4a8fb7e9f90b",
        "properties": {
          "fillColor": "#b7d895",
          "borderColor": "#b7d895"
        }
      },
      "minorTopic": {
        "id": "108ae124-e153-47e4-8c0f-77477b206c22",
        "properties": {
          "fillColor": "#94d7a5",
          "borderColor": "#94d7a5"
        }
      },
      "boundary": {
        "id": "6d812ece-06d9-47d3-87d6-54dd8359a448",
        "properties": {
          "fillColor": "#f0f0f0",
          "lineColor": "#f0f0f0"
        }
      },
      "summary": {
        "id": "aa2501a7-1b28-49bf-aad7-9b9d0a430f9b",
        "properties": {
          "lineColor": "#f0f0f0"
        }
      },
      "relationship": {
        "id": "7b20814d-3fde-4898-9ca8-0c637b8aee50",
        "properties": {
          "lineColor": "#f0f0f0"
        }
      }
    }
  },
  {
    "id": "Freshness-#3C74A6-TYPE_B",
    "tags": [
      "Freshness",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "6b7905dc-2698-4e80-aaab-da68c509e283",
        "properties": {
          "fillColor": "#3C74A6",
          "multiLineColors": "",
          "color-list": "#f0f0f0 #F2BDC7 #F2DC6B #5BA683 #B796D9 #3C74A6"
        }
      },
      "centralTopic": {
        "id": "19483c57-6358-44ba-b50f-c833f3a54ffe",
        "properties": {
          "fillColor": "#f0f0f0",
          "lineColor": "#f0f0f0"
        }
      },
      "mainTopic": {
        "id": "ff5a8436-bc2c-4469-9f51-d3f5fc590411",
        "properties": {
          "fillColor": "#f0f0f0"
        }
      },
      "subTopic": {
        "id": "f103890b-fd00-4984-b807-5ff051389d8f",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "1555b7e2-8dc3-4685-a6b5-0de0662b947d",
        "properties": {
          "fillColor": "#F2DC6B",
          "borderColor": "#F2DC6B"
        }
      },
      "summaryTopic": {
        "id": "4441d6ea-e9f7-4708-b32a-7a0b64f4763b",
        "properties": {
          "fillColor": "#f0f0f0",
          "borderColor": "#f0f0f0"
        }
      },
      "calloutTopic": {
        "id": "c57af602-9047-4f00-9c41-826550b79567",
        "properties": {
          "fillColor": "#f0f0f0",
          "borderColor": "#f0f0f0"
        }
      },
      "importantTopic": {
        "id": "d7bc1c62-f268-48dd-81b8-d136e805a5dd",
        "properties": {
          "fillColor": "#a66d3b",
          "borderColor": "#a66d3b"
        }
      },
      "minorTopic": {
        "id": "932f15f8-3792-4e52-b4a2-5edf0ce5ee24",
        "properties": {
          "fillColor": "#8ea53b",
          "borderColor": "#8ea53b"
        }
      },
      "boundary": {
        "id": "922d0b99-ff06-4d30-9d6d-279711123642",
        "properties": {
          "fillColor": "#f0f0f0",
          "lineColor": "#f0f0f0"
        }
      },
      "summary": {
        "id": "0cc47b64-ee02-48ca-9c4d-58d74af685da",
        "properties": {
          "lineColor": "#f0f0f0"
        }
      },
      "relationship": {
        "id": "6c991eab-f2df-4c43-941f-9bb702f6ca4f",
        "properties": {
          "lineColor": "#f0f0f0"
        }
      }
    }
  },
  {
    "id": "Freshness-#f0f0f0-MULTI_LINE_COLORS",
    "tags": [
      "Freshness",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "148f7c07-c4cc-4b7a-9a91-9d057adffddb",
        "properties": {
          "fillColor": "#f0f0f0",
          "multiLineColors": "#F2BDC7 #5BA683 #B796D9",
          "color-list": "#f0f0f0 #F2BDC7 #F2DC6B #5BA683 #B796D9 #3C74A6"
        }
      },
      "centralTopic": {
        "id": "bb98c2aa-1024-4fcf-95ec-bee055748a02",
        "properties": {
          "fillColor": "#3C74A6",
          "lineColor": "#3C74A6"
        }
      },
      "mainTopic": {
        "id": "e6fc5708-9533-442c-afe9-989213d301be",
        "properties": {}
      },
      "subTopic": {
        "id": "319dd41f-2a93-4ad9-8a54-32a229053629",
        "properties": {}
      },
      "floatingTopic": {
        "id": "d355e420-6778-4fea-90d0-5d922ad2fe9b",
        "properties": {
          "fillColor": "#F2BDC7",
          "borderColor": "#F2BDC7"
        }
      },
      "summaryTopic": {
        "id": "c6769ece-5674-4b20-abcf-7b1425547ca3",
        "properties": {
          "fillColor": "#B796D9",
          "borderColor": "#B796D9"
        }
      },
      "calloutTopic": {
        "id": "f0dd43fa-493d-4097-a062-fba851186967",
        "properties": {
          "fillColor": "#B796D9",
          "borderColor": "#B796D9"
        }
      },
      "importantTopic": {
        "id": "c395563d-c68e-444f-9ba0-16b9bdbd7d8c",
        "properties": {
          "fillColor": "#5a7da6",
          "borderColor": "#5a7da6"
        }
      },
      "minorTopic": {
        "id": "11c1b783-3090-4885-9c7d-587c3930f592",
        "properties": {
          "fillColor": "#6d3ba6",
          "borderColor": "#6d3ba6"
        }
      },
      "boundary": {
        "id": "244e31f3-0926-4735-aea3-25d07a98728d",
        "properties": {
          "fillColor": "#3C74A6",
          "lineColor": "#3C74A6"
        }
      },
      "summary": {
        "id": "f1f2216c-882a-407f-bb3c-0482cebac0e9",
        "properties": {
          "lineColor": "#3C74A6"
        }
      },
      "relationship": {
        "id": "dcd02c99-a093-4ca8-adda-4bfe537bee68",
        "properties": {
          "lineColor": "#3C74A6"
        }
      }
    }
  },
  {
    "id": "Kimono-#FFFFFF-TYPE_A",
    "tags": [
      "Kimono",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "12a2b68c-a1d7-4ac1-8ab1-d9607ee89e32",
        "properties": {
          "fillColor": "#FFFFFF",
          "multiLineColors": "",
          "color-list": "#FFFFFF #FFABAA #FF7B31 #8CB5FF #4A51D9 #191959"
        }
      },
      "centralTopic": {
        "id": "bd1d5f78-5e15-438f-806b-7a58a7217e57",
        "properties": {
          "fillColor": "#191959",
          "lineColor": "#191959"
        }
      },
      "mainTopic": {
        "id": "52ac332c-eec1-4160-a650-516b7e731d7a",
        "properties": {
          "fillColor": "#8CB5FF"
        }
      },
      "subTopic": {
        "id": "59475bd0-fce9-4873-b19d-a4fc7b86788c",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "756f31ee-5616-42ef-909b-11db4f0e3615",
        "properties": {
          "fillColor": "#FF7B31",
          "borderColor": "#FF7B31"
        }
      },
      "summaryTopic": {
        "id": "abd83726-e240-4f37-b4d1-22b7244c7edc",
        "properties": {
          "fillColor": "#8CB5FF",
          "borderColor": "#8CB5FF"
        }
      },
      "calloutTopic": {
        "id": "0fb831d5-88b2-41aa-9cf4-c1956d805cc8",
        "properties": {
          "fillColor": "#8CB5FF",
          "borderColor": "#8CB5FF"
        }
      },
      "importantTopic": {
        "id": "a7199f8c-05fa-4da6-a661-e727225e5a35",
        "properties": {
          "fillColor": "#4A51D9",
          "borderColor": "#4A51D9"
        }
      },
      "minorTopic": {
        "id": "d158c115-3806-483a-a3dd-c634a09eec67",
        "properties": {
          "fillColor": "#191959",
          "borderColor": "#191959"
        }
      },
      "boundary": {
        "id": "39fdb273-b69a-4444-9777-1232ab690d9a",
        "properties": {
          "fillColor": "#191959",
          "lineColor": "#191959"
        }
      },
      "summary": {
        "id": "ef5c593a-e3d7-4ca6-a4a6-fee15c8a796c",
        "properties": {
          "lineColor": "#191959"
        }
      },
      "relationship": {
        "id": "9d5f1f26-0050-4ec9-900d-b6c1b72183a2",
        "properties": {
          "lineColor": "#191959"
        }
      }
    }
  },
  {
    "id": "Kimono-#FFABAA-TYPE_A",
    "tags": [
      "Kimono",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "b5d8517d-3bf0-4987-8777-4c4f86a77819",
        "properties": {
          "fillColor": "#FFABAA",
          "multiLineColors": "",
          "color-list": "#FFFFFF #FFABAA #FF7B31 #8CB5FF #4A51D9 #191959"
        }
      },
      "centralTopic": {
        "id": "3799feb8-9c01-41a1-a6f1-ea28ab155068",
        "properties": {
          "fillColor": "#191959",
          "lineColor": "#191959"
        }
      },
      "mainTopic": {
        "id": "49a6c1c3-ee36-482e-b0d1-bf80c7853f7d",
        "properties": {
          "fillColor": "#4A51D9"
        }
      },
      "subTopic": {
        "id": "51f9fbf6-eb09-4ac7-958a-eb96163a4d49",
        "properties": {
          "fillColor": "#ff817f"
        }
      },
      "floatingTopic": {
        "id": "d3ecaf6c-3e82-4d9b-90c6-17b446acc2e0",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "summaryTopic": {
        "id": "5d030e02-ac1e-412b-ac26-69345c527da5",
        "properties": {
          "fillColor": "#4A51D9",
          "borderColor": "#4A51D9"
        }
      },
      "calloutTopic": {
        "id": "bd3ee483-8a90-4109-87f1-29ef0501adc6",
        "properties": {
          "fillColor": "#4A51D9",
          "borderColor": "#4A51D9"
        }
      },
      "importantTopic": {
        "id": "91317244-d9dc-44b0-b696-bbd72429f1f3",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "minorTopic": {
        "id": "807258f5-7bfa-43ac-8cf7-4823aa76d427",
        "properties": {
          "fillColor": "#191959",
          "borderColor": "#191959"
        }
      },
      "boundary": {
        "id": "6ee231f8-bf89-4396-abd8-2165e1c87de4",
        "properties": {
          "fillColor": "#191959",
          "lineColor": "#191959"
        }
      },
      "summary": {
        "id": "196f3ff3-f7f9-40a9-a5ed-90f0b44b5882",
        "properties": {
          "lineColor": "#191959"
        }
      },
      "relationship": {
        "id": "5e0f7086-a697-4301-851d-f4d0b61a8be3",
        "properties": {
          "lineColor": "#191959"
        }
      }
    }
  },
  {
    "id": "Kimono-#FF7B31-TYPE_B",
    "tags": [
      "Kimono",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "b19de58d-fbf1-4129-aa83-2f65b8eb6dd8",
        "properties": {
          "fillColor": "#191959",
          "multiLineColors": "",
          "color-list": "#FFFFFF #FFABAA #FF7B31 #8CB5FF #4A51D9 #191959"
        }
      },
      "centralTopic": {
        "id": "a592e0a2-dd5f-4b57-b859-c5d0ac3a0792",
        "properties": {
          "fillColor": "#FF7B31",
          "lineColor": "#FF7B31"
        }
      },
      "mainTopic": {
        "id": "eb4539a1-94b1-46a1-80b6-d7bc9f1d775f",
        "properties": {
          "fillColor": "#FFFFFF"
        }
      },
      "subTopic": {
        "id": "9d63d5ab-bf81-4581-b43a-e94e44f0bc72",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "9a0f1674-83fa-41d9-be0b-d32bd8cb18f6",
        "properties": {
          "fillColor": "#FFABAA",
          "borderColor": "#FFABAA"
        }
      },
      "summaryTopic": {
        "id": "0d543329-7f87-4a62-ae87-43848290b81e",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "calloutTopic": {
        "id": "d2e898f1-5a5a-47ff-8a9c-059bbe47d406",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "importantTopic": {
        "id": "2ab597de-9002-424d-9445-21708392fdbb",
        "properties": {
          "fillColor": "#585918",
          "borderColor": "#585918"
        }
      },
      "minorTopic": {
        "id": "3f2e9be8-e8ab-4d4d-b435-03f445a1aada",
        "properties": {
          "fillColor": "#275918",
          "borderColor": "#275918"
        }
      },
      "boundary": {
        "id": "6a03504f-071c-4100-afce-d00f1b35fd29",
        "properties": {
          "fillColor": "#FF7B31",
          "lineColor": "#FF7B31"
        }
      },
      "summary": {
        "id": "021ac1dd-2f16-473d-b17c-a8c8a7a6e85c",
        "properties": {
          "lineColor": "#FF7B31"
        }
      },
      "relationship": {
        "id": "e9f3781d-7604-4f80-8b0a-129f23943fda",
        "properties": {
          "lineColor": "#FF7B31"
        }
      }
    }
  },
  {
    "id": "Kimono-#8CB5FF-TYPE_B",
    "tags": [
      "Kimono",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "3424ba0e-af78-4c04-93c1-e462e9527f13",
        "properties": {
          "fillColor": "#8CB5FF",
          "multiLineColors": "",
          "color-list": "#FFFFFF #FFABAA #FF7B31 #8CB5FF #4A51D9 #191959"
        }
      },
      "centralTopic": {
        "id": "a420ecad-d59b-4c4e-bb0a-a03eb7a8cd2f",
        "properties": {
          "fillColor": "#191959",
          "lineColor": "#191959"
        }
      },
      "mainTopic": {
        "id": "180dd302-ce89-4116-87d6-c5d465f83c40",
        "properties": {
          "fillColor": "#191959"
        }
      },
      "subTopic": {
        "id": "3330e93d-5adc-4248-903f-00831357a6c1",
        "properties": {
          "fillColor": "#323272"
        }
      },
      "floatingTopic": {
        "id": "dd96cfa9-a692-4d87-aeec-f0a3a6a0eb7c",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "summaryTopic": {
        "id": "c9976b15-d6e5-478a-8805-fb51735a1cc7",
        "properties": {
          "fillColor": "#191959",
          "borderColor": "#191959"
        }
      },
      "calloutTopic": {
        "id": "242a0e8e-fc76-479a-b477-2018a6e25424",
        "properties": {
          "fillColor": "#191959",
          "borderColor": "#191959"
        }
      },
      "importantTopic": {
        "id": "19f069f4-d722-4bbd-9885-4778ef58c078",
        "properties": {
          "fillColor": "#fed58c",
          "borderColor": "#fed58c"
        }
      },
      "minorTopic": {
        "id": "b4cff2b7-da34-49b1-95b2-c8c8eedfae1f",
        "properties": {
          "fillColor": "#d1fe8c",
          "borderColor": "#d1fe8c"
        }
      },
      "boundary": {
        "id": "b6328a91-e480-4f25-967c-65263c86f57c",
        "properties": {
          "fillColor": "#191959",
          "lineColor": "#191959"
        }
      },
      "summary": {
        "id": "75c50249-37c2-49b7-926a-61a8dcfa86a6",
        "properties": {
          "lineColor": "#191959"
        }
      },
      "relationship": {
        "id": "64189344-9cba-49d7-82ca-697e0bda54a0",
        "properties": {
          "lineColor": "#191959"
        }
      }
    }
  },
  {
    "id": "Kimono-#4A51D9-TYPE_A",
    "tags": [
      "Kimono",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "9fa27b38-da94-4824-af5b-859d8a21817d",
        "properties": {
          "fillColor": "#FFFFFF",
          "multiLineColors": "",
          "color-list": "#FFFFFF #FFABAA #FF7B31 #8CB5FF #4A51D9 #191959"
        }
      },
      "centralTopic": {
        "id": "07c713af-20e1-4906-a7b7-7629355a97cc",
        "properties": {
          "fillColor": "#4A51D9",
          "lineColor": "#4A51D9"
        }
      },
      "mainTopic": {
        "id": "c4d3ee7c-8414-4807-8881-6667b6a5d30b",
        "properties": {
          "fillColor": "#8CB5FF"
        }
      },
      "subTopic": {
        "id": "ac0ad55e-edf0-48cb-8660-f701fc1d648d",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "edbfd169-b826-413e-95ae-57128ac32146",
        "properties": {
          "fillColor": "#FF7B31",
          "borderColor": "#FF7B31"
        }
      },
      "summaryTopic": {
        "id": "31401696-1df3-441e-b301-eca139b77782",
        "properties": {
          "fillColor": "#8CB5FF",
          "borderColor": "#8CB5FF"
        }
      },
      "calloutTopic": {
        "id": "6f827851-ae20-43fe-9aec-35726abe1b4d",
        "properties": {
          "fillColor": "#8CB5FF",
          "borderColor": "#8CB5FF"
        }
      },
      "importantTopic": {
        "id": "40886123-47b7-41fd-bc56-18f8b5c7ae8d",
        "properties": {
          "fillColor": "#191959",
          "borderColor": "#191959"
        }
      },
      "minorTopic": {
        "id": "3b8c574c-c79c-41e5-9172-11fa834dc36e",
        "properties": {
          "fillColor": "#4A51D9",
          "borderColor": "#4A51D9"
        }
      },
      "boundary": {
        "id": "20e47d34-c967-4ddf-ad04-a4df05d150a3",
        "properties": {
          "fillColor": "#4A51D9",
          "lineColor": "#4A51D9"
        }
      },
      "summary": {
        "id": "fccfcb30-28e9-4ab7-8d87-f4b4082046ea",
        "properties": {
          "lineColor": "#4A51D9"
        }
      },
      "relationship": {
        "id": "68e4cff0-114b-4e7e-baca-e44d5da114bc",
        "properties": {
          "lineColor": "#4A51D9"
        }
      }
    }
  },
  {
    "id": "Kimono-#191959-TYPE_B",
    "tags": [
      "Kimono",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "3cd191bf-ea90-4363-b302-96f3fcd1eb74",
        "properties": {
          "fillColor": "#191959",
          "multiLineColors": "",
          "color-list": "#FFFFFF #FFABAA #FF7B31 #8CB5FF #4A51D9 #191959"
        }
      },
      "centralTopic": {
        "id": "26b1083f-48f1-40d1-a7cc-ed2a8dbb23aa",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "mainTopic": {
        "id": "dd65905d-c192-4bc6-8833-94cf5e1fce40",
        "properties": {
          "fillColor": "#FFFFFF"
        }
      },
      "subTopic": {
        "id": "c05dc399-b894-4ae9-837d-4190d104c800",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "4be861e0-0c4e-4d94-bb1f-2b1dd0eb29df",
        "properties": {
          "fillColor": "#FFABAA",
          "borderColor": "#FFABAA"
        }
      },
      "summaryTopic": {
        "id": "cbe67247-9ec0-4cc0-bd0c-92eef7fc8d3b",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "calloutTopic": {
        "id": "478f9c1a-6ee7-43af-9d04-b14c6350af11",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "importantTopic": {
        "id": "2c556900-228e-4e52-8a9f-810dbbb5955a",
        "properties": {
          "fillColor": "#585918",
          "borderColor": "#585918"
        }
      },
      "minorTopic": {
        "id": "39da8543-dbd1-45ae-933a-b5489c88082d",
        "properties": {
          "fillColor": "#275918",
          "borderColor": "#275918"
        }
      },
      "boundary": {
        "id": "e4bdc681-23c6-4ac6-a12e-056633862912",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "summary": {
        "id": "349c2bce-4f2a-4f3e-8c6e-b72d138c200b",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      },
      "relationship": {
        "id": "53d0f862-feae-47bc-8353-00675bf0493f",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      }
    }
  },
  {
    "id": "Kimono-#FFFFFF-MULTI_LINE_COLORS",
    "tags": [
      "Kimono",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "23e76a53-f683-40d9-a6fb-c6cf89ac94fa",
        "properties": {
          "fillColor": "#FFFFFF",
          "multiLineColors": "#FFABAA #FF7B31 #8CB5FF #4A51D9",
          "color-list": "#FFFFFF #FFABAA #FF7B31 #8CB5FF #4A51D9 #191959"
        }
      },
      "centralTopic": {
        "id": "79295b36-9d8c-4a96-9ee9-37e1c3f24c7a",
        "properties": {
          "fillColor": "#191959",
          "lineColor": "#191959"
        }
      },
      "mainTopic": {
        "id": "2448f937-026b-4843-bf43-a62d485b8549",
        "properties": {}
      },
      "subTopic": {
        "id": "719a33ad-e3bd-4e43-8bca-1eb3a3994793",
        "properties": {}
      },
      "floatingTopic": {
        "id": "746a94a0-c51a-4b02-b54a-3da0cc8dc261",
        "properties": {
          "fillColor": "#FF7B31",
          "borderColor": "#FF7B31"
        }
      },
      "summaryTopic": {
        "id": "fe347cc6-dd48-474e-8a9d-a3ceb859ce35",
        "properties": {
          "fillColor": "#8CB5FF",
          "borderColor": "#8CB5FF"
        }
      },
      "calloutTopic": {
        "id": "ad24da25-9521-4a3f-9c0c-d23b7cb3f2d5",
        "properties": {
          "fillColor": "#8CB5FF",
          "borderColor": "#8CB5FF"
        }
      },
      "importantTopic": {
        "id": "214b173c-729f-4fc3-bc85-0d6f1a31626f",
        "properties": {
          "fillColor": "#d14ad8",
          "borderColor": "#d14ad8"
        }
      },
      "minorTopic": {
        "id": "7c54ed7a-6067-4451-b938-f911287b2ef8",
        "properties": {
          "fillColor": "#591858",
          "borderColor": "#591858"
        }
      },
      "boundary": {
        "id": "3a76352f-39cd-43fc-9e70-eb876fc63f47",
        "properties": {
          "fillColor": "#191959",
          "lineColor": "#191959"
        }
      },
      "summary": {
        "id": "53c1a351-fd2b-4f78-b077-2a71ae26ae9d",
        "properties": {
          "lineColor": "#191959"
        }
      },
      "relationship": {
        "id": "05ccf552-780a-4add-89b2-dcbdcbfa52a3",
        "properties": {
          "lineColor": "#191959"
        }
      }
    }
  },
  {
    "id": "Kimono-#191959-MULTI_LINE_COLORS",
    "tags": [
      "Kimono",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "907d2358-267f-45eb-bb3f-fa8af40dffb1",
        "properties": {
          "fillColor": "#191959",
          "multiLineColors": "#FFABAA #FF7B31 #8CB5FF #4A51D9",
          "color-list": "#FFFFFF #FFABAA #FF7B31 #8CB5FF #4A51D9 #191959"
        }
      },
      "centralTopic": {
        "id": "ab513b9b-61dd-4fae-bc3d-f936e21897b8",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "mainTopic": {
        "id": "fbf5b621-7d7a-435f-aded-61a9e42d041c",
        "properties": {}
      },
      "subTopic": {
        "id": "a9a35d52-6fc7-45c5-bdfb-37042423ceaa",
        "properties": {}
      },
      "floatingTopic": {
        "id": "d6b1b7d3-d90c-4be2-ae03-ab3fe8b26eef",
        "properties": {
          "fillColor": "#FFABAA",
          "borderColor": "#FFABAA"
        }
      },
      "summaryTopic": {
        "id": "1af04e21-b203-4790-a4df-407fd1e495f8",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "calloutTopic": {
        "id": "6b803ff8-728e-45f2-8ca0-0363f1abbc61",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "importantTopic": {
        "id": "9dd4afcf-8b73-46a8-883d-b210e410593f",
        "properties": {
          "fillColor": "#185918",
          "borderColor": "#185918"
        }
      },
      "minorTopic": {
        "id": "a2db9eb0-ad6a-446c-bf73-9cbfeca9b4d6",
        "properties": {
          "fillColor": "#185949",
          "borderColor": "#185949"
        }
      },
      "boundary": {
        "id": "67bfe7a6-1890-4c41-a1c8-e91c374fb6db",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "summary": {
        "id": "a236bba7-3c44-403a-99e4-54b2b85e197a",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      },
      "relationship": {
        "id": "4e3e5f2a-1f4e-4af1-a240-5dde2ee1c574",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      }
    }
  },
  {
    "id": "Forid-#EDF3FF-TYPE_A",
    "tags": [
      "Forid",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "16173ff3-c6e4-4b9a-8c6b-453d0d77fa83",
        "properties": {
          "fillColor": "#EDF3FF",
          "multiLineColors": "",
          "color-list": "#EDF3FF #C1E554 #FFAA39 #D389D5 #1692D2 #0A052E"
        }
      },
      "centralTopic": {
        "id": "f260629b-dd76-4502-825c-116f067f5f3a",
        "properties": {
          "fillColor": "#0A052E",
          "lineColor": "#0A052E"
        }
      },
      "mainTopic": {
        "id": "648c8570-6cfb-4381-9378-8a8a8ed7e7b8",
        "properties": {
          "fillColor": "#1692D2"
        }
      },
      "subTopic": {
        "id": "63f75916-483c-4c07-80f4-268e86c9ca0e",
        "properties": {
          "fillColor": "#e3ecff"
        }
      },
      "floatingTopic": {
        "id": "55659874-84c1-47ab-b3fb-3918a1452697",
        "properties": {
          "fillColor": "#FFAA39",
          "borderColor": "#FFAA39"
        }
      },
      "summaryTopic": {
        "id": "4f732cfd-6c4f-4371-83dd-cac1e14d6bba",
        "properties": {
          "fillColor": "#1692D2",
          "borderColor": "#1692D2"
        }
      },
      "calloutTopic": {
        "id": "d6a9ec28-85a6-4614-bd3e-ab2f7554b8c6",
        "properties": {
          "fillColor": "#1692D2",
          "borderColor": "#1692D2"
        }
      },
      "importantTopic": {
        "id": "0fd60e26-46c2-456f-979a-be25f3be6270",
        "properties": {
          "fillColor": "#D389D5",
          "borderColor": "#D389D5"
        }
      },
      "minorTopic": {
        "id": "ae081401-5347-47e1-8ccc-cfb162040e71",
        "properties": {
          "fillColor": "#0A052E",
          "borderColor": "#0A052E"
        }
      },
      "boundary": {
        "id": "d1c068f7-73e2-45a8-8e99-d8dea84a7821",
        "properties": {
          "fillColor": "#0A052E",
          "lineColor": "#0A052E"
        }
      },
      "summary": {
        "id": "1050e189-803b-4d30-8d82-aeb37deb46ec",
        "properties": {
          "lineColor": "#0A052E"
        }
      },
      "relationship": {
        "id": "40d3c7db-670f-497c-afe7-13a816b1af98",
        "properties": {
          "lineColor": "#0A052E"
        }
      }
    }
  },
  {
    "id": "Forid-#C1E554-TYPE_B",
    "tags": [
      "Forid",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "7804bde4-d5b3-412e-82c7-c06b34c8f5ce",
        "properties": {
          "fillColor": "#C1E554",
          "multiLineColors": "",
          "color-list": "#EDF3FF #C1E554 #FFAA39 #D389D5 #1692D2 #0A052E"
        }
      },
      "centralTopic": {
        "id": "e2faa63a-890d-41fc-8b44-fbebbd15eb75",
        "properties": {
          "fillColor": "#0A052E",
          "lineColor": "#0A052E"
        }
      },
      "mainTopic": {
        "id": "714a0720-56b8-4ecb-9566-723cc2e31fb1",
        "properties": {
          "fillColor": "#0A052E"
        }
      },
      "subTopic": {
        "id": "e9916737-662b-468d-b8cd-943afed31de1",
        "properties": {
          "fillColor": "#231e47"
        }
      },
      "floatingTopic": {
        "id": "38eb87cc-e066-4fba-801b-df49123df60b",
        "properties": {
          "fillColor": "#FFAA39",
          "borderColor": "#FFAA39"
        }
      },
      "summaryTopic": {
        "id": "a39ce7e7-82c0-4cbe-9eba-f8749b3e7718",
        "properties": {
          "fillColor": "#0A052E",
          "borderColor": "#0A052E"
        }
      },
      "calloutTopic": {
        "id": "81edb588-76eb-4edc-8048-729ad1fbee2d",
        "properties": {
          "fillColor": "#0A052E",
          "borderColor": "#0A052E"
        }
      },
      "importantTopic": {
        "id": "a4d8aa24-9a10-47c2-ac12-2c302e85bdd1",
        "properties": {
          "fillColor": "#7854e4",
          "borderColor": "#7854e4"
        }
      },
      "minorTopic": {
        "id": "aba6baac-24f7-4215-b1e0-184bdede0d4e",
        "properties": {
          "fillColor": "#e354e3",
          "borderColor": "#e354e3"
        }
      },
      "boundary": {
        "id": "4c91771c-28c6-4362-b2a1-cdd02d590ca6",
        "properties": {
          "fillColor": "#0A052E",
          "lineColor": "#0A052E"
        }
      },
      "summary": {
        "id": "5d548e63-4c0d-4e79-84da-247025de500d",
        "properties": {
          "lineColor": "#0A052E"
        }
      },
      "relationship": {
        "id": "1f11a15d-a837-40a9-b42b-a542abbad19f",
        "properties": {
          "lineColor": "#0A052E"
        }
      }
    }
  },
  {
    "id": "Forid-#FFAA39-TYPE_C",
    "tags": [
      "Forid",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "19948312-7045-4a9c-a157-7c4e883fcd97",
        "properties": {
          "fillColor": "#0A052E",
          "multiLineColors": "",
          "color-list": "#EDF3FF #C1E554 #FFAA39 #D389D5 #1692D2 #0A052E"
        }
      },
      "centralTopic": {
        "id": "cb6dbf51-24f2-4c25-80ca-125b78d7bb9b",
        "properties": {
          "fillColor": "#FFAA39",
          "lineColor": "#FFAA39"
        }
      },
      "mainTopic": {
        "id": "701bbbec-1ae3-4dad-af13-0e5663874395",
        "properties": {
          "fillColor": "#EDF3FF"
        }
      },
      "subTopic": {
        "id": "17ab6443-edf1-43b9-b8d2-80cc8da7ace6",
        "properties": {
          "fillColor": "#231e47"
        }
      },
      "floatingTopic": {
        "id": "8347de54-7c3f-4f35-96a5-85f142af698e",
        "properties": {
          "fillColor": "#C1E554",
          "borderColor": "#C1E554"
        }
      },
      "summaryTopic": {
        "id": "5588cba6-e0ce-49c7-ad95-9b4ccb247c84",
        "properties": {
          "fillColor": "#EDF3FF",
          "borderColor": "#EDF3FF"
        }
      },
      "calloutTopic": {
        "id": "97a8be3f-6fe9-4411-ae1d-04da0c0a9f68",
        "properties": {
          "fillColor": "#EDF3FF",
          "borderColor": "#EDF3FF"
        }
      },
      "importantTopic": {
        "id": "d88ee67d-75fd-4e3f-8d82-cd15dc10aa04",
        "properties": {
          "fillColor": "#C1E554",
          "borderColor": "#C1E554"
        }
      },
      "minorTopic": {
        "id": "5188e3e6-9eb4-4e84-966a-b978a0dc3905",
        "properties": {
          "fillColor": "#FFAA39",
          "borderColor": "#FFAA39"
        }
      },
      "boundary": {
        "id": "e9e888f3-3e2b-42ee-b05f-aab67dda3cb3",
        "properties": {
          "fillColor": "#FFAA39",
          "lineColor": "#FFAA39"
        }
      },
      "summary": {
        "id": "939cdb4a-f03e-4cc7-8d3d-ed2a01ff8fb6",
        "properties": {
          "lineColor": "#FFAA39"
        }
      },
      "relationship": {
        "id": "b897fffb-0eda-4bc7-a856-1affc3de29ca",
        "properties": {
          "lineColor": "#FFAA39"
        }
      }
    }
  },
  {
    "id": "Forid-#D389D5-TYPE_B",
    "tags": [
      "Forid",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "487398ba-1bb7-4b4b-9ecc-877eebc90869",
        "properties": {
          "fillColor": "#D389D5",
          "multiLineColors": "",
          "color-list": "#EDF3FF #C1E554 #FFAA39 #D389D5 #1692D2 #0A052E"
        }
      },
      "centralTopic": {
        "id": "98fa3e7d-ca12-4f58-97b1-802591ca1ca0",
        "properties": {
          "fillColor": "#0A052E",
          "lineColor": "#0A052E"
        }
      },
      "mainTopic": {
        "id": "c0f96d35-1392-4f73-980e-5b65b2b0080d",
        "properties": {
          "fillColor": "#0A052E"
        }
      },
      "subTopic": {
        "id": "8e2c8ee2-083c-46d8-8f25-d447b488e62c",
        "properties": {
          "fillColor": "#231e47"
        }
      },
      "floatingTopic": {
        "id": "469e638b-4aa6-4f3a-8bf9-c0a74893eae1",
        "properties": {
          "fillColor": "#EDF3FF",
          "borderColor": "#EDF3FF"
        }
      },
      "summaryTopic": {
        "id": "d3b02a7d-c840-4cbe-b3db-b69f750a8181",
        "properties": {
          "fillColor": "#0A052E",
          "borderColor": "#0A052E"
        }
      },
      "calloutTopic": {
        "id": "1dfb0feb-f0aa-452d-ad7b-fc1b2d1c269c",
        "properties": {
          "fillColor": "#0A052E",
          "borderColor": "#0A052E"
        }
      },
      "importantTopic": {
        "id": "a78627b9-26e1-4e1c-9f5b-af49e851dc03",
        "properties": {
          "fillColor": "#8bd588",
          "borderColor": "#8bd588"
        }
      },
      "minorTopic": {
        "id": "61c5ea6e-f5f9-4a03-9a44-fe27b1af9bf9",
        "properties": {
          "fillColor": "#88d5be",
          "borderColor": "#88d5be"
        }
      },
      "boundary": {
        "id": "b2d40dde-7ff4-4bd9-99ff-3168f38dd68b",
        "properties": {
          "fillColor": "#0A052E",
          "lineColor": "#0A052E"
        }
      },
      "summary": {
        "id": "0fbb685d-64cd-46b1-a17a-6f7adc7f5fee",
        "properties": {
          "lineColor": "#0A052E"
        }
      },
      "relationship": {
        "id": "4b658873-76a7-4c68-9d5c-c6e66e511648",
        "properties": {
          "lineColor": "#0A052E"
        }
      }
    }
  },
  {
    "id": "Forid-#1692D2-TYPE_C",
    "tags": [
      "Forid",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "7f7849c1-a197-4a12-a877-7039fbb2b557",
        "properties": {
          "fillColor": "#0A052E",
          "multiLineColors": "",
          "color-list": "#EDF3FF #C1E554 #FFAA39 #D389D5 #1692D2 #0A052E"
        }
      },
      "centralTopic": {
        "id": "b40bce1a-b134-48f0-ab3b-0e311ca6f251",
        "properties": {
          "fillColor": "#1692D2",
          "lineColor": "#1692D2"
        }
      },
      "mainTopic": {
        "id": "02cc8390-3c60-4ae2-8add-8d499989b0ed",
        "properties": {
          "fillColor": "#EDF3FF"
        }
      },
      "subTopic": {
        "id": "f0f49738-04cd-4356-a5bd-eb193259a12d",
        "properties": {
          "fillColor": "#231e47"
        }
      },
      "floatingTopic": {
        "id": "e4271438-5b96-4297-981b-c6a75d296b58",
        "properties": {
          "fillColor": "#C1E554",
          "borderColor": "#C1E554"
        }
      },
      "summaryTopic": {
        "id": "4bd6dbda-5d95-4f04-9208-cab3d7ff9978",
        "properties": {
          "fillColor": "#EDF3FF",
          "borderColor": "#EDF3FF"
        }
      },
      "calloutTopic": {
        "id": "00e81e2b-3988-452e-a18b-7f899ef5d2b9",
        "properties": {
          "fillColor": "#EDF3FF",
          "borderColor": "#EDF3FF"
        }
      },
      "importantTopic": {
        "id": "dafaaae6-3cf7-4fc2-a6bf-63a243459c94",
        "properties": {
          "fillColor": "#C1E554",
          "borderColor": "#C1E554"
        }
      },
      "minorTopic": {
        "id": "def87f1a-442c-4496-bf70-bf73c3a3de43",
        "properties": {
          "fillColor": "#1692D2",
          "borderColor": "#1692D2"
        }
      },
      "boundary": {
        "id": "da10b21b-65d8-4e61-b682-dc2a5ec3ddb7",
        "properties": {
          "fillColor": "#1692D2",
          "lineColor": "#1692D2"
        }
      },
      "summary": {
        "id": "210bbbc1-d024-4741-86e6-93f225577bf1",
        "properties": {
          "lineColor": "#1692D2"
        }
      },
      "relationship": {
        "id": "7d73d70a-f677-434c-b394-257d5d8f2614",
        "properties": {
          "lineColor": "#1692D2"
        }
      }
    }
  },
  {
    "id": "Forid-#0A052E-TYPE_C",
    "tags": [
      "Forid",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "03970ecc-e438-4e51-ab8a-467968af5814",
        "properties": {
          "fillColor": "#0A052E",
          "multiLineColors": "",
          "color-list": "#EDF3FF #C1E554 #FFAA39 #D389D5 #1692D2 #0A052E"
        }
      },
      "centralTopic": {
        "id": "57a8c669-c344-4cad-b114-20c6ff049615",
        "properties": {
          "fillColor": "#EDF3FF",
          "lineColor": "#EDF3FF"
        }
      },
      "mainTopic": {
        "id": "e20e7669-66b3-4f3f-ac3b-c7e566dc2169",
        "properties": {
          "fillColor": "#C1E554"
        }
      },
      "subTopic": {
        "id": "7d1944f7-98e6-4238-a85f-6b396b3f16df",
        "properties": {
          "fillColor": "#231e47"
        }
      },
      "floatingTopic": {
        "id": "d058afb6-c131-4ec8-ba28-dc96bdc2b3d3",
        "properties": {
          "fillColor": "#FFAA39",
          "borderColor": "#FFAA39"
        }
      },
      "summaryTopic": {
        "id": "991618ac-2dda-4fc2-abd8-49a36469ed7a",
        "properties": {
          "fillColor": "#C1E554",
          "borderColor": "#C1E554"
        }
      },
      "calloutTopic": {
        "id": "41314722-1748-4cf9-886d-8c470ad91998",
        "properties": {
          "fillColor": "#C1E554",
          "borderColor": "#C1E554"
        }
      },
      "importantTopic": {
        "id": "6f56566d-edc4-4656-b6e8-a8e87c3486b4",
        "properties": {
          "fillColor": "#FFAA39",
          "borderColor": "#FFAA39"
        }
      },
      "minorTopic": {
        "id": "7f38cd9b-9ff8-45cd-88ad-ca3bc1230aa0",
        "properties": {
          "fillColor": "#EDF3FF",
          "borderColor": "#EDF3FF"
        }
      },
      "boundary": {
        "id": "9bd36c6a-7b03-4a75-8590-dd6482a3e6a6",
        "properties": {
          "fillColor": "#EDF3FF",
          "lineColor": "#EDF3FF"
        }
      },
      "summary": {
        "id": "8940af4c-09c0-4298-b4d9-2a884a1c346c",
        "properties": {
          "lineColor": "#EDF3FF"
        }
      },
      "relationship": {
        "id": "d33e6eda-4b58-4910-85bf-c2135d7aaa43",
        "properties": {
          "lineColor": "#EDF3FF"
        }
      }
    }
  },
  {
    "id": "Forid-#EDF3FF-MULTI_LINE_COLORS",
    "tags": [
      "Forid",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "3706e5f4-2f66-4777-8686-8e64d0ddcf84",
        "properties": {
          "fillColor": "#EDF3FF",
          "multiLineColors": "#FFAA39 #D389D5 #1692D2",
          "color-list": "#EDF3FF #C1E554 #FFAA39 #D389D5 #1692D2 #0A052E"
        }
      },
      "centralTopic": {
        "id": "75b47f79-3da4-4667-8037-1e3fafb72e39",
        "properties": {
          "fillColor": "#0A052E",
          "lineColor": "#0A052E"
        }
      },
      "mainTopic": {
        "id": "e328b72c-6da7-4115-bffd-0f4a2c08b7a9",
        "properties": {}
      },
      "subTopic": {
        "id": "e301b129-b2e8-4811-9812-c15b7ff0bec4",
        "properties": {}
      },
      "floatingTopic": {
        "id": "b7898761-d696-47bd-a7d8-e5c275edb98e",
        "properties": {
          "fillColor": "#FFAA39",
          "borderColor": "#FFAA39"
        }
      },
      "summaryTopic": {
        "id": "9bb47596-caf0-47fa-8155-bd0ba32975f4",
        "properties": {
          "fillColor": "#1692D2",
          "borderColor": "#1692D2"
        }
      },
      "calloutTopic": {
        "id": "6c4adea0-5e05-41fe-99a3-ae951d52ef03",
        "properties": {
          "fillColor": "#1692D2",
          "borderColor": "#1692D2"
        }
      },
      "importantTopic": {
        "id": "e4054eb7-8c4e-4478-b119-54667b1525a5",
        "properties": {
          "fillColor": "#d5888b",
          "borderColor": "#d5888b"
        }
      },
      "minorTopic": {
        "id": "86f4fe92-17f9-4da4-be28-34c05a88d101",
        "properties": {
          "fillColor": "#2e0429",
          "borderColor": "#2e0429"
        }
      },
      "boundary": {
        "id": "fc3b37e6-7815-4c86-bab1-da40624fdcc4",
        "properties": {
          "fillColor": "#0A052E",
          "lineColor": "#0A052E"
        }
      },
      "summary": {
        "id": "980b689c-e814-48e8-8a84-f4827509c2ce",
        "properties": {
          "lineColor": "#0A052E"
        }
      },
      "relationship": {
        "id": "bf49ec47-c779-411d-9586-29618e754147",
        "properties": {
          "lineColor": "#0A052E"
        }
      }
    }
  },
  {
    "id": "Forid-#0A052E-MULTI_LINE_COLORS",
    "tags": [
      "Forid",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "eeb2309a-7d30-4921-9a5e-9ae76d945d58",
        "properties": {
          "fillColor": "#0A052E",
          "multiLineColors": "#C1E554 #FFAA39 #D389D5 #1692D2",
          "color-list": "#EDF3FF #C1E554 #FFAA39 #D389D5 #1692D2 #0A052E"
        }
      },
      "centralTopic": {
        "id": "4813f79c-2af7-4bc1-af73-494d116c9db2",
        "properties": {
          "fillColor": "#EDF3FF",
          "lineColor": "#EDF3FF"
        }
      },
      "mainTopic": {
        "id": "1e39f404-0481-455d-9d50-351bccad6a02",
        "properties": {}
      },
      "subTopic": {
        "id": "c72d118f-fe1d-488b-80bd-3190db6bfc9b",
        "properties": {}
      },
      "floatingTopic": {
        "id": "e0d66518-9d9f-4e97-b678-10243d2614f9",
        "properties": {
          "fillColor": "#FFAA39",
          "borderColor": "#FFAA39"
        }
      },
      "summaryTopic": {
        "id": "3a8ac3ef-35f4-4597-b7f4-6ef3fe314e95",
        "properties": {
          "fillColor": "#C1E554",
          "borderColor": "#C1E554"
        }
      },
      "calloutTopic": {
        "id": "9d46b495-3ebc-415f-b402-6be2d74a780d",
        "properties": {
          "fillColor": "#C1E554",
          "borderColor": "#C1E554"
        }
      },
      "importantTopic": {
        "id": "97005b2c-edcd-4b75-a8c6-3344ce0e9c25",
        "properties": {
          "fillColor": "#8dff39",
          "borderColor": "#8dff39"
        }
      },
      "minorTopic": {
        "id": "71810d15-f0c8-4616-b9d5-9da41447da28",
        "properties": {
          "fillColor": "#f9edff",
          "borderColor": "#f9edff"
        }
      },
      "boundary": {
        "id": "33dbb153-0656-4d88-bf97-030cd8de69b3",
        "properties": {
          "fillColor": "#EDF3FF",
          "lineColor": "#EDF3FF"
        }
      },
      "summary": {
        "id": "3498f191-5264-48f6-a169-58ef13715fdc",
        "properties": {
          "lineColor": "#EDF3FF"
        }
      },
      "relationship": {
        "id": "7040d756-2c71-4cb1-9834-d984863a6372",
        "properties": {
          "lineColor": "#EDF3FF"
        }
      }
    }
  },
  {
    "id": "Quaint-#F9F5DE-TYPE_A",
    "tags": [
      "Quaint",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "8a40b3ff-92e1-476d-b10e-931f4b4f1d31",
        "properties": {
          "fillColor": "#F9F5DE",
          "multiLineColors": "",
          "color-list": "#F9F5DE #DFDDCE #4B9D9D #7884A4 #AA79AA #153E5D"
        }
      },
      "centralTopic": {
        "id": "56ffa96c-6c2c-4589-a6a0-798ac78be768",
        "properties": {
          "fillColor": "#153E5D",
          "lineColor": "#153E5D"
        }
      },
      "mainTopic": {
        "id": "55521d94-9fe8-4417-a4f4-fc3dabad0c1d",
        "properties": {
          "fillColor": "#4B9D9D"
        }
      },
      "subTopic": {
        "id": "989a822c-4b4c-4500-ab02-14736837aef0",
        "properties": {
          "fillColor": "#f6f0cd"
        }
      },
      "floatingTopic": {
        "id": "616c7b5c-7c0a-4f76-bd6d-578281dfc87b",
        "properties": {
          "fillColor": "#7884A4",
          "borderColor": "#7884A4"
        }
      },
      "summaryTopic": {
        "id": "0b31be5a-36e8-430a-8f92-7de51ba5fa06",
        "properties": {
          "fillColor": "#4B9D9D",
          "borderColor": "#4B9D9D"
        }
      },
      "calloutTopic": {
        "id": "7ec21f34-1ed5-47a5-9368-553d1a25fd7d",
        "properties": {
          "fillColor": "#4B9D9D",
          "borderColor": "#4B9D9D"
        }
      },
      "importantTopic": {
        "id": "02cd29ff-50df-4710-969a-2686223ae39c",
        "properties": {
          "fillColor": "#7884A4",
          "borderColor": "#7884A4"
        }
      },
      "minorTopic": {
        "id": "467d97f4-5d55-4c72-8a01-3ff8a98c6de0",
        "properties": {
          "fillColor": "#153E5D",
          "borderColor": "#153E5D"
        }
      },
      "boundary": {
        "id": "9734697c-bec3-4c63-aa38-0804d2bb9c03",
        "properties": {
          "fillColor": "#153E5D",
          "lineColor": "#153E5D"
        }
      },
      "summary": {
        "id": "05dad468-cb08-4874-aaf7-33c3c25d54f0",
        "properties": {
          "lineColor": "#153E5D"
        }
      },
      "relationship": {
        "id": "8ebed2e1-3214-4f8c-a50c-e306ffdb876b",
        "properties": {
          "lineColor": "#153E5D"
        }
      }
    }
  },
  {
    "id": "Quaint-#DFDDCE-TYPE_A",
    "tags": [
      "Quaint",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "c4fcad3e-b573-465b-b189-99943b641225",
        "properties": {
          "fillColor": "#DFDDCE",
          "multiLineColors": "",
          "color-list": "#F9F5DE #DFDDCE #4B9D9D #7884A4 #AA79AA #153E5D"
        }
      },
      "centralTopic": {
        "id": "0d76eaec-d931-43b8-bc13-cc7c67dd34c0",
        "properties": {
          "fillColor": "#153E5D",
          "lineColor": "#153E5D"
        }
      },
      "mainTopic": {
        "id": "555e379d-32d3-440b-b8ce-52d295aa00ba",
        "properties": {
          "fillColor": "#4B9D9D"
        }
      },
      "subTopic": {
        "id": "20b13614-8929-4a9b-8a63-3c585e8f8f69",
        "properties": {
          "fillColor": "#cfccb5"
        }
      },
      "floatingTopic": {
        "id": "0331c25c-58ff-4f50-aad8-83a35e64edf0",
        "properties": {
          "fillColor": "#7884A4",
          "borderColor": "#7884A4"
        }
      },
      "summaryTopic": {
        "id": "b281421e-e20e-4e40-843f-92f466526dc4",
        "properties": {
          "fillColor": "#4B9D9D",
          "borderColor": "#4B9D9D"
        }
      },
      "calloutTopic": {
        "id": "cdfb0560-d167-4fad-ad60-9d2b5288359b",
        "properties": {
          "fillColor": "#4B9D9D",
          "borderColor": "#4B9D9D"
        }
      },
      "importantTopic": {
        "id": "35b5a69a-1be8-43c6-9e93-6244569e08ac",
        "properties": {
          "fillColor": "#7884A4",
          "borderColor": "#7884A4"
        }
      },
      "minorTopic": {
        "id": "cdab9175-d39f-4305-91d9-dd0a26cde391",
        "properties": {
          "fillColor": "#153E5D",
          "borderColor": "#153E5D"
        }
      },
      "boundary": {
        "id": "76cba78e-3dd3-4353-b9ce-f724162b63c1",
        "properties": {
          "fillColor": "#153E5D",
          "lineColor": "#153E5D"
        }
      },
      "summary": {
        "id": "0e2790cb-2918-4ef9-9f9e-7f639b5d63dd",
        "properties": {
          "lineColor": "#153E5D"
        }
      },
      "relationship": {
        "id": "87f28568-8961-4131-ba0a-42d4ea8a3442",
        "properties": {
          "lineColor": "#153E5D"
        }
      }
    }
  },
  {
    "id": "Quaint-#4B9D9D-TYPE_B",
    "tags": [
      "Quaint",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "35d218c5-337b-4d8f-9e74-20a006ca8471",
        "properties": {
          "fillColor": "#4B9D9D",
          "multiLineColors": "",
          "color-list": "#F9F5DE #DFDDCE #4B9D9D #7884A4 #AA79AA #153E5D"
        }
      },
      "centralTopic": {
        "id": "7985a4d7-1bcb-45e7-a00f-b587dfb2c210",
        "properties": {
          "fillColor": "#153E5D",
          "lineColor": "#153E5D"
        }
      },
      "mainTopic": {
        "id": "b4743cd1-e9d1-4ba0-ab53-d854b57fa8d5",
        "properties": {
          "fillColor": "#153E5D"
        }
      },
      "subTopic": {
        "id": "7ec9deb9-ffd4-4b5e-95e7-04b7113f556a",
        "properties": {
          "fillColor": "#2e5776"
        }
      },
      "floatingTopic": {
        "id": "d20322ae-ca85-4353-b1aa-049ba76537ab",
        "properties": {
          "fillColor": "#F9F5DE",
          "borderColor": "#F9F5DE"
        }
      },
      "summaryTopic": {
        "id": "be10fd51-0a64-4709-ab18-85035100da01",
        "properties": {
          "fillColor": "#153E5D",
          "borderColor": "#153E5D"
        }
      },
      "calloutTopic": {
        "id": "7257a8f2-d183-4038-9e58-867c4cdd6532",
        "properties": {
          "fillColor": "#153E5D",
          "borderColor": "#153E5D"
        }
      },
      "importantTopic": {
        "id": "1a1eec0b-fe46-4a33-b15f-35636530392f",
        "properties": {
          "fillColor": "#9d4a4a",
          "borderColor": "#9d4a4a"
        }
      },
      "minorTopic": {
        "id": "21e56168-a0f3-4c35-a772-c7915345840a",
        "properties": {
          "fillColor": "#9c884a",
          "borderColor": "#9c884a"
        }
      },
      "boundary": {
        "id": "683fea57-248a-48b8-b6fc-182f4854aa34",
        "properties": {
          "fillColor": "#153E5D",
          "lineColor": "#153E5D"
        }
      },
      "summary": {
        "id": "53a1fbb4-0c22-4823-afd1-29c6f8548e67",
        "properties": {
          "lineColor": "#153E5D"
        }
      },
      "relationship": {
        "id": "e3f5de81-dd96-4887-a472-580735bb29a9",
        "properties": {
          "lineColor": "#153E5D"
        }
      }
    }
  },
  {
    "id": "Quaint-#7884A4-TYPE_B",
    "tags": [
      "Quaint",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "031f5c36-49d8-44be-9315-87c12e9af96e",
        "properties": {
          "fillColor": "#7884A4",
          "multiLineColors": "",
          "color-list": "#F9F5DE #DFDDCE #4B9D9D #7884A4 #AA79AA #153E5D"
        }
      },
      "centralTopic": {
        "id": "29a7e3a8-8a9a-46bc-a505-5834a922d174",
        "properties": {
          "fillColor": "#F9F5DE",
          "lineColor": "#F9F5DE"
        }
      },
      "mainTopic": {
        "id": "edb6afb3-56a3-4ae9-988d-30567a801ce9",
        "properties": {
          "fillColor": "#F9F5DE"
        }
      },
      "subTopic": {
        "id": "819e0de2-73d4-4f25-bf43-3173671b58a3",
        "properties": {
          "fillColor": "#fffff7"
        }
      },
      "floatingTopic": {
        "id": "d496b322-dc49-441e-82cf-2756c20d0367",
        "properties": {
          "fillColor": "#DFDDCE",
          "borderColor": "#DFDDCE"
        }
      },
      "summaryTopic": {
        "id": "21ec962e-f133-4f3b-9d1e-e5346dbe1326",
        "properties": {
          "fillColor": "#F9F5DE",
          "borderColor": "#F9F5DE"
        }
      },
      "calloutTopic": {
        "id": "68c2d7c4-b335-4758-a652-f93be188aca4",
        "properties": {
          "fillColor": "#F9F5DE",
          "borderColor": "#F9F5DE"
        }
      },
      "importantTopic": {
        "id": "461f327c-43ca-4921-a032-9d01b55631c5",
        "properties": {
          "fillColor": "#a49878",
          "borderColor": "#a49878"
        }
      },
      "minorTopic": {
        "id": "804a3e83-3f15-4be2-b562-29cc82e63c34",
        "properties": {
          "fillColor": "#8fa478",
          "borderColor": "#8fa478"
        }
      },
      "boundary": {
        "id": "5a10331d-04ff-44b7-9593-ac3412d0cc21",
        "properties": {
          "fillColor": "#F9F5DE",
          "lineColor": "#F9F5DE"
        }
      },
      "summary": {
        "id": "09f2017c-1b19-4ec6-ba2e-0fa620e3af5f",
        "properties": {
          "lineColor": "#F9F5DE"
        }
      },
      "relationship": {
        "id": "58831e99-a5b0-4ee4-a44b-a26967c6f215",
        "properties": {
          "lineColor": "#F9F5DE"
        }
      }
    }
  },
  {
    "id": "Quaint-#AA79AA-TYPE_B",
    "tags": [
      "Quaint",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "c65dbc84-7c68-41b7-970a-0fe1c466fecf",
        "properties": {
          "fillColor": "#AA79AA",
          "multiLineColors": "",
          "color-list": "#F9F5DE #DFDDCE #4B9D9D #7884A4 #AA79AA #153E5D"
        }
      },
      "centralTopic": {
        "id": "46c854d4-2be6-4e04-8965-8136b0726232",
        "properties": {
          "fillColor": "#153E5D",
          "lineColor": "#153E5D"
        }
      },
      "mainTopic": {
        "id": "52c788d7-b2e6-4dfb-88f6-19792648f069",
        "properties": {
          "fillColor": "#F9F5DE"
        }
      },
      "subTopic": {
        "id": "2587fdfd-e4b4-4e8c-ae45-307010d811a0",
        "properties": {
          "fillColor": "#fffff7"
        }
      },
      "floatingTopic": {
        "id": "815252e7-1789-4e9e-a0a0-3208f7960aba",
        "properties": {
          "fillColor": "#DFDDCE",
          "borderColor": "#DFDDCE"
        }
      },
      "summaryTopic": {
        "id": "ebb2a9b1-4310-43c7-a580-8d10dc84aab5",
        "properties": {
          "fillColor": "#F9F5DE",
          "borderColor": "#F9F5DE"
        }
      },
      "calloutTopic": {
        "id": "bdaff708-a5b4-4cc3-bce5-823bb982b63a",
        "properties": {
          "fillColor": "#F9F5DE",
          "borderColor": "#F9F5DE"
        }
      },
      "importantTopic": {
        "id": "f46f91df-5993-43ad-9e56-a908ee84a7f0",
        "properties": {
          "fillColor": "#79aa79",
          "borderColor": "#79aa79"
        }
      },
      "minorTopic": {
        "id": "b46a94a3-7a36-4371-b94d-605c858abd46",
        "properties": {
          "fillColor": "#79aa9d",
          "borderColor": "#79aa9d"
        }
      },
      "boundary": {
        "id": "d42c8496-0548-41f3-bdc1-d4f19665f16b",
        "properties": {
          "fillColor": "#153E5D",
          "lineColor": "#153E5D"
        }
      },
      "summary": {
        "id": "2d8ef437-3b31-4e44-ad2a-2d269f5bb6a9",
        "properties": {
          "lineColor": "#153E5D"
        }
      },
      "relationship": {
        "id": "321ed33a-2a52-4f10-b324-c8207a701039",
        "properties": {
          "lineColor": "#153E5D"
        }
      }
    }
  },
  {
    "id": "Quaint-#153E5D-TYPE_B",
    "tags": [
      "Quaint",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "06ec34fd-023d-4890-9443-f0566af6de93",
        "properties": {
          "fillColor": "#153E5D",
          "multiLineColors": "",
          "color-list": "#F9F5DE #DFDDCE #4B9D9D #7884A4 #AA79AA #153E5D"
        }
      },
      "centralTopic": {
        "id": "441b87a3-01a9-43be-85da-ee63507fc76f",
        "properties": {
          "fillColor": "#F9F5DE",
          "lineColor": "#F9F5DE"
        }
      },
      "mainTopic": {
        "id": "edef0dab-b353-4ee6-b31b-12c5fb9b5a24",
        "properties": {
          "fillColor": "#F9F5DE"
        }
      },
      "subTopic": {
        "id": "77ac81d0-4e8c-45d6-9093-a46d8f283284",
        "properties": {
          "fillColor": "#fffff7"
        }
      },
      "floatingTopic": {
        "id": "e15e42a5-1b2f-4149-9d7d-bc83783bc290",
        "properties": {
          "fillColor": "#DFDDCE",
          "borderColor": "#DFDDCE"
        }
      },
      "summaryTopic": {
        "id": "5a0ec694-1ca6-4ba8-bc2e-1e735426426d",
        "properties": {
          "fillColor": "#F9F5DE",
          "borderColor": "#F9F5DE"
        }
      },
      "calloutTopic": {
        "id": "e211f40d-9f62-4f8a-8716-0e5018c9633b",
        "properties": {
          "fillColor": "#F9F5DE",
          "borderColor": "#F9F5DE"
        }
      },
      "importantTopic": {
        "id": "6874e9da-9661-4452-b2fb-ac7d34ad7ea4",
        "properties": {
          "fillColor": "#5d3314",
          "borderColor": "#5d3314"
        }
      },
      "minorTopic": {
        "id": "a7a26b14-0e1c-4cbe-bdc6-c8598a404e8d",
        "properties": {
          "fillColor": "#505d14",
          "borderColor": "#505d14"
        }
      },
      "boundary": {
        "id": "27c9496b-a94b-4955-ae73-a0f3fed8e328",
        "properties": {
          "fillColor": "#F9F5DE",
          "lineColor": "#F9F5DE"
        }
      },
      "summary": {
        "id": "39973e50-e042-448b-a989-145265136bef",
        "properties": {
          "lineColor": "#F9F5DE"
        }
      },
      "relationship": {
        "id": "9ddf73ec-0770-4f6e-a76f-de050e4a6def",
        "properties": {
          "lineColor": "#F9F5DE"
        }
      }
    }
  },
  {
    "id": "Quaint-#F9F5DE-MULTI_LINE_COLORS",
    "tags": [
      "Quaint",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "59fef625-443c-4926-af2c-ea28adebc1e6",
        "properties": {
          "fillColor": "#F9F5DE",
          "multiLineColors": "#4B9D9D #7884A4 #AA79AA",
          "color-list": "#F9F5DE #DFDDCE #4B9D9D #7884A4 #AA79AA #153E5D"
        }
      },
      "centralTopic": {
        "id": "a467b210-7a7e-4f1b-9604-76c0294af335",
        "properties": {
          "fillColor": "#153E5D",
          "lineColor": "#153E5D"
        }
      },
      "mainTopic": {
        "id": "2a251d59-9f08-4065-bab9-793a30f0a7e4",
        "properties": {}
      },
      "subTopic": {
        "id": "f48396e7-bebc-402d-8ce1-7dabb4c73b2c",
        "properties": {}
      },
      "floatingTopic": {
        "id": "6c68fc9a-e7b8-45f5-b9a6-f869e1fa9453",
        "properties": {
          "fillColor": "#7884A4",
          "borderColor": "#7884A4"
        }
      },
      "summaryTopic": {
        "id": "f03bb22f-4c9f-467c-a84b-2a955072fbbc",
        "properties": {
          "fillColor": "#4B9D9D",
          "borderColor": "#4B9D9D"
        }
      },
      "calloutTopic": {
        "id": "a14114c8-d843-4cdf-aae8-11b23c9b1625",
        "properties": {
          "fillColor": "#4B9D9D",
          "borderColor": "#4B9D9D"
        }
      },
      "importantTopic": {
        "id": "aee3aae0-3ba8-4426-948d-8927a1d92b70",
        "properties": {
          "fillColor": "#9778a4",
          "borderColor": "#9778a4"
        }
      },
      "minorTopic": {
        "id": "02e1f926-b0a1-4a79-8b1a-339cbd1e8624",
        "properties": {
          "fillColor": "#33145d",
          "borderColor": "#33145d"
        }
      },
      "boundary": {
        "id": "9dd5b63a-3496-450d-990e-73272839caa2",
        "properties": {
          "fillColor": "#153E5D",
          "lineColor": "#153E5D"
        }
      },
      "summary": {
        "id": "33397c52-46bb-46bc-a906-73d484c2bb41",
        "properties": {
          "lineColor": "#153E5D"
        }
      },
      "relationship": {
        "id": "d32d3e98-ec6e-4e27-b562-e53477a47526",
        "properties": {
          "lineColor": "#153E5D"
        }
      }
    }
  },
  {
    "id": "Quaint-#153E5D-MULTI_LINE_COLORS",
    "tags": [
      "Quaint",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "4a7a353e-7a21-4efc-a9b2-8149be4a522a",
        "properties": {
          "fillColor": "#153E5D",
          "multiLineColors": "#DFDDCE #4B9D9D #7884A4 #AA79AA",
          "color-list": "#F9F5DE #DFDDCE #4B9D9D #7884A4 #AA79AA #153E5D"
        }
      },
      "centralTopic": {
        "id": "d753310b-1941-46c1-85d3-daab64f70099",
        "properties": {
          "fillColor": "#F9F5DE",
          "lineColor": "#F9F5DE"
        }
      },
      "mainTopic": {
        "id": "b5dedf51-58e8-49fa-ada5-4dde6c3b2c1c",
        "properties": {}
      },
      "subTopic": {
        "id": "261d7517-e266-4368-a2f1-ecbfbad35946",
        "properties": {}
      },
      "floatingTopic": {
        "id": "ddabda0e-69d8-40ff-b478-82c6f52f66f5",
        "properties": {
          "fillColor": "#DFDDCE",
          "borderColor": "#DFDDCE"
        }
      },
      "summaryTopic": {
        "id": "8e2cea52-8342-4b7b-b81c-69079a48dc66",
        "properties": {
          "fillColor": "#F9F5DE",
          "borderColor": "#F9F5DE"
        }
      },
      "calloutTopic": {
        "id": "c8aa7eec-0738-44ae-94da-e4c64adf2f97",
        "properties": {
          "fillColor": "#F9F5DE",
          "borderColor": "#F9F5DE"
        }
      },
      "importantTopic": {
        "id": "d82a1251-439d-4a18-9ba5-cf5ba73f49c9",
        "properties": {
          "fillColor": "#3d5d14",
          "borderColor": "#3d5d14"
        }
      },
      "minorTopic": {
        "id": "228479b2-90fb-4f4b-b022-5f592ae38fd7",
        "properties": {
          "fillColor": "#145d20",
          "borderColor": "#145d20"
        }
      },
      "boundary": {
        "id": "0410b60d-6620-44c3-8ba8-45253d9885ac",
        "properties": {
          "fillColor": "#F9F5DE",
          "lineColor": "#F9F5DE"
        }
      },
      "summary": {
        "id": "dd307313-7daf-4d88-b582-38c3170dbcc5",
        "properties": {
          "lineColor": "#F9F5DE"
        }
      },
      "relationship": {
        "id": "d0915138-7a06-4610-ba85-9973c39b4ad6",
        "properties": {
          "lineColor": "#F9F5DE"
        }
      }
    }
  },
  {
    "id": "Variety-#F6F5F5-TYPE_A",
    "tags": [
      "Variety",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "ece31879-c409-4add-a590-acaf325e0343",
        "properties": {
          "fillColor": "#F6F5F5",
          "multiLineColors": "",
          "color-list": "#F6F5F5 #9BFFED #FFC947 #E46D57 #1F3C88 #070D59"
        }
      },
      "centralTopic": {
        "id": "69b2246e-a479-4f73-81db-80f46a3d15cf",
        "properties": {
          "fillColor": "#070D59",
          "lineColor": "#070D59"
        }
      },
      "mainTopic": {
        "id": "083ae012-f5d6-4739-b3f8-8c84453b6375",
        "properties": {
          "fillColor": "#E46D57"
        }
      },
      "subTopic": {
        "id": "809e4515-f2bb-42c3-bca8-33b2d0aec693",
        "properties": {
          "fillColor": "#f1f0f0"
        }
      },
      "floatingTopic": {
        "id": "e377d9f3-3d1e-41cd-b410-b533bb80427f",
        "properties": {
          "fillColor": "#FFC947",
          "borderColor": "#FFC947"
        }
      },
      "summaryTopic": {
        "id": "f8e5a953-475f-482b-985a-65c1e60639c3",
        "properties": {
          "fillColor": "#E46D57",
          "borderColor": "#E46D57"
        }
      },
      "calloutTopic": {
        "id": "01536523-be36-4e93-9af7-992779dbbbe9",
        "properties": {
          "fillColor": "#E46D57",
          "borderColor": "#E46D57"
        }
      },
      "importantTopic": {
        "id": "fd92c716-83fd-4a47-9259-2805e9eb7b7e",
        "properties": {
          "fillColor": "#1F3C88",
          "borderColor": "#1F3C88"
        }
      },
      "minorTopic": {
        "id": "b2ae13df-4ef1-4dd1-970a-9ec9cf736fee",
        "properties": {
          "fillColor": "#070D59",
          "borderColor": "#070D59"
        }
      },
      "boundary": {
        "id": "cc418aa7-49fd-448c-bb37-0599e03cd4d2",
        "properties": {
          "fillColor": "#070D59",
          "lineColor": "#070D59"
        }
      },
      "summary": {
        "id": "676617b0-ecd8-4177-a0ce-cc64e7beafda",
        "properties": {
          "lineColor": "#070D59"
        }
      },
      "relationship": {
        "id": "88d9fbad-027b-4e76-b6fb-b3d935ed349a",
        "properties": {
          "lineColor": "#070D59"
        }
      }
    }
  },
  {
    "id": "Variety-#9BFFED-TYPE_A",
    "tags": [
      "Variety",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "7fc994db-344f-40c6-8ec7-10028f61326d",
        "properties": {
          "fillColor": "#9BFFED",
          "multiLineColors": "",
          "color-list": "#F6F5F5 #9BFFED #FFC947 #E46D57 #1F3C88 #070D59"
        }
      },
      "centralTopic": {
        "id": "bff37266-d195-4600-b8bc-aa09282455d4",
        "properties": {
          "fillColor": "#070D59",
          "lineColor": "#070D59"
        }
      },
      "mainTopic": {
        "id": "6bcc32db-7c9b-4344-8af3-090bd77df8da",
        "properties": {
          "fillColor": "#E46D57"
        }
      },
      "subTopic": {
        "id": "b87039cd-8181-4ac3-8948-cc93680c3f27",
        "properties": {
          "fillColor": "#69ffe4"
        }
      },
      "floatingTopic": {
        "id": "8e4fa71a-fc6c-46d0-9be2-b561f17a1129",
        "properties": {
          "fillColor": "#FFC947",
          "borderColor": "#FFC947"
        }
      },
      "summaryTopic": {
        "id": "088d8e82-a49a-4222-b6a4-55f4ac28a697",
        "properties": {
          "fillColor": "#E46D57",
          "borderColor": "#E46D57"
        }
      },
      "calloutTopic": {
        "id": "b7eef4b2-65b8-41da-af55-889bebe72f47",
        "properties": {
          "fillColor": "#E46D57",
          "borderColor": "#E46D57"
        }
      },
      "importantTopic": {
        "id": "a848a9c9-b543-4001-835a-a34a2252d0dd",
        "properties": {
          "fillColor": "#1F3C88",
          "borderColor": "#1F3C88"
        }
      },
      "minorTopic": {
        "id": "24ddbd8e-86cc-4f15-804b-c3cb2a31dacf",
        "properties": {
          "fillColor": "#070D59",
          "borderColor": "#070D59"
        }
      },
      "boundary": {
        "id": "4978af91-0af2-4f89-a601-276815a9434b",
        "properties": {
          "fillColor": "#070D59",
          "lineColor": "#070D59"
        }
      },
      "summary": {
        "id": "3560a044-7f1d-4c51-a1ec-13460e8369b5",
        "properties": {
          "lineColor": "#070D59"
        }
      },
      "relationship": {
        "id": "4ebf955e-f273-4eb7-ae55-2342b1d651d7",
        "properties": {
          "lineColor": "#070D59"
        }
      }
    }
  },
  {
    "id": "Variety-#FFC947-TYPE_C",
    "tags": [
      "Variety",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "ef7c53b3-4ee8-4f65-969b-c7ddd805621c",
        "properties": {
          "fillColor": "#070D59",
          "multiLineColors": "",
          "color-list": "#F6F5F5 #9BFFED #FFC947 #E46D57 #1F3C88 #070D59"
        }
      },
      "centralTopic": {
        "id": "88510ff1-7c7b-4a2f-88cf-4cf1dcaf40d6",
        "properties": {
          "fillColor": "#FFC947",
          "lineColor": "#FFC947"
        }
      },
      "mainTopic": {
        "id": "8aa19109-40d8-41bf-8453-63d9d090f410",
        "properties": {
          "fillColor": "#F6F5F5"
        }
      },
      "subTopic": {
        "id": "995f65a8-2dba-47bd-8543-1108fa68ae04",
        "properties": {
          "fillColor": "#202672"
        }
      },
      "floatingTopic": {
        "id": "0341d47f-a8c8-4eee-a42d-68ff245bdcac",
        "properties": {
          "fillColor": "#9BFFED",
          "borderColor": "#9BFFED"
        }
      },
      "summaryTopic": {
        "id": "a3d5a7ff-1967-4863-bff1-f7b33323bdeb",
        "properties": {
          "fillColor": "#F6F5F5",
          "borderColor": "#F6F5F5"
        }
      },
      "calloutTopic": {
        "id": "93ce4ceb-e00b-4841-9cfa-abc328dc3a98",
        "properties": {
          "fillColor": "#F6F5F5",
          "borderColor": "#F6F5F5"
        }
      },
      "importantTopic": {
        "id": "982ee42a-1d83-4286-aab7-304d5cf678f2",
        "properties": {
          "fillColor": "#9BFFED",
          "borderColor": "#9BFFED"
        }
      },
      "minorTopic": {
        "id": "4c9076da-831d-43ed-8b88-cc8330cd01c2",
        "properties": {
          "fillColor": "#FFC947",
          "borderColor": "#FFC947"
        }
      },
      "boundary": {
        "id": "2a7af084-bb34-48f2-918a-565777f95b89",
        "properties": {
          "fillColor": "#FFC947",
          "lineColor": "#FFC947"
        }
      },
      "summary": {
        "id": "981a3b72-bbcd-415d-ae9c-06a77b128c8d",
        "properties": {
          "lineColor": "#FFC947"
        }
      },
      "relationship": {
        "id": "38590c7f-f428-4433-807f-394afafad4b9",
        "properties": {
          "lineColor": "#FFC947"
        }
      }
    }
  },
  {
    "id": "Variety-#E46D57-TYPE_B",
    "tags": [
      "Variety",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "ccddecc7-bcc2-4383-b577-754000d88930",
        "properties": {
          "fillColor": "#E46D57",
          "multiLineColors": "",
          "color-list": "#F6F5F5 #9BFFED #FFC947 #E46D57 #1F3C88 #070D59"
        }
      },
      "centralTopic": {
        "id": "92c5d8b4-8de7-44d4-b1c5-535cbbb7ade1",
        "properties": {
          "fillColor": "#070D59",
          "lineColor": "#070D59"
        }
      },
      "mainTopic": {
        "id": "67dafb5a-824b-40d0-855f-c1e199eb2809",
        "properties": {
          "fillColor": "#070D59"
        }
      },
      "subTopic": {
        "id": "af1b3db4-684f-4e41-8d3f-06c54e68abf8",
        "properties": {
          "fillColor": "#202672"
        }
      },
      "floatingTopic": {
        "id": "5fc6fd26-daa4-4f39-bc4c-c2ed27b2b95e",
        "properties": {
          "fillColor": "#F6F5F5",
          "borderColor": "#F6F5F5"
        }
      },
      "summaryTopic": {
        "id": "1a94fc8e-97ee-420a-98d7-8d3fdfc5582b",
        "properties": {
          "fillColor": "#070D59",
          "borderColor": "#070D59"
        }
      },
      "calloutTopic": {
        "id": "c7d7c43e-2a61-4f8e-bad1-a168616e7a94",
        "properties": {
          "fillColor": "#070D59",
          "borderColor": "#070D59"
        }
      },
      "importantTopic": {
        "id": "de4dd288-3d97-4710-9ee7-55fe10fd9e1f",
        "properties": {
          "fillColor": "#56cde4",
          "borderColor": "#56cde4"
        }
      },
      "minorTopic": {
        "id": "9f149233-2be0-4a73-bb60-55f4d0a2d98f",
        "properties": {
          "fillColor": "#5662e4",
          "borderColor": "#5662e4"
        }
      },
      "boundary": {
        "id": "c62e5a57-db37-416e-8459-b54693fefad8",
        "properties": {
          "fillColor": "#070D59",
          "lineColor": "#070D59"
        }
      },
      "summary": {
        "id": "644f9f86-b379-4859-8692-8cb6b5bb411c",
        "properties": {
          "lineColor": "#070D59"
        }
      },
      "relationship": {
        "id": "2a33d976-fbb7-424d-99db-2ad0e685e94f",
        "properties": {
          "lineColor": "#070D59"
        }
      }
    }
  },
  {
    "id": "Variety-#1F3C88-TYPE_B",
    "tags": [
      "Variety",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "d59aee8d-5826-43c6-8bdc-9e89c7d9f70d",
        "properties": {
          "fillColor": "#1F3C88",
          "multiLineColors": "",
          "color-list": "#F6F5F5 #9BFFED #FFC947 #E46D57 #1F3C88 #070D59"
        }
      },
      "centralTopic": {
        "id": "9f34d4b3-773d-40e3-900e-dc9668779eed",
        "properties": {
          "fillColor": "#F6F5F5",
          "lineColor": "#F6F5F5"
        }
      },
      "mainTopic": {
        "id": "31272aa3-0260-4b82-9b7e-53a9dfe728bb",
        "properties": {
          "fillColor": "#F6F5F5"
        }
      },
      "subTopic": {
        "id": "272de2bd-1fc1-43a6-95ac-e5c388c67a00",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "8fe996f2-975e-4fc2-bcfd-9006efc3cb4e",
        "properties": {
          "fillColor": "#9BFFED",
          "borderColor": "#9BFFED"
        }
      },
      "summaryTopic": {
        "id": "dff4fa70-931b-4719-bee7-912a84086ccd",
        "properties": {
          "fillColor": "#F6F5F5",
          "borderColor": "#F6F5F5"
        }
      },
      "calloutTopic": {
        "id": "08e214c8-1266-4d4c-a5f0-cb9e1a6a9409",
        "properties": {
          "fillColor": "#F6F5F5",
          "borderColor": "#F6F5F5"
        }
      },
      "importantTopic": {
        "id": "d8536306-2212-44bd-b365-9206165ac1c3",
        "properties": {
          "fillColor": "#876b1f",
          "borderColor": "#876b1f"
        }
      },
      "minorTopic": {
        "id": "f9ba8133-5112-4032-a0a1-776e5b770110",
        "properties": {
          "fillColor": "#55861f",
          "borderColor": "#55861f"
        }
      },
      "boundary": {
        "id": "507e2d37-5d12-455a-89a4-4e8467cfe76f",
        "properties": {
          "fillColor": "#F6F5F5",
          "lineColor": "#F6F5F5"
        }
      },
      "summary": {
        "id": "9ae120c7-de39-4097-a50d-f1bc6ca2e102",
        "properties": {
          "lineColor": "#F6F5F5"
        }
      },
      "relationship": {
        "id": "77979b22-089f-4f8b-8bd3-34b372e82dd5",
        "properties": {
          "lineColor": "#F6F5F5"
        }
      }
    }
  },
  {
    "id": "Variety-#070D59-TYPE_C",
    "tags": [
      "Variety",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "b24ff659-2a3e-4266-aaf9-ef24377614f3",
        "properties": {
          "fillColor": "#070D59",
          "multiLineColors": "",
          "color-list": "#F6F5F5 #9BFFED #FFC947 #E46D57 #1F3C88 #070D59"
        }
      },
      "centralTopic": {
        "id": "fb432317-c2ae-4314-9b23-6930a689ecf4",
        "properties": {
          "fillColor": "#F6F5F5",
          "lineColor": "#F6F5F5"
        }
      },
      "mainTopic": {
        "id": "86686ee4-6306-49f0-ab39-97189cc4821e",
        "properties": {
          "fillColor": "#9BFFED"
        }
      },
      "subTopic": {
        "id": "0ca606b7-14ac-40c6-8dd0-3f96dbb822fa",
        "properties": {
          "fillColor": "#202672"
        }
      },
      "floatingTopic": {
        "id": "e54479af-f881-4f9c-bcd3-950ff3eaf9ca",
        "properties": {
          "fillColor": "#FFC947",
          "borderColor": "#FFC947"
        }
      },
      "summaryTopic": {
        "id": "d544bda7-e528-4653-b757-521f66f9089d",
        "properties": {
          "fillColor": "#9BFFED",
          "borderColor": "#9BFFED"
        }
      },
      "calloutTopic": {
        "id": "1ea3aaf1-6a99-4c78-b311-f117930a67d5",
        "properties": {
          "fillColor": "#9BFFED",
          "borderColor": "#9BFFED"
        }
      },
      "importantTopic": {
        "id": "ad13951c-c3c3-48a2-8991-1f31cc6a10cc",
        "properties": {
          "fillColor": "#FFC947",
          "borderColor": "#FFC947"
        }
      },
      "minorTopic": {
        "id": "831765bf-cd97-4181-9c09-ffcc4e66d118",
        "properties": {
          "fillColor": "#F6F5F5",
          "borderColor": "#F6F5F5"
        }
      },
      "boundary": {
        "id": "b963c914-f0d8-495f-8da1-12d646e11679",
        "properties": {
          "fillColor": "#F6F5F5",
          "lineColor": "#F6F5F5"
        }
      },
      "summary": {
        "id": "f6faaf7e-5895-495a-8c0a-2b2670eb6fd0",
        "properties": {
          "lineColor": "#F6F5F5"
        }
      },
      "relationship": {
        "id": "ee07a06a-08e2-43db-a72e-edf988a369da",
        "properties": {
          "lineColor": "#F6F5F5"
        }
      }
    }
  },
  {
    "id": "Variety-#F6F5F5-MULTI_LINE_COLORS",
    "tags": [
      "Variety",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "54bbceb9-6453-4fda-88de-c6f376c0bbc2",
        "properties": {
          "fillColor": "#F6F5F5",
          "multiLineColors": "#FFC947 #E46D57 #1F3C88",
          "color-list": "#F6F5F5 #9BFFED #FFC947 #E46D57 #1F3C88 #070D59"
        }
      },
      "centralTopic": {
        "id": "3f4546b7-1f7c-4ed7-a6fd-a1ea17020ff7",
        "properties": {
          "fillColor": "#070D59",
          "lineColor": "#070D59"
        }
      },
      "mainTopic": {
        "id": "39dd3320-0679-4dbf-92ee-3ad23ea97552",
        "properties": {}
      },
      "subTopic": {
        "id": "36f78f52-dbb0-42d8-b45f-f7bc205b8c1a",
        "properties": {}
      },
      "floatingTopic": {
        "id": "2de7697c-8aef-4537-a403-5e349e35ab22",
        "properties": {
          "fillColor": "#FFC947",
          "borderColor": "#FFC947"
        }
      },
      "summaryTopic": {
        "id": "48000f21-23e9-4d2c-a777-6b6d35ec0d93",
        "properties": {
          "fillColor": "#E46D57",
          "borderColor": "#E46D57"
        }
      },
      "calloutTopic": {
        "id": "2b4a4e43-0521-4cfe-bc82-9c8e4dee69b9",
        "properties": {
          "fillColor": "#E46D57",
          "borderColor": "#E46D57"
        }
      },
      "importantTopic": {
        "id": "ab3ee712-5121-43e6-9fd7-c81997cc2807",
        "properties": {
          "fillColor": "#6a1f87",
          "borderColor": "#6a1f87"
        }
      },
      "minorTopic": {
        "id": "2249d826-5c81-490a-95d9-ab2c96403e56",
        "properties": {
          "fillColor": "#530759",
          "borderColor": "#530759"
        }
      },
      "boundary": {
        "id": "d0c6b856-6a3e-4e24-855e-d764837b0092",
        "properties": {
          "fillColor": "#070D59",
          "lineColor": "#070D59"
        }
      },
      "summary": {
        "id": "b5845df5-118a-4a4f-af06-3a1a8905e636",
        "properties": {
          "lineColor": "#070D59"
        }
      },
      "relationship": {
        "id": "abddd67d-0136-47b4-83e9-deb6bbec8b18",
        "properties": {
          "lineColor": "#070D59"
        }
      }
    }
  },
  {
    "id": "Variety-#070D59-MULTI_LINE_COLORS",
    "tags": [
      "Variety",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "5cdf2e4b-0dcc-4a3d-a62b-23bbb49171c0",
        "properties": {
          "fillColor": "#070D59",
          "multiLineColors": "#9BFFED #FFC947 #E46D57 #1F3C88",
          "color-list": "#F6F5F5 #9BFFED #FFC947 #E46D57 #1F3C88 #070D59"
        }
      },
      "centralTopic": {
        "id": "2ba79239-cb95-4b69-9c73-85af7eb1df2b",
        "properties": {
          "fillColor": "#F6F5F5",
          "lineColor": "#F6F5F5"
        }
      },
      "mainTopic": {
        "id": "822cb612-b981-41f5-a963-8bbe8d2a1e5a",
        "properties": {}
      },
      "subTopic": {
        "id": "d49bd013-6672-4b73-b49b-0d7fc5e71616",
        "properties": {}
      },
      "floatingTopic": {
        "id": "2cc2bbd3-12d2-49c7-885a-b783dc349109",
        "properties": {
          "fillColor": "#FFC947",
          "borderColor": "#FFC947"
        }
      },
      "summaryTopic": {
        "id": "5bbfe1d2-034b-4a7a-8d01-38a094e799fe",
        "properties": {
          "fillColor": "#9BFFED",
          "borderColor": "#9BFFED"
        }
      },
      "calloutTopic": {
        "id": "74abe4e3-7ebe-4acd-b675-05985149603f",
        "properties": {
          "fillColor": "#9BFFED",
          "borderColor": "#9BFFED"
        }
      },
      "importantTopic": {
        "id": "6acf858c-7e4c-4903-b3f2-336090c8df1b",
        "properties": {
          "fillColor": "#7cff46",
          "borderColor": "#7cff46"
        }
      },
      "minorTopic": {
        "id": "f47f8e46-7463-4974-8716-789442813bf5",
        "properties": {
          "fillColor": "#f5f5f5",
          "borderColor": "#f5f5f5"
        }
      },
      "boundary": {
        "id": "00fcca0a-7f11-4f57-9bb7-687ba18bda4a",
        "properties": {
          "fillColor": "#F6F5F5",
          "lineColor": "#F6F5F5"
        }
      },
      "summary": {
        "id": "e3d1959f-8be4-4bdd-8c7b-651e8a323fd2",
        "properties": {
          "lineColor": "#F6F5F5"
        }
      },
      "relationship": {
        "id": "ac84e92f-9d03-4a96-b9ed-fd6848e70a6b",
        "properties": {
          "lineColor": "#F6F5F5"
        }
      }
    }
  },
  {
    "id": "Dazzling-#FFFFFF-TYPE_A",
    "tags": [
      "Dazzling",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "cef4c4e1-96a3-4f6a-807c-5b4cd66d2ae3",
        "properties": {
          "fillColor": "#FFFFFF",
          "multiLineColors": "",
          "color-list": "#FFFFFF #EFD7E6 #FF7DC1 #A239EA #5C37E5 #092933"
        }
      },
      "centralTopic": {
        "id": "636cdac8-2179-4977-b9c6-a7f154583cd7",
        "properties": {
          "fillColor": "#092933",
          "lineColor": "#092933"
        }
      },
      "mainTopic": {
        "id": "51211350-8906-4216-a671-94fc60c322b8",
        "properties": {
          "fillColor": "#FF7DC1"
        }
      },
      "subTopic": {
        "id": "af5ce305-373d-4b53-abc3-4405b8a544bc",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "0211d44e-09c8-4b8c-b845-2a46815b066b",
        "properties": {
          "fillColor": "#A239EA",
          "borderColor": "#A239EA"
        }
      },
      "summaryTopic": {
        "id": "01d1cbb9-78c0-4b7b-82cd-2bab0d479438",
        "properties": {
          "fillColor": "#FF7DC1",
          "borderColor": "#FF7DC1"
        }
      },
      "calloutTopic": {
        "id": "ad77f8f1-2d21-446d-bf75-aa7f8ec1fe30",
        "properties": {
          "fillColor": "#FF7DC1",
          "borderColor": "#FF7DC1"
        }
      },
      "importantTopic": {
        "id": "21c01f3d-8cb3-4fb3-9905-9ae7dc2aa71e",
        "properties": {
          "fillColor": "#5C37E5",
          "borderColor": "#5C37E5"
        }
      },
      "minorTopic": {
        "id": "b899667e-cc2e-452d-9ae2-9d8e5ee93766",
        "properties": {
          "fillColor": "#092933",
          "borderColor": "#092933"
        }
      },
      "boundary": {
        "id": "b12ae7c2-84de-4668-86bd-45ff176c9efa",
        "properties": {
          "fillColor": "#092933",
          "lineColor": "#092933"
        }
      },
      "summary": {
        "id": "0a99ed53-83cd-48f6-bdde-57c7eae81632",
        "properties": {
          "lineColor": "#092933"
        }
      },
      "relationship": {
        "id": "f31f3363-bc13-4325-9858-b6922a8f0135",
        "properties": {
          "lineColor": "#092933"
        }
      }
    }
  },
  {
    "id": "Dazzling-#EFD7E6-TYPE_A",
    "tags": [
      "Dazzling",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "9fe2eefa-91a5-4af4-a14b-8657a33de46d",
        "properties": {
          "fillColor": "#EFD7E6",
          "multiLineColors": "",
          "color-list": "#FFFFFF #EFD7E6 #FF7DC1 #A239EA #5C37E5 #092933"
        }
      },
      "centralTopic": {
        "id": "4649b789-7ff3-413b-b255-5c64b7857917",
        "properties": {
          "fillColor": "#092933",
          "lineColor": "#092933"
        }
      },
      "mainTopic": {
        "id": "ca3d8da4-5a9d-4ffc-8b73-b265b95eb302",
        "properties": {
          "fillColor": "#5C37E5"
        }
      },
      "subTopic": {
        "id": "450dd9b4-9abe-406e-9537-b832146bab8a",
        "properties": {
          "fillColor": "#e6c3d9"
        }
      },
      "floatingTopic": {
        "id": "085e18ed-90fe-4676-9c3e-725b964b4825",
        "properties": {
          "fillColor": "#FF7DC1",
          "borderColor": "#FF7DC1"
        }
      },
      "summaryTopic": {
        "id": "d67e3a62-6ea4-47a8-bdee-cd3d11be4402",
        "properties": {
          "fillColor": "#5C37E5",
          "borderColor": "#5C37E5"
        }
      },
      "calloutTopic": {
        "id": "a29094aa-6e75-4347-9f72-872d7f5e30a0",
        "properties": {
          "fillColor": "#5C37E5",
          "borderColor": "#5C37E5"
        }
      },
      "importantTopic": {
        "id": "25e8912a-3267-4e2b-9328-58c738921ce4",
        "properties": {
          "fillColor": "#A239EA",
          "borderColor": "#A239EA"
        }
      },
      "minorTopic": {
        "id": "03f5388d-2b12-478a-bc42-39e8342c4845",
        "properties": {
          "fillColor": "#092933",
          "borderColor": "#092933"
        }
      },
      "boundary": {
        "id": "3281bac8-2244-4aa5-873a-e3c083a19f5f",
        "properties": {
          "fillColor": "#092933",
          "lineColor": "#092933"
        }
      },
      "summary": {
        "id": "6b6ffeef-3bed-485a-bc29-a61bba7c3166",
        "properties": {
          "lineColor": "#092933"
        }
      },
      "relationship": {
        "id": "53cc630c-0098-4086-89ea-33da104c7cb3",
        "properties": {
          "lineColor": "#092933"
        }
      }
    }
  },
  {
    "id": "Dazzling-#FF7DC1-TYPE_B",
    "tags": [
      "Dazzling",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "9388c038-9a4c-4373-8bcc-25c946380bc3",
        "properties": {
          "fillColor": "#FF7DC1",
          "multiLineColors": "",
          "color-list": "#FFFFFF #EFD7E6 #FF7DC1 #A239EA #5C37E5 #092933"
        }
      },
      "centralTopic": {
        "id": "382d46c8-786d-46a6-84a0-77a755fca993",
        "properties": {
          "fillColor": "#092933",
          "lineColor": "#092933"
        }
      },
      "mainTopic": {
        "id": "484ac3eb-8ac7-403d-8f30-84176ccb8529",
        "properties": {
          "fillColor": "#092933"
        }
      },
      "subTopic": {
        "id": "d9367f5b-83e7-4d41-bdbe-297f89bc5fa8",
        "properties": {
          "fillColor": "#22424c"
        }
      },
      "floatingTopic": {
        "id": "22c8a139-7194-436d-99f0-556ab962c3f9",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "summaryTopic": {
        "id": "31c7597f-dc2f-4011-9ac6-f44483adb00a",
        "properties": {
          "fillColor": "#092933",
          "borderColor": "#092933"
        }
      },
      "calloutTopic": {
        "id": "8af088db-2503-4074-8ce1-3f5aec2f93f0",
        "properties": {
          "fillColor": "#092933",
          "borderColor": "#092933"
        }
      },
      "importantTopic": {
        "id": "05c62563-e59e-434e-b5af-7281f1b3ffc2",
        "properties": {
          "fillColor": "#7dffbb",
          "borderColor": "#7dffbb"
        }
      },
      "minorTopic": {
        "id": "b1bb6822-4c7c-42e7-b7bf-b525bfedc003",
        "properties": {
          "fillColor": "#7de1ff",
          "borderColor": "#7de1ff"
        }
      },
      "boundary": {
        "id": "8bdf8f8e-d6ef-4d40-8869-1408537e9532",
        "properties": {
          "fillColor": "#092933",
          "lineColor": "#092933"
        }
      },
      "summary": {
        "id": "4a0b5c4e-d8d6-44b0-b38f-e767749e46c6",
        "properties": {
          "lineColor": "#092933"
        }
      },
      "relationship": {
        "id": "66bff8c4-a334-4839-8cbc-6bbd898243c6",
        "properties": {
          "lineColor": "#092933"
        }
      }
    }
  },
  {
    "id": "Dazzling-#A239EA-TYPE_B",
    "tags": [
      "Dazzling",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "4ad464cf-8a29-43b9-a803-da2204d3f5dc",
        "properties": {
          "fillColor": "#A239EA",
          "multiLineColors": "",
          "color-list": "#FFFFFF #EFD7E6 #FF7DC1 #A239EA #5C37E5 #092933"
        }
      },
      "centralTopic": {
        "id": "5c260257-bbd5-44b2-91fe-8659895fabe5",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "mainTopic": {
        "id": "6e335949-bb2f-4963-8372-148b54e120c5",
        "properties": {
          "fillColor": "#FFFFFF"
        }
      },
      "subTopic": {
        "id": "42f9486e-0d3c-4304-ba99-403992fcd3ce",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "11c62905-a4b6-405c-9b5f-c4901719da30",
        "properties": {
          "fillColor": "#EFD7E6",
          "borderColor": "#EFD7E6"
        }
      },
      "summaryTopic": {
        "id": "be4637be-bd25-4215-90de-9dff91cd1b21",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "calloutTopic": {
        "id": "adf5562a-4440-4ef9-b790-e0accfb835f3",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "importantTopic": {
        "id": "da0a6783-8e89-4dd5-b1c3-e333205e8af4",
        "properties": {
          "fillColor": "#80ea38",
          "borderColor": "#80ea38"
        }
      },
      "minorTopic": {
        "id": "52a7f4bf-800d-4e53-911b-e23ac8658f40",
        "properties": {
          "fillColor": "#38e975",
          "borderColor": "#38e975"
        }
      },
      "boundary": {
        "id": "7a02b28d-09e9-4ecd-a1d8-22b506c02822",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "summary": {
        "id": "749f8712-d192-4910-bfb0-6fc2c0468e51",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      },
      "relationship": {
        "id": "b26b9ac2-560d-441f-880a-fdf5ec8fb9d0",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      }
    }
  },
  {
    "id": "Dazzling-#5C37E5-TYPE_A",
    "tags": [
      "Dazzling",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "75891705-16a6-45a1-92e7-b1c1b8ebbc71",
        "properties": {
          "fillColor": "#FFFFFF",
          "multiLineColors": "",
          "color-list": "#FFFFFF #EFD7E6 #FF7DC1 #A239EA #5C37E5 #092933"
        }
      },
      "centralTopic": {
        "id": "65b75184-bfc0-4b06-af77-3a3973e205e2",
        "properties": {
          "fillColor": "#5C37E5",
          "lineColor": "#5C37E5"
        }
      },
      "mainTopic": {
        "id": "46edebf0-a254-4491-8bcc-c08d92c7d44a",
        "properties": {
          "fillColor": "#FF7DC1"
        }
      },
      "subTopic": {
        "id": "91310198-d847-4691-aca5-29b067c32586",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "f731fc49-1b54-49b1-9530-2fdd2d893fdc",
        "properties": {
          "fillColor": "#A239EA",
          "borderColor": "#A239EA"
        }
      },
      "summaryTopic": {
        "id": "143da9a8-2db7-4de2-b851-827e878eb064",
        "properties": {
          "fillColor": "#FF7DC1",
          "borderColor": "#FF7DC1"
        }
      },
      "calloutTopic": {
        "id": "8b85e14d-a9ce-4f85-838b-b5e05fe2a534",
        "properties": {
          "fillColor": "#FF7DC1",
          "borderColor": "#FF7DC1"
        }
      },
      "importantTopic": {
        "id": "17ff91cc-f5a4-4542-ae9a-c3d0a0a6f25d",
        "properties": {
          "fillColor": "#092933",
          "borderColor": "#092933"
        }
      },
      "minorTopic": {
        "id": "186b8c3c-b9a2-4e8a-a4bb-cfb856df7c1c",
        "properties": {
          "fillColor": "#5C37E5",
          "borderColor": "#5C37E5"
        }
      },
      "boundary": {
        "id": "bf761288-2202-4062-819f-6c80e6174b05",
        "properties": {
          "fillColor": "#5C37E5",
          "lineColor": "#5C37E5"
        }
      },
      "summary": {
        "id": "dc9ad391-25d5-4d79-ae50-861a138a6017",
        "properties": {
          "lineColor": "#5C37E5"
        }
      },
      "relationship": {
        "id": "4d9f88bc-97dd-4828-9cad-d6726763ceca",
        "properties": {
          "lineColor": "#5C37E5"
        }
      }
    }
  },
  {
    "id": "Dazzling-#092933-TYPE_C",
    "tags": [
      "Dazzling",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "c8048203-a8c7-4091-abbd-5fcba45eec9d",
        "properties": {
          "fillColor": "#092933",
          "multiLineColors": "",
          "color-list": "#FFFFFF #EFD7E6 #FF7DC1 #A239EA #5C37E5 #092933"
        }
      },
      "centralTopic": {
        "id": "b3c807f4-acb9-4a2d-834a-19a6ed547903",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "mainTopic": {
        "id": "ad22326a-1a4e-4640-83f0-40ffc811ecd1",
        "properties": {
          "fillColor": "#EFD7E6"
        }
      },
      "subTopic": {
        "id": "bd5a8644-bc94-4fa7-8b25-91beaf5f1aae",
        "properties": {
          "fillColor": "#22424c"
        }
      },
      "floatingTopic": {
        "id": "ddc93b88-f2ab-4f4e-afd7-e9cf6ba1c88d",
        "properties": {
          "fillColor": "#FF7DC1",
          "borderColor": "#FF7DC1"
        }
      },
      "summaryTopic": {
        "id": "96589ac5-e302-4a61-875c-b18f5287b9fa",
        "properties": {
          "fillColor": "#EFD7E6",
          "borderColor": "#EFD7E6"
        }
      },
      "calloutTopic": {
        "id": "c82f9ed9-d736-4f71-a92b-74929e0736d3",
        "properties": {
          "fillColor": "#EFD7E6",
          "borderColor": "#EFD7E6"
        }
      },
      "importantTopic": {
        "id": "b5cd0975-486d-40eb-acfa-4a676e2b6021",
        "properties": {
          "fillColor": "#FF7DC1",
          "borderColor": "#FF7DC1"
        }
      },
      "minorTopic": {
        "id": "3e04b707-9664-4578-a279-eaacd3f41b62",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "boundary": {
        "id": "1b47c3e6-7e08-482e-aee6-4af7b1fa1776",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "summary": {
        "id": "51fb2881-32b5-444f-9130-9767aaf2831e",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      },
      "relationship": {
        "id": "751e7d62-c36f-4c02-b153-d60af7cb7b60",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      }
    }
  },
  {
    "id": "Dazzling-#FFFFFF-MULTI_LINE_COLORS",
    "tags": [
      "Dazzling",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "f6edb4a9-1ed7-41d8-b4ff-c74fc6b9bea0",
        "properties": {
          "fillColor": "#FFFFFF",
          "multiLineColors": "#EFD7E6 #FF7DC1 #A239EA #5C37E5",
          "color-list": "#FFFFFF #EFD7E6 #FF7DC1 #A239EA #5C37E5 #092933"
        }
      },
      "centralTopic": {
        "id": "2bff1493-1157-4db7-a9f9-a9b6e703cb2f",
        "properties": {
          "fillColor": "#092933",
          "lineColor": "#092933"
        }
      },
      "mainTopic": {
        "id": "4e71aa15-6888-4f97-8b18-95f7819e20ad",
        "properties": {}
      },
      "subTopic": {
        "id": "b0d0b20b-2f9f-4a3b-ad25-6e1b834dba90",
        "properties": {}
      },
      "floatingTopic": {
        "id": "ce4d3f27-66e3-4a1c-99fa-34fd939ab0a9",
        "properties": {
          "fillColor": "#A239EA",
          "borderColor": "#A239EA"
        }
      },
      "summaryTopic": {
        "id": "05cbe48f-a63c-401e-a136-b29437e31d81",
        "properties": {
          "fillColor": "#FF7DC1",
          "borderColor": "#FF7DC1"
        }
      },
      "calloutTopic": {
        "id": "927df397-c824-4074-9785-0799ede2cf77",
        "properties": {
          "fillColor": "#FF7DC1",
          "borderColor": "#FF7DC1"
        }
      },
      "importantTopic": {
        "id": "f14bdb17-ed02-4bcb-9f0b-03ed4709b020",
        "properties": {
          "fillColor": "#e437c0",
          "borderColor": "#e437c0"
        }
      },
      "minorTopic": {
        "id": "a32443dd-6ec0-4482-b25f-2a5f44e48472",
        "properties": {
          "fillColor": "#120932",
          "borderColor": "#120932"
        }
      },
      "boundary": {
        "id": "aed0e8a7-f25d-4972-988a-5b5f0fc63285",
        "properties": {
          "fillColor": "#092933",
          "lineColor": "#092933"
        }
      },
      "summary": {
        "id": "86472af1-1639-4969-9f7f-f2d651744fc1",
        "properties": {
          "lineColor": "#092933"
        }
      },
      "relationship": {
        "id": "1a96ace8-2ece-4e21-8801-a008bc099700",
        "properties": {
          "lineColor": "#092933"
        }
      }
    }
  },
  {
    "id": "Dazzling-#092933-MULTI_LINE_COLORS",
    "tags": [
      "Dazzling",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "3fec30a1-6953-4462-bbb6-46fcb3ec7a92",
        "properties": {
          "fillColor": "#092933",
          "multiLineColors": "#EFD7E6 #FF7DC1 #A239EA #5C37E5",
          "color-list": "#FFFFFF #EFD7E6 #FF7DC1 #A239EA #5C37E5 #092933"
        }
      },
      "centralTopic": {
        "id": "4bf2ac6b-ce6a-46ec-8a10-4be3267eb0be",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "mainTopic": {
        "id": "dbed9003-61b9-4000-820c-50098aab104d",
        "properties": {}
      },
      "subTopic": {
        "id": "47ec28f8-e0ec-49e9-9008-90913102497f",
        "properties": {}
      },
      "floatingTopic": {
        "id": "69c4fad2-3e0f-4ece-b4c8-9e6b514907df",
        "properties": {
          "fillColor": "#FF7DC1",
          "borderColor": "#FF7DC1"
        }
      },
      "summaryTopic": {
        "id": "7eccaec6-43da-4ce0-9b35-7280bd1b5df9",
        "properties": {
          "fillColor": "#EFD7E6",
          "borderColor": "#EFD7E6"
        }
      },
      "calloutTopic": {
        "id": "bf227b96-1e9f-4b38-be93-20a4ac488788",
        "properties": {
          "fillColor": "#EFD7E6",
          "borderColor": "#EFD7E6"
        }
      },
      "importantTopic": {
        "id": "dff618cf-903b-448b-8c73-d39befd117e1",
        "properties": {
          "fillColor": "#ffbb7d",
          "borderColor": "#ffbb7d"
        }
      },
      "minorTopic": {
        "id": "26b84f9f-b345-461c-a7fb-dc2d527794ab",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "boundary": {
        "id": "738ce412-6833-4e4b-8824-a300110c3d38",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "summary": {
        "id": "7d69e9d1-bf27-498d-af6d-63499a2a70a7",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      },
      "relationship": {
        "id": "214ad0c8-6903-4a4c-9561-f8ec328e393d",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      }
    }
  },
  {
    "id": "Vintage-#E9C46A-TYPE_B",
    "tags": [
      "Vintage",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "ecf797c0-13a8-47a7-bca4-401266718fcc",
        "properties": {
          "fillColor": "#E9C46A",
          "multiLineColors": "",
          "color-list": "#E9C46A #F4A261 #DC856F #A4705E #2A9D8F #264653"
        }
      },
      "centralTopic": {
        "id": "799c0e27-6653-445d-a417-96c9cca08856",
        "properties": {
          "fillColor": "#264653",
          "lineColor": "#264653"
        }
      },
      "mainTopic": {
        "id": "ad1ab3fe-3da6-4c44-a440-a46e6f7d1023",
        "properties": {
          "fillColor": "#264653"
        }
      },
      "subTopic": {
        "id": "fce2148e-9c16-48e6-b72f-5fe6e358be4d",
        "properties": {
          "fillColor": "#3f5f6c"
        }
      },
      "floatingTopic": {
        "id": "8426b69b-dd4f-4d52-a0b2-cdee8407eeb9",
        "properties": {
          "fillColor": "#DC856F",
          "borderColor": "#DC856F"
        }
      },
      "summaryTopic": {
        "id": "6d1a0ff1-6e54-4a29-961c-096b60e1e813",
        "properties": {
          "fillColor": "#264653",
          "borderColor": "#264653"
        }
      },
      "calloutTopic": {
        "id": "4f5e3f7e-91b6-4e2e-9653-6e84a85dfca9",
        "properties": {
          "fillColor": "#264653",
          "borderColor": "#264653"
        }
      },
      "importantTopic": {
        "id": "173706e8-1e4d-444f-916d-048e08df2042",
        "properties": {
          "fillColor": "#698ee9",
          "borderColor": "#698ee9"
        }
      },
      "minorTopic": {
        "id": "a6ea87fd-e682-4bf4-b38b-1dc42abd6879",
        "properties": {
          "fillColor": "#a468e8",
          "borderColor": "#a468e8"
        }
      },
      "boundary": {
        "id": "a16cbeef-419f-487f-8ddb-ca15039d3437",
        "properties": {
          "fillColor": "#264653",
          "lineColor": "#264653"
        }
      },
      "summary": {
        "id": "82e06504-3fca-4f84-be60-8084b64a0242",
        "properties": {
          "lineColor": "#264653"
        }
      },
      "relationship": {
        "id": "74471f8a-1b08-439f-97bf-417e4f2c93f7",
        "properties": {
          "lineColor": "#264653"
        }
      }
    }
  },
  {
    "id": "Vintage-#F4A261-TYPE_B",
    "tags": [
      "Vintage",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "970d9497-7b89-49ea-beab-680a370bced7",
        "properties": {
          "fillColor": "#F4A261",
          "multiLineColors": "",
          "color-list": "#E9C46A #F4A261 #DC856F #A4705E #2A9D8F #264653"
        }
      },
      "centralTopic": {
        "id": "139f3d4f-c94d-4867-b10f-01567016d6a8",
        "properties": {
          "fillColor": "#264653",
          "lineColor": "#264653"
        }
      },
      "mainTopic": {
        "id": "7357c568-7ad9-491b-8640-9d9f87840251",
        "properties": {
          "fillColor": "#264653"
        }
      },
      "subTopic": {
        "id": "537f80ed-e8c1-4260-8585-086c7a0a6eae",
        "properties": {
          "fillColor": "#3f5f6c"
        }
      },
      "floatingTopic": {
        "id": "736f57d1-486d-432d-9c35-195ce62e30ad",
        "properties": {
          "fillColor": "#DC856F",
          "borderColor": "#DC856F"
        }
      },
      "summaryTopic": {
        "id": "5f7e4188-d3d0-42f0-b4f1-036c791ec70a",
        "properties": {
          "fillColor": "#264653",
          "borderColor": "#264653"
        }
      },
      "calloutTopic": {
        "id": "2eb79075-add7-4f20-94a5-127325d30f89",
        "properties": {
          "fillColor": "#264653",
          "borderColor": "#264653"
        }
      },
      "importantTopic": {
        "id": "bff8a7bd-6599-4499-b610-ddd8a3dd6cc0",
        "properties": {
          "fillColor": "#61b3f4",
          "borderColor": "#61b3f4"
        }
      },
      "minorTopic": {
        "id": "2f1e2e22-d0f7-436d-b1e8-39e7ec85f887",
        "properties": {
          "fillColor": "#7d61f4",
          "borderColor": "#7d61f4"
        }
      },
      "boundary": {
        "id": "c353b383-23ea-4b0e-87dc-a62e1b277e40",
        "properties": {
          "fillColor": "#264653",
          "lineColor": "#264653"
        }
      },
      "summary": {
        "id": "c7c62050-9f11-414f-a62d-7099738d2f72",
        "properties": {
          "lineColor": "#264653"
        }
      },
      "relationship": {
        "id": "80d0c688-5b13-491b-bcb6-9a1f3e02e3fa",
        "properties": {
          "lineColor": "#264653"
        }
      }
    }
  },
  {
    "id": "Vintage-#DC856F-TYPE_B",
    "tags": [
      "Vintage",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "2d6adff5-6a68-4ca6-aa11-5e72daa06dc5",
        "properties": {
          "fillColor": "#DC856F",
          "multiLineColors": "",
          "color-list": "#E9C46A #F4A261 #DC856F #A4705E #2A9D8F #264653"
        }
      },
      "centralTopic": {
        "id": "af27e68d-88d2-4074-84e2-db9ecc80b13f",
        "properties": {
          "fillColor": "#264653",
          "lineColor": "#264653"
        }
      },
      "mainTopic": {
        "id": "eeb05e8b-d908-4bac-a7cd-ca853f7f84b4",
        "properties": {
          "fillColor": "#264653"
        }
      },
      "subTopic": {
        "id": "025e0bbc-5a36-4f04-930f-cf33367ea807",
        "properties": {
          "fillColor": "#3f5f6c"
        }
      },
      "floatingTopic": {
        "id": "5d092995-32b8-4d0d-9525-bd9beb4f8344",
        "properties": {
          "fillColor": "#E9C46A",
          "borderColor": "#E9C46A"
        }
      },
      "summaryTopic": {
        "id": "6cc3c08a-1f32-4f67-8d3f-a0caf052526d",
        "properties": {
          "fillColor": "#264653",
          "borderColor": "#264653"
        }
      },
      "calloutTopic": {
        "id": "554464d2-b7bd-4b64-a98a-6c83a2b2bc82",
        "properties": {
          "fillColor": "#264653",
          "borderColor": "#264653"
        }
      },
      "importantTopic": {
        "id": "2175af6e-9d58-498f-b632-96b0203ca6eb",
        "properties": {
          "fillColor": "#6fc5db",
          "borderColor": "#6fc5db"
        }
      },
      "minorTopic": {
        "id": "41312a29-5fb0-4dcd-94b3-a2362a364627",
        "properties": {
          "fillColor": "#6e73db",
          "borderColor": "#6e73db"
        }
      },
      "boundary": {
        "id": "ef647554-78a3-429a-9f91-ef88502ce1ad",
        "properties": {
          "fillColor": "#264653",
          "lineColor": "#264653"
        }
      },
      "summary": {
        "id": "5399d6bd-7d70-4aa4-9237-3569fb803a98",
        "properties": {
          "lineColor": "#264653"
        }
      },
      "relationship": {
        "id": "acc85716-848c-4001-ac29-e50e1d89eea0",
        "properties": {
          "lineColor": "#264653"
        }
      }
    }
  },
  {
    "id": "Vintage-#A4705E-TYPE_B",
    "tags": [
      "Vintage",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "b819bb3b-4d76-4dee-b4f7-1f5649d01781",
        "properties": {
          "fillColor": "#A4705E",
          "multiLineColors": "",
          "color-list": "#E9C46A #F4A261 #DC856F #A4705E #2A9D8F #264653"
        }
      },
      "centralTopic": {
        "id": "1a38384d-c01a-42cb-a33b-972a0b47473b",
        "properties": {
          "fillColor": "#E9C46A",
          "lineColor": "#E9C46A"
        }
      },
      "mainTopic": {
        "id": "0ecbb2d8-b501-4ecb-b021-6c258f665e12",
        "properties": {
          "fillColor": "#264653"
        }
      },
      "subTopic": {
        "id": "69a1653b-0178-4ab3-966a-c0935596835e",
        "properties": {
          "fillColor": "#3f5f6c"
        }
      },
      "floatingTopic": {
        "id": "b5f69c5d-5659-48d1-b91a-26bc83343112",
        "properties": {
          "fillColor": "#F4A261",
          "borderColor": "#F4A261"
        }
      },
      "summaryTopic": {
        "id": "1fdd3cc9-c322-4493-948f-8005e483e3c8",
        "properties": {
          "fillColor": "#264653",
          "borderColor": "#264653"
        }
      },
      "calloutTopic": {
        "id": "b1151374-3eb1-4bee-a857-4e82bd3ab121",
        "properties": {
          "fillColor": "#264653",
          "borderColor": "#264653"
        }
      },
      "importantTopic": {
        "id": "14c505d6-7f5f-44a5-a301-4e9ecc238bf8",
        "properties": {
          "fillColor": "#5e92a3",
          "borderColor": "#5e92a3"
        }
      },
      "minorTopic": {
        "id": "4c184288-874b-46ea-8314-0ef66ce4b213",
        "properties": {
          "fillColor": "#5e5ea3",
          "borderColor": "#5e5ea3"
        }
      },
      "boundary": {
        "id": "1c96ced4-dfa9-47fa-b7cf-d3e6ce8bd1b2",
        "properties": {
          "fillColor": "#E9C46A",
          "lineColor": "#E9C46A"
        }
      },
      "summary": {
        "id": "6fe0e2d1-3872-42cf-b7c6-600c240a6f56",
        "properties": {
          "lineColor": "#E9C46A"
        }
      },
      "relationship": {
        "id": "c6afc459-3c93-45c4-ad63-ee9a460e12d6",
        "properties": {
          "lineColor": "#E9C46A"
        }
      }
    }
  },
  {
    "id": "Vintage-#2A9D8F-TYPE_B",
    "tags": [
      "Vintage",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "be04cc08-f196-4a7d-91e3-624304c1f8c0",
        "properties": {
          "fillColor": "#2A9D8F",
          "multiLineColors": "",
          "color-list": "#E9C46A #F4A261 #DC856F #A4705E #2A9D8F #264653"
        }
      },
      "centralTopic": {
        "id": "e6766c7c-b11b-444e-895f-e71bbf2e84d5",
        "properties": {
          "fillColor": "#264653",
          "lineColor": "#264653"
        }
      },
      "mainTopic": {
        "id": "0351618a-dda8-4eaa-8475-136f6929dbeb",
        "properties": {
          "fillColor": "#264653"
        }
      },
      "subTopic": {
        "id": "015553ba-9ec2-4e69-b295-a3ccfd1002f8",
        "properties": {
          "fillColor": "#3f5f6c"
        }
      },
      "floatingTopic": {
        "id": "20b76373-0097-49b7-bb35-0ebff90cbdf6",
        "properties": {
          "fillColor": "#E9C46A",
          "borderColor": "#E9C46A"
        }
      },
      "summaryTopic": {
        "id": "9944138c-248b-4f60-bbf0-5ddaa3a6a6db",
        "properties": {
          "fillColor": "#264653",
          "borderColor": "#264653"
        }
      },
      "calloutTopic": {
        "id": "c39a2dc2-0cd4-44f7-aa60-ad71a35d8a5d",
        "properties": {
          "fillColor": "#264653",
          "borderColor": "#264653"
        }
      },
      "importantTopic": {
        "id": "b6e4c58a-0b4b-4a9c-9d67-973b259256ff",
        "properties": {
          "fillColor": "#9d2a38",
          "borderColor": "#9d2a38"
        }
      },
      "minorTopic": {
        "id": "1b5281f2-20f8-41ab-864c-d6671f0894c3",
        "properties": {
          "fillColor": "#9d722a",
          "borderColor": "#9d722a"
        }
      },
      "boundary": {
        "id": "762632a3-3879-46fe-a135-5ad5fbc420cf",
        "properties": {
          "fillColor": "#264653",
          "lineColor": "#264653"
        }
      },
      "summary": {
        "id": "e723504a-bac9-4f6d-97f3-565251500588",
        "properties": {
          "lineColor": "#264653"
        }
      },
      "relationship": {
        "id": "4fe6dbdf-218a-4763-a1a5-721b5ebd595f",
        "properties": {
          "lineColor": "#264653"
        }
      }
    }
  },
  {
    "id": "Vintage-#264653-TYPE_B",
    "tags": [
      "Vintage",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "d6044951-90ac-4f6b-9549-a2daf7e14137",
        "properties": {
          "fillColor": "#264653",
          "multiLineColors": "",
          "color-list": "#E9C46A #F4A261 #DC856F #A4705E #2A9D8F #264653"
        }
      },
      "centralTopic": {
        "id": "ae9c7296-b539-4f12-8b99-e4ba73494b5a",
        "properties": {
          "fillColor": "#E9C46A",
          "lineColor": "#E9C46A"
        }
      },
      "mainTopic": {
        "id": "ec65cc01-2b94-4d8c-a9de-ee0fc84b5579",
        "properties": {
          "fillColor": "#E9C46A"
        }
      },
      "subTopic": {
        "id": "a412f1b1-1afe-4e84-b993-5e4e2e128807",
        "properties": {
          "fillColor": "#ffdd83"
        }
      },
      "floatingTopic": {
        "id": "460689b6-4742-4ffa-8667-d709bdb1061a",
        "properties": {
          "fillColor": "#F4A261",
          "borderColor": "#F4A261"
        }
      },
      "summaryTopic": {
        "id": "dee6f87c-1912-41d1-ac7f-e9df5bd045ee",
        "properties": {
          "fillColor": "#E9C46A",
          "borderColor": "#E9C46A"
        }
      },
      "calloutTopic": {
        "id": "b8cd304a-1870-4802-b198-bf3fa91552bb",
        "properties": {
          "fillColor": "#E9C46A",
          "borderColor": "#E9C46A"
        }
      },
      "importantTopic": {
        "id": "3d2e2a1e-f82b-43da-a3f6-7e4b09d5b2a8",
        "properties": {
          "fillColor": "#523225",
          "borderColor": "#523225"
        }
      },
      "minorTopic": {
        "id": "9ea3d200-04cc-4ca7-8497-c406b53dce5f",
        "properties": {
          "fillColor": "#505124",
          "borderColor": "#505124"
        }
      },
      "boundary": {
        "id": "00dfcf0d-c5c4-48d9-bc7e-01fae22dcc56",
        "properties": {
          "fillColor": "#E9C46A",
          "lineColor": "#E9C46A"
        }
      },
      "summary": {
        "id": "50009c5b-8c28-4a54-bfec-6b9663e0b78d",
        "properties": {
          "lineColor": "#E9C46A"
        }
      },
      "relationship": {
        "id": "fdfb1bd8-acac-4457-8eb2-1e17506d3b07",
        "properties": {
          "lineColor": "#E9C46A"
        }
      }
    }
  },
  {
    "id": "Vintage-#264653-MULTI_LINE_COLORS",
    "tags": [
      "Vintage",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "5515ec47-f758-453c-981d-82d9dfe0caf3",
        "properties": {
          "fillColor": "#264653",
          "multiLineColors": "#F4A261 #DC856F #A4705E #2A9D8F",
          "color-list": "#E9C46A #F4A261 #DC856F #A4705E #2A9D8F #264653"
        }
      },
      "centralTopic": {
        "id": "7afc703a-319c-4893-a269-52538b04cd18",
        "properties": {
          "fillColor": "#E9C46A",
          "lineColor": "#E9C46A"
        }
      },
      "mainTopic": {
        "id": "3256a29b-0485-485d-8eb6-25e1543d24c9",
        "properties": {}
      },
      "subTopic": {
        "id": "6c7e48a8-2760-4a52-a2e6-0849f17a2c5b",
        "properties": {}
      },
      "floatingTopic": {
        "id": "729bab40-7509-4a47-bf44-ee4aee471024",
        "properties": {
          "fillColor": "#F4A261",
          "borderColor": "#F4A261"
        }
      },
      "summaryTopic": {
        "id": "8aea1cc1-8c7c-4f61-ae23-65e0ea54be30",
        "properties": {
          "fillColor": "#E9C46A",
          "borderColor": "#E9C46A"
        }
      },
      "calloutTopic": {
        "id": "1f63cde2-8073-4111-91af-577f7bae226f",
        "properties": {
          "fillColor": "#E9C46A",
          "borderColor": "#E9C46A"
        }
      },
      "importantTopic": {
        "id": "6cb5dcba-24c2-4208-9cd4-d0e2ede89f33",
        "properties": {
          "fillColor": "#455124",
          "borderColor": "#455124"
        }
      },
      "minorTopic": {
        "id": "4c186d5e-16a8-4407-938e-a4b9d81c939b",
        "properties": {
          "fillColor": "#245125",
          "borderColor": "#245125"
        }
      },
      "boundary": {
        "id": "cd010a7d-26e6-44f7-a235-e47ed89b9ead",
        "properties": {
          "fillColor": "#E9C46A",
          "lineColor": "#E9C46A"
        }
      },
      "summary": {
        "id": "646f472f-1544-4e69-9509-7ac793bcd6d0",
        "properties": {
          "lineColor": "#E9C46A"
        }
      },
      "relationship": {
        "id": "f5332201-29fb-44dc-9ee6-c4d13d683d25",
        "properties": {
          "lineColor": "#E9C46A"
        }
      }
    }
  },
  {
    "id": "Dessert-#F9F8ED-TYPE_A",
    "tags": [
      "Dessert",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "98978bfd-bdfa-434a-a88d-e26e4a91b1f0",
        "properties": {
          "fillColor": "#F9F8ED",
          "multiLineColors": "",
          "color-list": "#F9F8ED #FFEDD2 #FFBC9F #D8AC8F #83c5be #006d77"
        }
      },
      "centralTopic": {
        "id": "14400a48-73bc-4872-a682-95f4733bac6f",
        "properties": {
          "fillColor": "#006d77",
          "lineColor": "#006d77"
        }
      },
      "mainTopic": {
        "id": "50141396-ff85-4d66-983b-c84bd2e2e6a7",
        "properties": {
          "fillColor": "#D8AC8F"
        }
      },
      "subTopic": {
        "id": "741c6d1e-4ec0-4b59-803b-06f88419362d",
        "properties": {
          "fillColor": "#f5f4e3"
        }
      },
      "floatingTopic": {
        "id": "31724e84-e85b-4b47-b2a9-9d2e38bded89",
        "properties": {
          "fillColor": "#FFBC9F",
          "borderColor": "#FFBC9F"
        }
      },
      "summaryTopic": {
        "id": "c52c072c-9bfe-4cf1-90af-5966d355f43a",
        "properties": {
          "fillColor": "#D8AC8F",
          "borderColor": "#D8AC8F"
        }
      },
      "calloutTopic": {
        "id": "3b906d82-e6a6-49be-ab43-230e9ccd39e8",
        "properties": {
          "fillColor": "#D8AC8F",
          "borderColor": "#D8AC8F"
        }
      },
      "importantTopic": {
        "id": "45d76c2b-c691-465b-a8f1-83d67854dcb7",
        "properties": {
          "fillColor": "#83c5be",
          "borderColor": "#83c5be"
        }
      },
      "minorTopic": {
        "id": "e9237634-2e81-4922-9a81-2fea822849a9",
        "properties": {
          "fillColor": "#006d77",
          "borderColor": "#006d77"
        }
      },
      "boundary": {
        "id": "880a6cd3-9cdf-40c3-b8e0-cf5518904d26",
        "properties": {
          "fillColor": "#006d77",
          "lineColor": "#006d77"
        }
      },
      "summary": {
        "id": "d4ea74fa-7241-429f-a9dd-6f2637150dc7",
        "properties": {
          "lineColor": "#006d77"
        }
      },
      "relationship": {
        "id": "156786a0-d41c-4a2e-a4c2-d272a499272e",
        "properties": {
          "lineColor": "#006d77"
        }
      }
    }
  },
  {
    "id": "Dessert-#FFEDD2-TYPE_A",
    "tags": [
      "Dessert",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "bd3fb424-9647-4dfd-96f9-17da45da0cd8",
        "properties": {
          "fillColor": "#FFEDD2",
          "multiLineColors": "",
          "color-list": "#F9F8ED #FFEDD2 #FFBC9F #D8AC8F #83c5be #006d77"
        }
      },
      "centralTopic": {
        "id": "4191cfb8-6017-4d71-9391-635f8125d06d",
        "properties": {
          "fillColor": "#006d77",
          "lineColor": "#006d77"
        }
      },
      "mainTopic": {
        "id": "f5a05d83-d81d-4b0f-a7cc-008a0d73ef6a",
        "properties": {
          "fillColor": "#D8AC8F"
        }
      },
      "subTopic": {
        "id": "bf082eeb-dc46-44e5-a6a5-76ffce8813cb",
        "properties": {
          "fillColor": "#ffe3bb"
        }
      },
      "floatingTopic": {
        "id": "6337b1bb-94f0-49ef-af2b-53d2d78389c9",
        "properties": {
          "fillColor": "#FFBC9F",
          "borderColor": "#FFBC9F"
        }
      },
      "summaryTopic": {
        "id": "17f35fd8-21e1-40a9-88a3-37eaae5d24f1",
        "properties": {
          "fillColor": "#D8AC8F",
          "borderColor": "#D8AC8F"
        }
      },
      "calloutTopic": {
        "id": "0d2d9a54-39e0-4fca-a561-a648698e9208",
        "properties": {
          "fillColor": "#D8AC8F",
          "borderColor": "#D8AC8F"
        }
      },
      "importantTopic": {
        "id": "e7837735-856d-4a10-b355-43aee139d6e9",
        "properties": {
          "fillColor": "#83c5be",
          "borderColor": "#83c5be"
        }
      },
      "minorTopic": {
        "id": "ae148b96-e5c3-4cce-a9c5-269cb6a83362",
        "properties": {
          "fillColor": "#006d77",
          "borderColor": "#006d77"
        }
      },
      "boundary": {
        "id": "d1428a12-3447-4412-b758-5f945b1c9cb6",
        "properties": {
          "fillColor": "#006d77",
          "lineColor": "#006d77"
        }
      },
      "summary": {
        "id": "34849bef-c70c-4093-bacb-4ad1bb5c9c7f",
        "properties": {
          "lineColor": "#006d77"
        }
      },
      "relationship": {
        "id": "9d34ef84-e27f-4d02-ac8a-fde284405cc5",
        "properties": {
          "lineColor": "#006d77"
        }
      }
    }
  },
  {
    "id": "Dessert-#FFBC9F-TYPE_A",
    "tags": [
      "Dessert",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "90926bc7-7c20-4d34-973c-4d7051579672",
        "properties": {
          "fillColor": "#FFBC9F",
          "multiLineColors": "",
          "color-list": "#F9F8ED #FFEDD2 #FFBC9F #D8AC8F #83c5be #006d77"
        }
      },
      "centralTopic": {
        "id": "cf9c0305-3623-4f8d-ac4a-ba4b1827ce41",
        "properties": {
          "fillColor": "#006d77",
          "lineColor": "#006d77"
        }
      },
      "mainTopic": {
        "id": "10ead122-422a-429b-b955-dd3e3f1c677c",
        "properties": {
          "fillColor": "#F9F8ED"
        }
      },
      "subTopic": {
        "id": "79e98c8a-6572-4581-be7c-c11fd1d527d8",
        "properties": {
          "fillColor": "#ff9a6e"
        }
      },
      "floatingTopic": {
        "id": "09bc8ca9-d57c-47c2-8191-d2e69db132aa",
        "properties": {
          "fillColor": "#FFEDD2",
          "borderColor": "#FFEDD2"
        }
      },
      "summaryTopic": {
        "id": "5a723965-61e9-4a2e-92c4-bb07598fa79c",
        "properties": {
          "fillColor": "#F9F8ED",
          "borderColor": "#F9F8ED"
        }
      },
      "calloutTopic": {
        "id": "6fa912f8-8ebc-4206-adff-61c06eca94cc",
        "properties": {
          "fillColor": "#F9F8ED",
          "borderColor": "#F9F8ED"
        }
      },
      "importantTopic": {
        "id": "f03dcd66-3ca2-4284-bb84-4fc9037f1666",
        "properties": {
          "fillColor": "#FFEDD2",
          "borderColor": "#FFEDD2"
        }
      },
      "minorTopic": {
        "id": "b20628b0-f092-4053-95c1-528729940e4a",
        "properties": {
          "fillColor": "#006d77",
          "borderColor": "#006d77"
        }
      },
      "boundary": {
        "id": "c56476db-1ee4-4eeb-b5d8-5f94d7711687",
        "properties": {
          "fillColor": "#006d77",
          "lineColor": "#006d77"
        }
      },
      "summary": {
        "id": "77a82b8e-17d3-4bc2-961c-c0efdaee950b",
        "properties": {
          "lineColor": "#006d77"
        }
      },
      "relationship": {
        "id": "e4089a6c-5577-4147-a73f-0a6e9222efec",
        "properties": {
          "lineColor": "#006d77"
        }
      }
    }
  },
  {
    "id": "Dessert-#D8AC8F-TYPE_B",
    "tags": [
      "Dessert",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "ca20817d-4f15-4a1b-905f-531583c214fa",
        "properties": {
          "fillColor": "#D8AC8F",
          "multiLineColors": "",
          "color-list": "#F9F8ED #FFEDD2 #FFBC9F #D8AC8F #83c5be #006d77"
        }
      },
      "centralTopic": {
        "id": "8ce7bc7d-7c7e-4b8c-8175-0f98dd695d3d",
        "properties": {
          "fillColor": "#006d77",
          "lineColor": "#006d77"
        }
      },
      "mainTopic": {
        "id": "2de32620-2b8a-4876-8f7a-e34bdf51a0ee",
        "properties": {
          "fillColor": "#F9F8ED"
        }
      },
      "subTopic": {
        "id": "03068710-9e4c-4ec4-a51e-8fc871f42c06",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "1aa5a9d3-19fe-4af7-adbf-f14c2d4f1b0c",
        "properties": {
          "fillColor": "#FFEDD2",
          "borderColor": "#FFEDD2"
        }
      },
      "summaryTopic": {
        "id": "f39ed958-f6b8-4bcf-b854-162058465bc2",
        "properties": {
          "fillColor": "#F9F8ED",
          "borderColor": "#F9F8ED"
        }
      },
      "calloutTopic": {
        "id": "53dda311-542a-4022-8e3b-c6ba239df9c5",
        "properties": {
          "fillColor": "#F9F8ED",
          "borderColor": "#F9F8ED"
        }
      },
      "importantTopic": {
        "id": "a1283ee2-dac5-480e-95b3-cfef2ecba07c",
        "properties": {
          "fillColor": "#8ebbd8",
          "borderColor": "#8ebbd8"
        }
      },
      "minorTopic": {
        "id": "dd728329-910e-48ab-8c01-16576ea0570f",
        "properties": {
          "fillColor": "#988dd8",
          "borderColor": "#988dd8"
        }
      },
      "boundary": {
        "id": "b7acd28d-1a86-4cb6-820a-e92b0127f635",
        "properties": {
          "fillColor": "#006d77",
          "lineColor": "#006d77"
        }
      },
      "summary": {
        "id": "f6ef3485-c080-4e9e-97bd-a6de0677ac6b",
        "properties": {
          "lineColor": "#006d77"
        }
      },
      "relationship": {
        "id": "5b40a08f-b008-4258-9da5-1ed02c27f5f5",
        "properties": {
          "lineColor": "#006d77"
        }
      }
    }
  },
  {
    "id": "Dessert-#83c5be-TYPE_B",
    "tags": [
      "Dessert",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "9f725348-16a1-43bc-98a1-f55abf357a7d",
        "properties": {
          "fillColor": "#83c5be",
          "multiLineColors": "",
          "color-list": "#F9F8ED #FFEDD2 #FFBC9F #D8AC8F #83c5be #006d77"
        }
      },
      "centralTopic": {
        "id": "92bb726d-35e6-4935-8cd1-2c1c366286f4",
        "properties": {
          "fillColor": "#006d77",
          "lineColor": "#006d77"
        }
      },
      "mainTopic": {
        "id": "521f36ca-dbdc-45c3-8c7b-2708634a5507",
        "properties": {
          "fillColor": "#006d77"
        }
      },
      "subTopic": {
        "id": "a9e7290a-9d7a-4508-bc89-e43d54bd6d05",
        "properties": {
          "fillColor": "#198690"
        }
      },
      "floatingTopic": {
        "id": "95cf0707-ca48-4a51-bd53-661ed6eaec36",
        "properties": {
          "fillColor": "#F9F8ED",
          "borderColor": "#F9F8ED"
        }
      },
      "summaryTopic": {
        "id": "08c90e2b-1cfd-418c-9592-379a34b8eccc",
        "properties": {
          "fillColor": "#006d77",
          "borderColor": "#006d77"
        }
      },
      "calloutTopic": {
        "id": "1c499ac6-4e52-4636-a372-a758c07eb6da",
        "properties": {
          "fillColor": "#006d77",
          "borderColor": "#006d77"
        }
      },
      "importantTopic": {
        "id": "19a5665d-5c05-494f-a3d6-25ee3c1c6906",
        "properties": {
          "fillColor": "#c48389",
          "borderColor": "#c48389"
        }
      },
      "minorTopic": {
        "id": "b00a3947-eb3a-4263-8067-37471d656dc5",
        "properties": {
          "fillColor": "#c3ad83",
          "borderColor": "#c3ad83"
        }
      },
      "boundary": {
        "id": "76d09f3b-30d0-41fc-9d2a-7d02cb443df1",
        "properties": {
          "fillColor": "#006d77",
          "lineColor": "#006d77"
        }
      },
      "summary": {
        "id": "d1387016-c8d1-4899-9cc3-5c8eedeaa338",
        "properties": {
          "lineColor": "#006d77"
        }
      },
      "relationship": {
        "id": "0e561a69-c498-43f4-a0ce-cd5f17cbbf26",
        "properties": {
          "lineColor": "#006d77"
        }
      }
    }
  },
  {
    "id": "Dessert-#006d77-TYPE_B",
    "tags": [
      "Dessert",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "f94ce7b2-8fc5-4a38-9ef4-a61945b94efa",
        "properties": {
          "fillColor": "#006d77",
          "multiLineColors": "",
          "color-list": "#F9F8ED #FFEDD2 #FFBC9F #D8AC8F #83c5be #006d77"
        }
      },
      "centralTopic": {
        "id": "b26ec0df-a18b-4fc4-8c90-dc1d6e60ffd3",
        "properties": {
          "fillColor": "#F9F8ED",
          "lineColor": "#F9F8ED"
        }
      },
      "mainTopic": {
        "id": "2b86e82a-8321-4963-a7fe-244cae7ba4dd",
        "properties": {
          "fillColor": "#F9F8ED"
        }
      },
      "subTopic": {
        "id": "5484c4d2-0143-440f-9c0c-459c182563f3",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "b37d7bf1-02ab-412e-bff6-d1fa5b620fd5",
        "properties": {
          "fillColor": "#FFEDD2",
          "borderColor": "#FFEDD2"
        }
      },
      "summaryTopic": {
        "id": "6813b919-0dde-4661-be77-8bff0ec508f9",
        "properties": {
          "fillColor": "#F9F8ED",
          "borderColor": "#F9F8ED"
        }
      },
      "calloutTopic": {
        "id": "bba5b556-ad1b-40df-bead-7c5fda1d0b87",
        "properties": {
          "fillColor": "#F9F8ED",
          "borderColor": "#F9F8ED"
        }
      },
      "importantTopic": {
        "id": "fc93213d-57f4-4672-b23f-9952afe86f7d",
        "properties": {
          "fillColor": "#760a00",
          "borderColor": "#760a00"
        }
      },
      "minorTopic": {
        "id": "4acc7fb9-982a-40b8-9480-6c0b351f7af9",
        "properties": {
          "fillColor": "#756200",
          "borderColor": "#756200"
        }
      },
      "boundary": {
        "id": "8f27f58e-03c9-4d79-9010-0f1028ef1b4b",
        "properties": {
          "fillColor": "#F9F8ED",
          "lineColor": "#F9F8ED"
        }
      },
      "summary": {
        "id": "98af4f2c-3bc0-4b6d-b8a9-9b02ffdf1aac",
        "properties": {
          "lineColor": "#F9F8ED"
        }
      },
      "relationship": {
        "id": "c65dfdeb-68fe-459e-b889-ef5f68cdd192",
        "properties": {
          "lineColor": "#F9F8ED"
        }
      }
    }
  },
  {
    "id": "Dessert-#F9F8ED-MULTI_LINE_COLORS",
    "tags": [
      "Dessert",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "330f181e-e1b9-4f3b-bdf7-8cfb9a0941fd",
        "properties": {
          "fillColor": "#F9F8ED",
          "multiLineColors": "#FFBC9F #D8AC8F #83c5be",
          "color-list": "#F9F8ED #FFEDD2 #FFBC9F #D8AC8F #83c5be #006d77"
        }
      },
      "centralTopic": {
        "id": "14fc834f-1602-4703-9c75-281399218a23",
        "properties": {
          "fillColor": "#006d77",
          "lineColor": "#006d77"
        }
      },
      "mainTopic": {
        "id": "9726c1fe-b756-4920-b8f1-1d8c2ef76062",
        "properties": {}
      },
      "subTopic": {
        "id": "c4ee6fc7-9e41-4c62-97e2-c55c00931bbc",
        "properties": {}
      },
      "floatingTopic": {
        "id": "e1c5c50d-e8bc-4750-a8e9-315525ec46b1",
        "properties": {
          "fillColor": "#FFBC9F",
          "borderColor": "#FFBC9F"
        }
      },
      "summaryTopic": {
        "id": "c5c8e015-138b-43f0-ae99-3898b09413bd",
        "properties": {
          "fillColor": "#D8AC8F",
          "borderColor": "#D8AC8F"
        }
      },
      "calloutTopic": {
        "id": "60c8b1a0-e6b1-49fa-9119-d4db93910aec",
        "properties": {
          "fillColor": "#D8AC8F",
          "borderColor": "#D8AC8F"
        }
      },
      "importantTopic": {
        "id": "c87b5358-a6ad-4eaf-a282-3959ccd72aaa",
        "properties": {
          "fillColor": "#8389c4",
          "borderColor": "#8389c4"
        }
      },
      "minorTopic": {
        "id": "28b9cba2-7779-4262-88d9-6d6682dd876a",
        "properties": {
          "fillColor": "#090076",
          "borderColor": "#090076"
        }
      },
      "boundary": {
        "id": "b2b799b6-c90b-401e-9bf0-6db989677dd6",
        "properties": {
          "fillColor": "#006d77",
          "lineColor": "#006d77"
        }
      },
      "summary": {
        "id": "46fabbff-6b20-4665-99cc-0d160e515650",
        "properties": {
          "lineColor": "#006d77"
        }
      },
      "relationship": {
        "id": "0d1f586d-2449-4036-8fd8-6351c0ebdb1f",
        "properties": {
          "lineColor": "#006d77"
        }
      }
    }
  },
  {
    "id": "Dessert-#006d77-MULTI_LINE_COLORS",
    "tags": [
      "Dessert",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "11fa6a7c-2373-40b1-8e2f-debeb0da3fe9",
        "properties": {
          "fillColor": "#006d77",
          "multiLineColors": "#FFEDD2 #FFBC9F #D8AC8F #83c5be",
          "color-list": "#F9F8ED #FFEDD2 #FFBC9F #D8AC8F #83c5be #006d77"
        }
      },
      "centralTopic": {
        "id": "c2b9b221-a60b-434a-86eb-14f72206a2a0",
        "properties": {
          "fillColor": "#F9F8ED",
          "lineColor": "#F9F8ED"
        }
      },
      "mainTopic": {
        "id": "9ae5b759-4e78-488f-ba61-c74dea1eb415",
        "properties": {}
      },
      "subTopic": {
        "id": "4aa708b7-4ee7-49f8-9d08-1cd4f5a60a70",
        "properties": {}
      },
      "floatingTopic": {
        "id": "4db90b58-1b60-4731-a3f6-425717b82052",
        "properties": {
          "fillColor": "#FFEDD2",
          "borderColor": "#FFEDD2"
        }
      },
      "summaryTopic": {
        "id": "b2b381de-161f-4396-a349-8405bcd5510c",
        "properties": {
          "fillColor": "#F9F8ED",
          "borderColor": "#F9F8ED"
        }
      },
      "calloutTopic": {
        "id": "bc962899-e791-4cf1-acce-f582201244b3",
        "properties": {
          "fillColor": "#F9F8ED",
          "borderColor": "#F9F8ED"
        }
      },
      "importantTopic": {
        "id": "0ddeac52-05ad-462d-aab2-4ad5c5153768",
        "properties": {
          "fillColor": "#6b7500",
          "borderColor": "#6b7500"
        }
      },
      "minorTopic": {
        "id": "c98c72cc-8c9e-4bc1-8d3a-44f6f8fd757a",
        "properties": {
          "fillColor": "#127500",
          "borderColor": "#127500"
        }
      },
      "boundary": {
        "id": "eb1ce713-377f-4a8d-b9c9-5d9eaa898742",
        "properties": {
          "fillColor": "#F9F8ED",
          "lineColor": "#F9F8ED"
        }
      },
      "summary": {
        "id": "d5080aae-95b6-4996-8151-0be07af24139",
        "properties": {
          "lineColor": "#F9F8ED"
        }
      },
      "relationship": {
        "id": "4410f421-d428-4fbc-b93a-c16dde789262",
        "properties": {
          "lineColor": "#F9F8ED"
        }
      }
    }
  },
  {
    "id": "Vanllia-#FFFFFF-TYPE_A",
    "tags": [
      "Vanllia",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "dccf01bc-e795-4fcd-8055-bdc6da496848",
        "properties": {
          "fillColor": "#FFFFFF",
          "multiLineColors": "",
          "color-list": "#FFFFFF #E4F9F5 #30E3CA #11999E #40514E #0D4040"
        }
      },
      "centralTopic": {
        "id": "991056d0-ab4e-4e4c-8b74-1747de4ecaa8",
        "properties": {
          "fillColor": "#0D4040",
          "lineColor": "#0D4040"
        }
      },
      "mainTopic": {
        "id": "15e53d1c-380e-4e56-b6bb-64ccce4a2770",
        "properties": {
          "fillColor": "#40514E"
        }
      },
      "subTopic": {
        "id": "cc9837e5-59f5-4c00-8817-6ffdc3eaf89b",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "9645d90a-c779-4857-9f59-8edd47f9c621",
        "properties": {
          "fillColor": "#30E3CA",
          "borderColor": "#30E3CA"
        }
      },
      "summaryTopic": {
        "id": "6d714832-c3e8-4caf-b5cc-871e3fcb3f5e",
        "properties": {
          "fillColor": "#40514E",
          "borderColor": "#40514E"
        }
      },
      "calloutTopic": {
        "id": "467999ba-f887-426e-8426-d6f82b01fdac",
        "properties": {
          "fillColor": "#40514E",
          "borderColor": "#40514E"
        }
      },
      "importantTopic": {
        "id": "f67604ab-d555-4657-b2f4-7b36c6d18fff",
        "properties": {
          "fillColor": "#11999E",
          "borderColor": "#11999E"
        }
      },
      "minorTopic": {
        "id": "95eb29e9-a3cf-4574-bd1b-7d19fef6d364",
        "properties": {
          "fillColor": "#0D4040",
          "borderColor": "#0D4040"
        }
      },
      "boundary": {
        "id": "35ba3712-768f-474f-b275-6ecbad75b4f8",
        "properties": {
          "fillColor": "#0D4040",
          "lineColor": "#0D4040"
        }
      },
      "summary": {
        "id": "e8c2de78-5975-48ed-b5ce-c85d04ec22a9",
        "properties": {
          "lineColor": "#0D4040"
        }
      },
      "relationship": {
        "id": "760f893d-a108-43ca-b432-326377d60ac1",
        "properties": {
          "lineColor": "#0D4040"
        }
      }
    }
  },
  {
    "id": "Vanllia-#E4F9F5-TYPE_A",
    "tags": [
      "Vanllia",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "d72a941b-6764-4740-ab63-a74192b38908",
        "properties": {
          "fillColor": "#E4F9F5",
          "multiLineColors": "",
          "color-list": "#FFFFFF #E4F9F5 #30E3CA #11999E #40514E #0D4040"
        }
      },
      "centralTopic": {
        "id": "0b6b8d87-215b-4e48-b285-b04896abc128",
        "properties": {
          "fillColor": "#0D4040",
          "lineColor": "#0D4040"
        }
      },
      "mainTopic": {
        "id": "98d4ae92-360c-4258-afe0-e046bf72eb85",
        "properties": {
          "fillColor": "#40514E"
        }
      },
      "subTopic": {
        "id": "c4f2ca8e-0251-43c0-a3eb-36434f77aa13",
        "properties": {
          "fillColor": "#d6f6f0"
        }
      },
      "floatingTopic": {
        "id": "2c8004dc-d161-44d7-abde-6cd58affca83",
        "properties": {
          "fillColor": "#30E3CA",
          "borderColor": "#30E3CA"
        }
      },
      "summaryTopic": {
        "id": "55d3894e-aea0-46cc-8129-b089aeede077",
        "properties": {
          "fillColor": "#40514E",
          "borderColor": "#40514E"
        }
      },
      "calloutTopic": {
        "id": "36f4a916-2f8f-4307-bc6b-8e7203374d56",
        "properties": {
          "fillColor": "#40514E",
          "borderColor": "#40514E"
        }
      },
      "importantTopic": {
        "id": "72cf799a-3fb6-4e07-ad3e-800e7cb39278",
        "properties": {
          "fillColor": "#11999E",
          "borderColor": "#11999E"
        }
      },
      "minorTopic": {
        "id": "602bbe96-0048-457e-9b21-900c2f57a1dd",
        "properties": {
          "fillColor": "#0D4040",
          "borderColor": "#0D4040"
        }
      },
      "boundary": {
        "id": "b1393667-b04c-4715-989c-d64a55e333b5",
        "properties": {
          "fillColor": "#0D4040",
          "lineColor": "#0D4040"
        }
      },
      "summary": {
        "id": "22761f47-0075-4c75-b536-f88b09abc704",
        "properties": {
          "lineColor": "#0D4040"
        }
      },
      "relationship": {
        "id": "12c039b8-bddd-4c6f-92d8-410f6e3d5ee3",
        "properties": {
          "lineColor": "#0D4040"
        }
      }
    }
  },
  {
    "id": "Vanllia-#30E3CA-TYPE_C",
    "tags": [
      "Vanllia",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "a2eb60e7-87a0-4f1c-af6c-06a5f46e1cc8",
        "properties": {
          "fillColor": "#0D4040",
          "multiLineColors": "",
          "color-list": "#FFFFFF #E4F9F5 #30E3CA #11999E #40514E #0D4040"
        }
      },
      "centralTopic": {
        "id": "9ffcc6f4-b51c-4682-a861-ec7ea6630b62",
        "properties": {
          "fillColor": "#30E3CA",
          "lineColor": "#30E3CA"
        }
      },
      "mainTopic": {
        "id": "e3a4ed85-09cb-435b-95e6-61c423eac39c",
        "properties": {
          "fillColor": "#FFFFFF"
        }
      },
      "subTopic": {
        "id": "6ff26afd-900a-4e67-8c82-bf2849876936",
        "properties": {
          "fillColor": "#265959"
        }
      },
      "floatingTopic": {
        "id": "fcfd494b-8d0d-4739-876d-2d5627c936ce",
        "properties": {
          "fillColor": "#E4F9F5",
          "borderColor": "#E4F9F5"
        }
      },
      "summaryTopic": {
        "id": "8d9647a7-b89b-495a-8df8-f6111dda643f",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "calloutTopic": {
        "id": "698830c8-5324-46a8-b7b3-9c8fbb094962",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "importantTopic": {
        "id": "fc0b440f-be73-4718-a634-6661aa1e7b8b",
        "properties": {
          "fillColor": "#E4F9F5",
          "borderColor": "#E4F9F5"
        }
      },
      "minorTopic": {
        "id": "2f87bbbd-f4eb-4b81-8326-7d0a82e0537e",
        "properties": {
          "fillColor": "#30E3CA",
          "borderColor": "#30E3CA"
        }
      },
      "boundary": {
        "id": "59b58d77-34cd-47e4-adca-fb122929f742",
        "properties": {
          "fillColor": "#30E3CA",
          "lineColor": "#30E3CA"
        }
      },
      "summary": {
        "id": "5f0899e6-3979-445a-99bc-621bee361351",
        "properties": {
          "lineColor": "#30E3CA"
        }
      },
      "relationship": {
        "id": "e87a7264-aede-48e1-ba1e-661aebb9a8bd",
        "properties": {
          "lineColor": "#30E3CA"
        }
      }
    }
  },
  {
    "id": "Vanllia-#11999E-TYPE_A",
    "tags": [
      "Vanllia",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "b4e8a157-7eae-45b5-a5b9-68984681353b",
        "properties": {
          "fillColor": "#FFFFFF",
          "multiLineColors": "",
          "color-list": "#FFFFFF #E4F9F5 #30E3CA #11999E #40514E #0D4040"
        }
      },
      "centralTopic": {
        "id": "6b50d710-9473-4f2f-8727-6b8a3e24a21f",
        "properties": {
          "fillColor": "#11999E",
          "lineColor": "#11999E"
        }
      },
      "mainTopic": {
        "id": "eeead926-658f-4016-9199-ad8ddc4cc5c5",
        "properties": {
          "fillColor": "#0D4040"
        }
      },
      "subTopic": {
        "id": "cbc8bbf4-16b9-494a-8ef4-2ae208117b00",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "396283b3-5a97-4e08-9b11-e51328d7adcf",
        "properties": {
          "fillColor": "#30E3CA",
          "borderColor": "#30E3CA"
        }
      },
      "summaryTopic": {
        "id": "993c3cb0-1ed3-4ef9-b46e-050990ba9c5b",
        "properties": {
          "fillColor": "#0D4040",
          "borderColor": "#0D4040"
        }
      },
      "calloutTopic": {
        "id": "529d0a6f-2833-41ef-bb1b-40fd2dd0ba8a",
        "properties": {
          "fillColor": "#0D4040",
          "borderColor": "#0D4040"
        }
      },
      "importantTopic": {
        "id": "7466509f-18f6-40ea-a26f-baba557b0e6f",
        "properties": {
          "fillColor": "#40514E",
          "borderColor": "#40514E"
        }
      },
      "minorTopic": {
        "id": "e6f0aa63-5043-49c5-bfbf-63b1a2fe53f2",
        "properties": {
          "fillColor": "#11999E",
          "borderColor": "#11999E"
        }
      },
      "boundary": {
        "id": "3d1d7869-c421-46d3-9595-f0e4c0636c36",
        "properties": {
          "fillColor": "#11999E",
          "lineColor": "#11999E"
        }
      },
      "summary": {
        "id": "6d758f8d-b01e-4ec6-8578-a3f8652376e5",
        "properties": {
          "lineColor": "#11999E"
        }
      },
      "relationship": {
        "id": "7b628011-a7bc-49e2-a5d1-6788c364a6ed",
        "properties": {
          "lineColor": "#11999E"
        }
      }
    }
  },
  {
    "id": "Vanllia-#40514E-TYPE_B",
    "tags": [
      "Vanllia",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "76ddc307-18a3-4c3f-a30d-fa30b53963c4",
        "properties": {
          "fillColor": "#40514E",
          "multiLineColors": "",
          "color-list": "#FFFFFF #E4F9F5 #30E3CA #11999E #40514E #0D4040"
        }
      },
      "centralTopic": {
        "id": "bf5a82b5-b449-4dd1-9e80-89635d88d2c9",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "mainTopic": {
        "id": "6e265190-7b8c-4262-afc1-3186e07e9fce",
        "properties": {
          "fillColor": "#FFFFFF"
        }
      },
      "subTopic": {
        "id": "b9baf1fb-8801-400e-b4db-cfeaf62d9a54",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "70406b74-82d5-47a6-aa41-a9239bcf2a76",
        "properties": {
          "fillColor": "#E4F9F5",
          "borderColor": "#E4F9F5"
        }
      },
      "summaryTopic": {
        "id": "4fb23088-ad48-4f8c-b439-a4508bb7d11f",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "calloutTopic": {
        "id": "3c4ac1ef-a239-4d8e-a72a-dcf8a4a09393",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "importantTopic": {
        "id": "6c6037b1-15ae-4bcf-a0c9-42f23ff69b82",
        "properties": {
          "fillColor": "#514042",
          "borderColor": "#514042"
        }
      },
      "minorTopic": {
        "id": "3985dc09-c789-46bf-8d61-ad7d2f178620",
        "properties": {
          "fillColor": "#514a40",
          "borderColor": "#514a40"
        }
      },
      "boundary": {
        "id": "1e415456-8cb6-4fd8-9d99-a12f01cc6330",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "summary": {
        "id": "27cf6b72-45bc-45dc-b6fc-3bdd7f8fe599",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      },
      "relationship": {
        "id": "c1137170-308c-4e5e-a3e4-e3d124586743",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      }
    }
  },
  {
    "id": "Vanllia-#0D4040-TYPE_C",
    "tags": [
      "Vanllia",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "65cc35cb-69e8-4fa9-b558-87954cd03764",
        "properties": {
          "fillColor": "#0D4040",
          "multiLineColors": "",
          "color-list": "#FFFFFF #E4F9F5 #30E3CA #11999E #40514E #0D4040"
        }
      },
      "centralTopic": {
        "id": "b53d7368-1484-487a-a89c-9738f95bdd35",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "mainTopic": {
        "id": "076046a3-cdd1-4630-873e-1e1ea5795b4e",
        "properties": {
          "fillColor": "#E4F9F5"
        }
      },
      "subTopic": {
        "id": "671b0e29-fc6d-4466-8bcd-a16a0f648e72",
        "properties": {
          "fillColor": "#265959"
        }
      },
      "floatingTopic": {
        "id": "c926d894-ca1f-4173-95ba-6031849284a5",
        "properties": {
          "fillColor": "#30E3CA",
          "borderColor": "#30E3CA"
        }
      },
      "summaryTopic": {
        "id": "f631c19e-9db8-4fb2-9025-5244b1bf2ed1",
        "properties": {
          "fillColor": "#E4F9F5",
          "borderColor": "#E4F9F5"
        }
      },
      "calloutTopic": {
        "id": "4faa4fc7-f291-49d6-b918-71bd27cc07a9",
        "properties": {
          "fillColor": "#E4F9F5",
          "borderColor": "#E4F9F5"
        }
      },
      "importantTopic": {
        "id": "076773ba-65e8-48d3-a39f-6c8f08c40270",
        "properties": {
          "fillColor": "#30E3CA",
          "borderColor": "#30E3CA"
        }
      },
      "minorTopic": {
        "id": "aebddbc6-80e7-4244-ae43-aa34cbb54b4c",
        "properties": {
          "fillColor": "#FFFFFF",
          "borderColor": "#FFFFFF"
        }
      },
      "boundary": {
        "id": "da0d28fb-8632-4b11-8fda-d782260a0723",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "summary": {
        "id": "aa858bd7-93e8-4f03-8ff7-d16ab32951f3",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      },
      "relationship": {
        "id": "373e7deb-baa8-42e3-a590-4497ffe9ba38",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      }
    }
  },
  {
    "id": "Vanllia-#FFFFFF-MULTI_LINE_COLORS",
    "tags": [
      "Vanllia",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "de0fb79d-44a1-41c1-b25e-07a513b5c6c1",
        "properties": {
          "fillColor": "#FFFFFF",
          "multiLineColors": "#30E3CA #11999E #40514E",
          "color-list": "#FFFFFF #E4F9F5 #30E3CA #11999E #40514E #0D4040"
        }
      },
      "centralTopic": {
        "id": "48173af0-1001-4143-a48f-41fcc261c3d4",
        "properties": {
          "fillColor": "#0D4040",
          "lineColor": "#0D4040"
        }
      },
      "mainTopic": {
        "id": "0b7935a4-8c13-4705-af36-6dc09b63895f",
        "properties": {}
      },
      "subTopic": {
        "id": "46c0b8c7-98de-4673-8766-9131259925b9",
        "properties": {}
      },
      "floatingTopic": {
        "id": "0361afed-5607-4ba1-89fc-544220d6e7f3",
        "properties": {
          "fillColor": "#30E3CA",
          "borderColor": "#30E3CA"
        }
      },
      "summaryTopic": {
        "id": "5c507fe6-bee3-4dce-acf8-466a444ebb36",
        "properties": {
          "fillColor": "#40514E",
          "borderColor": "#40514E"
        }
      },
      "calloutTopic": {
        "id": "fbd34ed4-e7d0-48e5-b591-1c2bc57316fb",
        "properties": {
          "fillColor": "#40514E",
          "borderColor": "#40514E"
        }
      },
      "importantTopic": {
        "id": "281830da-1833-4189-a17b-e4e6fb732f34",
        "properties": {
          "fillColor": "#16109e",
          "borderColor": "#16109e"
        }
      },
      "minorTopic": {
        "id": "02fced82-1897-4bde-a5d8-f835ec196942",
        "properties": {
          "fillColor": "#0c0c40",
          "borderColor": "#0c0c40"
        }
      },
      "boundary": {
        "id": "d59b5ed0-890a-417a-ac87-59b33b27a2d8",
        "properties": {
          "fillColor": "#0D4040",
          "lineColor": "#0D4040"
        }
      },
      "summary": {
        "id": "dd2d828f-ad76-452b-8500-989f32f651f6",
        "properties": {
          "lineColor": "#0D4040"
        }
      },
      "relationship": {
        "id": "4f44e5a8-3ed0-4816-a4e3-9dc2c464a7e1",
        "properties": {
          "lineColor": "#0D4040"
        }
      }
    }
  },
  {
    "id": "Vanllia-#0D4040-MULTI_LINE_COLORS",
    "tags": [
      "Vanllia",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "38f0d445-8551-4182-8856-b6ead8c0daea",
        "properties": {
          "fillColor": "#0D4040",
          "multiLineColors": "#E4F9F5 #30E3CA #11999E #40514E",
          "color-list": "#FFFFFF #E4F9F5 #30E3CA #11999E #40514E #0D4040"
        }
      },
      "centralTopic": {
        "id": "b5742812-70d6-460f-81e8-d5531b83dead",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "mainTopic": {
        "id": "e7bcb99c-3cdf-495f-b64d-cc8438b555b8",
        "properties": {}
      },
      "subTopic": {
        "id": "d808b7a9-8b3f-440d-b736-023a0505e56b",
        "properties": {}
      },
      "floatingTopic": {
        "id": "8e3c5f07-db0a-4d47-8497-cac594382a99",
        "properties": {
          "fillColor": "#30E3CA",
          "borderColor": "#30E3CA"
        }
      },
      "summaryTopic": {
        "id": "81382c54-af0e-452d-af03-4af8625089d6",
        "properties": {
          "fillColor": "#E4F9F5",
          "borderColor": "#E4F9F5"
        }
      },
      "calloutTopic": {
        "id": "91f71e3f-3ee7-4476-8299-ec01f3cbc928",
        "properties": {
          "fillColor": "#E4F9F5",
          "borderColor": "#E4F9F5"
        }
      },
      "importantTopic": {
        "id": "c49b63af-4195-47a0-8f92-9af3c61a581f",
        "properties": {
          "fillColor": "#2f48e3",
          "borderColor": "#2f48e3"
        }
      },
      "minorTopic": {
        "id": "46c5baf8-5060-41e8-9f98-2a108c01d7db",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "boundary": {
        "id": "62ec5ce6-f946-4697-b319-7c1e5360778b",
        "properties": {
          "fillColor": "#FFFFFF",
          "lineColor": "#FFFFFF"
        }
      },
      "summary": {
        "id": "607743da-62b1-4765-ad3a-ab752ab57a45",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      },
      "relationship": {
        "id": "42628f71-49f2-4632-a43e-985a6d61bc21",
        "properties": {
          "lineColor": "#FFFFFF"
        }
      }
    }
  },
  {
    "id": "Candy-#ffffff-TYPE_A",
    "tags": [
      "Candy",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "01ebec5c-1b47-465e-a157-f74acf7f12ef",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #FF9C72 #f5cd6c #F09E3A #9cc3e4 #54A6D6"
        }
      },
      "centralTopic": {
        "id": "c4677a3f-1e61-4bcd-925c-d00731c6b055",
        "properties": {
          "fillColor": "#54A6D6",
          "lineColor": "#54A6D6"
        }
      },
      "mainTopic": {
        "id": "00c330b7-ff20-4ff7-974c-101aaab0dc4a",
        "properties": {
          "fillColor": "#F09E3A"
        }
      },
      "subTopic": {
        "id": "4c64b66b-e72d-4bf5-a8a7-6e9c3043e0af",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "95eb0ee6-bffa-46ee-9626-bd9a612d7577",
        "properties": {
          "fillColor": "#FF9C72",
          "borderColor": "#FF9C72"
        }
      },
      "summaryTopic": {
        "id": "cb938593-b1e3-4bc7-89b0-b5549cb6b674",
        "properties": {
          "fillColor": "#F09E3A",
          "borderColor": "#F09E3A"
        }
      },
      "calloutTopic": {
        "id": "50dbbfba-0ff2-4b9f-821d-5238f6b59068",
        "properties": {
          "fillColor": "#F09E3A",
          "borderColor": "#F09E3A"
        }
      },
      "importantTopic": {
        "id": "f0661de0-48bf-41c1-bb06-c8b7e46a659e",
        "properties": {
          "fillColor": "#FF9C72",
          "borderColor": "#FF9C72"
        }
      },
      "minorTopic": {
        "id": "1e09d6df-c1f8-4a5f-8127-34432d8a7905",
        "properties": {
          "fillColor": "#54A6D6",
          "borderColor": "#54A6D6"
        }
      },
      "boundary": {
        "id": "9525c8d4-b3b1-46c9-a047-394bd88f5ba2",
        "properties": {
          "fillColor": "#54A6D6",
          "lineColor": "#54A6D6"
        }
      },
      "summary": {
        "id": "0a0f9bff-ac89-492a-9a80-acac1ab40d36",
        "properties": {
          "lineColor": "#54A6D6"
        }
      },
      "relationship": {
        "id": "571f6c99-0364-4aa6-8832-0b7d1a07873f",
        "properties": {
          "lineColor": "#54A6D6"
        }
      }
    }
  },
  {
    "id": "Candy-#FF9C72-TYPE_B",
    "tags": [
      "Candy",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "1353549f-ade8-46d8-9d83-c543a845d665",
        "properties": {
          "fillColor": "#FF9C72",
          "multiLineColors": "",
          "color-list": "#ffffff #FF9C72 #f5cd6c #F09E3A #9cc3e4 #54A6D6"
        }
      },
      "centralTopic": {
        "id": "88eecaf6-5e8e-4d53-84a7-2ea18f14b18b",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "497e731f-c38f-4e57-a78b-ceaa74ef00e5",
        "properties": {
          "fillColor": "#f5cd6c"
        }
      },
      "subTopic": {
        "id": "07c6ef7e-4dad-4d33-9a09-024b437fa849",
        "properties": {
          "fillColor": "#ffe685"
        }
      },
      "floatingTopic": {
        "id": "9e4f3345-3742-425d-9411-cde150c3df34",
        "properties": {
          "fillColor": "#f5cd6c",
          "borderColor": "#f5cd6c"
        }
      },
      "summaryTopic": {
        "id": "5826f2e9-ef77-4a70-b337-149bfdde55ba",
        "properties": {
          "fillColor": "#f5cd6c",
          "borderColor": "#f5cd6c"
        }
      },
      "calloutTopic": {
        "id": "b002e72e-f0f6-4d1b-98c4-4d5e17d441b7",
        "properties": {
          "fillColor": "#f5cd6c",
          "borderColor": "#f5cd6c"
        }
      },
      "importantTopic": {
        "id": "0808aac3-8c6e-4f87-bd05-fb49978e2e4a",
        "properties": {
          "fillColor": "#71d4ff",
          "borderColor": "#71d4ff"
        }
      },
      "minorTopic": {
        "id": "76b9c9da-c90b-419d-9589-b7333672e3b7",
        "properties": {
          "fillColor": "#7871ff",
          "borderColor": "#7871ff"
        }
      },
      "boundary": {
        "id": "53b7ad1c-89d2-430b-b2d7-524fe4354434",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "summary": {
        "id": "de5e7710-612d-4dcf-ad44-ff54f8b130ed",
        "properties": {
          "lineColor": "#ffffff"
        }
      },
      "relationship": {
        "id": "233ed8fa-227b-4d0c-8866-a6a8528dfe96",
        "properties": {
          "lineColor": "#ffffff"
        }
      }
    }
  },
  {
    "id": "Candy-#f5cd6c-TYPE_B",
    "tags": [
      "Candy",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "034d25e4-f33a-440a-bf3c-507da7c349c0",
        "properties": {
          "fillColor": "#f5cd6c",
          "multiLineColors": "",
          "color-list": "#ffffff #FF9C72 #f5cd6c #F09E3A #9cc3e4 #54A6D6"
        }
      },
      "centralTopic": {
        "id": "608f68aa-6cc8-4575-bf8a-f42fc944e211",
        "properties": {
          "fillColor": "#54A6D6",
          "lineColor": "#54A6D6"
        }
      },
      "mainTopic": {
        "id": "9379a960-4e4c-4d99-9ed7-10b5facd558a",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "59c00b5f-2929-4e16-bc84-dfc5d6d33534",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "a84ff7e1-8d6f-454a-86f1-56996a3b7ebb",
        "properties": {
          "fillColor": "#F09E3A",
          "borderColor": "#F09E3A"
        }
      },
      "summaryTopic": {
        "id": "705f5fe9-0155-49dc-91be-cf6153c061ca",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "calloutTopic": {
        "id": "63d535a9-ebce-4704-bf81-0f0b09f5340d",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "importantTopic": {
        "id": "a8d3ebac-c631-4316-bb3c-427de1c9bfe3",
        "properties": {
          "fillColor": "#6b93f5",
          "borderColor": "#6b93f5"
        }
      },
      "minorTopic": {
        "id": "817b3aa6-b66d-47e9-9d07-48ac1373614b",
        "properties": {
          "fillColor": "#aa6af5",
          "borderColor": "#aa6af5"
        }
      },
      "boundary": {
        "id": "534a4f10-1249-46bc-837a-5acd39b36c32",
        "properties": {
          "fillColor": "#54A6D6",
          "lineColor": "#54A6D6"
        }
      },
      "summary": {
        "id": "a58f07de-b648-44b3-87ea-b7f3af4cd1dc",
        "properties": {
          "lineColor": "#54A6D6"
        }
      },
      "relationship": {
        "id": "fcfb7aea-0626-45ad-8f3b-82f01cee648c",
        "properties": {
          "lineColor": "#54A6D6"
        }
      }
    }
  },
  {
    "id": "Candy-#F09E3A-TYPE_B",
    "tags": [
      "Candy",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "b19f9f7f-9992-4dff-9f6c-0b679ef50fcc",
        "properties": {
          "fillColor": "#F09E3A",
          "multiLineColors": "",
          "color-list": "#ffffff #FF9C72 #f5cd6c #F09E3A #9cc3e4 #54A6D6"
        }
      },
      "centralTopic": {
        "id": "3f954bdc-2daf-4f90-9c6a-b894d25d5616",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "2f358dbc-e537-4aec-a083-0956b4b76dc2",
        "properties": {
          "fillColor": "#f5cd6c"
        }
      },
      "subTopic": {
        "id": "30f2efb6-3650-47d9-8eea-1080ed47f8ba",
        "properties": {
          "fillColor": "#ffe685"
        }
      },
      "floatingTopic": {
        "id": "40f8fb9a-df2f-461d-b657-afe95f0a8a16",
        "properties": {
          "fillColor": "#f5cd6c",
          "borderColor": "#f5cd6c"
        }
      },
      "summaryTopic": {
        "id": "1e43a314-0fe8-4c80-a9a5-0f860d1c0b21",
        "properties": {
          "fillColor": "#f5cd6c",
          "borderColor": "#f5cd6c"
        }
      },
      "calloutTopic": {
        "id": "293ddd43-be8b-43ee-94dd-82cca1f79337",
        "properties": {
          "fillColor": "#f5cd6c",
          "borderColor": "#f5cd6c"
        }
      },
      "importantTopic": {
        "id": "c1313552-8e7f-4760-8898-72f770c13ab2",
        "properties": {
          "fillColor": "#3a8bf0",
          "borderColor": "#3a8bf0"
        }
      },
      "minorTopic": {
        "id": "bbcb32c1-9e91-4d60-b120-ff82f6c858b7",
        "properties": {
          "fillColor": "#713af0",
          "borderColor": "#713af0"
        }
      },
      "boundary": {
        "id": "e6d91f09-ae34-4cae-8077-0dcf4d766cab",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "summary": {
        "id": "5d49eef3-6e23-4559-8639-4dfb3feb3d34",
        "properties": {
          "lineColor": "#ffffff"
        }
      },
      "relationship": {
        "id": "06adb0fa-c123-4098-a8af-12bbe34022d0",
        "properties": {
          "lineColor": "#ffffff"
        }
      }
    }
  },
  {
    "id": "Candy-#9cc3e4-TYPE_B",
    "tags": [
      "Candy",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "3e7c3927-9c28-4377-8901-3edf24f98f9d",
        "properties": {
          "fillColor": "#9cc3e4",
          "multiLineColors": "",
          "color-list": "#ffffff #FF9C72 #f5cd6c #F09E3A #9cc3e4 #54A6D6"
        }
      },
      "centralTopic": {
        "id": "5f6ef766-d8d0-42fa-8967-d03ea128358d",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "134ed5cc-bad7-4f3f-b6cd-524ac2c47161",
        "properties": {
          "fillColor": "#54A6D6"
        }
      },
      "subTopic": {
        "id": "7005367a-df13-428b-af9e-5b61edd5838e",
        "properties": {
          "fillColor": "#6dbfef"
        }
      },
      "floatingTopic": {
        "id": "9ddd394e-c2e3-42da-ae40-9ff0e834be9a",
        "properties": {
          "fillColor": "#54A6D6",
          "borderColor": "#54A6D6"
        }
      },
      "summaryTopic": {
        "id": "d2404205-a28b-4be1-96b2-00d7d61228d5",
        "properties": {
          "fillColor": "#54A6D6",
          "borderColor": "#54A6D6"
        }
      },
      "calloutTopic": {
        "id": "40613265-fd24-478a-b509-c872dc9c5663",
        "properties": {
          "fillColor": "#54A6D6",
          "borderColor": "#54A6D6"
        }
      },
      "importantTopic": {
        "id": "1b9b4138-4af8-4c86-a5fe-00d3556fbc42",
        "properties": {
          "fillColor": "#e3bd9c",
          "borderColor": "#e3bd9c"
        }
      },
      "minorTopic": {
        "id": "36ba1cfe-4abd-47e3-8542-4379885d5a46",
        "properties": {
          "fillColor": "#d3e39b",
          "borderColor": "#d3e39b"
        }
      },
      "boundary": {
        "id": "5cb32ef0-4065-40cf-acf8-608706c6c67b",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "summary": {
        "id": "b15b7576-3673-4c76-8317-4c100c47d08e",
        "properties": {
          "lineColor": "#ffffff"
        }
      },
      "relationship": {
        "id": "d3affcd7-b465-4fd6-8721-e1e918585410",
        "properties": {
          "lineColor": "#ffffff"
        }
      }
    }
  },
  {
    "id": "Candy-#54A6D6-TYPE_B",
    "tags": [
      "Candy",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "149421eb-0876-4831-be4a-c6dd674e4a0d",
        "properties": {
          "fillColor": "#54A6D6",
          "multiLineColors": "",
          "color-list": "#ffffff #FF9C72 #f5cd6c #F09E3A #9cc3e4 #54A6D6"
        }
      },
      "centralTopic": {
        "id": "7018babf-29aa-4d87-b2f6-1d38bac003f5",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "623a7d77-b74a-4e08-90f7-f25234185d56",
        "properties": {
          "fillColor": "#f5cd6c"
        }
      },
      "subTopic": {
        "id": "b08f5f9b-f1e0-4bc4-8da5-a6abf77d66c9",
        "properties": {
          "fillColor": "#ffe685"
        }
      },
      "floatingTopic": {
        "id": "3e73358b-78a1-4c0a-895e-094344c47359",
        "properties": {
          "fillColor": "#9cc3e4",
          "borderColor": "#9cc3e4"
        }
      },
      "summaryTopic": {
        "id": "e86af2bb-8a24-49a1-acdd-ae3069b13406",
        "properties": {
          "fillColor": "#f5cd6c",
          "borderColor": "#f5cd6c"
        }
      },
      "calloutTopic": {
        "id": "a12ac5fa-9a34-4198-af2b-ac4b167281e2",
        "properties": {
          "fillColor": "#f5cd6c",
          "borderColor": "#f5cd6c"
        }
      },
      "importantTopic": {
        "id": "03bf47c4-b822-4b71-9f02-89b4bb12435c",
        "properties": {
          "fillColor": "#d68453",
          "borderColor": "#d68453"
        }
      },
      "minorTopic": {
        "id": "fd5acc46-9520-4bd4-b6a4-b26ae4b4ed85",
        "properties": {
          "fillColor": "#c5d553",
          "borderColor": "#c5d553"
        }
      },
      "boundary": {
        "id": "6e086f0b-8132-4424-a1a8-44c60a0927aa",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "summary": {
        "id": "94b9d865-f34e-422d-beb4-23c121e651b3",
        "properties": {
          "lineColor": "#ffffff"
        }
      },
      "relationship": {
        "id": "2e3deea4-f44a-4136-bd38-900f6a9053d9",
        "properties": {
          "lineColor": "#ffffff"
        }
      }
    }
  },
  {
    "id": "Candy-#ffffff-MULTI_LINE_COLORS",
    "tags": [
      "Candy",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "8267d0bc-fcba-4ac8-82d5-b809b97970ce",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "#FF9C72 #f5cd6c #F09E3A #9cc3e4",
          "color-list": "#ffffff #FF9C72 #f5cd6c #F09E3A #9cc3e4 #54A6D6"
        }
      },
      "centralTopic": {
        "id": "4c4866de-77f7-4bcd-bbd3-4ebe4174b38a",
        "properties": {
          "fillColor": "#54A6D6",
          "lineColor": "#54A6D6"
        }
      },
      "mainTopic": {
        "id": "e5bd093e-9c71-481e-9a65-753a4bbd4854",
        "properties": {}
      },
      "subTopic": {
        "id": "ef8ef632-5b34-49c3-aaf2-c35bff6f9f8c",
        "properties": {}
      },
      "floatingTopic": {
        "id": "56b73bc1-7f62-44f9-a24d-7fee75bae11b",
        "properties": {
          "fillColor": "#FF9C72",
          "borderColor": "#FF9C72"
        }
      },
      "summaryTopic": {
        "id": "cbdb36ed-19f7-46e7-b6cf-e656af959184",
        "properties": {
          "fillColor": "#F09E3A",
          "borderColor": "#F09E3A"
        }
      },
      "calloutTopic": {
        "id": "3867d09e-1956-4ae1-a9ed-dc36ab47b36e",
        "properties": {
          "fillColor": "#F09E3A",
          "borderColor": "#F09E3A"
        }
      },
      "importantTopic": {
        "id": "9232680a-5cb0-4fb1-a8fa-9677e027cb28",
        "properties": {
          "fillColor": "#d4ff71",
          "borderColor": "#d4ff71"
        }
      },
      "minorTopic": {
        "id": "1453c603-57f9-4516-8949-68a8b7f455d5",
        "properties": {
          "fillColor": "#8453d6",
          "borderColor": "#8453d6"
        }
      },
      "boundary": {
        "id": "8cdd0bf1-6292-41bf-8a31-10609b521906",
        "properties": {
          "fillColor": "#54A6D6",
          "lineColor": "#54A6D6"
        }
      },
      "summary": {
        "id": "e6e1a0c2-4d97-4c86-82d6-aa530535bb99",
        "properties": {
          "lineColor": "#54A6D6"
        }
      },
      "relationship": {
        "id": "6403a1c9-44c8-46b4-bbd3-651eb575f918",
        "properties": {
          "lineColor": "#54A6D6"
        }
      }
    }
  },
  {
    "id": "GreenTea-#D6D9C3-TYPE_A",
    "tags": [
      "GreenTea",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "5a44c73b-1e2f-4dd8-b488-db0f4c02c7a4",
        "properties": {
          "fillColor": "#D6D9C3",
          "multiLineColors": "",
          "color-list": "#D6D9C3 #b6ad90 #579360 #656d4a #265834 #1F2B1D"
        }
      },
      "centralTopic": {
        "id": "57d4527e-326b-41ad-88e3-5c47b27ff4b2",
        "properties": {
          "fillColor": "#1F2B1D",
          "lineColor": "#1F2B1D"
        }
      },
      "mainTopic": {
        "id": "7999947f-ad14-4a92-9ece-e11dc531425f",
        "properties": {
          "fillColor": "#265834"
        }
      },
      "subTopic": {
        "id": "3545da46-26ad-444e-bc2b-6294adab1b6f",
        "properties": {
          "fillColor": "#c1c5a4"
        }
      },
      "floatingTopic": {
        "id": "70c78a53-c6eb-4656-9fff-31ce19c6a4b1",
        "properties": {
          "fillColor": "#579360",
          "borderColor": "#579360"
        }
      },
      "summaryTopic": {
        "id": "f40a87bf-5897-480d-805a-01e6b9a696b4",
        "properties": {
          "fillColor": "#265834",
          "borderColor": "#265834"
        }
      },
      "calloutTopic": {
        "id": "aceef4a6-7793-433e-bf79-ad8e6a58c6b4",
        "properties": {
          "fillColor": "#265834",
          "borderColor": "#265834"
        }
      },
      "importantTopic": {
        "id": "deee917f-2f1d-4fe9-b7b3-9d9e878b6bc8",
        "properties": {
          "fillColor": "#656d4a",
          "borderColor": "#656d4a"
        }
      },
      "minorTopic": {
        "id": "f647b695-1a25-4d06-84ba-5fe68438e23b",
        "properties": {
          "fillColor": "#1F2B1D",
          "borderColor": "#1F2B1D"
        }
      },
      "boundary": {
        "id": "e7e1bba1-5837-4c5e-8cbc-0d04d7fd081e",
        "properties": {
          "fillColor": "#1F2B1D",
          "lineColor": "#1F2B1D"
        }
      },
      "summary": {
        "id": "e6e72b1f-8df2-42c0-a68c-b2a1d831e397",
        "properties": {
          "lineColor": "#1F2B1D"
        }
      },
      "relationship": {
        "id": "e6b4c708-bc2e-476d-a994-81a81188dc32",
        "properties": {
          "lineColor": "#1F2B1D"
        }
      }
    }
  },
  {
    "id": "GreenTea-#b6ad90-TYPE_B",
    "tags": [
      "GreenTea",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "1b5f6ae2-98bb-4978-94bd-4b54b52e8048",
        "properties": {
          "fillColor": "#b6ad90",
          "multiLineColors": "",
          "color-list": "#D6D9C3 #b6ad90 #579360 #656d4a #265834 #1F2B1D"
        }
      },
      "centralTopic": {
        "id": "3f006f81-dcc8-497f-b84d-51895ce852b5",
        "properties": {
          "fillColor": "#1F2B1D",
          "lineColor": "#1F2B1D"
        }
      },
      "mainTopic": {
        "id": "7add312a-734d-44b2-8dd2-a9848a4ff824",
        "properties": {
          "fillColor": "#1F2B1D"
        }
      },
      "subTopic": {
        "id": "6b19029b-6b47-492a-9d51-e4e2b4cb1139",
        "properties": {
          "fillColor": "#384436"
        }
      },
      "floatingTopic": {
        "id": "623d03da-11ab-4760-a3d8-b2dd5bf18540",
        "properties": {
          "fillColor": "#579360",
          "borderColor": "#579360"
        }
      },
      "summaryTopic": {
        "id": "7987af2a-5ae8-4308-ab63-389d68fab5df",
        "properties": {
          "fillColor": "#1F2B1D",
          "borderColor": "#1F2B1D"
        }
      },
      "calloutTopic": {
        "id": "030eeaa9-024f-4d4a-8dcd-919d112fc77e",
        "properties": {
          "fillColor": "#1F2B1D",
          "borderColor": "#1F2B1D"
        }
      },
      "importantTopic": {
        "id": "7a8ea7e0-8848-4275-bb10-872d300cbf45",
        "properties": {
          "fillColor": "#9099b5",
          "borderColor": "#9099b5"
        }
      },
      "minorTopic": {
        "id": "3a6d3db9-d28e-4bb0-8a99-04517a3bc60a",
        "properties": {
          "fillColor": "#a290b4",
          "borderColor": "#a290b4"
        }
      },
      "boundary": {
        "id": "92d3a5e1-f339-4be7-9b8a-9837e93d6be3",
        "properties": {
          "fillColor": "#1F2B1D",
          "lineColor": "#1F2B1D"
        }
      },
      "summary": {
        "id": "2ece8d21-4cd3-4005-9c60-e469d9c5f1b0",
        "properties": {
          "lineColor": "#1F2B1D"
        }
      },
      "relationship": {
        "id": "6e6fdfd2-e068-4962-b525-d25b2bc1ed72",
        "properties": {
          "lineColor": "#1F2B1D"
        }
      }
    }
  },
  {
    "id": "GreenTea-#579360-TYPE_B",
    "tags": [
      "GreenTea",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "e6aa0c3a-7041-477b-b7c5-ed29e1b2261f",
        "properties": {
          "fillColor": "#579360",
          "multiLineColors": "",
          "color-list": "#D6D9C3 #b6ad90 #579360 #656d4a #265834 #1F2B1D"
        }
      },
      "centralTopic": {
        "id": "a85a74af-dec9-4491-838e-ea6c611de5ce",
        "properties": {
          "fillColor": "#1F2B1D",
          "lineColor": "#1F2B1D"
        }
      },
      "mainTopic": {
        "id": "b9470da2-03c7-4b24-9eba-2a67f8e8cdbf",
        "properties": {
          "fillColor": "#1F2B1D"
        }
      },
      "subTopic": {
        "id": "81f66f28-9f9a-4c4c-97ce-5cd55fb994d4",
        "properties": {
          "fillColor": "#384436"
        }
      },
      "floatingTopic": {
        "id": "fe5b854a-96a2-45f7-9d86-10d45d2aa307",
        "properties": {
          "fillColor": "#D6D9C3",
          "borderColor": "#D6D9C3"
        }
      },
      "summaryTopic": {
        "id": "106209d6-63ac-484c-adf6-971fdd2e6d99",
        "properties": {
          "fillColor": "#1F2B1D",
          "borderColor": "#1F2B1D"
        }
      },
      "calloutTopic": {
        "id": "d3afd544-e65a-411d-87bb-470dc05b927e",
        "properties": {
          "fillColor": "#1F2B1D",
          "borderColor": "#1F2B1D"
        }
      },
      "importantTopic": {
        "id": "dbd722a8-9963-44d5-a6e3-a26805e84fdf",
        "properties": {
          "fillColor": "#93578a",
          "borderColor": "#93578a"
        }
      },
      "minorTopic": {
        "id": "21a22746-4a4f-4104-b7fc-fde906e654e6",
        "properties": {
          "fillColor": "#93575d",
          "borderColor": "#93575d"
        }
      },
      "boundary": {
        "id": "b89451a7-a471-43f7-b38c-d5efaed03d05",
        "properties": {
          "fillColor": "#1F2B1D",
          "lineColor": "#1F2B1D"
        }
      },
      "summary": {
        "id": "e13794dd-3de0-4ef1-9300-bdfc7d367186",
        "properties": {
          "lineColor": "#1F2B1D"
        }
      },
      "relationship": {
        "id": "f53b493d-2a06-4277-823a-faad2ce051c4",
        "properties": {
          "lineColor": "#1F2B1D"
        }
      }
    }
  },
  {
    "id": "GreenTea-#656d4a-TYPE_B",
    "tags": [
      "GreenTea",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "183069b3-3aa1-4757-a2a4-2aa1fc31af52",
        "properties": {
          "fillColor": "#656d4a",
          "multiLineColors": "",
          "color-list": "#D6D9C3 #b6ad90 #579360 #656d4a #265834 #1F2B1D"
        }
      },
      "centralTopic": {
        "id": "e868c275-2554-423e-a7e4-33f958441125",
        "properties": {
          "fillColor": "#D6D9C3",
          "lineColor": "#D6D9C3"
        }
      },
      "mainTopic": {
        "id": "97b76ea4-ef27-446f-b97b-645a1224a55a",
        "properties": {
          "fillColor": "#D6D9C3"
        }
      },
      "subTopic": {
        "id": "3c9f58e7-4706-4d0e-b283-88acf6c87e96",
        "properties": {
          "fillColor": "#eff2dc"
        }
      },
      "floatingTopic": {
        "id": "e4d6570c-456c-480b-a412-43b6da10e2bf",
        "properties": {
          "fillColor": "#b6ad90",
          "borderColor": "#b6ad90"
        }
      },
      "summaryTopic": {
        "id": "5dffbce4-4061-43ae-9bb7-91d30ead4412",
        "properties": {
          "fillColor": "#D6D9C3",
          "borderColor": "#D6D9C3"
        }
      },
      "calloutTopic": {
        "id": "af403ced-8b6b-40ea-9c4f-7ee10a0d9e96",
        "properties": {
          "fillColor": "#D6D9C3",
          "borderColor": "#D6D9C3"
        }
      },
      "importantTopic": {
        "id": "52b9b9ce-6fbf-4ada-98d8-ecd7d97494fa",
        "properties": {
          "fillColor": "#524a6d",
          "borderColor": "#524a6d"
        }
      },
      "minorTopic": {
        "id": "bf63cab8-e523-48c7-92b9-0f790c6fe764",
        "properties": {
          "fillColor": "#6c4a6d",
          "borderColor": "#6c4a6d"
        }
      },
      "boundary": {
        "id": "34055c67-cee9-4083-8b9a-24c39491b256",
        "properties": {
          "fillColor": "#D6D9C3",
          "lineColor": "#D6D9C3"
        }
      },
      "summary": {
        "id": "af9edbb8-8f3f-478d-b04f-6b4edd112879",
        "properties": {
          "lineColor": "#D6D9C3"
        }
      },
      "relationship": {
        "id": "67e6ca26-2d85-45bf-8c57-b415ad22640d",
        "properties": {
          "lineColor": "#D6D9C3"
        }
      }
    }
  },
  {
    "id": "GreenTea-#265834-TYPE_B",
    "tags": [
      "GreenTea",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "1fdbd10a-aaaf-4004-bb8e-60581958a9ab",
        "properties": {
          "fillColor": "#265834",
          "multiLineColors": "",
          "color-list": "#D6D9C3 #b6ad90 #579360 #656d4a #265834 #1F2B1D"
        }
      },
      "centralTopic": {
        "id": "92a6e18f-d93d-4ce9-8c6e-4fef41de0f44",
        "properties": {
          "fillColor": "#D6D9C3",
          "lineColor": "#D6D9C3"
        }
      },
      "mainTopic": {
        "id": "75e1a9b5-95a4-4295-a147-50f11abcc881",
        "properties": {
          "fillColor": "#D6D9C3"
        }
      },
      "subTopic": {
        "id": "db441b06-9842-4147-a407-5c39c8ed74e6",
        "properties": {
          "fillColor": "#eff2dc"
        }
      },
      "floatingTopic": {
        "id": "3486d903-1df4-4ef0-933d-df89fa9150c8",
        "properties": {
          "fillColor": "#b6ad90",
          "borderColor": "#b6ad90"
        }
      },
      "summaryTopic": {
        "id": "87ae1cd6-931e-4d5f-a073-c67ff8baa6b9",
        "properties": {
          "fillColor": "#D6D9C3",
          "borderColor": "#D6D9C3"
        }
      },
      "calloutTopic": {
        "id": "fdb8b42c-bad7-4eee-a6ae-1e1e3d9654a8",
        "properties": {
          "fillColor": "#D6D9C3",
          "borderColor": "#D6D9C3"
        }
      },
      "importantTopic": {
        "id": "4eda827e-9629-4594-a406-9e1de072f280",
        "properties": {
          "fillColor": "#582649",
          "borderColor": "#582649"
        }
      },
      "minorTopic": {
        "id": "305a6562-8b45-4ae5-bb18-510a3d8f7022",
        "properties": {
          "fillColor": "#582826",
          "borderColor": "#582826"
        }
      },
      "boundary": {
        "id": "35965331-13e1-4bc8-bd16-792159d33db3",
        "properties": {
          "fillColor": "#D6D9C3",
          "lineColor": "#D6D9C3"
        }
      },
      "summary": {
        "id": "1496ed42-b2ba-4caf-9b96-e5a93543bca2",
        "properties": {
          "lineColor": "#D6D9C3"
        }
      },
      "relationship": {
        "id": "6844f62f-1198-4e26-b01e-28f01268f6bb",
        "properties": {
          "lineColor": "#D6D9C3"
        }
      }
    }
  },
  {
    "id": "GreenTea-#1F2B1D-TYPE_C",
    "tags": [
      "GreenTea",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "fa71aed7-ffa2-4232-bad5-e1a4891b5db5",
        "properties": {
          "fillColor": "#1F2B1D",
          "multiLineColors": "",
          "color-list": "#D6D9C3 #b6ad90 #579360 #656d4a #265834 #1F2B1D"
        }
      },
      "centralTopic": {
        "id": "28ef1600-be0b-4f17-91ed-533ce64f661d",
        "properties": {
          "fillColor": "#D6D9C3",
          "lineColor": "#D6D9C3"
        }
      },
      "mainTopic": {
        "id": "5f89bc8d-cd04-4f37-b9f5-a8f300d2c7f9",
        "properties": {
          "fillColor": "#b6ad90"
        }
      },
      "subTopic": {
        "id": "11d296c3-e785-4e1a-88f5-1ae36d95339c",
        "properties": {
          "fillColor": "#384436"
        }
      },
      "floatingTopic": {
        "id": "23ec06b3-060b-4d71-b13a-6f6a79d7a80e",
        "properties": {
          "fillColor": "#579360",
          "borderColor": "#579360"
        }
      },
      "summaryTopic": {
        "id": "947ef7a0-465c-4b84-8dec-e4aadd46603c",
        "properties": {
          "fillColor": "#b6ad90",
          "borderColor": "#b6ad90"
        }
      },
      "calloutTopic": {
        "id": "4e377b9c-7fe8-437b-986b-8c9301372a61",
        "properties": {
          "fillColor": "#b6ad90",
          "borderColor": "#b6ad90"
        }
      },
      "importantTopic": {
        "id": "ab18f30f-07aa-474a-8901-622f266357f3",
        "properties": {
          "fillColor": "#579360",
          "borderColor": "#579360"
        }
      },
      "minorTopic": {
        "id": "e3871d21-654e-4f02-8978-848e7763eef3",
        "properties": {
          "fillColor": "#D6D9C3",
          "borderColor": "#D6D9C3"
        }
      },
      "boundary": {
        "id": "7db97c51-84ea-4275-9248-31a4dca754d0",
        "properties": {
          "fillColor": "#D6D9C3",
          "lineColor": "#D6D9C3"
        }
      },
      "summary": {
        "id": "d1a1c154-a84e-466f-8484-f76de0958b85",
        "properties": {
          "lineColor": "#D6D9C3"
        }
      },
      "relationship": {
        "id": "4cbf39a8-3f24-43e6-a956-b99619916775",
        "properties": {
          "lineColor": "#D6D9C3"
        }
      }
    }
  },
  {
    "id": "GreenTea-#1F2B1D-MULTI_LINE_COLORS",
    "tags": [
      "GreenTea",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "5dfe1c76-d84f-45c2-ad7e-bcfe4380acd0",
        "properties": {
          "fillColor": "#1F2B1D",
          "multiLineColors": "#b6ad90 #579360 #656d4a #265834",
          "color-list": "#D6D9C3 #b6ad90 #579360 #656d4a #265834 #1F2B1D"
        }
      },
      "centralTopic": {
        "id": "8521710f-94a5-48a5-9909-5a3f613405ae",
        "properties": {
          "fillColor": "#D6D9C3",
          "lineColor": "#D6D9C3"
        }
      },
      "mainTopic": {
        "id": "498f61a3-8942-4add-839d-9e5e2fdbe85f",
        "properties": {}
      },
      "subTopic": {
        "id": "245e91d8-2da3-4203-a00b-d1e25fb0e8b3",
        "properties": {}
      },
      "floatingTopic": {
        "id": "b63d0bee-5b14-4e85-8714-629baf12890f",
        "properties": {
          "fillColor": "#579360",
          "borderColor": "#579360"
        }
      },
      "summaryTopic": {
        "id": "52e743e6-f6d8-4754-ac9a-b61cad6ec1e3",
        "properties": {
          "fillColor": "#b6ad90",
          "borderColor": "#b6ad90"
        }
      },
      "calloutTopic": {
        "id": "73c3d0fb-7a00-4b40-8389-35e4e87848c2",
        "properties": {
          "fillColor": "#b6ad90",
          "borderColor": "#b6ad90"
        }
      },
      "importantTopic": {
        "id": "bc493d3d-2f50-49ff-a07b-4f4509abfa55",
        "properties": {
          "fillColor": "#578993",
          "borderColor": "#578993"
        }
      },
      "minorTopic": {
        "id": "b8ecab92-b3f9-4bd5-80e9-7724a4ef0929",
        "properties": {
          "fillColor": "#c3d9c6",
          "borderColor": "#c3d9c6"
        }
      },
      "boundary": {
        "id": "f819ea8a-c186-42ec-b096-a055bb376eb4",
        "properties": {
          "fillColor": "#D6D9C3",
          "lineColor": "#D6D9C3"
        }
      },
      "summary": {
        "id": "bac4a743-69ea-4a21-ac67-23181b5d5997",
        "properties": {
          "lineColor": "#D6D9C3"
        }
      },
      "relationship": {
        "id": "db39ae35-5104-4b63-9dcf-19fbdbb69e0f",
        "properties": {
          "lineColor": "#D6D9C3"
        }
      }
    }
  },
  {
    "id": "CyberPunk-#ffffff-TYPE_A",
    "tags": [
      "CyberPunk",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "8373441f-d5c3-4b6a-8118-8c9f52087cd5",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #72efdd #56cfe1 #4ea8de #5e60ce #7400b8"
        }
      },
      "centralTopic": {
        "id": "b5fdfc83-5b6d-4c95-89e1-59c92ad4eb24",
        "properties": {
          "fillColor": "#7400b8",
          "lineColor": "#7400b8"
        }
      },
      "mainTopic": {
        "id": "a1fba9f6-3811-464e-aff2-c7355bdb5a89",
        "properties": {
          "fillColor": "#4ea8de"
        }
      },
      "subTopic": {
        "id": "febaf316-31df-44d9-a301-9ead16c32bad",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "2faebb8d-d814-4e8a-8b0c-9c967084b23d",
        "properties": {
          "fillColor": "#5e60ce",
          "borderColor": "#5e60ce"
        }
      },
      "summaryTopic": {
        "id": "0fd3deac-8206-41eb-9833-0e530f4fcec0",
        "properties": {
          "fillColor": "#4ea8de",
          "borderColor": "#4ea8de"
        }
      },
      "calloutTopic": {
        "id": "20377972-2cb2-4b71-b5fe-b1e41f44471b",
        "properties": {
          "fillColor": "#4ea8de",
          "borderColor": "#4ea8de"
        }
      },
      "importantTopic": {
        "id": "4c4b2765-4088-4350-b7db-708915f96f4a",
        "properties": {
          "fillColor": "#5e60ce",
          "borderColor": "#5e60ce"
        }
      },
      "minorTopic": {
        "id": "b21ea975-5f56-4f67-85cc-7a438ad7edcf",
        "properties": {
          "fillColor": "#7400b8",
          "borderColor": "#7400b8"
        }
      },
      "boundary": {
        "id": "f647f5a2-9979-46dc-91a7-ddcc557c676a",
        "properties": {
          "fillColor": "#7400b8",
          "lineColor": "#7400b8"
        }
      },
      "summary": {
        "id": "5197ed98-d7ce-4cdd-9f58-8b368ae751e6",
        "properties": {
          "lineColor": "#7400b8"
        }
      },
      "relationship": {
        "id": "190b55bf-2817-44ac-bd4a-856b46e33688",
        "properties": {
          "lineColor": "#7400b8"
        }
      }
    }
  },
  {
    "id": "CyberPunk-#72efdd-TYPE_B",
    "tags": [
      "CyberPunk",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "ec32eff1-9fae-4767-8b81-e06a02b2eab5",
        "properties": {
          "fillColor": "#72efdd",
          "multiLineColors": "",
          "color-list": "#ffffff #72efdd #56cfe1 #4ea8de #5e60ce #7400b8"
        }
      },
      "centralTopic": {
        "id": "35cf426f-8dd0-45b3-96e4-f8205ab7d2fc",
        "properties": {
          "fillColor": "#7400b8",
          "lineColor": "#7400b8"
        }
      },
      "mainTopic": {
        "id": "b2318733-cde0-40db-b51a-119c2d736e70",
        "properties": {
          "fillColor": "#7400b8"
        }
      },
      "subTopic": {
        "id": "27734fcf-9663-460d-8019-98619bca7681",
        "properties": {
          "fillColor": "#8d19d1"
        }
      },
      "floatingTopic": {
        "id": "f0a46e99-f0d8-4d90-b0d5-b1601a2e588b",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "9662f5ee-64be-4242-94c8-4cee2315841d",
        "properties": {
          "fillColor": "#7400b8",
          "borderColor": "#7400b8"
        }
      },
      "calloutTopic": {
        "id": "493e6765-6046-4522-a9cd-9ba829daddd8",
        "properties": {
          "fillColor": "#7400b8",
          "borderColor": "#7400b8"
        }
      },
      "importantTopic": {
        "id": "be9d0747-7315-4ef0-9001-c256d442d737",
        "properties": {
          "fillColor": "#ee7283",
          "borderColor": "#ee7283"
        }
      },
      "minorTopic": {
        "id": "6190e750-675c-4c5d-98f9-8e8d18f0cc15",
        "properties": {
          "fillColor": "#eebe71",
          "borderColor": "#eebe71"
        }
      },
      "boundary": {
        "id": "e7051285-a9ab-4414-ad1a-55fec0cd8b3c",
        "properties": {
          "fillColor": "#7400b8",
          "lineColor": "#7400b8"
        }
      },
      "summary": {
        "id": "b9f1ba00-1437-48c4-8a93-c6f03b689ccd",
        "properties": {
          "lineColor": "#7400b8"
        }
      },
      "relationship": {
        "id": "845fc7ea-4f97-4a7e-8540-1b272f59c3d1",
        "properties": {
          "lineColor": "#7400b8"
        }
      }
    }
  },
  {
    "id": "CyberPunk-#56cfe1-TYPE_B",
    "tags": [
      "CyberPunk",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "0a513e62-7974-4d7a-acd1-468a47487311",
        "properties": {
          "fillColor": "#56cfe1",
          "multiLineColors": "",
          "color-list": "#ffffff #72efdd #56cfe1 #4ea8de #5e60ce #7400b8"
        }
      },
      "centralTopic": {
        "id": "c0abd8fe-9bee-408b-82de-3379fe3cce03",
        "properties": {
          "fillColor": "#7400b8",
          "lineColor": "#7400b8"
        }
      },
      "mainTopic": {
        "id": "79870a39-1438-4953-bfe7-39f5f03c0304",
        "properties": {
          "fillColor": "#7400b8"
        }
      },
      "subTopic": {
        "id": "e84ee7a8-e353-4f4d-9dd0-4e3e7c3e774a",
        "properties": {
          "fillColor": "#8d19d1"
        }
      },
      "floatingTopic": {
        "id": "f7b5524f-dd65-4fc1-a975-54bbb3661571",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "27cb8ab2-3f28-4624-bda5-8244c3a95ecd",
        "properties": {
          "fillColor": "#7400b8",
          "borderColor": "#7400b8"
        }
      },
      "calloutTopic": {
        "id": "60f5ef2e-e5c7-4081-8520-c8c6367eee54",
        "properties": {
          "fillColor": "#7400b8",
          "borderColor": "#7400b8"
        }
      },
      "importantTopic": {
        "id": "09725a82-f53b-4aa4-9872-39500e504390",
        "properties": {
          "fillColor": "#e16756",
          "borderColor": "#e16756"
        }
      },
      "minorTopic": {
        "id": "27412dfe-d97b-4c00-9ae7-e9aa4026bca1",
        "properties": {
          "fillColor": "#e1cf56",
          "borderColor": "#e1cf56"
        }
      },
      "boundary": {
        "id": "19d4632c-0c4c-4439-b079-d638a836e790",
        "properties": {
          "fillColor": "#7400b8",
          "lineColor": "#7400b8"
        }
      },
      "summary": {
        "id": "2c98e3a8-1696-471c-ac79-b192cd1be8c0",
        "properties": {
          "lineColor": "#7400b8"
        }
      },
      "relationship": {
        "id": "f62eead3-0f1a-44f1-a30a-d78270634cc5",
        "properties": {
          "lineColor": "#7400b8"
        }
      }
    }
  },
  {
    "id": "CyberPunk-#4ea8de-TYPE_B",
    "tags": [
      "CyberPunk",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "b5463a3c-2e15-4ebc-8421-baceff67868b",
        "properties": {
          "fillColor": "#4ea8de",
          "multiLineColors": "",
          "color-list": "#ffffff #72efdd #56cfe1 #4ea8de #5e60ce #7400b8"
        }
      },
      "centralTopic": {
        "id": "7933cdc7-8b6e-475f-9fb9-39597a869147",
        "properties": {
          "fillColor": "#7400b8",
          "lineColor": "#7400b8"
        }
      },
      "mainTopic": {
        "id": "9d13720d-9c92-4e73-ae96-5eed87daf97e",
        "properties": {
          "fillColor": "#7400b8"
        }
      },
      "subTopic": {
        "id": "4272c72b-51d2-4255-aeda-c2545f661ff1",
        "properties": {
          "fillColor": "#8d19d1"
        }
      },
      "floatingTopic": {
        "id": "119ea40e-392e-428a-8131-1165775393dd",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "b69cf49b-56c9-48b7-a9ff-a0407b9881e3",
        "properties": {
          "fillColor": "#7400b8",
          "borderColor": "#7400b8"
        }
      },
      "calloutTopic": {
        "id": "a6e17e52-aec5-495d-806b-3ebee455fa8a",
        "properties": {
          "fillColor": "#7400b8",
          "borderColor": "#7400b8"
        }
      },
      "importantTopic": {
        "id": "958c65e5-f66c-4048-b568-e9cb2e775f13",
        "properties": {
          "fillColor": "#dd844e",
          "borderColor": "#dd844e"
        }
      },
      "minorTopic": {
        "id": "a7b317a3-3c7a-460a-9c50-afbb017fdfc9",
        "properties": {
          "fillColor": "#cadd4e",
          "borderColor": "#cadd4e"
        }
      },
      "boundary": {
        "id": "5f0f10bd-4956-48cd-a07d-aef57f862309",
        "properties": {
          "fillColor": "#7400b8",
          "lineColor": "#7400b8"
        }
      },
      "summary": {
        "id": "c39c5fa1-8d45-498b-bf9e-cc30938494c1",
        "properties": {
          "lineColor": "#7400b8"
        }
      },
      "relationship": {
        "id": "67338789-b496-4a28-b42b-49dfaed27d7a",
        "properties": {
          "lineColor": "#7400b8"
        }
      }
    }
  },
  {
    "id": "CyberPunk-#5e60ce-TYPE_B",
    "tags": [
      "CyberPunk",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "0f998869-6105-4046-9421-2317572029ae",
        "properties": {
          "fillColor": "#5e60ce",
          "multiLineColors": "",
          "color-list": "#ffffff #72efdd #56cfe1 #4ea8de #5e60ce #7400b8"
        }
      },
      "centralTopic": {
        "id": "12080933-a87d-4246-ae83-cc48006c1fe8",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "066fc03f-8a3d-4500-ba68-0bb7be6b8f14",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "b27f7925-c55f-4345-a196-e7dabbf23691",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "ba57884f-f253-4e77-b83b-4a11f02063b0",
        "properties": {
          "fillColor": "#72efdd",
          "borderColor": "#72efdd"
        }
      },
      "summaryTopic": {
        "id": "7d5ba3df-eb02-4b27-8b9e-779110a7aa1f",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "calloutTopic": {
        "id": "08170810-5b96-4b14-a93c-2965bcba9b40",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "importantTopic": {
        "id": "897ed81d-ad4d-40f5-9b5c-72fe1cb3f7e9",
        "properties": {
          "fillColor": "#cecc5e",
          "borderColor": "#cecc5e"
        }
      },
      "minorTopic": {
        "id": "823e2be0-c843-4d9e-ae37-5a7210265ef3",
        "properties": {
          "fillColor": "#7bce5e",
          "borderColor": "#7bce5e"
        }
      },
      "boundary": {
        "id": "32952718-5a4a-4b0b-8242-dd3164c55fc8",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "summary": {
        "id": "f32e01c6-781d-47ba-871d-bf893151be27",
        "properties": {
          "lineColor": "#ffffff"
        }
      },
      "relationship": {
        "id": "f9fec7d7-49b0-4f35-be0b-96c25628e124",
        "properties": {
          "lineColor": "#ffffff"
        }
      }
    }
  },
  {
    "id": "CyberPunk-#7400b8-TYPE_A",
    "tags": [
      "CyberPunk",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "05cb195c-b94f-4c2a-84ea-5876873f86e3",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #72efdd #56cfe1 #4ea8de #5e60ce #7400b8"
        }
      },
      "centralTopic": {
        "id": "e3f8aa50-1731-45eb-814b-ce23d065c1bb",
        "properties": {
          "fillColor": "#7400b8",
          "lineColor": "#7400b8"
        }
      },
      "mainTopic": {
        "id": "a0201eff-3769-482f-aa5e-ac98334a2442",
        "properties": {
          "fillColor": "#4ea8de"
        }
      },
      "subTopic": {
        "id": "bdd59df7-7b5f-48e0-accc-b1b86224448f",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "17d28567-844d-4153-8c62-82a090f9ac40",
        "properties": {
          "fillColor": "#5e60ce",
          "borderColor": "#5e60ce"
        }
      },
      "summaryTopic": {
        "id": "b88c6450-fc56-4cab-8ea2-0f0648b75d25",
        "properties": {
          "fillColor": "#4ea8de",
          "borderColor": "#4ea8de"
        }
      },
      "calloutTopic": {
        "id": "c9d58ccf-6b92-419f-97d5-f0160c02a819",
        "properties": {
          "fillColor": "#4ea8de",
          "borderColor": "#4ea8de"
        }
      },
      "importantTopic": {
        "id": "7eed8e6a-a31f-44a8-a29e-d5a9a5c5e2a6",
        "properties": {
          "fillColor": "#5e60ce",
          "borderColor": "#5e60ce"
        }
      },
      "minorTopic": {
        "id": "fd1387ca-9bc6-4a69-ab32-4370f5f3fe09",
        "properties": {
          "fillColor": "#7400b8",
          "borderColor": "#7400b8"
        }
      },
      "boundary": {
        "id": "6dfb1dd4-68c4-4862-8b1d-703c55f0e18f",
        "properties": {
          "fillColor": "#7400b8",
          "lineColor": "#7400b8"
        }
      },
      "summary": {
        "id": "5784ed7e-2d4d-4b00-a956-e0f6992793eb",
        "properties": {
          "lineColor": "#7400b8"
        }
      },
      "relationship": {
        "id": "0f3b4ed5-ade7-4c22-bf96-35a9448bfcc6",
        "properties": {
          "lineColor": "#7400b8"
        }
      }
    }
  },
  {
    "id": "CyberPunk-#ffffff-MULTI_LINE_COLORS",
    "tags": [
      "CyberPunk",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "cfc3db15-b51d-4956-b45f-568787dded0c",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "#72efdd #56cfe1 #4ea8de #5e60ce",
          "color-list": "#ffffff #72efdd #56cfe1 #4ea8de #5e60ce #7400b8"
        }
      },
      "centralTopic": {
        "id": "12cfff61-4e97-426c-9a7c-f7998357aaa2",
        "properties": {
          "fillColor": "#7400b8",
          "lineColor": "#7400b8"
        }
      },
      "mainTopic": {
        "id": "9773db07-e320-4675-a4a0-120b658fcca4",
        "properties": {}
      },
      "subTopic": {
        "id": "28c2d070-27f9-46dc-80fb-59da23850b8e",
        "properties": {}
      },
      "floatingTopic": {
        "id": "2d936be2-03db-474a-9b02-7241e836c336",
        "properties": {
          "fillColor": "#5e60ce",
          "borderColor": "#5e60ce"
        }
      },
      "summaryTopic": {
        "id": "6bd905f5-e5c3-4528-a460-4f47c42690b8",
        "properties": {
          "fillColor": "#4ea8de",
          "borderColor": "#4ea8de"
        }
      },
      "calloutTopic": {
        "id": "17ea59c4-c81e-4ac8-974e-bf1822ebb42e",
        "properties": {
          "fillColor": "#4ea8de",
          "borderColor": "#4ea8de"
        }
      },
      "importantTopic": {
        "id": "c7e1e177-9529-4781-a63a-6839149be0e4",
        "properties": {
          "fillColor": "#cc5ece",
          "borderColor": "#cc5ece"
        }
      },
      "minorTopic": {
        "id": "27ac80f5-8eec-4e6a-a3ad-818e5dfd27c8",
        "properties": {
          "fillColor": "#b80043",
          "borderColor": "#b80043"
        }
      },
      "boundary": {
        "id": "db6116a2-5232-4281-a134-36d0934b3d9b",
        "properties": {
          "fillColor": "#7400b8",
          "lineColor": "#7400b8"
        }
      },
      "summary": {
        "id": "d9b21316-c2b0-4a14-8e2c-2a526eac1245",
        "properties": {
          "lineColor": "#7400b8"
        }
      },
      "relationship": {
        "id": "d080f38d-a870-4ad1-9a45-fe797a375996",
        "properties": {
          "lineColor": "#7400b8"
        }
      }
    }
  },
  {
    "id": "Space-#d9dcd6-TYPE_A",
    "tags": [
      "Space",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "92c15346-5a56-4fe7-9190-8cbbe4c9962f",
        "properties": {
          "fillColor": "#d9dcd6",
          "multiLineColors": "",
          "color-list": "#d9dcd6 #81c3d7 #3a7ca5 #2f6690 #16425b #0D2F42"
        }
      },
      "centralTopic": {
        "id": "433202b6-6b2f-4eff-b171-da7469a21007",
        "properties": {
          "fillColor": "#0D2F42",
          "lineColor": "#0D2F42"
        }
      },
      "mainTopic": {
        "id": "1a537175-72d0-4527-863d-a25625773769",
        "properties": {
          "fillColor": "#2f6690"
        }
      },
      "subTopic": {
        "id": "38293c1e-eb17-4a66-b710-4ebe508bcaa5",
        "properties": {
          "fillColor": "#c6cac1"
        }
      },
      "floatingTopic": {
        "id": "18517705-a0f2-4213-981c-ca6a91953b71",
        "properties": {
          "fillColor": "#3a7ca5",
          "borderColor": "#3a7ca5"
        }
      },
      "summaryTopic": {
        "id": "943f40ef-5a43-4c97-bce9-0b667757adf4",
        "properties": {
          "fillColor": "#2f6690",
          "borderColor": "#2f6690"
        }
      },
      "calloutTopic": {
        "id": "47f5c0ac-aaad-4191-a735-57cf44f45c8a",
        "properties": {
          "fillColor": "#2f6690",
          "borderColor": "#2f6690"
        }
      },
      "importantTopic": {
        "id": "1bc2b227-9e11-41dd-8e31-743c4c4bebe1",
        "properties": {
          "fillColor": "#16425b",
          "borderColor": "#16425b"
        }
      },
      "minorTopic": {
        "id": "d3e48c0e-1d89-4351-b32c-09fb616a7592",
        "properties": {
          "fillColor": "#0D2F42",
          "borderColor": "#0D2F42"
        }
      },
      "boundary": {
        "id": "68d71164-ce99-433b-af20-5cd09af9ab29",
        "properties": {
          "fillColor": "#0D2F42",
          "lineColor": "#0D2F42"
        }
      },
      "summary": {
        "id": "87779b8e-eb8e-40c4-9d05-e00d4a552241",
        "properties": {
          "lineColor": "#0D2F42"
        }
      },
      "relationship": {
        "id": "06f94f06-9a77-4a9d-ae58-570928e45548",
        "properties": {
          "lineColor": "#0D2F42"
        }
      }
    }
  },
  {
    "id": "Space-#81c3d7-TYPE_B",
    "tags": [
      "Space",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "2a051e9b-4061-45bf-b165-7e187b6d83d2",
        "properties": {
          "fillColor": "#81c3d7",
          "multiLineColors": "",
          "color-list": "#d9dcd6 #81c3d7 #3a7ca5 #2f6690 #16425b #0D2F42"
        }
      },
      "centralTopic": {
        "id": "390109a1-0d1d-4d8f-a73c-68b5a7cf89e7",
        "properties": {
          "fillColor": "#0D2F42",
          "lineColor": "#0D2F42"
        }
      },
      "mainTopic": {
        "id": "3613d6f8-0576-49c0-8e6b-5d95095dcafd",
        "properties": {
          "fillColor": "#0D2F42"
        }
      },
      "subTopic": {
        "id": "b2933413-3103-4757-8227-55e8d0859e61",
        "properties": {
          "fillColor": "#26485b"
        }
      },
      "floatingTopic": {
        "id": "59b04804-5690-4090-9390-8ca2a59ad873",
        "properties": {
          "fillColor": "#3a7ca5",
          "borderColor": "#3a7ca5"
        }
      },
      "summaryTopic": {
        "id": "a8f152a0-f019-4995-85b9-76ccdeb69e1e",
        "properties": {
          "fillColor": "#0D2F42",
          "borderColor": "#0D2F42"
        }
      },
      "calloutTopic": {
        "id": "fed93edb-7f10-43e9-bb1d-1e9de53d3d04",
        "properties": {
          "fillColor": "#0D2F42",
          "borderColor": "#0D2F42"
        }
      },
      "importantTopic": {
        "id": "1ec3fa81-1869-4665-9151-f0234e00ffab",
        "properties": {
          "fillColor": "#d69581",
          "borderColor": "#d69581"
        }
      },
      "minorTopic": {
        "id": "cdd458ed-d3a7-494d-b331-529ce7aa20b2",
        "properties": {
          "fillColor": "#d6d481",
          "borderColor": "#d6d481"
        }
      },
      "boundary": {
        "id": "fe79ae59-d351-440c-90cd-35434855d48d",
        "properties": {
          "fillColor": "#0D2F42",
          "lineColor": "#0D2F42"
        }
      },
      "summary": {
        "id": "476a7baf-97c8-4d72-b90c-ea3231f2b2f0",
        "properties": {
          "lineColor": "#0D2F42"
        }
      },
      "relationship": {
        "id": "0abc8aea-731c-48cd-a8ef-9d0e17142d16",
        "properties": {
          "lineColor": "#0D2F42"
        }
      }
    }
  },
  {
    "id": "Space-#3a7ca5-TYPE_B",
    "tags": [
      "Space",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "dd31431a-e0ba-483f-870b-d1fd2b0ff1ad",
        "properties": {
          "fillColor": "#3a7ca5",
          "multiLineColors": "",
          "color-list": "#d9dcd6 #81c3d7 #3a7ca5 #2f6690 #16425b #0D2F42"
        }
      },
      "centralTopic": {
        "id": "af11b633-6ef8-4595-a033-8169acc8b1d7",
        "properties": {
          "fillColor": "#d9dcd6",
          "lineColor": "#d9dcd6"
        }
      },
      "mainTopic": {
        "id": "f6eb8bca-0c74-437e-8bec-a03b0666a7b4",
        "properties": {
          "fillColor": "#d9dcd6"
        }
      },
      "subTopic": {
        "id": "d7316ee5-d8af-43e7-8522-6b1c28e7c5ed",
        "properties": {
          "fillColor": "#f2f5ef"
        }
      },
      "floatingTopic": {
        "id": "e0b645dc-2bca-44e5-8eb4-166ae1b6d6cc",
        "properties": {
          "fillColor": "#81c3d7",
          "borderColor": "#81c3d7"
        }
      },
      "summaryTopic": {
        "id": "f8ce1b86-732d-4dac-912d-b012a08a1c34",
        "properties": {
          "fillColor": "#d9dcd6",
          "borderColor": "#d9dcd6"
        }
      },
      "calloutTopic": {
        "id": "58e3ca37-e084-45b8-bc9b-4369d4b39459",
        "properties": {
          "fillColor": "#d9dcd6",
          "borderColor": "#d9dcd6"
        }
      },
      "importantTopic": {
        "id": "55ceb44b-261b-4107-809f-c28828856b62",
        "properties": {
          "fillColor": "#a56339",
          "borderColor": "#a56339"
        }
      },
      "minorTopic": {
        "id": "61894e3e-dc54-4243-b822-546bb1aa60f4",
        "properties": {
          "fillColor": "#95a439",
          "borderColor": "#95a439"
        }
      },
      "boundary": {
        "id": "6eb45030-9ab8-448a-94c5-ae6b1f8e0a75",
        "properties": {
          "fillColor": "#d9dcd6",
          "lineColor": "#d9dcd6"
        }
      },
      "summary": {
        "id": "0e69fb30-5323-4b5d-a858-b4720037370a",
        "properties": {
          "lineColor": "#d9dcd6"
        }
      },
      "relationship": {
        "id": "71ae77eb-5b02-4914-9724-6de059ca0412",
        "properties": {
          "lineColor": "#d9dcd6"
        }
      }
    }
  },
  {
    "id": "Space-#2f6690-TYPE_B",
    "tags": [
      "Space",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "0639530c-c767-46a3-8295-1d55619de1ae",
        "properties": {
          "fillColor": "#2f6690",
          "multiLineColors": "",
          "color-list": "#d9dcd6 #81c3d7 #3a7ca5 #2f6690 #16425b #0D2F42"
        }
      },
      "centralTopic": {
        "id": "3868ac20-ba88-4acf-9c2d-c3a42ca0a4d2",
        "properties": {
          "fillColor": "#d9dcd6",
          "lineColor": "#d9dcd6"
        }
      },
      "mainTopic": {
        "id": "4ef591ee-23fc-4b84-9bbd-f817a9a5bcb9",
        "properties": {
          "fillColor": "#d9dcd6"
        }
      },
      "subTopic": {
        "id": "1bc7a2b5-68d5-49c8-a88a-557ccac7493c",
        "properties": {
          "fillColor": "#f2f5ef"
        }
      },
      "floatingTopic": {
        "id": "d5fc6220-40f3-45cb-8a9b-98699fc69358",
        "properties": {
          "fillColor": "#81c3d7",
          "borderColor": "#81c3d7"
        }
      },
      "summaryTopic": {
        "id": "f8fe90bf-0457-403b-94cc-cfa2438b99b9",
        "properties": {
          "fillColor": "#d9dcd6",
          "borderColor": "#d9dcd6"
        }
      },
      "calloutTopic": {
        "id": "7cca1588-8b09-42a7-a762-041dfff3cee5",
        "properties": {
          "fillColor": "#d9dcd6",
          "borderColor": "#d9dcd6"
        }
      },
      "importantTopic": {
        "id": "c90b32ef-5f83-4a4e-aab1-5be3e6147fae",
        "properties": {
          "fillColor": "#8f592f",
          "borderColor": "#8f592f"
        }
      },
      "minorTopic": {
        "id": "e2deda7a-2878-4829-beb4-6f920a27e067",
        "properties": {
          "fillColor": "#7c8f2f",
          "borderColor": "#7c8f2f"
        }
      },
      "boundary": {
        "id": "c8154ce6-651b-4212-96b4-e940e1399ab8",
        "properties": {
          "fillColor": "#d9dcd6",
          "lineColor": "#d9dcd6"
        }
      },
      "summary": {
        "id": "5acc284a-9466-4ffe-9e24-571d2e57efba",
        "properties": {
          "lineColor": "#d9dcd6"
        }
      },
      "relationship": {
        "id": "72cc3825-3719-4783-a7f2-453efd5ce000",
        "properties": {
          "lineColor": "#d9dcd6"
        }
      }
    }
  },
  {
    "id": "Space-#16425b-TYPE_B",
    "tags": [
      "Space",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "ccb835b7-f262-438d-b97a-afb84852cd90",
        "properties": {
          "fillColor": "#16425b",
          "multiLineColors": "",
          "color-list": "#d9dcd6 #81c3d7 #3a7ca5 #2f6690 #16425b #0D2F42"
        }
      },
      "centralTopic": {
        "id": "ef6a8162-4b25-4e41-831f-c5342e7093bc",
        "properties": {
          "fillColor": "#d9dcd6",
          "lineColor": "#d9dcd6"
        }
      },
      "mainTopic": {
        "id": "ad169402-e0bf-47f0-97b0-e2ccd75725cc",
        "properties": {
          "fillColor": "#d9dcd6"
        }
      },
      "subTopic": {
        "id": "0093c4e5-4757-476d-b105-576c22a9358a",
        "properties": {
          "fillColor": "#f2f5ef"
        }
      },
      "floatingTopic": {
        "id": "8b684b53-db90-4abb-97a7-e4bb39320653",
        "properties": {
          "fillColor": "#81c3d7",
          "borderColor": "#81c3d7"
        }
      },
      "summaryTopic": {
        "id": "0c59e54e-8c9a-48ad-af4f-2a4bf45e6845",
        "properties": {
          "fillColor": "#d9dcd6",
          "borderColor": "#d9dcd6"
        }
      },
      "calloutTopic": {
        "id": "0bc551c1-34dd-4269-a403-9e3cc2cc118c",
        "properties": {
          "fillColor": "#d9dcd6",
          "borderColor": "#d9dcd6"
        }
      },
      "importantTopic": {
        "id": "3f584f66-ee69-406a-b50f-e9e02dc91811",
        "properties": {
          "fillColor": "#5b2f15",
          "borderColor": "#5b2f15"
        }
      },
      "minorTopic": {
        "id": "d590efef-8a91-43fc-9d43-17d2020ac723",
        "properties": {
          "fillColor": "#525b14",
          "borderColor": "#525b14"
        }
      },
      "boundary": {
        "id": "ecd3846f-9834-42af-a1f9-85811c99672a",
        "properties": {
          "fillColor": "#d9dcd6",
          "lineColor": "#d9dcd6"
        }
      },
      "summary": {
        "id": "3f7c9f9a-cc3a-4adb-9ea4-5cd9d1298aaa",
        "properties": {
          "lineColor": "#d9dcd6"
        }
      },
      "relationship": {
        "id": "b4af109d-7e2e-498e-8cd7-90a825231fa1",
        "properties": {
          "lineColor": "#d9dcd6"
        }
      }
    }
  },
  {
    "id": "Space-#0D2F42-TYPE_C",
    "tags": [
      "Space",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "f96e837a-4be7-4abe-9e53-9ca5c23d1ba1",
        "properties": {
          "fillColor": "#0D2F42",
          "multiLineColors": "",
          "color-list": "#d9dcd6 #81c3d7 #3a7ca5 #2f6690 #16425b #0D2F42"
        }
      },
      "centralTopic": {
        "id": "bca09454-c415-4191-bcc8-3ca157ba102e",
        "properties": {
          "fillColor": "#d9dcd6",
          "lineColor": "#d9dcd6"
        }
      },
      "mainTopic": {
        "id": "1005787b-4666-405d-9013-51d90e7e1c5f",
        "properties": {
          "fillColor": "#81c3d7"
        }
      },
      "subTopic": {
        "id": "b738983e-9c4f-4c4b-af72-d7295949ba9c",
        "properties": {
          "fillColor": "#26485b"
        }
      },
      "floatingTopic": {
        "id": "d7003d9e-2e20-4457-9157-d0473aa9b31d",
        "properties": {
          "fillColor": "#3a7ca5",
          "borderColor": "#3a7ca5"
        }
      },
      "summaryTopic": {
        "id": "8ff9f700-a150-44f3-b971-c53c9a66ae69",
        "properties": {
          "fillColor": "#81c3d7",
          "borderColor": "#81c3d7"
        }
      },
      "calloutTopic": {
        "id": "e8277a62-2bef-485c-b45b-bbbdba35c2ac",
        "properties": {
          "fillColor": "#81c3d7",
          "borderColor": "#81c3d7"
        }
      },
      "importantTopic": {
        "id": "fba87480-553f-45b3-8604-3ee07f6bd0b5",
        "properties": {
          "fillColor": "#3a7ca5",
          "borderColor": "#3a7ca5"
        }
      },
      "minorTopic": {
        "id": "0059b741-754a-48f3-a5d7-c393ede44b7a",
        "properties": {
          "fillColor": "#d9dcd6",
          "borderColor": "#d9dcd6"
        }
      },
      "boundary": {
        "id": "f648820a-8790-4b13-b5eb-fdbc564fa053",
        "properties": {
          "fillColor": "#d9dcd6",
          "lineColor": "#d9dcd6"
        }
      },
      "summary": {
        "id": "8deaef95-90c1-4e25-8268-c83b1eb335b4",
        "properties": {
          "lineColor": "#d9dcd6"
        }
      },
      "relationship": {
        "id": "efc1de78-26b2-4431-bb56-894297fd9e20",
        "properties": {
          "lineColor": "#d9dcd6"
        }
      }
    }
  },
  {
    "id": "Space-#0D2F42-MULTI_LINE_COLORS",
    "tags": [
      "Space",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "40211da0-7f61-47b7-bc68-0872205d5e11",
        "properties": {
          "fillColor": "#0D2F42",
          "multiLineColors": "#81c3d7 #3a7ca5 #2f6690 #16425b",
          "color-list": "#d9dcd6 #81c3d7 #3a7ca5 #2f6690 #16425b #0D2F42"
        }
      },
      "centralTopic": {
        "id": "c8d16134-865a-409b-9698-099ec5f83e85",
        "properties": {
          "fillColor": "#d9dcd6",
          "lineColor": "#d9dcd6"
        }
      },
      "mainTopic": {
        "id": "6e930f59-988e-4919-91ac-ea0c22c0e586",
        "properties": {}
      },
      "subTopic": {
        "id": "683e3b42-a26a-41e5-a789-93c239d43d02",
        "properties": {}
      },
      "floatingTopic": {
        "id": "4105a04a-e096-403f-bd1b-ff9166322e88",
        "properties": {
          "fillColor": "#3a7ca5",
          "borderColor": "#3a7ca5"
        }
      },
      "summaryTopic": {
        "id": "b9ec0ccb-5912-49bb-be99-bc22b1c1215b",
        "properties": {
          "fillColor": "#81c3d7",
          "borderColor": "#81c3d7"
        }
      },
      "calloutTopic": {
        "id": "74b1efae-e76a-4c35-a352-9cff58e8ed1b",
        "properties": {
          "fillColor": "#81c3d7",
          "borderColor": "#81c3d7"
        }
      },
      "importantTopic": {
        "id": "b81af180-232a-4d2c-b369-f18fc73de2c3",
        "properties": {
          "fillColor": "#6239a5",
          "borderColor": "#6239a5"
        }
      },
      "minorTopic": {
        "id": "bd6de934-ec43-4ad8-aea4-be2967a25e09",
        "properties": {
          "fillColor": "#d6dcd9",
          "borderColor": "#d6dcd9"
        }
      },
      "boundary": {
        "id": "f376867e-96a7-4dab-8f0e-f607075612ce",
        "properties": {
          "fillColor": "#d9dcd6",
          "lineColor": "#d9dcd6"
        }
      },
      "summary": {
        "id": "61d0ace7-86cd-409b-99d6-7f9aaa369bd3",
        "properties": {
          "lineColor": "#d9dcd6"
        }
      },
      "relationship": {
        "id": "8e6884f0-3e8c-44ec-805e-643673a2500a",
        "properties": {
          "lineColor": "#d9dcd6"
        }
      }
    }
  },
  {
    "id": "Sakura-#FFE3E8-TYPE_A",
    "tags": [
      "Sakura",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "2d99033f-6c25-42aa-b2aa-d5798f4582ee",
        "properties": {
          "fillColor": "#FFE3E8",
          "multiLineColors": "",
          "color-list": "#FFE3E8 #FFDCC8 #FFB4B6 #FFA9C6 #D1C3BD #C1CFDE"
        }
      },
      "centralTopic": {
        "id": "0d17dfac-4a10-4f5c-a695-4336fe87d0d1",
        "properties": {
          "fillColor": "#FFA9C6",
          "lineColor": "#FFA9C6"
        }
      },
      "mainTopic": {
        "id": "3164ed88-e09f-4955-b0bc-ef22b9a6e13f",
        "properties": {
          "fillColor": "#D1C3BD"
        }
      },
      "subTopic": {
        "id": "ceea988a-59a2-4946-a55f-1f3c29bb0010",
        "properties": {
          "fillColor": "#ffd4dc"
        }
      },
      "floatingTopic": {
        "id": "f6eda142-3ace-4552-8792-461a72dd5ed1",
        "properties": {
          "fillColor": "#FFB4B6",
          "borderColor": "#FFB4B6"
        }
      },
      "summaryTopic": {
        "id": "cd2f0233-5ff5-4b6a-8ffb-b3ad81350b4b",
        "properties": {
          "fillColor": "#D1C3BD",
          "borderColor": "#D1C3BD"
        }
      },
      "calloutTopic": {
        "id": "0bc68017-8517-4f75-aa52-7f65d7ff6784",
        "properties": {
          "fillColor": "#D1C3BD",
          "borderColor": "#D1C3BD"
        }
      },
      "importantTopic": {
        "id": "b96fcd1b-b548-43ec-980b-4756b272d2fc",
        "properties": {
          "fillColor": "#FFB4B6",
          "borderColor": "#FFB4B6"
        }
      },
      "minorTopic": {
        "id": "aabd9124-548d-4937-926a-c1d291572d6c",
        "properties": {
          "fillColor": "#FFA9C6",
          "borderColor": "#FFA9C6"
        }
      },
      "boundary": {
        "id": "c7cb86be-6ac5-4941-b09e-d1989246146a",
        "properties": {
          "fillColor": "#FFA9C6",
          "lineColor": "#FFA9C6"
        }
      },
      "summary": {
        "id": "e83e9c9c-aacf-4d8f-8f30-a18584f88440",
        "properties": {
          "lineColor": "#FFA9C6"
        }
      },
      "relationship": {
        "id": "24f87ca5-ee89-41bc-acad-142d35e00e07",
        "properties": {
          "lineColor": "#FFA9C6"
        }
      }
    }
  },
  {
    "id": "Sakura-#FFDCC8-TYPE_A",
    "tags": [
      "Sakura",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "2eae1328-0c22-48f8-9428-15c2498e402d",
        "properties": {
          "fillColor": "#FFDCC8",
          "multiLineColors": "",
          "color-list": "#FFE3E8 #FFDCC8 #FFB4B6 #FFA9C6 #D1C3BD #C1CFDE"
        }
      },
      "centralTopic": {
        "id": "625b7c5b-c0bf-40ce-a1e8-e19c6b1a6f1e",
        "properties": {
          "fillColor": "#FFA9C6",
          "lineColor": "#FFA9C6"
        }
      },
      "mainTopic": {
        "id": "a2930882-0c12-4853-baa2-5d64c01fe64c",
        "properties": {
          "fillColor": "#D1C3BD"
        }
      },
      "subTopic": {
        "id": "f40bd458-cc99-4918-8c8f-fc9e7a4cdac0",
        "properties": {
          "fillColor": "#ffcaac"
        }
      },
      "floatingTopic": {
        "id": "35f02f79-b886-4903-8f51-5320e57a1914",
        "properties": {
          "fillColor": "#FFB4B6",
          "borderColor": "#FFB4B6"
        }
      },
      "summaryTopic": {
        "id": "f8a748c7-4253-42b1-984f-e536b5cdf80b",
        "properties": {
          "fillColor": "#D1C3BD",
          "borderColor": "#D1C3BD"
        }
      },
      "calloutTopic": {
        "id": "3178d49e-6467-4d8a-aa2f-2d05682ba06c",
        "properties": {
          "fillColor": "#D1C3BD",
          "borderColor": "#D1C3BD"
        }
      },
      "importantTopic": {
        "id": "231a2574-dc96-4380-be6d-7ada505880e3",
        "properties": {
          "fillColor": "#FFB4B6",
          "borderColor": "#FFB4B6"
        }
      },
      "minorTopic": {
        "id": "5c9d6aae-4895-44c4-ad4f-30d8c1f5f447",
        "properties": {
          "fillColor": "#FFA9C6",
          "borderColor": "#FFA9C6"
        }
      },
      "boundary": {
        "id": "6b49b028-ab1a-47ad-873a-c1d369ebee9d",
        "properties": {
          "fillColor": "#FFA9C6",
          "lineColor": "#FFA9C6"
        }
      },
      "summary": {
        "id": "7b7a6536-b322-4386-8f15-900bf8ab8ee2",
        "properties": {
          "lineColor": "#FFA9C6"
        }
      },
      "relationship": {
        "id": "f3bb0d5b-4f92-42d6-9d7f-89a0bc83a91c",
        "properties": {
          "lineColor": "#FFA9C6"
        }
      }
    }
  },
  {
    "id": "Sakura-#FFB4B6-TYPE_A",
    "tags": [
      "Sakura",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "31cb57f3-d4dc-4009-aacd-7947728ea460",
        "properties": {
          "fillColor": "#FFB4B6",
          "multiLineColors": "",
          "color-list": "#FFE3E8 #FFDCC8 #FFB4B6 #FFA9C6 #D1C3BD #C1CFDE"
        }
      },
      "centralTopic": {
        "id": "006c59a3-cfcb-4493-a7fc-5f0b292eb580",
        "properties": {
          "fillColor": "#FFE3E8",
          "lineColor": "#FFE3E8"
        }
      },
      "mainTopic": {
        "id": "504c06f4-8df3-4ba9-8d82-88c5e70c1adc",
        "properties": {
          "fillColor": "#FFDCC8"
        }
      },
      "subTopic": {
        "id": "24f00453-30c3-4a81-8cbe-ffd13963590d",
        "properties": {
          "fillColor": "#fe8e91"
        }
      },
      "floatingTopic": {
        "id": "a6e677ef-da29-4a11-84ab-ba4d78be2998",
        "properties": {
          "fillColor": "#FFDCC8",
          "borderColor": "#FFDCC8"
        }
      },
      "summaryTopic": {
        "id": "69267b60-d885-4986-af64-a5cb6228468a",
        "properties": {
          "fillColor": "#FFDCC8",
          "borderColor": "#FFDCC8"
        }
      },
      "calloutTopic": {
        "id": "5103304a-19fc-47ba-b420-203afba1a60b",
        "properties": {
          "fillColor": "#FFDCC8",
          "borderColor": "#FFDCC8"
        }
      },
      "importantTopic": {
        "id": "2b265614-57e0-4b9b-a3cc-99a2d9d27659",
        "properties": {
          "fillColor": "#C1CFDE",
          "borderColor": "#C1CFDE"
        }
      },
      "minorTopic": {
        "id": "965c2ac1-532d-4672-b2f5-eeff0cda38fb",
        "properties": {
          "fillColor": "#FFE3E8",
          "borderColor": "#FFE3E8"
        }
      },
      "boundary": {
        "id": "8e108ba5-ae0c-49b3-9888-caa329bb8285",
        "properties": {
          "fillColor": "#FFE3E8",
          "lineColor": "#FFE3E8"
        }
      },
      "summary": {
        "id": "8507ceb5-1a57-4ba5-97c6-d1c37c07958f",
        "properties": {
          "lineColor": "#FFE3E8"
        }
      },
      "relationship": {
        "id": "0a21f7c3-2c9b-41f3-84c7-2223df085303",
        "properties": {
          "lineColor": "#FFE3E8"
        }
      }
    }
  },
  {
    "id": "Sakura-#FFA9C6-TYPE_A",
    "tags": [
      "Sakura",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "a6d118ce-3f66-4584-81e7-f4be041daa88",
        "properties": {
          "fillColor": "#FFA9C6",
          "multiLineColors": "",
          "color-list": "#FFE3E8 #FFDCC8 #FFB4B6 #FFA9C6 #D1C3BD #C1CFDE"
        }
      },
      "centralTopic": {
        "id": "de930e3a-1fd7-4954-97ee-32121aba50d0",
        "properties": {
          "fillColor": "#FFE3E8",
          "lineColor": "#FFE3E8"
        }
      },
      "mainTopic": {
        "id": "b7756dd3-95d4-4fdd-b590-3733478d8b42",
        "properties": {
          "fillColor": "#FFDCC8"
        }
      },
      "subTopic": {
        "id": "ea936a49-e2aa-433f-8d37-f2de7932fd31",
        "properties": {
          "fillColor": "#ff7da9"
        }
      },
      "floatingTopic": {
        "id": "c509c5ab-6a59-45ac-b51b-3ec9906513aa",
        "properties": {
          "fillColor": "#FFDCC8",
          "borderColor": "#FFDCC8"
        }
      },
      "summaryTopic": {
        "id": "daa38ca7-45bd-42d6-a09d-5d724bbc75f2",
        "properties": {
          "fillColor": "#FFDCC8",
          "borderColor": "#FFDCC8"
        }
      },
      "calloutTopic": {
        "id": "cb6b2dab-270c-4cb1-aa79-2a9a0315ae61",
        "properties": {
          "fillColor": "#FFDCC8",
          "borderColor": "#FFDCC8"
        }
      },
      "importantTopic": {
        "id": "e7c8132d-7dbe-4141-b7c4-aa601abf4cf1",
        "properties": {
          "fillColor": "#C1CFDE",
          "borderColor": "#C1CFDE"
        }
      },
      "minorTopic": {
        "id": "f8ee7c6d-e8ad-4a17-a28d-6fe3ca7ccb11",
        "properties": {
          "fillColor": "#FFE3E8",
          "borderColor": "#FFE3E8"
        }
      },
      "boundary": {
        "id": "d6c3e699-1299-470c-ac4c-f5a3d143174f",
        "properties": {
          "fillColor": "#FFE3E8",
          "lineColor": "#FFE3E8"
        }
      },
      "summary": {
        "id": "8306d7a4-42ca-4f3d-93ae-52f45486d6a3",
        "properties": {
          "lineColor": "#FFE3E8"
        }
      },
      "relationship": {
        "id": "89572d05-ed8f-48bd-95af-5c832a0a73cf",
        "properties": {
          "lineColor": "#FFE3E8"
        }
      }
    }
  },
  {
    "id": "Sakura-#D1C3BD-TYPE_B",
    "tags": [
      "Sakura",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "47d1c3cc-f79a-418c-8561-da7a0f0e9253",
        "properties": {
          "fillColor": "#D1C3BD",
          "multiLineColors": "",
          "color-list": "#FFE3E8 #FFDCC8 #FFB4B6 #FFA9C6 #D1C3BD #C1CFDE"
        }
      },
      "centralTopic": {
        "id": "6770dcdb-3b31-46bd-8553-e4a1b41d30e9",
        "properties": {
          "fillColor": "#FFE3E8",
          "lineColor": "#FFE3E8"
        }
      },
      "mainTopic": {
        "id": "c7ac47f8-1bfd-4a23-ab68-3c6b6bb65ac6",
        "properties": {
          "fillColor": "#FFDCC8"
        }
      },
      "subTopic": {
        "id": "f6c94176-d29c-4113-8812-304e49c55f4f",
        "properties": {
          "fillColor": "#fff5e1"
        }
      },
      "floatingTopic": {
        "id": "a092cfee-db9f-4d18-9ea1-a77ceb59f8ad",
        "properties": {
          "fillColor": "#FFDCC8",
          "borderColor": "#FFDCC8"
        }
      },
      "summaryTopic": {
        "id": "8e711294-b15a-4a59-b960-2809f2f13775",
        "properties": {
          "fillColor": "#FFDCC8",
          "borderColor": "#FFDCC8"
        }
      },
      "calloutTopic": {
        "id": "eabc964e-b675-41c3-becd-d3fb671c1752",
        "properties": {
          "fillColor": "#FFDCC8",
          "borderColor": "#FFDCC8"
        }
      },
      "importantTopic": {
        "id": "5d823e8f-fd35-48c8-8847-568582bc4855",
        "properties": {
          "fillColor": "#bdcbd1",
          "borderColor": "#bdcbd1"
        }
      },
      "minorTopic": {
        "id": "9762f436-d6cf-4446-9037-f3d51c3da7ed",
        "properties": {
          "fillColor": "#bebdd1",
          "borderColor": "#bebdd1"
        }
      },
      "boundary": {
        "id": "ef4b6b5a-9964-4ade-8071-b5bc69362cce",
        "properties": {
          "fillColor": "#FFE3E8",
          "lineColor": "#FFE3E8"
        }
      },
      "summary": {
        "id": "7bd61b66-50ed-470f-9935-2c1d66e0d52a",
        "properties": {
          "lineColor": "#FFE3E8"
        }
      },
      "relationship": {
        "id": "efead7bb-ee48-4d60-9594-f80f50ccb4f4",
        "properties": {
          "lineColor": "#FFE3E8"
        }
      }
    }
  },
  {
    "id": "Sakura-#C1CFDE-TYPE_A",
    "tags": [
      "Sakura",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "3fc363b9-3329-4bdf-a6bc-bb49cc3c0dd4",
        "properties": {
          "fillColor": "#C1CFDE",
          "multiLineColors": "",
          "color-list": "#FFE3E8 #FFDCC8 #FFB4B6 #FFA9C6 #D1C3BD #C1CFDE"
        }
      },
      "centralTopic": {
        "id": "5f7bada2-c812-403a-8344-5e98d226655b",
        "properties": {
          "fillColor": "#FFE3E8",
          "lineColor": "#FFE3E8"
        }
      },
      "mainTopic": {
        "id": "ba175ef6-5b96-4701-8156-615430bc64ca",
        "properties": {
          "fillColor": "#FFDCC8"
        }
      },
      "subTopic": {
        "id": "bbfc8619-32c7-4f45-b26e-4e6d2f6d8100",
        "properties": {
          "fillColor": "#a2b6cd"
        }
      },
      "floatingTopic": {
        "id": "23c12636-496e-4f64-b41c-6289e7357f1b",
        "properties": {
          "fillColor": "#FFDCC8",
          "borderColor": "#FFDCC8"
        }
      },
      "summaryTopic": {
        "id": "da957af1-1404-4423-8cab-ebc662bf9c45",
        "properties": {
          "fillColor": "#FFDCC8",
          "borderColor": "#FFDCC8"
        }
      },
      "calloutTopic": {
        "id": "e4425ded-e641-4730-bfa9-7ff1375c0eac",
        "properties": {
          "fillColor": "#FFDCC8",
          "borderColor": "#FFDCC8"
        }
      },
      "importantTopic": {
        "id": "1056e58d-d800-4ed6-b119-eb7634ea3141",
        "properties": {
          "fillColor": "#FFA9C6",
          "borderColor": "#FFA9C6"
        }
      },
      "minorTopic": {
        "id": "a70028eb-3051-4543-8287-4496bbeb917a",
        "properties": {
          "fillColor": "#FFE3E8",
          "borderColor": "#FFE3E8"
        }
      },
      "boundary": {
        "id": "c4b1e7f7-9b09-44fc-b9ff-01475ced0651",
        "properties": {
          "fillColor": "#FFE3E8",
          "lineColor": "#FFE3E8"
        }
      },
      "summary": {
        "id": "cd9d1dcc-f6bd-490e-935c-79f29fe54189",
        "properties": {
          "lineColor": "#FFE3E8"
        }
      },
      "relationship": {
        "id": "2df481fa-f043-4dff-9916-6de7055724e8",
        "properties": {
          "lineColor": "#FFE3E8"
        }
      }
    }
  },
  {
    "id": "Sakura-#FFE3E8-MULTI_LINE_COLORS",
    "tags": [
      "Sakura",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "50dceff2-35d7-4e30-bccf-de8b0afaf6fe",
        "properties": {
          "fillColor": "#FFE3E8",
          "multiLineColors": "#FFB4B6 #D1C3BD #C1CFDE",
          "color-list": "#FFE3E8 #FFDCC8 #FFB4B6 #FFA9C6 #D1C3BD #C1CFDE"
        }
      },
      "centralTopic": {
        "id": "f9e24342-a810-4f3a-bc11-bd2d04da3c8c",
        "properties": {
          "fillColor": "#FFA9C6",
          "lineColor": "#FFA9C6"
        }
      },
      "mainTopic": {
        "id": "eca782fb-edf9-42b5-b6ad-8bfd970a498f",
        "properties": {}
      },
      "subTopic": {
        "id": "e649f239-e30e-4f52-bf10-e5fde02e21dc",
        "properties": {}
      },
      "floatingTopic": {
        "id": "0b78e177-3b76-43b5-ac0a-96f80d09f9f4",
        "properties": {
          "fillColor": "#FFB4B6",
          "borderColor": "#FFB4B6"
        }
      },
      "summaryTopic": {
        "id": "ed56b94f-ff6a-4c96-9710-061f35c8dfc9",
        "properties": {
          "fillColor": "#D1C3BD",
          "borderColor": "#D1C3BD"
        }
      },
      "calloutTopic": {
        "id": "9329e7f4-b964-44bb-898f-1cac1193e4b3",
        "properties": {
          "fillColor": "#D1C3BD",
          "borderColor": "#D1C3BD"
        }
      },
      "importantTopic": {
        "id": "81500553-a0b9-4f79-8ece-dbe8631a722e",
        "properties": {
          "fillColor": "#fffcb4",
          "borderColor": "#fffcb4"
        }
      },
      "minorTopic": {
        "id": "c8e805d1-aa0a-4ea1-a80d-373509cb0317",
        "properties": {
          "fillColor": "#ffe2a8",
          "borderColor": "#ffe2a8"
        }
      },
      "boundary": {
        "id": "0e8be4fa-8627-4c3d-b654-8254673ab85a",
        "properties": {
          "fillColor": "#FFA9C6",
          "lineColor": "#FFA9C6"
        }
      },
      "summary": {
        "id": "b27d22bb-5769-46dd-ad2a-02a35bfcdcef",
        "properties": {
          "lineColor": "#FFA9C6"
        }
      },
      "relationship": {
        "id": "1323ed53-f89a-42fc-b897-0ae9c6da01bc",
        "properties": {
          "lineColor": "#FFA9C6"
        }
      }
    }
  },
  {
    "id": "Fire-#FDD29A-TYPE_B",
    "tags": [
      "Fire",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "e48e0853-770e-4d5e-8506-b683d4f3c052",
        "properties": {
          "fillColor": "#FDD29A",
          "multiLineColors": "",
          "color-list": "#FDD29A #F9A655 #FC901A #E04B51 #A4564C #6D3B37"
        }
      },
      "centralTopic": {
        "id": "bc8c994a-11f5-4216-9fcc-e568794d5a2e",
        "properties": {
          "fillColor": "#6D3B37",
          "lineColor": "#6D3B37"
        }
      },
      "mainTopic": {
        "id": "1ac5d915-45a0-447a-b84a-d735002b7014",
        "properties": {
          "fillColor": "#6D3B37"
        }
      },
      "subTopic": {
        "id": "3b010b2b-8722-4daf-a9f1-bd52ff36b111",
        "properties": {
          "fillColor": "#865450"
        }
      },
      "floatingTopic": {
        "id": "4b096a22-eb8d-4f39-b933-8eeb6af08f00",
        "properties": {
          "fillColor": "#FC901A",
          "borderColor": "#FC901A"
        }
      },
      "summaryTopic": {
        "id": "3602b21d-eda5-46b0-b25a-2a2513cc6464",
        "properties": {
          "fillColor": "#6D3B37",
          "borderColor": "#6D3B37"
        }
      },
      "calloutTopic": {
        "id": "ca21c1fa-7e81-413e-b3df-3500607d8f36",
        "properties": {
          "fillColor": "#6D3B37",
          "borderColor": "#6D3B37"
        }
      },
      "importantTopic": {
        "id": "1c0ddcb5-ae22-43c0-8946-67c4f9b58226",
        "properties": {
          "fillColor": "#9ac4fd",
          "borderColor": "#9ac4fd"
        }
      },
      "minorTopic": {
        "id": "2bdc8faf-b609-45b8-a7da-2e121b960a28",
        "properties": {
          "fillColor": "#ba9afd",
          "borderColor": "#ba9afd"
        }
      },
      "boundary": {
        "id": "2e88b667-14f5-4431-8622-6fe1b17fafb1",
        "properties": {
          "fillColor": "#6D3B37",
          "lineColor": "#6D3B37"
        }
      },
      "summary": {
        "id": "206d42b7-021c-4d70-a028-b8b4e83903fe",
        "properties": {
          "lineColor": "#6D3B37"
        }
      },
      "relationship": {
        "id": "b314097b-9fe4-42bd-9d19-b27ba7825ccf",
        "properties": {
          "lineColor": "#6D3B37"
        }
      }
    }
  },
  {
    "id": "Fire-#F9A655-TYPE_B",
    "tags": [
      "Fire",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "d420de2d-cb61-421e-ab96-98412a1cd45e",
        "properties": {
          "fillColor": "#F9A655",
          "multiLineColors": "",
          "color-list": "#FDD29A #F9A655 #FC901A #E04B51 #A4564C #6D3B37"
        }
      },
      "centralTopic": {
        "id": "1a66ef99-121b-4d8d-b9c3-e4dd7e7e49d8",
        "properties": {
          "fillColor": "#6D3B37",
          "lineColor": "#6D3B37"
        }
      },
      "mainTopic": {
        "id": "72066f45-54bb-4d5e-9baa-d3d601e3a317",
        "properties": {
          "fillColor": "#6D3B37"
        }
      },
      "subTopic": {
        "id": "c2e28244-0e0b-48bc-a1ac-c2a4071e10b2",
        "properties": {
          "fillColor": "#865450"
        }
      },
      "floatingTopic": {
        "id": "e35e848b-9322-4395-91b5-66dca9f093fd",
        "properties": {
          "fillColor": "#FDD29A",
          "borderColor": "#FDD29A"
        }
      },
      "summaryTopic": {
        "id": "69439da5-ec80-412f-808b-3b2245a957cd",
        "properties": {
          "fillColor": "#6D3B37",
          "borderColor": "#6D3B37"
        }
      },
      "calloutTopic": {
        "id": "9fed6ddd-fa09-4e25-91c3-88eff11c15cd",
        "properties": {
          "fillColor": "#6D3B37",
          "borderColor": "#6D3B37"
        }
      },
      "importantTopic": {
        "id": "1c1d88de-7028-4d60-88eb-df0ba8769859",
        "properties": {
          "fillColor": "#54a7f8",
          "borderColor": "#54a7f8"
        }
      },
      "minorTopic": {
        "id": "1fc692eb-9430-4df3-9198-aa818a84df18",
        "properties": {
          "fillColor": "#7b53f8",
          "borderColor": "#7b53f8"
        }
      },
      "boundary": {
        "id": "1253d0bc-ab87-44db-82e8-b134aab70e3d",
        "properties": {
          "fillColor": "#6D3B37",
          "lineColor": "#6D3B37"
        }
      },
      "summary": {
        "id": "db0c6449-a4a1-4b50-91ed-d7a2e768f038",
        "properties": {
          "lineColor": "#6D3B37"
        }
      },
      "relationship": {
        "id": "936fedcc-19bb-4dca-9a7a-e407fdf4b6a2",
        "properties": {
          "lineColor": "#6D3B37"
        }
      }
    }
  },
  {
    "id": "Fire-#FC901A-TYPE_B",
    "tags": [
      "Fire",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "73119faf-8177-4bf2-bfd0-26f4ada591eb",
        "properties": {
          "fillColor": "#6D3B37",
          "multiLineColors": "",
          "color-list": "#FDD29A #F9A655 #FC901A #E04B51 #A4564C #6D3B37"
        }
      },
      "centralTopic": {
        "id": "8f51bf16-5fa8-4858-8771-363638331eb4",
        "properties": {
          "fillColor": "#FC901A",
          "lineColor": "#FC901A"
        }
      },
      "mainTopic": {
        "id": "ddceafaf-7ae5-4a78-b280-2a4f80d2df80",
        "properties": {
          "fillColor": "#FDD29A"
        }
      },
      "subTopic": {
        "id": "4d10037d-f44e-4b9c-a4d5-8672392c4ef6",
        "properties": {
          "fillColor": "#ffebb3"
        }
      },
      "floatingTopic": {
        "id": "26b311d3-bd19-49ad-a3d0-35d116dd4328",
        "properties": {
          "fillColor": "#F9A655",
          "borderColor": "#F9A655"
        }
      },
      "summaryTopic": {
        "id": "e34a91d9-45b1-432a-a5b0-62b658d7b39e",
        "properties": {
          "fillColor": "#FDD29A",
          "borderColor": "#FDD29A"
        }
      },
      "calloutTopic": {
        "id": "5e60244b-a6fc-489b-b8da-b316ea9b1ecb",
        "properties": {
          "fillColor": "#FDD29A",
          "borderColor": "#FDD29A"
        }
      },
      "importantTopic": {
        "id": "9498478d-7b96-4bdb-bfc7-846015e10038",
        "properties": {
          "fillColor": "#37686c",
          "borderColor": "#37686c"
        }
      },
      "minorTopic": {
        "id": "4b3cb07d-9da1-409a-aee0-a754fc58cd3d",
        "properties": {
          "fillColor": "#37406b",
          "borderColor": "#37406b"
        }
      },
      "boundary": {
        "id": "d5317f3a-ad2d-4d11-a443-e59482bf5619",
        "properties": {
          "fillColor": "#FC901A",
          "lineColor": "#FC901A"
        }
      },
      "summary": {
        "id": "4ececb33-5e9c-437e-8dfd-f23cb667fbaf",
        "properties": {
          "lineColor": "#FC901A"
        }
      },
      "relationship": {
        "id": "cd555604-e8d5-436d-b111-c15f4a820cb1",
        "properties": {
          "lineColor": "#FC901A"
        }
      }
    }
  },
  {
    "id": "Fire-#E04B51-TYPE_B",
    "tags": [
      "Fire",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "c70878cb-61ec-4fec-a3da-c1ef599972a6",
        "properties": {
          "fillColor": "#FDD29A",
          "multiLineColors": "",
          "color-list": "#FDD29A #F9A655 #FC901A #E04B51 #A4564C #6D3B37"
        }
      },
      "centralTopic": {
        "id": "58bc81c9-70c9-448d-b1b3-e7e4e96eb153",
        "properties": {
          "fillColor": "#E04B51",
          "lineColor": "#E04B51"
        }
      },
      "mainTopic": {
        "id": "2675b4da-2c45-4a99-92e3-2d45ed46da72",
        "properties": {
          "fillColor": "#6D3B37"
        }
      },
      "subTopic": {
        "id": "eb3fa8f7-5349-492f-8636-b27e2050186a",
        "properties": {
          "fillColor": "#865450"
        }
      },
      "floatingTopic": {
        "id": "4416d465-bddc-4195-95a2-26a836808e6b",
        "properties": {
          "fillColor": "#FC901A",
          "borderColor": "#FC901A"
        }
      },
      "summaryTopic": {
        "id": "4be4d9ca-682a-4220-bef5-8d6c5fd8f07a",
        "properties": {
          "fillColor": "#6D3B37",
          "borderColor": "#6D3B37"
        }
      },
      "calloutTopic": {
        "id": "b8d7144b-495d-42f2-ab8d-f0bf6681b58a",
        "properties": {
          "fillColor": "#6D3B37",
          "borderColor": "#6D3B37"
        }
      },
      "importantTopic": {
        "id": "5334d7b0-b306-4623-a03a-5a3ecd9f4450",
        "properties": {
          "fillColor": "#9ac4fd",
          "borderColor": "#9ac4fd"
        }
      },
      "minorTopic": {
        "id": "28526992-ca31-4041-aaa7-7d5f3320389c",
        "properties": {
          "fillColor": "#ba9afd",
          "borderColor": "#ba9afd"
        }
      },
      "boundary": {
        "id": "8324e195-9dec-4320-96e3-bec3c16d26bc",
        "properties": {
          "fillColor": "#E04B51",
          "lineColor": "#E04B51"
        }
      },
      "summary": {
        "id": "c49b55ac-2773-4f57-9ee8-cb7ad211c1bc",
        "properties": {
          "lineColor": "#E04B51"
        }
      },
      "relationship": {
        "id": "b5767ca0-c273-45a2-892d-c6a10b979afd",
        "properties": {
          "lineColor": "#E04B51"
        }
      }
    }
  },
  {
    "id": "Fire-#A4564C-TYPE_B",
    "tags": [
      "Fire",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "bc4baa49-3904-4950-b729-dbfc297a4958",
        "properties": {
          "fillColor": "#A4564C",
          "multiLineColors": "",
          "color-list": "#FDD29A #F9A655 #FC901A #E04B51 #A4564C #6D3B37"
        }
      },
      "centralTopic": {
        "id": "27bcba1f-a348-45fd-a5bb-324e0792c396",
        "properties": {
          "fillColor": "#FDD29A",
          "lineColor": "#FDD29A"
        }
      },
      "mainTopic": {
        "id": "512b3cc6-46f7-48ca-998a-89e269899c24",
        "properties": {
          "fillColor": "#FDD29A"
        }
      },
      "subTopic": {
        "id": "23ebb812-64ab-4034-839d-df39a8f9766c",
        "properties": {
          "fillColor": "#ffebb3"
        }
      },
      "floatingTopic": {
        "id": "00a92342-01ad-4f44-8d9c-73ecb2203a22",
        "properties": {
          "fillColor": "#F9A655",
          "borderColor": "#F9A655"
        }
      },
      "summaryTopic": {
        "id": "c5805987-6a20-434e-9914-f563249b8f7a",
        "properties": {
          "fillColor": "#FDD29A",
          "borderColor": "#FDD29A"
        }
      },
      "calloutTopic": {
        "id": "ee073733-ad44-419e-8175-77d46fc5b65b",
        "properties": {
          "fillColor": "#FDD29A",
          "borderColor": "#FDD29A"
        }
      },
      "importantTopic": {
        "id": "d3ad04b2-6ae0-4afd-ac26-70f5e1aef70e",
        "properties": {
          "fillColor": "#4b99a3",
          "borderColor": "#4b99a3"
        }
      },
      "minorTopic": {
        "id": "637b6a6c-fe90-479d-ac86-022fb6199cb5",
        "properties": {
          "fillColor": "#4a56a3",
          "borderColor": "#4a56a3"
        }
      },
      "boundary": {
        "id": "2a4bd0cf-5963-4cdf-a9d1-cb543f550589",
        "properties": {
          "fillColor": "#FDD29A",
          "lineColor": "#FDD29A"
        }
      },
      "summary": {
        "id": "9ccb4dc5-4df5-4ea8-8ac2-258ef7d3a27d",
        "properties": {
          "lineColor": "#FDD29A"
        }
      },
      "relationship": {
        "id": "a7b661e0-71a3-4909-bcb9-5fdcea867232",
        "properties": {
          "lineColor": "#FDD29A"
        }
      }
    }
  },
  {
    "id": "Fire-#6D3B37-TYPE_B",
    "tags": [
      "Fire",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "0b1c62c2-c1ec-4c8b-8178-59b3db1b8e9a",
        "properties": {
          "fillColor": "#6D3B37",
          "multiLineColors": "",
          "color-list": "#FDD29A #F9A655 #FC901A #E04B51 #A4564C #6D3B37"
        }
      },
      "centralTopic": {
        "id": "1bf286f8-f984-48d7-b9ff-e20e8bb84162",
        "properties": {
          "fillColor": "#FDD29A",
          "lineColor": "#FDD29A"
        }
      },
      "mainTopic": {
        "id": "87e36d6a-da00-40a2-9eb3-c76c1e2b3bc0",
        "properties": {
          "fillColor": "#FDD29A"
        }
      },
      "subTopic": {
        "id": "fe657b22-2703-4b16-be51-fb280ffb896d",
        "properties": {
          "fillColor": "#ffebb3"
        }
      },
      "floatingTopic": {
        "id": "a71450cb-b43b-4bb6-a7d6-91bcaed5dd37",
        "properties": {
          "fillColor": "#F9A655",
          "borderColor": "#F9A655"
        }
      },
      "summaryTopic": {
        "id": "bf8e7341-5136-418e-8027-0e5ee0dc9c20",
        "properties": {
          "fillColor": "#FDD29A",
          "borderColor": "#FDD29A"
        }
      },
      "calloutTopic": {
        "id": "75f626ce-fe4c-4939-b781-367be604a762",
        "properties": {
          "fillColor": "#FDD29A",
          "borderColor": "#FDD29A"
        }
      },
      "importantTopic": {
        "id": "c7514ebf-1528-4ec2-aa3f-7164f3f2a2c5",
        "properties": {
          "fillColor": "#37686c",
          "borderColor": "#37686c"
        }
      },
      "minorTopic": {
        "id": "27fc47ba-3117-4ec2-8cd9-a28f31f531a4",
        "properties": {
          "fillColor": "#37406b",
          "borderColor": "#37406b"
        }
      },
      "boundary": {
        "id": "ae1cb1f4-6185-4808-9f4e-d0e865e6b5ab",
        "properties": {
          "fillColor": "#FDD29A",
          "lineColor": "#FDD29A"
        }
      },
      "summary": {
        "id": "83f5cf72-5831-403b-ab7a-c401a98c76a2",
        "properties": {
          "lineColor": "#FDD29A"
        }
      },
      "relationship": {
        "id": "78453bf1-21cf-45c7-b230-f967180e89c8",
        "properties": {
          "lineColor": "#FDD29A"
        }
      }
    }
  },
  {
    "id": "Christmas-#D5F2E3-TYPE_A",
    "tags": [
      "Christmas",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "c0a0d481-af94-439d-aa09-bb1f589fa6e5",
        "properties": {
          "fillColor": "#D5F2E3",
          "multiLineColors": "",
          "color-list": "#D5F2E3 #F0A346 #E12A37 #BC191E #2D6C65 #101F23"
        }
      },
      "centralTopic": {
        "id": "545893b5-7f5e-4663-8846-f8f6352546f1",
        "properties": {
          "fillColor": "#101F23",
          "lineColor": "#101F23"
        }
      },
      "mainTopic": {
        "id": "e2b21d19-60e4-429b-9b53-0ae79456ac53",
        "properties": {
          "fillColor": "#BC191E"
        }
      },
      "subTopic": {
        "id": "11ff73df-abdf-46c1-934c-e67c7bf42070",
        "properties": {
          "fillColor": "#c0ebd4"
        }
      },
      "floatingTopic": {
        "id": "6884d4e3-0f3b-48bb-b574-1b751468b546",
        "properties": {
          "fillColor": "#E12A37",
          "borderColor": "#E12A37"
        }
      },
      "summaryTopic": {
        "id": "00aecfaf-567a-4ccc-ad1f-ad5fffff9689",
        "properties": {
          "fillColor": "#BC191E",
          "borderColor": "#BC191E"
        }
      },
      "calloutTopic": {
        "id": "aa8ddfd2-9a0e-4cde-9c11-cc01bae608ae",
        "properties": {
          "fillColor": "#BC191E",
          "borderColor": "#BC191E"
        }
      },
      "importantTopic": {
        "id": "d807c51b-34b4-48a7-aacc-3d7c0df570b3",
        "properties": {
          "fillColor": "#2D6C65",
          "borderColor": "#2D6C65"
        }
      },
      "minorTopic": {
        "id": "9d003829-c96c-444a-aab4-1accbe3d6e47",
        "properties": {
          "fillColor": "#101F23",
          "borderColor": "#101F23"
        }
      },
      "boundary": {
        "id": "6c7ebd4a-70e2-4bfd-90e6-48b60392d3f7",
        "properties": {
          "fillColor": "#101F23",
          "lineColor": "#101F23"
        }
      },
      "summary": {
        "id": "ab50bfd0-b9e3-428d-a4ec-79e8a734a056",
        "properties": {
          "lineColor": "#101F23"
        }
      },
      "relationship": {
        "id": "76ae81f7-65bc-4a49-b748-bdf9308601e4",
        "properties": {
          "lineColor": "#101F23"
        }
      }
    }
  },
  {
    "id": "Christmas-#F0A346-TYPE_B",
    "tags": [
      "Christmas",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "6697be52-2214-4660-8209-10368e7dc798",
        "properties": {
          "fillColor": "#F0A346",
          "multiLineColors": "",
          "color-list": "#D5F2E3 #F0A346 #E12A37 #BC191E #2D6C65 #101F23"
        }
      },
      "centralTopic": {
        "id": "0c8ddd53-3c89-404f-a469-36567ffd90f1",
        "properties": {
          "fillColor": "#101F23",
          "lineColor": "#101F23"
        }
      },
      "mainTopic": {
        "id": "198447e0-e104-4e6d-a42d-ee27b23784d5",
        "properties": {
          "fillColor": "#101F23"
        }
      },
      "subTopic": {
        "id": "51638ba8-9161-4b14-a3e6-426cf167a9db",
        "properties": {
          "fillColor": "#29383c"
        }
      },
      "floatingTopic": {
        "id": "e416aaae-f809-435e-9114-fd9f481b6301",
        "properties": {
          "fillColor": "#E12A37",
          "borderColor": "#E12A37"
        }
      },
      "summaryTopic": {
        "id": "0d6206f1-a665-4d50-9037-5de6d08092de",
        "properties": {
          "fillColor": "#101F23",
          "borderColor": "#101F23"
        }
      },
      "calloutTopic": {
        "id": "030b0439-6336-49b3-bd59-57acc9796c26",
        "properties": {
          "fillColor": "#101F23",
          "borderColor": "#101F23"
        }
      },
      "importantTopic": {
        "id": "3b709548-5126-4fc7-96e8-c5b1dee1fd7e",
        "properties": {
          "fillColor": "#4692f0",
          "borderColor": "#4692f0"
        }
      },
      "minorTopic": {
        "id": "1d2d6d55-b20b-4cf6-8fed-779d32cd2da9",
        "properties": {
          "fillColor": "#7946f0",
          "borderColor": "#7946f0"
        }
      },
      "boundary": {
        "id": "f7d72314-3089-48f4-a0e9-94f17f3342cf",
        "properties": {
          "fillColor": "#101F23",
          "lineColor": "#101F23"
        }
      },
      "summary": {
        "id": "2590fdd0-e798-4151-b296-2276c0adf78e",
        "properties": {
          "lineColor": "#101F23"
        }
      },
      "relationship": {
        "id": "8130eab2-d9da-4d5d-86fa-b748da9fd2ff",
        "properties": {
          "lineColor": "#101F23"
        }
      }
    }
  },
  {
    "id": "Christmas-#E12A37-TYPE_A",
    "tags": [
      "Christmas",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "06e9ad1d-8b64-4f18-80f9-8f9d0066994d",
        "properties": {
          "fillColor": "#D5F2E3",
          "multiLineColors": "",
          "color-list": "#D5F2E3 #F0A346 #E12A37 #BC191E #2D6C65 #101F23"
        }
      },
      "centralTopic": {
        "id": "f2bb37d6-dde2-4d85-b016-85531fb1dd25",
        "properties": {
          "fillColor": "#E12A37",
          "lineColor": "#E12A37"
        }
      },
      "mainTopic": {
        "id": "c724b37b-df63-4525-be25-0314c83f4bf1",
        "properties": {
          "fillColor": "#101F23"
        }
      },
      "subTopic": {
        "id": "b3e71582-399b-478b-93ac-2c47f4f97e25",
        "properties": {
          "fillColor": "#c0ebd4"
        }
      },
      "floatingTopic": {
        "id": "018e5de2-922c-4ef0-ad1a-dae82780accf",
        "properties": {
          "fillColor": "#BC191E",
          "borderColor": "#BC191E"
        }
      },
      "summaryTopic": {
        "id": "89561ad4-c5e9-450a-a1b9-745a609c0281",
        "properties": {
          "fillColor": "#101F23",
          "borderColor": "#101F23"
        }
      },
      "calloutTopic": {
        "id": "bfad3566-a0f4-4fad-80e9-fa8d5b5e543e",
        "properties": {
          "fillColor": "#101F23",
          "borderColor": "#101F23"
        }
      },
      "importantTopic": {
        "id": "f4303199-92b1-4a73-862b-affbec05c482",
        "properties": {
          "fillColor": "#BC191E",
          "borderColor": "#BC191E"
        }
      },
      "minorTopic": {
        "id": "81835067-3d06-419a-870f-441ac7ea5a54",
        "properties": {
          "fillColor": "#E12A37",
          "borderColor": "#E12A37"
        }
      },
      "boundary": {
        "id": "963c3d8c-6f8c-444d-b8a1-e0946fd04dba",
        "properties": {
          "fillColor": "#E12A37",
          "lineColor": "#E12A37"
        }
      },
      "summary": {
        "id": "05125220-4f0e-4e46-8ad8-c2435709a606",
        "properties": {
          "lineColor": "#E12A37"
        }
      },
      "relationship": {
        "id": "da07ee5b-7272-438b-8ee8-c0c53eae9409",
        "properties": {
          "lineColor": "#E12A37"
        }
      }
    }
  },
  {
    "id": "Christmas-#BC191E-TYPE_A",
    "tags": [
      "Christmas",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "041f8044-4010-4863-bb68-7c8cca1c22af",
        "properties": {
          "fillColor": "#D5F2E3",
          "multiLineColors": "",
          "color-list": "#D5F2E3 #F0A346 #E12A37 #BC191E #2D6C65 #101F23"
        }
      },
      "centralTopic": {
        "id": "bd139da2-96b7-482b-ba76-37de6e0d050e",
        "properties": {
          "fillColor": "#BC191E",
          "lineColor": "#BC191E"
        }
      },
      "mainTopic": {
        "id": "6fcd5553-6b2e-419f-be08-0c92d3936e87",
        "properties": {
          "fillColor": "#101F23"
        }
      },
      "subTopic": {
        "id": "86943a5c-4100-4150-925f-7413f53f5fdb",
        "properties": {
          "fillColor": "#c0ebd4"
        }
      },
      "floatingTopic": {
        "id": "34aa175a-e5c2-4fe3-9a4a-f7ab4a9ca771",
        "properties": {
          "fillColor": "#E12A37",
          "borderColor": "#E12A37"
        }
      },
      "summaryTopic": {
        "id": "6458c685-1174-4ede-820e-0669ff0cd796",
        "properties": {
          "fillColor": "#101F23",
          "borderColor": "#101F23"
        }
      },
      "calloutTopic": {
        "id": "883321e6-c42f-410f-882a-94edb6108f50",
        "properties": {
          "fillColor": "#101F23",
          "borderColor": "#101F23"
        }
      },
      "importantTopic": {
        "id": "251d6edc-b3eb-4cb5-b1fa-092c469fb688",
        "properties": {
          "fillColor": "#2D6C65",
          "borderColor": "#2D6C65"
        }
      },
      "minorTopic": {
        "id": "f9f88feb-85a3-40a1-9bb4-0252430b7cdf",
        "properties": {
          "fillColor": "#BC191E",
          "borderColor": "#BC191E"
        }
      },
      "boundary": {
        "id": "9237a65c-99ee-46af-ba28-233df1b6a301",
        "properties": {
          "fillColor": "#BC191E",
          "lineColor": "#BC191E"
        }
      },
      "summary": {
        "id": "9c936623-9e35-40e9-9ae3-872da7aa1afc",
        "properties": {
          "lineColor": "#BC191E"
        }
      },
      "relationship": {
        "id": "ea39f208-b942-42ae-88ab-fe11e6a56946",
        "properties": {
          "lineColor": "#BC191E"
        }
      }
    }
  },
  {
    "id": "Christmas-#2D6C65-TYPE_B",
    "tags": [
      "Christmas",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "8d5926dc-ba4b-481e-94e8-cd46d2dbc222",
        "properties": {
          "fillColor": "#2D6C65",
          "multiLineColors": "",
          "color-list": "#D5F2E3 #F0A346 #E12A37 #BC191E #2D6C65 #101F23"
        }
      },
      "centralTopic": {
        "id": "27cecd4a-9246-4eef-85d2-87098ce7b00d",
        "properties": {
          "fillColor": "#D5F2E3",
          "lineColor": "#D5F2E3"
        }
      },
      "mainTopic": {
        "id": "b033726e-e522-4227-b10a-6cb0d8768f04",
        "properties": {
          "fillColor": "#D5F2E3"
        }
      },
      "subTopic": {
        "id": "389b4898-836a-4895-9420-4e6785a6d47c",
        "properties": {
          "fillColor": "#eefffc"
        }
      },
      "floatingTopic": {
        "id": "0164558c-baff-4cd6-999a-200170c4e390",
        "properties": {
          "fillColor": "#F0A346",
          "borderColor": "#F0A346"
        }
      },
      "summaryTopic": {
        "id": "1eb0ae90-d4f5-439e-b7dd-a59fe1e2d0a9",
        "properties": {
          "fillColor": "#D5F2E3",
          "borderColor": "#D5F2E3"
        }
      },
      "calloutTopic": {
        "id": "8fd8019e-9603-48ad-87f3-6614ae362abb",
        "properties": {
          "fillColor": "#D5F2E3",
          "borderColor": "#D5F2E3"
        }
      },
      "importantTopic": {
        "id": "8243ff16-7814-4ba5-a59a-2e4ea3412428",
        "properties": {
          "fillColor": "#6b2d33",
          "borderColor": "#6b2d33"
        }
      },
      "minorTopic": {
        "id": "cce59846-1f29-47bb-be4f-1bce00705b3d",
        "properties": {
          "fillColor": "#6b552c",
          "borderColor": "#6b552c"
        }
      },
      "boundary": {
        "id": "19d79ecb-ffcc-4b79-89dc-ac039ee7c2a8",
        "properties": {
          "fillColor": "#D5F2E3",
          "lineColor": "#D5F2E3"
        }
      },
      "summary": {
        "id": "dda2601d-b7ca-4c5d-bc8d-6744a4ccfe18",
        "properties": {
          "lineColor": "#D5F2E3"
        }
      },
      "relationship": {
        "id": "ee74ef57-2beb-4136-ad08-217964a868d2",
        "properties": {
          "lineColor": "#D5F2E3"
        }
      }
    }
  },
  {
    "id": "Christmas-#101F23-TYPE_C",
    "tags": [
      "Christmas",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "b7116e17-3a44-466c-8981-b65bdd198472",
        "properties": {
          "fillColor": "#101F23",
          "multiLineColors": "",
          "color-list": "#D5F2E3 #F0A346 #E12A37 #BC191E #2D6C65 #101F23"
        }
      },
      "centralTopic": {
        "id": "df723f89-4fa6-4ee3-ad9f-905ad221e2fa",
        "properties": {
          "fillColor": "#D5F2E3",
          "lineColor": "#D5F2E3"
        }
      },
      "mainTopic": {
        "id": "881aa46c-9c6f-4768-b10d-990776065706",
        "properties": {
          "fillColor": "#F0A346"
        }
      },
      "subTopic": {
        "id": "176f708d-3640-4798-8c5d-724655148ead",
        "properties": {
          "fillColor": "#29383c"
        }
      },
      "floatingTopic": {
        "id": "4f3736c7-54e1-423a-b3a6-0fc3c60ef648",
        "properties": {
          "fillColor": "#E12A37",
          "borderColor": "#E12A37"
        }
      },
      "summaryTopic": {
        "id": "f3c683c0-8265-46ba-9ab5-b234a527ac0c",
        "properties": {
          "fillColor": "#F0A346",
          "borderColor": "#F0A346"
        }
      },
      "calloutTopic": {
        "id": "742f9ff0-9b45-46a0-add2-6c80a4f2cd18",
        "properties": {
          "fillColor": "#F0A346",
          "borderColor": "#F0A346"
        }
      },
      "importantTopic": {
        "id": "0cfe004e-37fc-4209-89f2-d61c24a96816",
        "properties": {
          "fillColor": "#E12A37",
          "borderColor": "#E12A37"
        }
      },
      "minorTopic": {
        "id": "ac4f4995-b906-4e46-aa72-1a1d9ef92505",
        "properties": {
          "fillColor": "#D5F2E3",
          "borderColor": "#D5F2E3"
        }
      },
      "boundary": {
        "id": "3b2513fc-5de8-4cb4-9a70-c355e2c3de87",
        "properties": {
          "fillColor": "#D5F2E3",
          "lineColor": "#D5F2E3"
        }
      },
      "summary": {
        "id": "ae780dac-c09b-44fa-9482-53c9a80ff5e7",
        "properties": {
          "lineColor": "#D5F2E3"
        }
      },
      "relationship": {
        "id": "ee3077a2-b57a-4336-acca-406022bf9820",
        "properties": {
          "lineColor": "#D5F2E3"
        }
      }
    }
  },
  {
    "id": "Christmas-#101F23-MULTI_LINE_COLORS",
    "tags": [
      "Christmas",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "cd2719f9-f600-4990-9ec0-65366ccc1cb7",
        "properties": {
          "fillColor": "#101F23",
          "multiLineColors": "#F0A346 #E12A37 #BC191E #2D6C65",
          "color-list": "#D5F2E3 #F0A346 #E12A37 #BC191E #2D6C65 #101F23"
        }
      },
      "centralTopic": {
        "id": "a0c62d45-b6d5-48aa-919e-20b14a2505c3",
        "properties": {
          "fillColor": "#D5F2E3",
          "lineColor": "#D5F2E3"
        }
      },
      "mainTopic": {
        "id": "547018ba-7b1f-4891-aa20-4024ab7503e1",
        "properties": {}
      },
      "subTopic": {
        "id": "bb8beec8-dcad-46fd-b292-455cb50d8d58",
        "properties": {}
      },
      "floatingTopic": {
        "id": "83b40555-5be0-4a5f-903a-088d2fbcda9b",
        "properties": {
          "fillColor": "#E12A37",
          "borderColor": "#E12A37"
        }
      },
      "summaryTopic": {
        "id": "f390533d-0889-4225-8c9d-3d51feaf0d30",
        "properties": {
          "fillColor": "#F0A346",
          "borderColor": "#F0A346"
        }
      },
      "calloutTopic": {
        "id": "81373271-4969-4dd2-880a-a39ef80026a4",
        "properties": {
          "fillColor": "#F0A346",
          "borderColor": "#F0A346"
        }
      },
      "importantTopic": {
        "id": "ccbe2427-c610-425a-9811-7ae0ae308905",
        "properties": {
          "fillColor": "#e1d329",
          "borderColor": "#e1d329"
        }
      },
      "minorTopic": {
        "id": "4941b0d3-38fa-4b5b-bbc7-6b313f66e5e9",
        "properties": {
          "fillColor": "#d4e3f2",
          "borderColor": "#d4e3f2"
        }
      },
      "boundary": {
        "id": "4f9591f3-398d-4c16-84f8-16faa380de7c",
        "properties": {
          "fillColor": "#D5F2E3",
          "lineColor": "#D5F2E3"
        }
      },
      "summary": {
        "id": "ab20a665-9444-46e5-ab84-fb3335634894",
        "properties": {
          "lineColor": "#D5F2E3"
        }
      },
      "relationship": {
        "id": "2f30440c-433d-4217-bdf5-5ee19dc38b19",
        "properties": {
          "lineColor": "#D5F2E3"
        }
      }
    }
  },
  {
    "id": "DeepSea-#B4F2FD-TYPE_A",
    "tags": [
      "DeepSea",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "00ea609d-a80c-4603-a76c-3628ce011a42",
        "properties": {
          "fillColor": "#B4F2FD",
          "multiLineColors": "",
          "color-list": "#B4F2FD #6EE2FD #3BB6E3 #135CAE #01206A #000D2D"
        }
      },
      "centralTopic": {
        "id": "02bf8a9a-87c9-46c1-937c-ab3c6abc78ec",
        "properties": {
          "fillColor": "#000D2D",
          "lineColor": "#000D2D"
        }
      },
      "mainTopic": {
        "id": "b33f0b9a-28a5-447f-bbca-c1425c40d235",
        "properties": {
          "fillColor": "#135CAE"
        }
      },
      "subTopic": {
        "id": "2b2d65ae-1bd1-4191-92d7-23f5dc81876b",
        "properties": {
          "fillColor": "#8eebfc"
        }
      },
      "floatingTopic": {
        "id": "f6563ae7-004e-4c2b-a612-d65e1e58475f",
        "properties": {
          "fillColor": "#3BB6E3",
          "borderColor": "#3BB6E3"
        }
      },
      "summaryTopic": {
        "id": "a0b068b3-1ab5-4d41-ab84-701f32c4c45f",
        "properties": {
          "fillColor": "#135CAE",
          "borderColor": "#135CAE"
        }
      },
      "calloutTopic": {
        "id": "35909d65-3718-419d-b82f-a99f5765188f",
        "properties": {
          "fillColor": "#135CAE",
          "borderColor": "#135CAE"
        }
      },
      "importantTopic": {
        "id": "5e45ab12-de90-4d53-818c-928d226a5cf5",
        "properties": {
          "fillColor": "#01206A",
          "borderColor": "#01206A"
        }
      },
      "minorTopic": {
        "id": "ae04989b-7181-473c-8c77-d4b6c7f7a869",
        "properties": {
          "fillColor": "#000D2D",
          "borderColor": "#000D2D"
        }
      },
      "boundary": {
        "id": "08b07922-0b05-433d-8f2c-8412c005f83b",
        "properties": {
          "fillColor": "#000D2D",
          "lineColor": "#000D2D"
        }
      },
      "summary": {
        "id": "1ecb3a11-f2cf-4bbb-b6fe-55ef50496277",
        "properties": {
          "lineColor": "#000D2D"
        }
      },
      "relationship": {
        "id": "04eaf558-c61f-4383-82fa-066132e902e6",
        "properties": {
          "lineColor": "#000D2D"
        }
      }
    }
  },
  {
    "id": "DeepSea-#6EE2FD-TYPE_B",
    "tags": [
      "DeepSea",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "438fadf0-d015-42ab-82d7-f6ca3ffb1009",
        "properties": {
          "fillColor": "#6EE2FD",
          "multiLineColors": "",
          "color-list": "#B4F2FD #6EE2FD #3BB6E3 #135CAE #01206A #000D2D"
        }
      },
      "centralTopic": {
        "id": "35939995-5746-4542-91be-99c0a38e405d",
        "properties": {
          "fillColor": "#000D2D",
          "lineColor": "#000D2D"
        }
      },
      "mainTopic": {
        "id": "b7c9b71d-c3d6-4277-85a1-04a19621787b",
        "properties": {
          "fillColor": "#000D2D"
        }
      },
      "subTopic": {
        "id": "957ccee1-2d1b-4610-9533-ac0a202a5dd6",
        "properties": {
          "fillColor": "#192646"
        }
      },
      "floatingTopic": {
        "id": "6ebf641f-132b-4bc0-9470-c9ec85a1bbcd",
        "properties": {
          "fillColor": "#3BB6E3",
          "borderColor": "#3BB6E3"
        }
      },
      "summaryTopic": {
        "id": "7209b299-d9d8-4497-a6a1-899e5693ff95",
        "properties": {
          "fillColor": "#000D2D",
          "borderColor": "#000D2D"
        }
      },
      "calloutTopic": {
        "id": "5c8d81c5-2583-4ffc-9f5c-cdd872a71ae0",
        "properties": {
          "fillColor": "#000D2D",
          "borderColor": "#000D2D"
        }
      },
      "importantTopic": {
        "id": "4bfab2b9-a423-4fcf-be6a-66d7d164a372",
        "properties": {
          "fillColor": "#fd896d",
          "borderColor": "#fd896d"
        }
      },
      "minorTopic": {
        "id": "c6f9cede-d502-4686-9f12-bcb5aef8deed",
        "properties": {
          "fillColor": "#fcf46d",
          "borderColor": "#fcf46d"
        }
      },
      "boundary": {
        "id": "2d3dcae5-284f-403e-9036-450a795f0db0",
        "properties": {
          "fillColor": "#000D2D",
          "lineColor": "#000D2D"
        }
      },
      "summary": {
        "id": "d38d231b-9d60-4af3-9059-035f4662571c",
        "properties": {
          "lineColor": "#000D2D"
        }
      },
      "relationship": {
        "id": "cbfa47b5-bedc-4333-90b2-d9403602ffa9",
        "properties": {
          "lineColor": "#000D2D"
        }
      }
    }
  },
  {
    "id": "DeepSea-#3BB6E3-TYPE_C",
    "tags": [
      "DeepSea",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "98aeffd2-6086-4827-81c8-c544ba8448e1",
        "properties": {
          "fillColor": "#000D2D",
          "multiLineColors": "",
          "color-list": "#B4F2FD #6EE2FD #3BB6E3 #135CAE #01206A #000D2D"
        }
      },
      "centralTopic": {
        "id": "ae6b1034-a2f1-4fba-a6b9-23767864a25d",
        "properties": {
          "fillColor": "#3BB6E3",
          "lineColor": "#3BB6E3"
        }
      },
      "mainTopic": {
        "id": "879855c7-9ea9-49ac-860c-a04ebc478b6c",
        "properties": {
          "fillColor": "#B4F2FD"
        }
      },
      "subTopic": {
        "id": "a714cb85-6ff9-4dea-8ff3-50f556bcb343",
        "properties": {
          "fillColor": "#192646"
        }
      },
      "floatingTopic": {
        "id": "978ac393-865a-436c-9d34-73643440843d",
        "properties": {
          "fillColor": "#6EE2FD",
          "borderColor": "#6EE2FD"
        }
      },
      "summaryTopic": {
        "id": "14b82999-cfcb-4dc0-accd-db3ba9a0abe5",
        "properties": {
          "fillColor": "#B4F2FD",
          "borderColor": "#B4F2FD"
        }
      },
      "calloutTopic": {
        "id": "bf7a05dd-7d27-4df4-b72f-1fdcbef21260",
        "properties": {
          "fillColor": "#B4F2FD",
          "borderColor": "#B4F2FD"
        }
      },
      "importantTopic": {
        "id": "f5ad437a-0309-4163-8271-92307c8d6c62",
        "properties": {
          "fillColor": "#6EE2FD",
          "borderColor": "#6EE2FD"
        }
      },
      "minorTopic": {
        "id": "b3e6e621-fb8b-4219-a486-659405978179",
        "properties": {
          "fillColor": "#3BB6E3",
          "borderColor": "#3BB6E3"
        }
      },
      "boundary": {
        "id": "f78aec91-3d12-4a1f-8be6-b1ba5eab3210",
        "properties": {
          "fillColor": "#3BB6E3",
          "lineColor": "#3BB6E3"
        }
      },
      "summary": {
        "id": "1d34a40f-382b-41df-b9e3-d8eaf6f30237",
        "properties": {
          "lineColor": "#3BB6E3"
        }
      },
      "relationship": {
        "id": "ba0df857-a02c-4f9f-b263-9a49af06eb13",
        "properties": {
          "lineColor": "#3BB6E3"
        }
      }
    }
  },
  {
    "id": "DeepSea-#135CAE-TYPE_B",
    "tags": [
      "DeepSea",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "3a1bef17-1bdf-453d-bb5d-6f73cf97742a",
        "properties": {
          "fillColor": "#135CAE",
          "multiLineColors": "",
          "color-list": "#B4F2FD #6EE2FD #3BB6E3 #135CAE #01206A #000D2D"
        }
      },
      "centralTopic": {
        "id": "25d0e93c-f766-4ed7-857e-d75fed368ee6",
        "properties": {
          "fillColor": "#B4F2FD",
          "lineColor": "#B4F2FD"
        }
      },
      "mainTopic": {
        "id": "24107feb-c4d0-4a28-8da4-37b9ce6d736d",
        "properties": {
          "fillColor": "#B4F2FD"
        }
      },
      "subTopic": {
        "id": "a0eb460e-0aff-40ec-ab62-27e95a10d340",
        "properties": {
          "fillColor": "#cdffff"
        }
      },
      "floatingTopic": {
        "id": "3b67d135-c5c4-4fa7-99dd-f13744364af8",
        "properties": {
          "fillColor": "#6EE2FD",
          "borderColor": "#6EE2FD"
        }
      },
      "summaryTopic": {
        "id": "98f093f9-4d5c-4027-b970-5af37ea04230",
        "properties": {
          "fillColor": "#B4F2FD",
          "borderColor": "#B4F2FD"
        }
      },
      "calloutTopic": {
        "id": "8d3b637b-ec60-419d-af38-99172012511d",
        "properties": {
          "fillColor": "#B4F2FD",
          "borderColor": "#B4F2FD"
        }
      },
      "importantTopic": {
        "id": "325d70d6-b74e-4aaf-893d-722213af81c6",
        "properties": {
          "fillColor": "#ae6512",
          "borderColor": "#ae6512"
        }
      },
      "minorTopic": {
        "id": "3fa27864-8f33-4a19-a9f1-cd0c5eddad77",
        "properties": {
          "fillColor": "#82ae11",
          "borderColor": "#82ae11"
        }
      },
      "boundary": {
        "id": "cab42669-04c1-4356-a52f-274cea8a8752",
        "properties": {
          "fillColor": "#B4F2FD",
          "lineColor": "#B4F2FD"
        }
      },
      "summary": {
        "id": "10d81f22-d192-468b-92c9-c17e62e053fe",
        "properties": {
          "lineColor": "#B4F2FD"
        }
      },
      "relationship": {
        "id": "939e365c-0cb8-428a-8de2-f1e2e6433996",
        "properties": {
          "lineColor": "#B4F2FD"
        }
      }
    }
  },
  {
    "id": "DeepSea-#01206A-TYPE_B",
    "tags": [
      "DeepSea",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "0b482f35-684d-45ba-9af3-e320eb95ea76",
        "properties": {
          "fillColor": "#01206A",
          "multiLineColors": "",
          "color-list": "#B4F2FD #6EE2FD #3BB6E3 #135CAE #01206A #000D2D"
        }
      },
      "centralTopic": {
        "id": "a5db6cec-9911-4698-9627-a77f62b438f8",
        "properties": {
          "fillColor": "#B4F2FD",
          "lineColor": "#B4F2FD"
        }
      },
      "mainTopic": {
        "id": "c2509c89-30a5-4ebc-9ee3-c0866ede5b6a",
        "properties": {
          "fillColor": "#B4F2FD"
        }
      },
      "subTopic": {
        "id": "dd4d10ee-5e30-45f8-872a-63df3ac0ac94",
        "properties": {
          "fillColor": "#cdffff"
        }
      },
      "floatingTopic": {
        "id": "2f182b74-82cf-4321-9f56-7e9623de4267",
        "properties": {
          "fillColor": "#6EE2FD",
          "borderColor": "#6EE2FD"
        }
      },
      "summaryTopic": {
        "id": "9c1f21da-a727-4c0b-b7be-680dc25eff24",
        "properties": {
          "fillColor": "#B4F2FD",
          "borderColor": "#B4F2FD"
        }
      },
      "calloutTopic": {
        "id": "86ca181e-dae3-4308-85b2-8058bb47d9a2",
        "properties": {
          "fillColor": "#B4F2FD",
          "borderColor": "#B4F2FD"
        }
      },
      "importantTopic": {
        "id": "6dfc57f6-9e8f-4b4c-835a-002dcca28328",
        "properties": {
          "fillColor": "#6a4b00",
          "borderColor": "#6a4b00"
        }
      },
      "minorTopic": {
        "id": "b5999e47-6956-4e6e-a9ad-2bfe1c2a1671",
        "properties": {
          "fillColor": "#396a00",
          "borderColor": "#396a00"
        }
      },
      "boundary": {
        "id": "da54cdf5-f26f-462f-bce6-c50e6af8b11d",
        "properties": {
          "fillColor": "#B4F2FD",
          "lineColor": "#B4F2FD"
        }
      },
      "summary": {
        "id": "750215ce-762f-4bff-b231-0714c60b5a82",
        "properties": {
          "lineColor": "#B4F2FD"
        }
      },
      "relationship": {
        "id": "30be945c-773c-4923-90f2-f68e9f4d26e6",
        "properties": {
          "lineColor": "#B4F2FD"
        }
      }
    }
  },
  {
    "id": "DeepSea-#000D2D-TYPE_C",
    "tags": [
      "DeepSea",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "801884c1-2831-4615-a616-7fe2263f2da2",
        "properties": {
          "fillColor": "#000D2D",
          "multiLineColors": "",
          "color-list": "#B4F2FD #6EE2FD #3BB6E3 #135CAE #01206A #000D2D"
        }
      },
      "centralTopic": {
        "id": "147f08e0-1343-4ad8-8b34-71cc946da0e5",
        "properties": {
          "fillColor": "#B4F2FD",
          "lineColor": "#B4F2FD"
        }
      },
      "mainTopic": {
        "id": "64237e99-47fe-450d-8a54-54963bd4c1f9",
        "properties": {
          "fillColor": "#6EE2FD"
        }
      },
      "subTopic": {
        "id": "a87c6f1b-346e-4ad7-8109-03878adddafd",
        "properties": {
          "fillColor": "#192646"
        }
      },
      "floatingTopic": {
        "id": "e0efe1e1-c598-4873-aa2e-bc6f1057b2b7",
        "properties": {
          "fillColor": "#3BB6E3",
          "borderColor": "#3BB6E3"
        }
      },
      "summaryTopic": {
        "id": "06b87e75-d5ad-4c4a-a51d-1d0f76fada95",
        "properties": {
          "fillColor": "#6EE2FD",
          "borderColor": "#6EE2FD"
        }
      },
      "calloutTopic": {
        "id": "e527b8bb-7f42-44aa-82e7-7919e00ff5c3",
        "properties": {
          "fillColor": "#6EE2FD",
          "borderColor": "#6EE2FD"
        }
      },
      "importantTopic": {
        "id": "d0ebed63-4791-4a4d-bf0a-be2e37000145",
        "properties": {
          "fillColor": "#3BB6E3",
          "borderColor": "#3BB6E3"
        }
      },
      "minorTopic": {
        "id": "68c3ea35-86fc-4ff6-ba76-fcbdd09e75e8",
        "properties": {
          "fillColor": "#B4F2FD",
          "borderColor": "#B4F2FD"
        }
      },
      "boundary": {
        "id": "87dd9deb-05ec-4189-96c2-6d9048621fde",
        "properties": {
          "fillColor": "#B4F2FD",
          "lineColor": "#B4F2FD"
        }
      },
      "summary": {
        "id": "615e0054-56a3-4e08-b7f0-9cee10b33dd8",
        "properties": {
          "lineColor": "#B4F2FD"
        }
      },
      "relationship": {
        "id": "a429aade-c7f1-4d7d-86c5-ab2bdbee5d54",
        "properties": {
          "lineColor": "#B4F2FD"
        }
      }
    }
  },
  {
    "id": "DeepSea-#000D2D-MULTI_LINE_COLORS",
    "tags": [
      "DeepSea",
      "TYPE_C"
    ],
    "theme": {
      "map": {
        "id": "0e12510a-300b-4a26-a73a-012cd12e1545",
        "properties": {
          "fillColor": "#000D2D",
          "multiLineColors": "#6EE2FD #3BB6E3 #135CAE",
          "color-list": "#B4F2FD #6EE2FD #3BB6E3 #135CAE #01206A #000D2D"
        }
      },
      "centralTopic": {
        "id": "781dd4ad-bb40-4515-bf21-5c89ebbfaf12",
        "properties": {
          "fillColor": "#B4F2FD",
          "lineColor": "#B4F2FD"
        }
      },
      "mainTopic": {
        "id": "f07f117e-8397-4caa-bdfd-2bc69178ca7f",
        "properties": {}
      },
      "subTopic": {
        "id": "f62bbf1e-8906-48ca-8480-a7a83193f129",
        "properties": {}
      },
      "floatingTopic": {
        "id": "ee0d7f26-16c9-4cb1-93fa-b1a2824a17c5",
        "properties": {
          "fillColor": "#3BB6E3",
          "borderColor": "#3BB6E3"
        }
      },
      "summaryTopic": {
        "id": "2c54cc25-1521-44f9-9eff-d87220985e70",
        "properties": {
          "fillColor": "#6EE2FD",
          "borderColor": "#6EE2FD"
        }
      },
      "calloutTopic": {
        "id": "083cc208-b3d8-4b95-a92a-d44341f5c046",
        "properties": {
          "fillColor": "#6EE2FD",
          "borderColor": "#6EE2FD"
        }
      },
      "importantTopic": {
        "id": "a557ece2-617f-479b-a519-c3bbd5ac2930",
        "properties": {
          "fillColor": "#673be2",
          "borderColor": "#673be2"
        }
      },
      "minorTopic": {
        "id": "4a64c5b4-ca1e-499e-90d1-08c08b76e50f",
        "properties": {
          "fillColor": "#bfb4fd",
          "borderColor": "#bfb4fd"
        }
      },
      "boundary": {
        "id": "3b0b0769-36c4-4c4a-a3fb-d25310f24b03",
        "properties": {
          "fillColor": "#B4F2FD",
          "lineColor": "#B4F2FD"
        }
      },
      "summary": {
        "id": "38ce7f4b-e671-41ba-b96a-d40b98471eec",
        "properties": {
          "lineColor": "#B4F2FD"
        }
      },
      "relationship": {
        "id": "bfd011e9-c0f2-4ed3-8e4c-96432a2e93b5",
        "properties": {
          "lineColor": "#B4F2FD"
        }
      }
    }
  },
  {
    "id": "Islands-#ffe8d6-TYPE_A",
    "tags": [
      "Islands",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "d784e027-b011-4172-9caf-cf953f7f6eaf",
        "properties": {
          "fillColor": "#ffe8d6",
          "multiLineColors": "",
          "color-list": "#ffe8d6 #ddbea9 #cb997e #b7b7a4 #a5a58d #6b705c"
        }
      },
      "centralTopic": {
        "id": "e62001e8-934d-4312-bda0-4c976777c604",
        "properties": {
          "fillColor": "#6b705c",
          "lineColor": "#6b705c"
        }
      },
      "mainTopic": {
        "id": "40843695-9b7e-4b49-a478-a1d0898f7f25",
        "properties": {
          "fillColor": "#a5a58d"
        }
      },
      "subTopic": {
        "id": "418f7c5b-04fb-4505-8900-3523d95ec3f2",
        "properties": {
          "fillColor": "#fedcc1"
        }
      },
      "floatingTopic": {
        "id": "c7602c18-f423-472c-89f5-f033c4819977",
        "properties": {
          "fillColor": "#cb997e",
          "borderColor": "#cb997e"
        }
      },
      "summaryTopic": {
        "id": "b11ff507-2497-48e2-af6a-e4cbfd7b3266",
        "properties": {
          "fillColor": "#a5a58d",
          "borderColor": "#a5a58d"
        }
      },
      "calloutTopic": {
        "id": "fff74fbd-d3da-4ba4-82bb-a3d45db9a8ff",
        "properties": {
          "fillColor": "#a5a58d",
          "borderColor": "#a5a58d"
        }
      },
      "importantTopic": {
        "id": "a666a573-6a41-44ea-ac3f-45baad6fe6e4",
        "properties": {
          "fillColor": "#cb997e",
          "borderColor": "#cb997e"
        }
      },
      "minorTopic": {
        "id": "bdbacd61-4580-46f9-a11e-8a137e0689c5",
        "properties": {
          "fillColor": "#6b705c",
          "borderColor": "#6b705c"
        }
      },
      "boundary": {
        "id": "8beca357-cc7d-4877-a6bf-e9e5d62a2190",
        "properties": {
          "fillColor": "#6b705c",
          "lineColor": "#6b705c"
        }
      },
      "summary": {
        "id": "1f100bf1-195b-49f8-8174-ca90a4285659",
        "properties": {
          "lineColor": "#6b705c"
        }
      },
      "relationship": {
        "id": "09debdc1-e1e6-4039-b5f2-3ea9ec77b334",
        "properties": {
          "lineColor": "#6b705c"
        }
      }
    }
  },
  {
    "id": "Islands-#ddbea9-TYPE_B",
    "tags": [
      "Islands",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "06291abe-3bf1-49b2-b238-048437737ec8",
        "properties": {
          "fillColor": "#ddbea9",
          "multiLineColors": "",
          "color-list": "#ffe8d6 #ddbea9 #cb997e #b7b7a4 #a5a58d #6b705c"
        }
      },
      "centralTopic": {
        "id": "84764da7-e896-4f9e-ad30-5cb449825055",
        "properties": {
          "fillColor": "#6b705c",
          "lineColor": "#6b705c"
        }
      },
      "mainTopic": {
        "id": "e5da9d7c-c488-4fac-96aa-b61628a1f2ed",
        "properties": {
          "fillColor": "#ffe8d6"
        }
      },
      "subTopic": {
        "id": "b27a9cbe-556a-4898-888e-52e8289376ff",
        "properties": {
          "fillColor": "#ffffef"
        }
      },
      "floatingTopic": {
        "id": "1e0a09db-ea13-4702-af1b-35a33a9b8972",
        "properties": {
          "fillColor": "#cb997e",
          "borderColor": "#cb997e"
        }
      },
      "summaryTopic": {
        "id": "cee65f29-b2d3-4382-9855-8f32403913ad",
        "properties": {
          "fillColor": "#ffe8d6",
          "borderColor": "#ffe8d6"
        }
      },
      "calloutTopic": {
        "id": "982fac20-400c-4493-bbf6-d3a6fdafaa2a",
        "properties": {
          "fillColor": "#ffe8d6",
          "borderColor": "#ffe8d6"
        }
      },
      "importantTopic": {
        "id": "2f67a17e-11f5-4f8d-accd-85d7eba65681",
        "properties": {
          "fillColor": "#a9c7dc",
          "borderColor": "#a9c7dc"
        }
      },
      "minorTopic": {
        "id": "acdbece9-8b79-411a-8fb8-8425cc7c8f71",
        "properties": {
          "fillColor": "#b1a8dc",
          "borderColor": "#b1a8dc"
        }
      },
      "boundary": {
        "id": "1467885d-cbea-471e-8e8a-95e428781d16",
        "properties": {
          "fillColor": "#6b705c",
          "lineColor": "#6b705c"
        }
      },
      "summary": {
        "id": "4859b2c5-9d0d-4409-a272-60fedc6f6f4f",
        "properties": {
          "lineColor": "#6b705c"
        }
      },
      "relationship": {
        "id": "44a63648-9722-4667-a6c1-2ac998494593",
        "properties": {
          "lineColor": "#6b705c"
        }
      }
    }
  },
  {
    "id": "Islands-#cb997e-TYPE_B",
    "tags": [
      "Islands",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "f7321e02-361d-4e89-8a16-43583a2272f4",
        "properties": {
          "fillColor": "#cb997e",
          "multiLineColors": "",
          "color-list": "#ffe8d6 #ddbea9 #cb997e #b7b7a4 #a5a58d #6b705c"
        }
      },
      "centralTopic": {
        "id": "a5c95601-173a-4283-b19a-d886d606f8e9",
        "properties": {
          "fillColor": "#ffe8d6",
          "lineColor": "#ffe8d6"
        }
      },
      "mainTopic": {
        "id": "10010040-79fd-4118-8630-eb4b90849749",
        "properties": {
          "fillColor": "#6b705c"
        }
      },
      "subTopic": {
        "id": "cefbff60-db6e-4c7f-be7e-a600f09818c0",
        "properties": {
          "fillColor": "#848975"
        }
      },
      "floatingTopic": {
        "id": "4a8184a1-dbd7-4d53-b9d1-0e420324fbd3",
        "properties": {
          "fillColor": "#ddbea9",
          "borderColor": "#ddbea9"
        }
      },
      "summaryTopic": {
        "id": "75426d18-1fc0-4b55-b108-e6eb8c0f7887",
        "properties": {
          "fillColor": "#6b705c",
          "borderColor": "#6b705c"
        }
      },
      "calloutTopic": {
        "id": "dd0d89e7-84d2-4487-a80f-d016ac2b2f47",
        "properties": {
          "fillColor": "#6b705c",
          "borderColor": "#6b705c"
        }
      },
      "importantTopic": {
        "id": "a4950515-1f6b-47a3-a04a-b73fb12f6321",
        "properties": {
          "fillColor": "#7eafca",
          "borderColor": "#7eafca"
        }
      },
      "minorTopic": {
        "id": "b3fc7bcb-99b9-467f-876a-d3986add9e69",
        "properties": {
          "fillColor": "#857ec9",
          "borderColor": "#857ec9"
        }
      },
      "boundary": {
        "id": "decdc947-3db9-4ffe-b762-32e012e3e2ff",
        "properties": {
          "fillColor": "#ffe8d6",
          "lineColor": "#ffe8d6"
        }
      },
      "summary": {
        "id": "bc39e04a-14a0-488b-a92c-81134cc81d68",
        "properties": {
          "lineColor": "#ffe8d6"
        }
      },
      "relationship": {
        "id": "64fa8f5e-813b-48e7-874a-9bec78d858e3",
        "properties": {
          "lineColor": "#ffe8d6"
        }
      }
    }
  },
  {
    "id": "Islands-#b7b7a4-TYPE_B",
    "tags": [
      "Islands",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "c2efdbf0-ef92-4f34-bd6d-40f2ae030d71",
        "properties": {
          "fillColor": "#b7b7a4",
          "multiLineColors": "",
          "color-list": "#ffe8d6 #ddbea9 #cb997e #b7b7a4 #a5a58d #6b705c"
        }
      },
      "centralTopic": {
        "id": "4c4da714-0abd-4544-ba44-20c44b0ed7a7",
        "properties": {
          "fillColor": "#6b705c",
          "lineColor": "#6b705c"
        }
      },
      "mainTopic": {
        "id": "da26fd8e-d532-4221-b7a4-d3ac91a8ccdd",
        "properties": {
          "fillColor": "#ffe8d6"
        }
      },
      "subTopic": {
        "id": "02850506-b3b0-4a6e-b1f8-24678adbbc22",
        "properties": {
          "fillColor": "#ffffef"
        }
      },
      "floatingTopic": {
        "id": "9aaaa5ea-781e-4faf-a246-cd4b59674e14",
        "properties": {
          "fillColor": "#ffe8d6",
          "borderColor": "#ffe8d6"
        }
      },
      "summaryTopic": {
        "id": "ec0fc3cd-9adb-41f5-9770-054e14f062e5",
        "properties": {
          "fillColor": "#ffe8d6",
          "borderColor": "#ffe8d6"
        }
      },
      "calloutTopic": {
        "id": "891eb3d3-c677-4be3-970b-504566716ca9",
        "properties": {
          "fillColor": "#ffe8d6",
          "borderColor": "#ffe8d6"
        }
      },
      "importantTopic": {
        "id": "a58ac9a9-4511-4874-8df5-23e2bdf2215c",
        "properties": {
          "fillColor": "#a4a4b7",
          "borderColor": "#a4a4b7"
        }
      },
      "minorTopic": {
        "id": "1ebbbc4d-b85f-4fa2-9164-6bfaaa34014b",
        "properties": {
          "fillColor": "#b2a4b7",
          "borderColor": "#b2a4b7"
        }
      },
      "boundary": {
        "id": "97d461ee-4a4a-40b7-96c3-6cdfb68b7943",
        "properties": {
          "fillColor": "#6b705c",
          "lineColor": "#6b705c"
        }
      },
      "summary": {
        "id": "bdb9e33e-6ca5-4fe4-abe3-abfa2088b6e9",
        "properties": {
          "lineColor": "#6b705c"
        }
      },
      "relationship": {
        "id": "4878fa7c-c17f-433c-acf7-e81100d47218",
        "properties": {
          "lineColor": "#6b705c"
        }
      }
    }
  },
  {
    "id": "Islands-#a5a58d-TYPE_B",
    "tags": [
      "Islands",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "f7f6a8a8-18d3-4449-be8c-2ca3f5a4861b",
        "properties": {
          "fillColor": "#a5a58d",
          "multiLineColors": "",
          "color-list": "#ffe8d6 #ddbea9 #cb997e #b7b7a4 #a5a58d #6b705c"
        }
      },
      "centralTopic": {
        "id": "3d777354-2194-4b1f-9f74-a3e09f5e0fad",
        "properties": {
          "fillColor": "#ffe8d6",
          "lineColor": "#ffe8d6"
        }
      },
      "mainTopic": {
        "id": "f6965679-e85a-4f8c-b754-87aae0abb8ec",
        "properties": {
          "fillColor": "#6b705c"
        }
      },
      "subTopic": {
        "id": "fd8a32b2-5467-481a-a045-23f1f27ffa96",
        "properties": {
          "fillColor": "#848975"
        }
      },
      "floatingTopic": {
        "id": "5a966471-2074-43f0-b815-734818cda268",
        "properties": {
          "fillColor": "#ddbea9",
          "borderColor": "#ddbea9"
        }
      },
      "summaryTopic": {
        "id": "6bfb6261-71d9-4c8e-863a-a50e1dcbeb80",
        "properties": {
          "fillColor": "#6b705c",
          "borderColor": "#6b705c"
        }
      },
      "calloutTopic": {
        "id": "f16cffe2-622c-4ea8-b0a7-2ac93f31aa3b",
        "properties": {
          "fillColor": "#6b705c",
          "borderColor": "#6b705c"
        }
      },
      "importantTopic": {
        "id": "04c832cd-794a-4cf1-a291-0055e8309ddc",
        "properties": {
          "fillColor": "#8d8da5",
          "borderColor": "#8d8da5"
        }
      },
      "minorTopic": {
        "id": "0f6ab9e0-bb65-45cc-9587-a7848631f07c",
        "properties": {
          "fillColor": "#9f8da5",
          "borderColor": "#9f8da5"
        }
      },
      "boundary": {
        "id": "5255381a-de09-48b8-90fd-eaafb1649866",
        "properties": {
          "fillColor": "#ffe8d6",
          "lineColor": "#ffe8d6"
        }
      },
      "summary": {
        "id": "4bfa2948-9eec-43eb-a008-527d4330e49a",
        "properties": {
          "lineColor": "#ffe8d6"
        }
      },
      "relationship": {
        "id": "0df91f00-a71e-4603-aa1a-30a42cecf9a7",
        "properties": {
          "lineColor": "#ffe8d6"
        }
      }
    }
  },
  {
    "id": "Islands-#6b705c-TYPE_B",
    "tags": [
      "Islands",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "cb072bd4-ab69-465c-8cb1-181417a31d5a",
        "properties": {
          "fillColor": "#6b705c",
          "multiLineColors": "",
          "color-list": "#ffe8d6 #ddbea9 #cb997e #b7b7a4 #a5a58d #6b705c"
        }
      },
      "centralTopic": {
        "id": "2091e4e9-3015-4819-be84-e3f7eae04209",
        "properties": {
          "fillColor": "#ffe8d6",
          "lineColor": "#ffe8d6"
        }
      },
      "mainTopic": {
        "id": "ae8a587b-3126-4339-b23a-2144b05175e3",
        "properties": {
          "fillColor": "#ffe8d6"
        }
      },
      "subTopic": {
        "id": "dc03d6ba-4e87-4340-b384-71744f9df66b",
        "properties": {
          "fillColor": "#ffffef"
        }
      },
      "floatingTopic": {
        "id": "b0fb2853-3319-4ea1-8230-777860a85b2d",
        "properties": {
          "fillColor": "#ddbea9",
          "borderColor": "#ddbea9"
        }
      },
      "summaryTopic": {
        "id": "ffe34e0d-7331-4412-b3a8-eca616bcd866",
        "properties": {
          "fillColor": "#ffe8d6",
          "borderColor": "#ffe8d6"
        }
      },
      "calloutTopic": {
        "id": "65460264-9ef4-4110-b988-e0d8cff3c1f3",
        "properties": {
          "fillColor": "#ffe8d6",
          "borderColor": "#ffe8d6"
        }
      },
      "importantTopic": {
        "id": "79141bc7-5b4f-48c6-8a03-364d40f74402",
        "properties": {
          "fillColor": "#615c70",
          "borderColor": "#615c70"
        }
      },
      "minorTopic": {
        "id": "83044bbc-0c8e-4a83-ab5d-7f2373943b2a",
        "properties": {
          "fillColor": "#705c70",
          "borderColor": "#705c70"
        }
      },
      "boundary": {
        "id": "86062de9-c921-4be6-bfb7-bbbb35266038",
        "properties": {
          "fillColor": "#ffe8d6",
          "lineColor": "#ffe8d6"
        }
      },
      "summary": {
        "id": "f77d280a-d353-4060-a77f-89ba2fbc6b5e",
        "properties": {
          "lineColor": "#ffe8d6"
        }
      },
      "relationship": {
        "id": "8283115e-dcb9-4455-afdf-3ab15f543dbf",
        "properties": {
          "lineColor": "#ffe8d6"
        }
      }
    }
  },
  {
    "id": "Islands-#ffe8d6-MULTI_LINE_COLORS",
    "tags": [
      "Islands",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "d6feb8ce-fc9b-46f0-8054-65b5d9c761f3",
        "properties": {
          "fillColor": "#ffe8d6",
          "multiLineColors": "#ddbea9 #cb997e #b7b7a4 #a5a58d",
          "color-list": "#ffe8d6 #ddbea9 #cb997e #b7b7a4 #a5a58d #6b705c"
        }
      },
      "centralTopic": {
        "id": "d1d066db-3618-43cf-b37a-b1c76f61c396",
        "properties": {
          "fillColor": "#6b705c",
          "lineColor": "#6b705c"
        }
      },
      "mainTopic": {
        "id": "7c2267ef-73b5-4f6f-acac-37b27ab8f4aa",
        "properties": {}
      },
      "subTopic": {
        "id": "c75995f0-102b-4400-aaa3-7c8193023839",
        "properties": {}
      },
      "floatingTopic": {
        "id": "8e2ccf6e-da8b-472a-a27f-f7e035807fa8",
        "properties": {
          "fillColor": "#cb997e",
          "borderColor": "#cb997e"
        }
      },
      "summaryTopic": {
        "id": "347dba52-cbfa-4d1b-833a-d1742f9c3daf",
        "properties": {
          "fillColor": "#a5a58d",
          "borderColor": "#a5a58d"
        }
      },
      "calloutTopic": {
        "id": "f525dc66-fc26-4bfd-a36b-17315e596ec3",
        "properties": {
          "fillColor": "#a5a58d",
          "borderColor": "#a5a58d"
        }
      },
      "importantTopic": {
        "id": "642ffafd-5b64-43e5-822c-0cf36410a3fe",
        "properties": {
          "fillColor": "#afca7e",
          "borderColor": "#afca7e"
        }
      },
      "minorTopic": {
        "id": "6cfb56a9-f907-4019-8383-05bf6c3523a6",
        "properties": {
          "fillColor": "#5c7061",
          "borderColor": "#5c7061"
        }
      },
      "boundary": {
        "id": "2d6cae89-bc12-4221-a0c3-e83bd5dd648c",
        "properties": {
          "fillColor": "#6b705c",
          "lineColor": "#6b705c"
        }
      },
      "summary": {
        "id": "5c62a2b3-1aeb-4bac-ab96-6fda7d2aaa9c",
        "properties": {
          "lineColor": "#6b705c"
        }
      },
      "relationship": {
        "id": "7b942167-f4f9-48c0-920d-ecd084336612",
        "properties": {
          "lineColor": "#6b705c"
        }
      }
    }
  },
  {
    "id": "Violet-#FFFBEF-TYPE_A",
    "tags": [
      "Violet",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "db88ebc0-217b-45cb-9c60-d9552d1da07f",
        "properties": {
          "fillColor": "#FFFBEF",
          "multiLineColors": "",
          "color-list": "#FFFBEF #FBD58A #DCBEF4 #b67be6 #9d4edd #72369d"
        }
      },
      "centralTopic": {
        "id": "1006b190-eca6-4889-98ab-1c52e1aeaee2",
        "properties": {
          "fillColor": "#72369d",
          "lineColor": "#72369d"
        }
      },
      "mainTopic": {
        "id": "d2a47f68-1e67-44b9-b8b2-48436d7901b1",
        "properties": {
          "fillColor": "#9d4edd"
        }
      },
      "subTopic": {
        "id": "59ece4b7-6945-4764-8d5e-4d9d2b95db9d",
        "properties": {
          "fillColor": "#fef8e6"
        }
      },
      "floatingTopic": {
        "id": "88cccb04-07fb-4865-91cb-5c2e02b08a24",
        "properties": {
          "fillColor": "#DCBEF4",
          "borderColor": "#DCBEF4"
        }
      },
      "summaryTopic": {
        "id": "2a1ebc06-31fd-4fb8-88ce-45109049ae43",
        "properties": {
          "fillColor": "#9d4edd",
          "borderColor": "#9d4edd"
        }
      },
      "calloutTopic": {
        "id": "ecbf27a8-754e-4b3d-838a-592d6d34a158",
        "properties": {
          "fillColor": "#9d4edd",
          "borderColor": "#9d4edd"
        }
      },
      "importantTopic": {
        "id": "c7edbbb6-012f-4fe9-b07c-501a65be7c22",
        "properties": {
          "fillColor": "#b67be6",
          "borderColor": "#b67be6"
        }
      },
      "minorTopic": {
        "id": "bd8ce57a-33fd-4313-9ea3-0a6556ca25fd",
        "properties": {
          "fillColor": "#72369d",
          "borderColor": "#72369d"
        }
      },
      "boundary": {
        "id": "a023876b-4183-4d50-aed9-c062687cea2d",
        "properties": {
          "fillColor": "#72369d",
          "lineColor": "#72369d"
        }
      },
      "summary": {
        "id": "01fd567d-6c27-4856-8544-7276570384b6",
        "properties": {
          "lineColor": "#72369d"
        }
      },
      "relationship": {
        "id": "9c120327-8a48-44bc-a70d-c8ae835a7a32",
        "properties": {
          "lineColor": "#72369d"
        }
      }
    }
  },
  {
    "id": "Violet-#FBD58A-TYPE_B",
    "tags": [
      "Violet",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "a4216585-0b5a-4faf-9db6-e154c7ac491e",
        "properties": {
          "fillColor": "#FBD58A",
          "multiLineColors": "",
          "color-list": "#FFFBEF #FBD58A #DCBEF4 #b67be6 #9d4edd #72369d"
        }
      },
      "centralTopic": {
        "id": "14cab0db-0fd4-4e40-8f8f-10cd901f1859",
        "properties": {
          "fillColor": "#72369d",
          "lineColor": "#72369d"
        }
      },
      "mainTopic": {
        "id": "62c5d4ac-f7ee-4f63-80d1-096b3343c345",
        "properties": {
          "fillColor": "#72369d"
        }
      },
      "subTopic": {
        "id": "55c5572d-f8fe-44c0-84cb-ba131bbbbf36",
        "properties": {
          "fillColor": "#8b4fb6"
        }
      },
      "floatingTopic": {
        "id": "daec83f8-6b0a-4460-b5a6-35339df38432",
        "properties": {
          "fillColor": "#FFFBEF",
          "borderColor": "#FFFBEF"
        }
      },
      "summaryTopic": {
        "id": "c36a864e-0516-4c87-a554-91ee3ec6e134",
        "properties": {
          "fillColor": "#72369d",
          "borderColor": "#72369d"
        }
      },
      "calloutTopic": {
        "id": "6107b6df-f636-40fb-a3c3-4288af48065e",
        "properties": {
          "fillColor": "#72369d",
          "borderColor": "#72369d"
        }
      },
      "importantTopic": {
        "id": "c751a8f1-7156-426d-aea7-bcd02c3979ed",
        "properties": {
          "fillColor": "#8aaffb",
          "borderColor": "#8aaffb"
        }
      },
      "minorTopic": {
        "id": "b0cb94a3-2812-427b-90c8-3cd4e00dc9a2",
        "properties": {
          "fillColor": "#b98afb",
          "borderColor": "#b98afb"
        }
      },
      "boundary": {
        "id": "9aa1a90c-3491-4361-871c-d63b42429d6a",
        "properties": {
          "fillColor": "#72369d",
          "lineColor": "#72369d"
        }
      },
      "summary": {
        "id": "1c3759ea-fd5b-455f-ad0a-d30c55304e9c",
        "properties": {
          "lineColor": "#72369d"
        }
      },
      "relationship": {
        "id": "1920c9df-a126-4f23-9fad-c5d97a83a14b",
        "properties": {
          "lineColor": "#72369d"
        }
      }
    }
  },
  {
    "id": "Violet-#DCBEF4-TYPE_A",
    "tags": [
      "Violet",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "bed7b905-8f36-40e3-82f7-c4ded24b798c",
        "properties": {
          "fillColor": "#DCBEF4",
          "multiLineColors": "",
          "color-list": "#FFFBEF #FBD58A #DCBEF4 #b67be6 #9d4edd #72369d"
        }
      },
      "centralTopic": {
        "id": "255bb055-2d2f-47c4-9263-5816d0ed733c",
        "properties": {
          "fillColor": "#72369d",
          "lineColor": "#72369d"
        }
      },
      "mainTopic": {
        "id": "b48b5aab-b8e2-4863-a3a1-ae7319c694c1",
        "properties": {
          "fillColor": "#9d4edd"
        }
      },
      "subTopic": {
        "id": "9a318709-dc63-4d80-83c1-e9f1178aad7d",
        "properties": {
          "fillColor": "#ca9dee"
        }
      },
      "floatingTopic": {
        "id": "7f28ca69-aa8d-4380-beb0-fa1b5222c272",
        "properties": {
          "fillColor": "#FFFBEF",
          "borderColor": "#FFFBEF"
        }
      },
      "summaryTopic": {
        "id": "af144cfa-fb88-4dce-9415-faa87b69158e",
        "properties": {
          "fillColor": "#9d4edd",
          "borderColor": "#9d4edd"
        }
      },
      "calloutTopic": {
        "id": "a3316980-aac9-4a68-8b86-c5870e87b7d9",
        "properties": {
          "fillColor": "#9d4edd",
          "borderColor": "#9d4edd"
        }
      },
      "importantTopic": {
        "id": "c5ece1ab-a343-4deb-b071-f039c2f27eb8",
        "properties": {
          "fillColor": "#b67be6",
          "borderColor": "#b67be6"
        }
      },
      "minorTopic": {
        "id": "0f5c4c2a-9fae-40e9-802c-d328fe609bac",
        "properties": {
          "fillColor": "#72369d",
          "borderColor": "#72369d"
        }
      },
      "boundary": {
        "id": "0ed2d42a-af29-44e3-8319-478c9bee2b5f",
        "properties": {
          "fillColor": "#72369d",
          "lineColor": "#72369d"
        }
      },
      "summary": {
        "id": "0a18f4da-50ce-4494-a74c-b3f61c35628a",
        "properties": {
          "lineColor": "#72369d"
        }
      },
      "relationship": {
        "id": "5f9e48f0-e026-49c9-af33-6a8f55432f46",
        "properties": {
          "lineColor": "#72369d"
        }
      }
    }
  },
  {
    "id": "Violet-#b67be6-TYPE_B",
    "tags": [
      "Violet",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "f2c8d986-878b-4d4a-bc07-0b2c76385898",
        "properties": {
          "fillColor": "#b67be6",
          "multiLineColors": "",
          "color-list": "#FFFBEF #FBD58A #DCBEF4 #b67be6 #9d4edd #72369d"
        }
      },
      "centralTopic": {
        "id": "9f4f42b4-3d75-47fd-a5ea-5a25d272717e",
        "properties": {
          "fillColor": "#FFFBEF",
          "lineColor": "#FFFBEF"
        }
      },
      "mainTopic": {
        "id": "22940ddd-149c-4feb-8727-38bc7de70a20",
        "properties": {
          "fillColor": "#72369d"
        }
      },
      "subTopic": {
        "id": "1d568f2e-128b-4068-9306-903fd954d96d",
        "properties": {
          "fillColor": "#8b4fb6"
        }
      },
      "floatingTopic": {
        "id": "d62bdf03-5f36-4247-853f-ea0a96a9b99f",
        "properties": {
          "fillColor": "#FBD58A",
          "borderColor": "#FBD58A"
        }
      },
      "summaryTopic": {
        "id": "e641990f-656f-4627-9637-78ed441d12f0",
        "properties": {
          "fillColor": "#72369d",
          "borderColor": "#72369d"
        }
      },
      "calloutTopic": {
        "id": "c47df56b-ab56-40c1-8e7d-06959ecd605d",
        "properties": {
          "fillColor": "#72369d",
          "borderColor": "#72369d"
        }
      },
      "importantTopic": {
        "id": "6b14dc71-ba18-426f-ae09-58c39a280d42",
        "properties": {
          "fillColor": "#abe57b",
          "borderColor": "#abe57b"
        }
      },
      "minorTopic": {
        "id": "abb545b0-e912-48e3-8d51-653a6f9b760a",
        "properties": {
          "fillColor": "#7ae59a",
          "borderColor": "#7ae59a"
        }
      },
      "boundary": {
        "id": "ae4b094c-71fb-42c0-9490-f912e5ebeb45",
        "properties": {
          "fillColor": "#FFFBEF",
          "lineColor": "#FFFBEF"
        }
      },
      "summary": {
        "id": "31180e4c-4636-41c6-ba0d-7553e8c3b82e",
        "properties": {
          "lineColor": "#FFFBEF"
        }
      },
      "relationship": {
        "id": "5cf51b62-ab58-4779-8f31-55c252cad322",
        "properties": {
          "lineColor": "#FFFBEF"
        }
      }
    }
  },
  {
    "id": "Violet-#9d4edd-TYPE_B",
    "tags": [
      "Violet",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "21e0dcfd-90ed-4873-b7c7-b479641329c4",
        "properties": {
          "fillColor": "#9d4edd",
          "multiLineColors": "",
          "color-list": "#FFFBEF #FBD58A #DCBEF4 #b67be6 #9d4edd #72369d"
        }
      },
      "centralTopic": {
        "id": "352ca239-37a7-4adc-91d9-cf0486d47197",
        "properties": {
          "fillColor": "#FFFBEF",
          "lineColor": "#FFFBEF"
        }
      },
      "mainTopic": {
        "id": "07c2b73a-e88a-498e-9a73-4b46256fa3df",
        "properties": {
          "fillColor": "#FFFBEF"
        }
      },
      "subTopic": {
        "id": "f89adebe-0149-4bd2-a10c-aae1f11950c0",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "b3e9dd63-29b8-409c-a6c9-3649e729d1bc",
        "properties": {
          "fillColor": "#FBD58A",
          "borderColor": "#FBD58A"
        }
      },
      "summaryTopic": {
        "id": "051ae7c8-bf70-4cff-860e-0c41a1612d90",
        "properties": {
          "fillColor": "#FFFBEF",
          "borderColor": "#FFFBEF"
        }
      },
      "calloutTopic": {
        "id": "54a17008-eecb-4fb1-b92a-f5abab5013f4",
        "properties": {
          "fillColor": "#FFFBEF",
          "borderColor": "#FFFBEF"
        }
      },
      "importantTopic": {
        "id": "121347f6-3a21-44fe-8177-2262de6133e8",
        "properties": {
          "fillColor": "#8ddd4e",
          "borderColor": "#8ddd4e"
        }
      },
      "minorTopic": {
        "id": "63c2207b-38f3-4d0b-8d62-ab11b6d040d5",
        "properties": {
          "fillColor": "#4edd7a",
          "borderColor": "#4edd7a"
        }
      },
      "boundary": {
        "id": "ea5d3874-e2e2-488a-bc05-5361a92fe1d1",
        "properties": {
          "fillColor": "#FFFBEF",
          "lineColor": "#FFFBEF"
        }
      },
      "summary": {
        "id": "ce7b3644-78db-467b-afda-8906e3fb5e18",
        "properties": {
          "lineColor": "#FFFBEF"
        }
      },
      "relationship": {
        "id": "45c0c073-e554-44da-acab-2fd670631490",
        "properties": {
          "lineColor": "#FFFBEF"
        }
      }
    }
  },
  {
    "id": "Violet-#72369d-TYPE_B",
    "tags": [
      "Violet",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "9820c8aa-e276-47d1-94eb-8617da572d56",
        "properties": {
          "fillColor": "#72369d",
          "multiLineColors": "",
          "color-list": "#FFFBEF #FBD58A #DCBEF4 #b67be6 #9d4edd #72369d"
        }
      },
      "centralTopic": {
        "id": "aad00142-0567-4e35-b06c-38b39e984fdb",
        "properties": {
          "fillColor": "#FFFBEF",
          "lineColor": "#FFFBEF"
        }
      },
      "mainTopic": {
        "id": "caae5a84-3b76-47ae-80e2-94036bbae046",
        "properties": {
          "fillColor": "#FFFBEF"
        }
      },
      "subTopic": {
        "id": "a3f9b59e-fe33-4842-8d15-4a00b62dbe9a",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "27a68d39-76ae-4562-9427-c478df638a37",
        "properties": {
          "fillColor": "#FBD58A",
          "borderColor": "#FBD58A"
        }
      },
      "summaryTopic": {
        "id": "441f6002-4d1c-4221-8761-910027b0118e",
        "properties": {
          "fillColor": "#FFFBEF",
          "borderColor": "#FFFBEF"
        }
      },
      "calloutTopic": {
        "id": "a7637dfe-96bb-47fa-91a5-f055b13dc9a6",
        "properties": {
          "fillColor": "#FFFBEF",
          "borderColor": "#FFFBEF"
        }
      },
      "importantTopic": {
        "id": "7a31c25f-0738-489c-ba1b-3652a2e73093",
        "properties": {
          "fillColor": "#619d36",
          "borderColor": "#619d36"
        }
      },
      "minorTopic": {
        "id": "448b1049-d802-415b-85a5-e669076df169",
        "properties": {
          "fillColor": "#369d58",
          "borderColor": "#369d58"
        }
      },
      "boundary": {
        "id": "fe79e087-d65f-446e-9082-b5bab9773a85",
        "properties": {
          "fillColor": "#FFFBEF",
          "lineColor": "#FFFBEF"
        }
      },
      "summary": {
        "id": "514646fa-f0b9-4ef4-ad0f-b04c1aaf1160",
        "properties": {
          "lineColor": "#FFFBEF"
        }
      },
      "relationship": {
        "id": "8919a4ae-9e88-47ae-9cd2-859773cc2e3b",
        "properties": {
          "lineColor": "#FFFBEF"
        }
      }
    }
  },
  {
    "id": "Violet-#FFFBEF-MULTI_LINE_COLORS",
    "tags": [
      "Violet",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "1ac1bc73-de8d-4b7d-89fa-e3443af4562e",
        "properties": {
          "fillColor": "#FFFBEF",
          "multiLineColors": "#FBD58A #DCBEF4 #b67be6 #9d4edd",
          "color-list": "#FFFBEF #FBD58A #DCBEF4 #b67be6 #9d4edd #72369d"
        }
      },
      "centralTopic": {
        "id": "7bc1ce09-b6ee-4c7a-8620-b1cab5405204",
        "properties": {
          "fillColor": "#72369d",
          "lineColor": "#72369d"
        }
      },
      "mainTopic": {
        "id": "a9144017-931b-471a-8988-5feef9a6c800",
        "properties": {}
      },
      "subTopic": {
        "id": "704543a5-b98f-488c-a73a-4cc1a8c6441d",
        "properties": {}
      },
      "floatingTopic": {
        "id": "10c51176-1cf5-4369-8acb-830739669717",
        "properties": {
          "fillColor": "#DCBEF4",
          "borderColor": "#DCBEF4"
        }
      },
      "summaryTopic": {
        "id": "50a9b507-c138-4022-be1b-0a105a1f9959",
        "properties": {
          "fillColor": "#9d4edd",
          "borderColor": "#9d4edd"
        }
      },
      "calloutTopic": {
        "id": "dc83bf34-6ed8-46c4-ba68-a01375bf8851",
        "properties": {
          "fillColor": "#9d4edd",
          "borderColor": "#9d4edd"
        }
      },
      "importantTopic": {
        "id": "177ef982-a04d-47e4-86c9-6acf130e1ebc",
        "properties": {
          "fillColor": "#e57baa",
          "borderColor": "#e57baa"
        }
      },
      "minorTopic": {
        "id": "7a2252a2-259c-48b2-a281-9342ca712fdf",
        "properties": {
          "fillColor": "#9d3661",
          "borderColor": "#9d3661"
        }
      },
      "boundary": {
        "id": "4dc566ba-eee7-4db8-97b6-775df37f95ac",
        "properties": {
          "fillColor": "#72369d",
          "lineColor": "#72369d"
        }
      },
      "summary": {
        "id": "c6457fbb-1507-4ade-ba1a-a05d85b9b983",
        "properties": {
          "lineColor": "#72369d"
        }
      },
      "relationship": {
        "id": "1b7c6c78-38ab-4bc7-9989-56580869fd10",
        "properties": {
          "lineColor": "#72369d"
        }
      }
    }
  },
  {
    "id": "Roses-#fff0f3-TYPE_A",
    "tags": [
      "Roses",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "96f29ca0-312d-41b9-b9ab-ab7440a81e5d",
        "properties": {
          "fillColor": "#fff0f3",
          "multiLineColors": "",
          "color-list": "#fff0f3 #ffccd5 #ffb3c1 #ff758f #c9184a #a4133c"
        }
      },
      "centralTopic": {
        "id": "e159f05b-e3c8-4a4c-97f6-9684eb56bb01",
        "properties": {
          "fillColor": "#a4133c",
          "lineColor": "#a4133c"
        }
      },
      "mainTopic": {
        "id": "44a5e678-ced4-439e-aae8-eb86719eef78",
        "properties": {
          "fillColor": "#ff758f"
        }
      },
      "subTopic": {
        "id": "1f5a0a4b-3c66-433f-b4d0-96868923ed78",
        "properties": {
          "fillColor": "#ffe8ec"
        }
      },
      "floatingTopic": {
        "id": "626e8c4b-65a1-49af-b11a-ccc031278772",
        "properties": {
          "fillColor": "#ffb3c1",
          "borderColor": "#ffb3c1"
        }
      },
      "summaryTopic": {
        "id": "08a73b56-820c-4e98-83e8-6015ae80576f",
        "properties": {
          "fillColor": "#ff758f",
          "borderColor": "#ff758f"
        }
      },
      "calloutTopic": {
        "id": "84ae54ca-8494-46b7-8e22-68f01ae4e551",
        "properties": {
          "fillColor": "#ff758f",
          "borderColor": "#ff758f"
        }
      },
      "importantTopic": {
        "id": "fa51d8db-b6e5-4024-b226-022373655e97",
        "properties": {
          "fillColor": "#c9184a",
          "borderColor": "#c9184a"
        }
      },
      "minorTopic": {
        "id": "556334c4-3447-4ddc-a11f-8987c096cf2b",
        "properties": {
          "fillColor": "#a4133c",
          "borderColor": "#a4133c"
        }
      },
      "boundary": {
        "id": "01845114-ce30-4291-8c3e-87a1ceff2cba",
        "properties": {
          "fillColor": "#a4133c",
          "lineColor": "#a4133c"
        }
      },
      "summary": {
        "id": "91b6e130-09e4-4b45-8a39-d89372766840",
        "properties": {
          "lineColor": "#a4133c"
        }
      },
      "relationship": {
        "id": "a4c2b8ab-0248-4acb-9315-6c9809eb8dc1",
        "properties": {
          "lineColor": "#a4133c"
        }
      }
    }
  },
  {
    "id": "Roses-#ffccd5-TYPE_A",
    "tags": [
      "Roses",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "739e6dfd-81a4-4eb4-9126-7aa1eb8dbc31",
        "properties": {
          "fillColor": "#ffccd5",
          "multiLineColors": "",
          "color-list": "#fff0f3 #ffccd5 #ffb3c1 #ff758f #c9184a #a4133c"
        }
      },
      "centralTopic": {
        "id": "3c615766-d4a3-4f7a-8acc-4f0bd1aef3a9",
        "properties": {
          "fillColor": "#a4133c",
          "lineColor": "#a4133c"
        }
      },
      "mainTopic": {
        "id": "fbb80171-2464-4365-b577-ca0bc3f2cf8c",
        "properties": {
          "fillColor": "#c9184a"
        }
      },
      "subTopic": {
        "id": "a230a09d-daab-4f1a-babd-eee39b16a7e5",
        "properties": {
          "fillColor": "#ffb2bf"
        }
      },
      "floatingTopic": {
        "id": "99f9b87b-a286-4ee0-ba4f-5b09814cb13f",
        "properties": {
          "fillColor": "#c9184a",
          "borderColor": "#c9184a"
        }
      },
      "summaryTopic": {
        "id": "7e8b60f4-f4d7-426f-ac23-9346b46a6760",
        "properties": {
          "fillColor": "#c9184a",
          "borderColor": "#c9184a"
        }
      },
      "calloutTopic": {
        "id": "8f04f77d-501e-4417-8bae-fba6f749d0c8",
        "properties": {
          "fillColor": "#c9184a",
          "borderColor": "#c9184a"
        }
      },
      "importantTopic": {
        "id": "496d6612-b11d-4516-96ab-027ee58f1412",
        "properties": {
          "fillColor": "#ff758f",
          "borderColor": "#ff758f"
        }
      },
      "minorTopic": {
        "id": "9aa3c297-9562-4fa0-815f-b49677e51234",
        "properties": {
          "fillColor": "#a4133c",
          "borderColor": "#a4133c"
        }
      },
      "boundary": {
        "id": "6a7a6be9-f97e-41cf-b594-a9e097c8c087",
        "properties": {
          "fillColor": "#a4133c",
          "lineColor": "#a4133c"
        }
      },
      "summary": {
        "id": "39486ddb-747b-44a2-9f53-8b41043e2f57",
        "properties": {
          "lineColor": "#a4133c"
        }
      },
      "relationship": {
        "id": "8a876cca-f452-4e39-ad57-4e3a140efa06",
        "properties": {
          "lineColor": "#a4133c"
        }
      }
    }
  },
  {
    "id": "Roses-#ffb3c1-TYPE_A",
    "tags": [
      "Roses",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "ccd5ff8c-2e10-4f5b-857a-dfee11e92ce4",
        "properties": {
          "fillColor": "#ffb3c1",
          "multiLineColors": "",
          "color-list": "#fff0f3 #ffccd5 #ffb3c1 #ff758f #c9184a #a4133c"
        }
      },
      "centralTopic": {
        "id": "477bc880-c1fe-4851-9431-70701959eed4",
        "properties": {
          "fillColor": "#a4133c",
          "lineColor": "#a4133c"
        }
      },
      "mainTopic": {
        "id": "b7ff707e-87b1-414a-8842-7f8efb7a1856",
        "properties": {
          "fillColor": "#c9184a"
        }
      },
      "subTopic": {
        "id": "74953149-a37d-45d1-9f65-0d6ded4636e1",
        "properties": {
          "fillColor": "#ff8ca2"
        }
      },
      "floatingTopic": {
        "id": "df9daba5-bbba-4da6-a033-d2dc6eac0cf4",
        "properties": {
          "fillColor": "#fff0f3",
          "borderColor": "#fff0f3"
        }
      },
      "summaryTopic": {
        "id": "3145afaf-488f-4173-99a3-187164774d7e",
        "properties": {
          "fillColor": "#c9184a",
          "borderColor": "#c9184a"
        }
      },
      "calloutTopic": {
        "id": "cfb6796e-93af-408c-9900-0aeef7ea66a2",
        "properties": {
          "fillColor": "#c9184a",
          "borderColor": "#c9184a"
        }
      },
      "importantTopic": {
        "id": "b4389ffb-3e94-4e4f-882d-106e395ecdf1",
        "properties": {
          "fillColor": "#fff0f3",
          "borderColor": "#fff0f3"
        }
      },
      "minorTopic": {
        "id": "dcaeb70d-1a75-487d-b197-a465d26a32cf",
        "properties": {
          "fillColor": "#a4133c",
          "borderColor": "#a4133c"
        }
      },
      "boundary": {
        "id": "a8200e6c-8dfb-4964-ad83-2fa422937360",
        "properties": {
          "fillColor": "#a4133c",
          "lineColor": "#a4133c"
        }
      },
      "summary": {
        "id": "5140a8c8-d6a0-4487-859a-fc051a38e72c",
        "properties": {
          "lineColor": "#a4133c"
        }
      },
      "relationship": {
        "id": "f82c6aac-f807-41db-831f-da756b3b11f5",
        "properties": {
          "lineColor": "#a4133c"
        }
      }
    }
  },
  {
    "id": "Roses-#ff758f-TYPE_B",
    "tags": [
      "Roses",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "1132e43d-34f5-4e26-ba8e-e8e48f670ff3",
        "properties": {
          "fillColor": "#ff758f",
          "multiLineColors": "",
          "color-list": "#fff0f3 #ffccd5 #ffb3c1 #ff758f #c9184a #a4133c"
        }
      },
      "centralTopic": {
        "id": "68d935e7-caee-419a-8068-a1053b6172af",
        "properties": {
          "fillColor": "#a4133c",
          "lineColor": "#a4133c"
        }
      },
      "mainTopic": {
        "id": "b2e5ee28-a38a-4ae9-b304-1650faffe7e5",
        "properties": {
          "fillColor": "#fff0f3"
        }
      },
      "subTopic": {
        "id": "d700cbaf-bddd-4cb6-a2de-0561b7e1bbe7",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "c635c1e6-6ea9-4d54-abab-20435dd3c839",
        "properties": {
          "fillColor": "#ffccd5",
          "borderColor": "#ffccd5"
        }
      },
      "summaryTopic": {
        "id": "7131fb35-7488-49a5-8946-2d2e2553003d",
        "properties": {
          "fillColor": "#fff0f3",
          "borderColor": "#fff0f3"
        }
      },
      "calloutTopic": {
        "id": "5bdac2f6-c2ae-4e32-964a-3872bd3a56d0",
        "properties": {
          "fillColor": "#fff0f3",
          "borderColor": "#fff0f3"
        }
      },
      "importantTopic": {
        "id": "ef76b592-8342-4e9e-8d69-ff7cc04506c7",
        "properties": {
          "fillColor": "#74ffe4",
          "borderColor": "#74ffe4"
        }
      },
      "minorTopic": {
        "id": "40c71cd7-0f4f-4471-8612-1beeb117a204",
        "properties": {
          "fillColor": "#73b1ff",
          "borderColor": "#73b1ff"
        }
      },
      "boundary": {
        "id": "7d124eeb-7661-44f2-af81-5f595f160184",
        "properties": {
          "fillColor": "#a4133c",
          "lineColor": "#a4133c"
        }
      },
      "summary": {
        "id": "189a1418-bb79-4bb1-9236-b47b59b8e2b3",
        "properties": {
          "lineColor": "#a4133c"
        }
      },
      "relationship": {
        "id": "245734db-9117-4e57-b1d1-e87f1b13b4b7",
        "properties": {
          "lineColor": "#a4133c"
        }
      }
    }
  },
  {
    "id": "Roses-#c9184a-TYPE_A",
    "tags": [
      "Roses",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "cc60d63b-91d3-4e18-8e49-1bcbe530d8cd",
        "properties": {
          "fillColor": "#fff0f3",
          "multiLineColors": "",
          "color-list": "#fff0f3 #ffccd5 #ffb3c1 #ff758f #c9184a #a4133c"
        }
      },
      "centralTopic": {
        "id": "cd7bcb1c-0393-4f24-a609-ac3f1def9977",
        "properties": {
          "fillColor": "#c9184a",
          "lineColor": "#c9184a"
        }
      },
      "mainTopic": {
        "id": "2ed2b81e-8e7b-408a-93b2-049cc4a21279",
        "properties": {
          "fillColor": "#ff758f"
        }
      },
      "subTopic": {
        "id": "f58aa9b3-6435-4ab9-99a0-7979f3f68c2a",
        "properties": {
          "fillColor": "#ffe8ec"
        }
      },
      "floatingTopic": {
        "id": "a570efc3-2b8c-4ba2-a8aa-d07b5410f15a",
        "properties": {
          "fillColor": "#ffb3c1",
          "borderColor": "#ffb3c1"
        }
      },
      "summaryTopic": {
        "id": "982d6116-0d7d-4d04-b49c-401705f418d1",
        "properties": {
          "fillColor": "#ff758f",
          "borderColor": "#ff758f"
        }
      },
      "calloutTopic": {
        "id": "4682bcce-4657-4089-84f7-5a26e9354ab8",
        "properties": {
          "fillColor": "#ff758f",
          "borderColor": "#ff758f"
        }
      },
      "importantTopic": {
        "id": "3a7644f1-cdce-4b7b-959d-08ce62509184",
        "properties": {
          "fillColor": "#a4133c",
          "borderColor": "#a4133c"
        }
      },
      "minorTopic": {
        "id": "97016101-8316-408c-87ce-de544b381cc8",
        "properties": {
          "fillColor": "#c9184a",
          "borderColor": "#c9184a"
        }
      },
      "boundary": {
        "id": "8b38d383-85c8-4986-b4ee-4df35e1312f9",
        "properties": {
          "fillColor": "#c9184a",
          "lineColor": "#c9184a"
        }
      },
      "summary": {
        "id": "59dacc47-c7eb-4ae4-b4b1-e9d3b0a9da60",
        "properties": {
          "lineColor": "#c9184a"
        }
      },
      "relationship": {
        "id": "bef3c9a9-c517-43fd-b275-f8c1d66ee48d",
        "properties": {
          "lineColor": "#c9184a"
        }
      }
    }
  },
  {
    "id": "Roses-#a4133c-TYPE_B",
    "tags": [
      "Roses",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "909323f0-0634-46b2-976f-f4fb6b6573d5",
        "properties": {
          "fillColor": "#a4133c",
          "multiLineColors": "",
          "color-list": "#fff0f3 #ffccd5 #ffb3c1 #ff758f #c9184a #a4133c"
        }
      },
      "centralTopic": {
        "id": "92871827-4139-4078-aef7-66c7ef699cb2",
        "properties": {
          "fillColor": "#fff0f3",
          "lineColor": "#fff0f3"
        }
      },
      "mainTopic": {
        "id": "fc6a7e65-af2c-4cb2-9cda-0015aeacbde4",
        "properties": {
          "fillColor": "#fff0f3"
        }
      },
      "subTopic": {
        "id": "7b16027a-048e-4b87-85f6-8c5b031a068f",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "ba073e27-00f9-4b6b-ae24-701838f184be",
        "properties": {
          "fillColor": "#ffccd5",
          "borderColor": "#ffccd5"
        }
      },
      "summaryTopic": {
        "id": "02847d1c-edfd-419b-a347-4d9ecbad2427",
        "properties": {
          "fillColor": "#fff0f3",
          "borderColor": "#fff0f3"
        }
      },
      "calloutTopic": {
        "id": "941cbb37-4e7a-4331-90df-8d02330123b3",
        "properties": {
          "fillColor": "#fff0f3",
          "borderColor": "#fff0f3"
        }
      },
      "importantTopic": {
        "id": "8a281fc2-4a7d-46af-a9f0-486da7192be9",
        "properties": {
          "fillColor": "#12a47b",
          "borderColor": "#12a47b"
        }
      },
      "minorTopic": {
        "id": "d975f9ad-526f-4ace-8e81-c289f3ec8cb6",
        "properties": {
          "fillColor": "#115fa4",
          "borderColor": "#115fa4"
        }
      },
      "boundary": {
        "id": "1e656082-c209-449d-b78a-4847ac0563ca",
        "properties": {
          "fillColor": "#fff0f3",
          "lineColor": "#fff0f3"
        }
      },
      "summary": {
        "id": "cffdda96-ffc1-4e2c-be07-4d1b7316589c",
        "properties": {
          "lineColor": "#fff0f3"
        }
      },
      "relationship": {
        "id": "2484b7d9-2779-40c7-915c-e828f72965b9",
        "properties": {
          "lineColor": "#fff0f3"
        }
      }
    }
  },
  {
    "id": "Roses-#fff0f3-MULTI_LINE_COLORS",
    "tags": [
      "Roses",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "e1345a91-dbc3-498d-86a1-52d7440e590c",
        "properties": {
          "fillColor": "#fff0f3",
          "multiLineColors": "#ffb3c1 #ff758f #c9184a",
          "color-list": "#fff0f3 #ffccd5 #ffb3c1 #ff758f #c9184a #a4133c"
        }
      },
      "centralTopic": {
        "id": "d3113506-17c2-460e-a3e1-326defd64d7e",
        "properties": {
          "fillColor": "#a4133c",
          "lineColor": "#a4133c"
        }
      },
      "mainTopic": {
        "id": "5d8cf120-3cae-4143-bb20-e19886a7ad6e",
        "properties": {}
      },
      "subTopic": {
        "id": "03438e71-a781-44c6-ab0a-168059bcdee7",
        "properties": {}
      },
      "floatingTopic": {
        "id": "ed35be61-db8d-48dd-a050-ed6a4502d60a",
        "properties": {
          "fillColor": "#ffb3c1",
          "borderColor": "#ffb3c1"
        }
      },
      "summaryTopic": {
        "id": "6ad3bbcc-d391-4f76-8d57-04bf6757c0e2",
        "properties": {
          "fillColor": "#ff758f",
          "borderColor": "#ff758f"
        }
      },
      "calloutTopic": {
        "id": "2f3e9fd9-e8b0-46ac-b2c3-9903d3f96145",
        "properties": {
          "fillColor": "#ff758f",
          "borderColor": "#ff758f"
        }
      },
      "importantTopic": {
        "id": "8099acaa-c32e-46a9-bc7d-90f34b8a8b5d",
        "properties": {
          "fillColor": "#c99718",
          "borderColor": "#c99718"
        }
      },
      "minorTopic": {
        "id": "e3cdd7e6-4927-42e3-812b-7f50d73b98c1",
        "properties": {
          "fillColor": "#a47b12",
          "borderColor": "#a47b12"
        }
      },
      "boundary": {
        "id": "d04665f3-8ae4-4687-8e6f-d09a8e50dbb6",
        "properties": {
          "fillColor": "#a4133c",
          "lineColor": "#a4133c"
        }
      },
      "summary": {
        "id": "c361e3a2-981b-4aed-a45c-392265cea066",
        "properties": {
          "lineColor": "#a4133c"
        }
      },
      "relationship": {
        "id": "b147de37-db5e-43b1-8975-245b48ce4012",
        "properties": {
          "lineColor": "#a4133c"
        }
      }
    }
  },
  {
    "id": "Rainforest-#ffffff-TYPE_A",
    "tags": [
      "Rainforest",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "adc2b69f-d6d2-4a61-a718-53311d52bbfc",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #c4fff9 #9ceaef #68d8d6 #06AFA9 #046562"
        }
      },
      "centralTopic": {
        "id": "a042497d-7943-417f-ac6b-b9bf551fe738",
        "properties": {
          "fillColor": "#046562",
          "lineColor": "#046562"
        }
      },
      "mainTopic": {
        "id": "dc19b6d8-f304-40f8-8b88-869a6c6b99f1",
        "properties": {
          "fillColor": "#06AFA9"
        }
      },
      "subTopic": {
        "id": "912e64bf-749a-435a-83ca-4c304e78309b",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "13c4582b-0af5-4b74-8772-07e283e0e397",
        "properties": {
          "fillColor": "#68d8d6",
          "borderColor": "#68d8d6"
        }
      },
      "summaryTopic": {
        "id": "bd099862-f3ab-424c-bc8f-27f44a49871f",
        "properties": {
          "fillColor": "#06AFA9",
          "borderColor": "#06AFA9"
        }
      },
      "calloutTopic": {
        "id": "ce0a4fb6-18bb-4c1e-9a83-d4595009df7a",
        "properties": {
          "fillColor": "#06AFA9",
          "borderColor": "#06AFA9"
        }
      },
      "importantTopic": {
        "id": "3fefc6fa-38a7-4d6a-87bb-72cb765b6a01",
        "properties": {
          "fillColor": "#68d8d6",
          "borderColor": "#68d8d6"
        }
      },
      "minorTopic": {
        "id": "c0fbd800-33e3-4f94-8299-eed87f3c3cb2",
        "properties": {
          "fillColor": "#046562",
          "borderColor": "#046562"
        }
      },
      "boundary": {
        "id": "ed16b826-e091-4a7d-a7c5-caa3407c86cf",
        "properties": {
          "fillColor": "#046562",
          "lineColor": "#046562"
        }
      },
      "summary": {
        "id": "29ec5845-042d-4c33-8af3-bd7a03104bad",
        "properties": {
          "lineColor": "#046562"
        }
      },
      "relationship": {
        "id": "83b23781-2c6d-49e9-97ee-2f46152d29aa",
        "properties": {
          "lineColor": "#046562"
        }
      }
    }
  },
  {
    "id": "Rainforest-#c4fff9-TYPE_A",
    "tags": [
      "Rainforest",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "bda231dc-d117-4e6f-b1b7-25f76525c4de",
        "properties": {
          "fillColor": "#c4fff9",
          "multiLineColors": "",
          "color-list": "#ffffff #c4fff9 #9ceaef #68d8d6 #06AFA9 #046562"
        }
      },
      "centralTopic": {
        "id": "cfd80d98-78c3-4c6c-b161-24cf1dac7c51",
        "properties": {
          "fillColor": "#046562",
          "lineColor": "#046562"
        }
      },
      "mainTopic": {
        "id": "7e2c7e20-4e2f-4272-a44f-324b3049acbb",
        "properties": {
          "fillColor": "#06AFA9"
        }
      },
      "subTopic": {
        "id": "35de91fb-3a17-413c-a45c-9d540bcea0f5",
        "properties": {
          "fillColor": "#a6fef5"
        }
      },
      "floatingTopic": {
        "id": "b8939ba4-a3e5-471b-a047-385ff3891720",
        "properties": {
          "fillColor": "#06AFA9",
          "borderColor": "#06AFA9"
        }
      },
      "summaryTopic": {
        "id": "e206e82b-fe90-45e2-a6f2-fc89ed811eaf",
        "properties": {
          "fillColor": "#06AFA9",
          "borderColor": "#06AFA9"
        }
      },
      "calloutTopic": {
        "id": "70114128-a08a-4d8f-8e28-f34dbdc5b15f",
        "properties": {
          "fillColor": "#06AFA9",
          "borderColor": "#06AFA9"
        }
      },
      "importantTopic": {
        "id": "5059dba4-13e3-4f82-9df3-a4e04135a151",
        "properties": {
          "fillColor": "#68d8d6",
          "borderColor": "#68d8d6"
        }
      },
      "minorTopic": {
        "id": "5e9d1028-0e1c-433c-b32c-f8dbf09f43cd",
        "properties": {
          "fillColor": "#046562",
          "borderColor": "#046562"
        }
      },
      "boundary": {
        "id": "51e7d14c-d2b5-43d9-a1c0-bd04f4a9eb8a",
        "properties": {
          "fillColor": "#046562",
          "lineColor": "#046562"
        }
      },
      "summary": {
        "id": "96114cca-b384-443f-9f8b-f4fc2cd6187b",
        "properties": {
          "lineColor": "#046562"
        }
      },
      "relationship": {
        "id": "45447ef4-00e4-4db4-94df-60f1e8311cfa",
        "properties": {
          "lineColor": "#046562"
        }
      }
    }
  },
  {
    "id": "Rainforest-#9ceaef-TYPE_B",
    "tags": [
      "Rainforest",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "35bb8f0f-1dc0-48a0-b7cb-18e9eda50058",
        "properties": {
          "fillColor": "#9ceaef",
          "multiLineColors": "",
          "color-list": "#ffffff #c4fff9 #9ceaef #68d8d6 #06AFA9 #046562"
        }
      },
      "centralTopic": {
        "id": "ede562de-9937-4d49-b792-f890f18cd6f7",
        "properties": {
          "fillColor": "#046562",
          "lineColor": "#046562"
        }
      },
      "mainTopic": {
        "id": "704f0f6c-148c-4d37-8081-00500ed65078",
        "properties": {
          "fillColor": "#046562"
        }
      },
      "subTopic": {
        "id": "d5539436-02cd-4e70-882d-b3434d1d4466",
        "properties": {
          "fillColor": "#1d7e7b"
        }
      },
      "floatingTopic": {
        "id": "0c0ad1e5-21c4-4270-81a0-96fe99df3c3d",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "245d2ad1-b852-4b3a-a8dc-9a474513e889",
        "properties": {
          "fillColor": "#046562",
          "borderColor": "#046562"
        }
      },
      "calloutTopic": {
        "id": "6e175c60-d5c3-4bc5-a4ff-fed6ca50230e",
        "properties": {
          "fillColor": "#046562",
          "borderColor": "#046562"
        }
      },
      "importantTopic": {
        "id": "d2e5399f-c236-4a78-b759-5549ae780d3b",
        "properties": {
          "fillColor": "#efa19c",
          "borderColor": "#efa19c"
        }
      },
      "minorTopic": {
        "id": "6404e67f-6e3b-45da-b9e6-f5f2f56f9446",
        "properties": {
          "fillColor": "#efdf9c",
          "borderColor": "#efdf9c"
        }
      },
      "boundary": {
        "id": "e23f6ad0-27b8-4a5d-a32a-eb55ab6c7217",
        "properties": {
          "fillColor": "#046562",
          "lineColor": "#046562"
        }
      },
      "summary": {
        "id": "a4a7bc60-e53c-4ae5-bb5f-3f08a9c7cae2",
        "properties": {
          "lineColor": "#046562"
        }
      },
      "relationship": {
        "id": "ed342628-c244-4050-b7b9-3e3eba31cdc3",
        "properties": {
          "lineColor": "#046562"
        }
      }
    }
  },
  {
    "id": "Rainforest-#68d8d6-TYPE_B",
    "tags": [
      "Rainforest",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "86cabb13-3818-4180-bc24-03434f9f0975",
        "properties": {
          "fillColor": "#68d8d6",
          "multiLineColors": "",
          "color-list": "#ffffff #c4fff9 #9ceaef #68d8d6 #06AFA9 #046562"
        }
      },
      "centralTopic": {
        "id": "79a272ca-aa92-4ae2-9970-db2086089768",
        "properties": {
          "fillColor": "#046562",
          "lineColor": "#046562"
        }
      },
      "mainTopic": {
        "id": "ffe991d6-2c89-4fcd-b283-08c7ae1dd528",
        "properties": {
          "fillColor": "#046562"
        }
      },
      "subTopic": {
        "id": "68145bc0-246f-4fea-92f9-ca3ed16a315c",
        "properties": {
          "fillColor": "#1d7e7b"
        }
      },
      "floatingTopic": {
        "id": "d03b3d06-323f-48cf-9f20-318360b9f3b0",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "summaryTopic": {
        "id": "5f776a77-5903-459f-bb11-c0ebe3defc8f",
        "properties": {
          "fillColor": "#046562",
          "borderColor": "#046562"
        }
      },
      "calloutTopic": {
        "id": "90b858d9-ae8f-4b65-9b1e-55c47850221d",
        "properties": {
          "fillColor": "#046562",
          "borderColor": "#046562"
        }
      },
      "importantTopic": {
        "id": "78282ec3-ff63-44df-8d11-22b8afa49b7f",
        "properties": {
          "fillColor": "#d86769",
          "borderColor": "#d86769"
        }
      },
      "minorTopic": {
        "id": "a44fc4fa-5088-4191-84ed-3a6753dd3fb8",
        "properties": {
          "fillColor": "#d7b967",
          "borderColor": "#d7b967"
        }
      },
      "boundary": {
        "id": "9fbda7f9-9bbe-4ec5-a5cf-b470e2f0ad96",
        "properties": {
          "fillColor": "#046562",
          "lineColor": "#046562"
        }
      },
      "summary": {
        "id": "9ac45244-afde-4cd5-833a-9454f225f6be",
        "properties": {
          "lineColor": "#046562"
        }
      },
      "relationship": {
        "id": "a16c5b5d-9d16-40c8-aa66-53b5c35c9be9",
        "properties": {
          "lineColor": "#046562"
        }
      }
    }
  },
  {
    "id": "Rainforest-#06AFA9-TYPE_A",
    "tags": [
      "Rainforest",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "bd69e801-55b9-458c-8a86-b57107d2e7a2",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "",
          "color-list": "#ffffff #c4fff9 #9ceaef #68d8d6 #06AFA9 #046562"
        }
      },
      "centralTopic": {
        "id": "3ede66a5-3f0a-4e9a-8a05-469ed3361136",
        "properties": {
          "fillColor": "#06AFA9",
          "lineColor": "#06AFA9"
        }
      },
      "mainTopic": {
        "id": "03b7ca0a-e556-4ddd-944a-d56471705d0f",
        "properties": {
          "fillColor": "#046562"
        }
      },
      "subTopic": {
        "id": "bd49be77-2fd1-4080-8738-3c864144f131",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "f616df94-0957-45a5-a95f-70fa33b7fb55",
        "properties": {
          "fillColor": "#68d8d6",
          "borderColor": "#68d8d6"
        }
      },
      "summaryTopic": {
        "id": "ce6a0994-6ace-49b6-9e26-eff078b3ab5f",
        "properties": {
          "fillColor": "#046562",
          "borderColor": "#046562"
        }
      },
      "calloutTopic": {
        "id": "452ae654-c939-4d36-99ea-4ee56a962bca",
        "properties": {
          "fillColor": "#046562",
          "borderColor": "#046562"
        }
      },
      "importantTopic": {
        "id": "f9617109-23ab-43fa-9645-b640cf93176d",
        "properties": {
          "fillColor": "#68d8d6",
          "borderColor": "#68d8d6"
        }
      },
      "minorTopic": {
        "id": "737cb388-54e5-42be-bc59-2dc1e3817d28",
        "properties": {
          "fillColor": "#06AFA9",
          "borderColor": "#06AFA9"
        }
      },
      "boundary": {
        "id": "856be3d2-fc8e-451f-a9de-32b68dd79e34",
        "properties": {
          "fillColor": "#06AFA9",
          "lineColor": "#06AFA9"
        }
      },
      "summary": {
        "id": "7b6e9ddb-2d8c-448c-b8e5-f49b154fc391",
        "properties": {
          "lineColor": "#06AFA9"
        }
      },
      "relationship": {
        "id": "9fe4a29f-8068-449a-8a22-93b4df5883d4",
        "properties": {
          "lineColor": "#06AFA9"
        }
      }
    }
  },
  {
    "id": "Rainforest-#046562-TYPE_B",
    "tags": [
      "Rainforest",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "5638b2d9-1218-4aa1-b513-8a40e551ad81",
        "properties": {
          "fillColor": "#046562",
          "multiLineColors": "",
          "color-list": "#ffffff #c4fff9 #9ceaef #68d8d6 #06AFA9 #046562"
        }
      },
      "centralTopic": {
        "id": "9924bc5e-962a-46cc-a601-d4ecd5a05720",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "ab8deaff-49f9-4eba-88be-4c3d26192b9d",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "subTopic": {
        "id": "a9cc21c5-f866-4369-ac7e-139e44030807",
        "properties": {
          "fillColor": "#ffffff"
        }
      },
      "floatingTopic": {
        "id": "1d51a304-40b0-443a-8195-e24b11bc978f",
        "properties": {
          "fillColor": "#c4fff9",
          "borderColor": "#c4fff9"
        }
      },
      "summaryTopic": {
        "id": "48ccb34f-96b9-4785-a212-fb24bc54caca",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "calloutTopic": {
        "id": "f3401995-18ca-4fb6-8cc8-4fd2e9fcfee9",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "importantTopic": {
        "id": "80be2a85-a718-46c7-8396-145950388fea",
        "properties": {
          "fillColor": "#640406",
          "borderColor": "#640406"
        }
      },
      "minorTopic": {
        "id": "e16fa8aa-f752-487b-b346-d266c1b3e545",
        "properties": {
          "fillColor": "#634904",
          "borderColor": "#634904"
        }
      },
      "boundary": {
        "id": "4c245d75-33bf-4df1-a296-2213a469c4cb",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "summary": {
        "id": "a2e8b758-9387-483a-bb03-792dcc467667",
        "properties": {
          "lineColor": "#ffffff"
        }
      },
      "relationship": {
        "id": "7248e696-8431-4184-8e87-5bff41a088bc",
        "properties": {
          "lineColor": "#ffffff"
        }
      }
    }
  },
  {
    "id": "Rainforest-#ffffff-MULTI_LINE_COLORS",
    "tags": [
      "Rainforest",
      "TYPE_A"
    ],
    "theme": {
      "map": {
        "id": "b6197f71-919c-4482-addb-bbac058f3e4f",
        "properties": {
          "fillColor": "#ffffff",
          "multiLineColors": "#9ceaef #68d8d6 #06AFA9",
          "color-list": "#ffffff #c4fff9 #9ceaef #68d8d6 #06AFA9 #046562"
        }
      },
      "centralTopic": {
        "id": "fe1f3725-67dc-47fd-82a7-626f4a40face",
        "properties": {
          "fillColor": "#046562",
          "lineColor": "#046562"
        }
      },
      "mainTopic": {
        "id": "ecf7038d-c77b-4de1-ba9a-15e2b6bf5df8",
        "properties": {}
      },
      "subTopic": {
        "id": "64cdc2d5-9622-4147-a7de-02af164a8571",
        "properties": {}
      },
      "floatingTopic": {
        "id": "b315610c-73a6-43ad-b213-220d098a50cc",
        "properties": {
          "fillColor": "#68d8d6",
          "borderColor": "#68d8d6"
        }
      },
      "summaryTopic": {
        "id": "d432968b-bfab-48f5-844b-2b3129489b9d",
        "properties": {
          "fillColor": "#06AFA9",
          "borderColor": "#06AFA9"
        }
      },
      "calloutTopic": {
        "id": "80c7a643-f5c8-4340-868d-83ebcc24d808",
        "properties": {
          "fillColor": "#06AFA9",
          "borderColor": "#06AFA9"
        }
      },
      "importantTopic": {
        "id": "b54711a7-2f1e-480a-abec-3b1bcdb420fc",
        "properties": {
          "fillColor": "#6769d8",
          "borderColor": "#6769d8"
        }
      },
      "minorTopic": {
        "id": "92229bd4-5213-43df-800a-75b0182ef09f",
        "properties": {
          "fillColor": "#040764",
          "borderColor": "#040764"
        }
      },
      "boundary": {
        "id": "76624eea-c9f4-40f9-a6d9-8dacc59c924a",
        "properties": {
          "fillColor": "#046562",
          "lineColor": "#046562"
        }
      },
      "summary": {
        "id": "196cdce2-d37d-486c-8e18-6844fe4a52d9",
        "properties": {
          "lineColor": "#046562"
        }
      },
      "relationship": {
        "id": "b8496d9c-9312-48ba-b5de-ff8160900916",
        "properties": {
          "lineColor": "#046562"
        }
      }
    }
  },
  {
    "id": "Rainforest-#046562-MULTI_LINE_COLORS",
    "tags": [
      "Rainforest",
      "TYPE_B"
    ],
    "theme": {
      "map": {
        "id": "4510ef87-af7a-45cb-97b4-3e04f2149bfa",
        "properties": {
          "fillColor": "#046562",
          "multiLineColors": "#c4fff9 #9ceaef #68d8d6 #06AFA9",
          "color-list": "#ffffff #c4fff9 #9ceaef #68d8d6 #06AFA9 #046562"
        }
      },
      "centralTopic": {
        "id": "36704b95-7e9e-4b73-ab8c-eaa6236fcee1",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "mainTopic": {
        "id": "64ced3d8-0dcf-4f9e-8028-e86edb84ef3e",
        "properties": {}
      },
      "subTopic": {
        "id": "2457306d-4079-41a3-ba19-a2f4a385ca2b",
        "properties": {}
      },
      "floatingTopic": {
        "id": "95449bd5-a123-4964-ba0b-5914e1b7fb10",
        "properties": {
          "fillColor": "#c4fff9",
          "borderColor": "#c4fff9"
        }
      },
      "summaryTopic": {
        "id": "3bf33408-7b30-4501-9be5-b5097fbf0bdd",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "calloutTopic": {
        "id": "7c14e2e5-20f1-4d8c-8aad-a38b8e37d05a",
        "properties": {
          "fillColor": "#ffffff",
          "borderColor": "#ffffff"
        }
      },
      "importantTopic": {
        "id": "6a213ac2-99f7-46cd-b936-19a9e2ac390e",
        "properties": {
          "fillColor": "#636104",
          "borderColor": "#636104"
        }
      },
      "minorTopic": {
        "id": "d6669709-385b-44c7-b47c-66740269e74d",
        "properties": {
          "fillColor": "#1e6304",
          "borderColor": "#1e6304"
        }
      },
      "boundary": {
        "id": "b9556349-f514-4b15-9b78-49ac105cf960",
        "properties": {
          "fillColor": "#ffffff",
          "lineColor": "#ffffff"
        }
      },
      "summary": {
        "id": "b19c4e46-dcc2-4d3c-a0fc-764066047393",
        "properties": {
          "lineColor": "#ffffff"
        }
      },
      "relationship": {
        "id": "39e98d87-c1bb-4e3d-aa14-09e45e9cf01d",
        "properties": {
          "lineColor": "#ffffff"
        }
      }
    }
  }
]

/** 骨架主题列表 */
export const SKELETON_THEMES: SkeletonThemeData[] = [
  {
    "id": "e61ab87dcac9e31dc0adba85ce",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.brace.right"
    },
    "theme": {
      "centralTopic": {
        "id": "6b2e92a3-99a6-4034-80da-0aa678d3c423",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "actived",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "24pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "2286fd7e-fef6-4cfc-9209-fc8f40ae6913",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "97314a04-f8b2-44be-b748-aba8c8b49268",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "74d03371-8c79-49ae-89ea-4fa49d7fbdfc",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "summaryTopic": {
        "id": "8223ee3d-b534-45e3-abee-86cddb85f3b3",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "400",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "7a8d41cd-f7a1-4df4-ae34-f53d1b8063fc",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "d67d873d-d969-4a42-9879-7ed27d41f1ab",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "1",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "eb5cd966-b6be-422c-81aa-a73e15b35955",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "9269585e-2677-4920-8abc-ec5980cd790a",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "1",
          "linePattern": "dot",
          "arrow-begin-class": "org.xmind.arrowShape.dot",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "48a989c9-197e-4534-984e-f80434e50ff7",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "0fd8201f7fe8e282fa35fa4750",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.brace.right"
    },
    "theme": {
      "centralTopic": {
        "id": "4b550ffe-9721-47ca-909f-352ba37ea32f",
        "properties": {
          "shapeClass": "org.xmind.topicShape.doubleunderline",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "actived",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "24pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "6c72d445-bd98-4e0a-bdf4-8b7d81f86bf4",
        "properties": {
          "shapeClass": "org.xmind.topicShape.doubleunderline",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "4deaa19e-b309-40b2-9881-a79a841277fc",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "40c97675-7467-450c-950b-30c533cfa800",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "50a8791c-44f0-4386-a895-0fb71b71e34c",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": "400",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "9135bf43-9f38-4db5-b165-dab939c0693e",
        "properties": {
          "shapeClass": "org.xmind.topicShape.doubleunderline",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "'NeverMind','NeverMind','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "571dc791-db25-4b01-80b0-3bee3a45ce60",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind','Montserrat','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "42399a40-f9cd-4e82-a885-dd94903ad184",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "dc55ec84-07a5-49c3-8300-46f8a2ab5b4f",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "f35c7db6-49eb-46ba-9bdf-b0d72ada927e",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "3928167d3ffa2e83c2382a0644",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.brace.right"
    },
    "theme": {
      "centralTopic": {
        "id": "fdf177a4-cf49-4f0c-b19e-2f3625d75a3d",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": "bold",
          "fontSize": "24pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "988113cf-dafa-4c68-ac4f-909751506027",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedhexagon",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderPattern": "dash",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "434aa94c-7204-42ea-9d53-3f9e2da5341b",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "84ba9841-b4c1-406f-ac39-f35dbb41389d",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.ellipse",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "95c57993-a840-4146-afef-3c36ca834029",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": "400",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "da2f241b-aa26-41eb-8f2a-8b86934db06b",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedhexagon",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderPattern": "dash",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "'NeverMind','NeverMind','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "bcfc30ea-ac9f-400f-bb2d-0c20c04c6149",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "solid",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind','Montserrat','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "6368f06f-5a80-4211-bd77-05c59091337b",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "8ec90004-afe2-4b5e-badd-4ca962455ec2",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "6c13f5c6-dc69-493f-8cd2-c1b33f0bcb22",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "c49a76edff28fe9e497b49499a",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.brace.right",
      "mainTopic": "org.xmind.ui.brace.right"
    },
    "theme": {
      "centralTopic": {
        "id": "4545f6c6-2463-4ce7-9ad0-1d8c75e12b9e",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipticrectangle",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "3pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "crossing",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "actived",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "e367c25c-2d4a-4626-8a17-04a8ee8d75ac",
        "properties": {
          "shapeClass": "org.xmind.topicShape.doubleunderline",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "linePattern": "handdrawn-solid",
          "fillPattern": "crossing",
          "borderWidth": "2",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "4107cd54-280e-43ff-9bf6-9c670d362b30",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "c2fefa28-c72f-4271-b38a-28b015b6fbc0",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "summaryTopic": {
        "id": "a0be1c09-9e60-4df3-acc8-b11495e555c7",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "3",
          "fillPattern": "solid",
          "borderWidth": "2",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "d2af9df6-a3cd-4d8a-83b4-69451041c9cb",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "linePattern": "handdrawn-solid",
          "fillPattern": "crossing",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "988fc526-d0e6-4391-97a6-1e23d0170568",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "76144a0d-32e9-4231-a893-f8a74c63fca9",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "1a072db1-c239-49f5-966b-0a9dc682983f",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "dbccd6e4-3928-41bb-bbf4-1aaaeec39ff3",
        "properties": {
          "line-tapered": "normal"
        }
      }
    }
  },
  {
    "id": "041a2b078e2986e953fe6b71af",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.fishbone.leftHeaded",
      "subTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "3b41ae6e-b648-441b-8f78-850ec916a9cd",
        "properties": {
          "shapeClass": "org.xmind.topicShape.squareBracket",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Roboto Slab",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "c4f4dfef-e266-4e5b-ba09-858c3902c608",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3",
          "fontFamily": "Roboto Slab",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "961c387a-288d-4c1a-92f3-3b38469ea1bf",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.fold",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Roboto Slab",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "summaryTopic": {
        "id": "724619ff-a879-439a-a4f3-4911bdbbb3ef",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.fold",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Roboto Slab",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "076ea2d6-f805-4575-a680-4d9644dd1d5c",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.fold",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Roboto Slab",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "boundary": {
        "id": "4a0deb8c-8080-4cb5-9c71-670efae0cd2a",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.rect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Roboto Slab','Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "2b506121-fb82-47b6-b7fc-e9d0f25a3387",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "73a1951e-0d73-46ec-bcd5-110b365e914a",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.dot",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Roboto Slab','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "a4884af6-4e2f-409a-976b-0533cfeabb8d",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "401842e4d049428cfe841a1879",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.fishbone.leftHeaded",
      "mainTopic": "org.xmind.ui.fishbone.leftHeaded"
    },
    "theme": {
      "centralTopic": {
        "id": "6267b3e3-e4b1-411e-88f0-d7d3f4287ca2",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "9169432a-c6b6-4e90-9d79-5756b87c9860",
        "properties": {
          "shapeClass": "org.xmind.topicShape.doubleunderline",
          "lineClass": "org.xmind.branchConnection.curve",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "d96d338d-e210-4900-aacb-f7feb9115044",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedfold",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "summaryTopic": {
        "id": "9c04cd75-f52c-410b-9377-c167ed6b5b93",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedfold",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "f5e6a9e3-fa28-435e-ae8c-4cda0defd693",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.curve",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "67ddc9b1-a13d-437f-ae35-bb423449f61c",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "1",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind Condense','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "99ebee2f-c2da-4fb8-95d5-415b11f941bb",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.angle",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "60f7c1bb-19b5-493e-82a1-f15cd39da80d",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "1",
          "linePattern": "dot",
          "arrow-begin-class": "org.xmind.arrowShape.dot",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Condense','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "321990c5-dd80-4648-94ee-74ec06933444",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "233845a43c18f189d5ecc83e36",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.fishbone.leftHeaded",
      "mainTopic": "org.xmind.ui.tree.right"
    },
    "theme": {
      "centralTopic": {
        "id": "c67d8ffe-2c6c-49fa-bc3c-495053d75d51",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.straight",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "hachure-thin",
          "borderWidth": "3",
          "borderPattern": "handdrawn-solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "40136d49-44f3-4547-bf7f-1caf568a82a0",
        "properties": {
          "shapeClass": "org.xmind.topicShape.doubleunderline",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "hachure",
          "borderWidth": "2pt",
          "borderPattern": "handdrawn-solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "55c5ad36-e663-4c01-9b83-04cfd7a216b9",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.straight",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "crossing",
          "borderWidth": "2",
          "borderPattern": "handdrawn-solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "48236b27-36fe-4242-972b-f296f8dd57ff",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "10664190-2f25-4423-9636-1be4df86380f",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.fold",
          "fillPattern": "crossing-thin",
          "borderWidth": "1",
          "borderPattern": "handdrawn-solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "f673416d-c210-458a-91ea-c73f848fa736",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.straight",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2pt",
          "borderPattern": "handdrawn-solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "boundary": {
        "id": "9fdca292-8eb4-4b70-ae7e-623685e329b8",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.polygon",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "5007aec1-9728-465c-b633-152a8c1b2a50",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "ededf29e-78d9-4fc2-9d06-77de143255cb",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "f83ef788-6fb7-4025-afc6-71f53869ce23",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "a148ee55687bdfc44af2fa5f16",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "131e2d5f-18b7-48e9-8abd-ea2f177765dd",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedfold",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "actived",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "e5f99a77-f4bc-453a-90fd-82deb65ea055",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedfold",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "79670938-abc9-4d25-a14d-7d4e29c4f9a8",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedfold",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "cd138cea-262c-46a2-a494-17d70e32d48f",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.ellipse",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "summaryTopic": {
        "id": "e76aa5f9-1f5c-4e33-9409-64ba7d5b10a4",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedfold",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "400",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "75448ce5-da51-46ef-8d4c-e043bc2e71af",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedfold",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "77054ee8-a1b7-4033-a640-951efb951fc8",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "abbccd17-39ba-4d76-816c-e6e61368059e",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "f2d674db-36e7-440c-8f03-5b73f57e40d2",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "2ef1d4af-fb1a-4190-a6c7-7cc453896c7f",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "c1fbada1b45ba2e3bfc3b8b57b",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "5b463047-eac5-4bd7-ac99-2678207e5ad2",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "3pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "actived",
          "fontFamily": "Droid Serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "30pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "e07fd87d-bbd6-4717-84f7-80c1aa0d9f90",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Droid Serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "2ca11f9a-3287-4e42-975a-1503e31ec3bd",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Droid Serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "f6e72068-4be5-47b6-8fae-e3478a68e2f7",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "Droid Serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "summaryTopic": {
        "id": "c683bd6c-40b8-4103-ad7c-86f9d06d1c3d",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Droid Serif",
          "fontStyle": "normal",
          "fontWeight": "400",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "bad2a701-f84c-41e5-abfd-bc18fa91896c",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Droid Serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "28d0fb91-f8df-4168-a7a9-4f8c3ee0126c",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Droid Serif','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "49232c55-f918-419b-915a-6bc9c67f8823",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "98e113f0-0633-4d3a-b945-64f0aafa56b6",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Droid Serif','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "56765ed7-df9f-4d71-9676-d94bd669170f",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "69e995eafceaa75d4772db83ca",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.logic.right",
      "mainTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "70e4fa13-e020-4d08-9313-39512a34ba21",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "actived",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "7413029a-08e1-44c5-b175-91d21bd2c45f",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "30578d0b-0f72-4aab-b515-1e9a739970c7",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "3c317d3d-908d-4973-995e-3ca4af569c6e",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "e5a3d3dc-d18c-468d-be97-c4fd47a943cd",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "400",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "be519dcb-3899-4092-ad7c-d11ab228bb5c",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "5d7d6045-b166-4825-beba-dcc8047e7cc2",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "f62a7653-e166-4a53-bf3b-fbea60c81e77",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "0630b782-c448-4c64-8b2e-36140e2a1e66",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "efe8cb1f-9f60-4bdd-a17e-afac75664fb2",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "742a0094a75af3d82d6aebec36",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "ec3650d8-f048-454f-837f-9de09137279a",
        "properties": {
          "shapeClass": "org.xmind.topicShape.stack",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "1pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "1pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "actived",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "03df1b77-4669-4f72-8c02-5b934fb14d47",
        "properties": {
          "shapeClass": "org.xmind.topicShape.singlebreakangle",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "332bcd5a-7183-4e33-a314-5241da0b7cc0",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "ff46fa40-bc80-4dc6-9c28-b3798c7ce907",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.rectangle",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "summaryTopic": {
        "id": "7aa08a78-2c29-4cd3-a73e-40ffa1c34d94",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "ae704007-29d7-4729-9584-b6f26d147355",
        "properties": {
          "shapeClass": "org.xmind.topicShape.singlebreakangle",
          "lineClass": "org.xmind.branchConnection.elbow",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "'NeverMind Condense','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "boundary": {
        "id": "19c4a11e-ab8c-4885-9809-3242a66deecf",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.rect",
          "shapeCorner": "20pt",
          "lineWidth": "1",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind Condense','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "5054c1b4-e094-487c-929d-cac47ca290f3",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "1",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "c8d5e51b-76cb-4809-8502-32a5935b0796",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.zigzag",
          "lineWidth": "1",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.dot",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Condense','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "79e6c87d-d30c-449d-9d63-d548c8614082",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "435b94254499a365f53b38c686",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.logic.right",
      "mainTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "eaf81f1f-fb77-45cd-a19c-1fb54855e214",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "3pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "handdrawn-solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "bd156671-810d-45cb-9629-62fe0632fc0a",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipserect",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillPattern": "crossing",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "c3818b85-0913-421b-b497-eea9e8b99c4a",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "425d342c-0549-4e4f-b25b-8300cb225b67",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "3501f6c1-791d-408a-9e0b-25873faf8ba8",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillPattern": "crossing",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "72067d61-6499-4bf9-9e2f-bba36ace8b4b",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipserect",
          "lineClass": "org.xmind.branchConnection.bight",
          "linePattern": "handdrawn-solid",
          "fillPattern": "crossing",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "9c148560-fc6f-429f-b051-5de616b64a98",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "'NeverMind Hand','Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "e9f9848b-f8bb-4b08-b2df-4ec4b988317d",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2",
          "linePattern": "handdrawn-solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "819bc5e6-4b28-4612-9a50-b05a23607ed3",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Hand','Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "bdd82bb5-feaf-4082-a4e4-654e2fb5a6f6",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "63f9e6f1d8a855fd7d88783d7d",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.logic.right",
      "mainTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "e86df873-10e4-413f-af44-07dacba2a9e1",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedfold",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "1792d05a-d633-4f69-af14-4c3eb3e85947",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipticrectangle",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "1pt",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "20pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "9c76a538-cefb-4832-b2ee-9a5ac57a073b",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.curve",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "a6b9a633-610b-492b-9093-0cc372ecb618",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "059a83b5-edd6-432c-b780-c496d3ee987e",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "1pt",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "1a9e670a-f113-4110-aec4-3a0d13baf4af",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipticrectangle",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "1pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "solid-hand-drawn",
          "borderWidth": "0",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "8a3fc60b-1f1d-4bd2-b6cc-0c7e883945d9",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "1",
          "linePattern": "handdrawn-dash",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "4c073e50-7417-4504-b814-5d032749ec61",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "1",
          "linePattern": "handdrawn-solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "1e25a1a3-dc65-4fed-b19c-fd45bee2215e",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "1",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.dot",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "italic",
          "fontWeight": "normal",
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "712e5022-f0ff-4113-8c97-21af5d644e6e",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "2f7a92d35e78bb028393d81c91",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.logic.right",
      "mainTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "fa3ffc0e-8175-4979-853a-207154fca89b",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "hachure-thin",
          "borderWidth": "2pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "actived",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "8dc47df7-cd56-4ba8-99de-6584e0045764",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillPattern": "hachure-thin",
          "borderPattern": "handdrawn-solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "20pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "c0be854e-8492-4b7c-8cc8-7f07333215a8",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillPattern": "hachure-thin",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "3fdf2f1b-11af-4ffd-8aa0-e60c9e8fac11",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.ellipse",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "summaryTopic": {
        "id": "9bfd1e3d-44b5-477c-8f9e-3012cc2ebf5d",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2pt",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "c14b0277-c36b-4c5a-890d-7fea1c313fb8",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "hachure-thin",
          "borderWidth": "2pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "15d00df0-d8cb-46e0-996f-cfd6c6bc81cd",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-dash",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "0586163e-7e58-4423-8ee6-808b6c120d4a",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2",
          "linePattern": "handdrawn-solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "73be08db-5d4d-4858-88aa-4d0e7b59658e",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "f8accc62-34bb-446d-aa40-6ff3ba97471b",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "69a9222aa3cb5e4fb218190de7",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.spreadsheet.column",
      "mainTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "ae7214dc-6f68-4e0b-90bc-fa97cf62d194",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "2pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "24pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "e106b513-9003-4e27-9c22-42075e050a36",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.curve",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "1c03b6cf-888a-48c6-b649-e30b257cc49b",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "5147938d-7c5d-4342-86df-15be2b463c25",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "78d1032f-b551-4f37-9865-c0a9a6f9c76f",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "26c4385b-a3c4-4881-b4a3-372a7029beb2",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "55cc1059-6e4e-48f3-94f5-08a0371adab7",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "30a90974-7036-4542-8b64-201b3e78b5e1",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.dot",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "e7ee410e-0338-4429-a800-54744eab162d",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "e3eabc5d4cbbbc26c2a8f811e1",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.spreadsheet",
      "mainTopic": "org.xmind.ui.brace.right"
    },
    "theme": {
      "centralTopic": {
        "id": "6ac93fa9-5d14-43e9-93b8-198dbe70e4ee",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "30pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "f47715e6-68c5-497e-949e-420d9a5128f4",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.curve",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "c0e6068a-590e-4fad-b4f2-746eddc5f117",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.curve",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "66bed8ec-8df4-4f35-af74-996aa13ae769",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.ellipse",
          "fillPattern": "solid",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "a1ba4fe8-fb07-4c9b-91d2-02a59096feea",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.curve",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "4c63f17d-7b76-4cbc-ad8e-9b7adab48762",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "5f790bb2-6a6f-4bcc-88dd-654a9b97458f",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "096c1a47-d22e-4fc0-8323-27b9deed03e7",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.zigzag",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.dot",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "696f829d-2d86-4e0f-ac92-51b22bf3e811",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "db4a5df4db39a8cd1310ea55ea",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.map.clockwise",
      "mainTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "beeb2961-f597-4edc-ba40-f46144e35b63",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "30pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "9ffe0f01-65b1-4363-89bf-6f660df733da",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "1bdb1476-82ff-48b3-a656-47cf9948b160",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "8053476e-ae16-48ba-b93d-16dfbd50ee69",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "6475d017-f13e-417f-a8ea-8b96686eff82",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": "400",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "0f98a0ec-3c91-4106-a034-b62596197511",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "8b84becb-f0a2-4a28-b1c8-71612a0ad308",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "47386369-3ecf-4410-919a-cb85c7ed648f",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "41d660a0-2ff6-4733-98f0-eeaf77f2c08c",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "5172e5f5-2d0e-4ba3-8a36-23a408ac9588",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "6e8a0060db4a430f98c8d89f66",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.map.clockwise",
      "mainTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "84c8e8e8-6468-459b-80f0-67085552800c",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedfold",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Roboto",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "30pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "8f478b31-58d6-480c-beb1-adca3be0555c",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3",
          "fontFamily": "Roboto",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "a1157d84-3a91-4b46-bcd5-8df02d985fda",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Roboto",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "f5aa1a5b-7d54-45bc-9767-d2d950de5117",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.ellipse",
          "fillPattern": "solid",
          "fontFamily": "Roboto",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "5ad93164-fac9-47bc-b256-e6852765dae9",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Roboto",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "2859fc53-93b5-4c31-8894-e3da9e6024e5",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Roboto",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "bbf455ee-42a0-497f-be52-f53ebbc180bd",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Roboto','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "42fd8ac5-b54e-4034-a818-bab7c3d7e646",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "9ce68b0e-51d9-4a2e-995f-1c9b893e4fae",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Roboto','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "45d72d70-b004-44df-9a51-fe61550a5260",
        "properties": {
          "line-tapered": "tapered"
        }
      }
    }
  },
  {
    "id": "42c88f12129a77f5482a880df3",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.map.clockwise",
      "mainTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "52a69547-9bb2-42fd-9087-83177591dd01",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipserect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "3pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "7b10c915-6848-4fb9-aabc-8cd20514272a",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipserect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "2pt",
          "fillPattern": "solid",
          "borderWidth": "3",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "1998a177-18da-44ed-b6d7-67902961c9f7",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "7858d710-21e2-4878-b7be-06f80b747fc6",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.ellipse",
          "fillPattern": "solid",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "ac929bd6-27d4-44e7-9c39-27df1d757875",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "4a1f1fa3-2941-4de4-993f-c44861f20114",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipserect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "3",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "7d2b46e3-314e-4733-a662-8a271df1d50e",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "8c1b3228-8eb7-4fe5-a8c9-418a09875711",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "1de0fdb3-5685-4532-828d-2d0070d2875d",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "2937d1c7-f823-4390-b7d1-229f25fb55b4",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "bf289133ca1b566815eabb3698",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.map.clockwise"
    },
    "theme": {
      "centralTopic": {
        "id": "f7005009-e65e-4aff-93c4-6e43bfd7a934",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.fold",
          "lineWidth": "5pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Arvo",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "36pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "03498d63-ca9d-4857-a467-8fd36ad151ac",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.fold",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Arvo",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "3f9445bf-7639-4133-8023-758f467d10c8",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.fold",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Arvo",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "cbb65eae-358d-4510-827c-c883b72a78ae",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.ellipse",
          "fillPattern": "solid",
          "fontFamily": "Arvo",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "7742d0aa-b5b4-400d-ae09-5b35a0ee8847",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.fold",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Arvo",
          "fontStyle": "normal",
          "fontWeight": "400",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "24f59da1-644b-4a5c-ac75-77ecaba368e1",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.fold",
          "lineWidth": "5pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "'Arvo','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "da9fdad9-09f3-4246-9439-a01cf8289e8f",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.rect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Arvo','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "09c15bf6-255c-42e9-8a47-23f0cd67964e",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.straight",
          "lineWidth": "3",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "c56b6845-78e3-493c-99fe-9db6d1137648",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Arvo','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "0b783c61-5ca8-4828-aba3-b12deddbd949",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "e179c2ffb0b8dec4f09479329d",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.map.clockwise",
      "mainTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "5fa2e73e-0b2b-4b43-be0c-ceb70fc9d9a1",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "1pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "ce6c0a5e-034d-4e89-b521-a5461c4d8a82",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "5",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "4fa792e3-9e30-4d16-9c16-bde7c24d2c9f",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "8f0b34fd-1a5f-43df-8cdf-b0ae6483db01",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "deaab9f7-fe2c-45c9-bda2-e01a9cb82aaf",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "b1315c48-5481-4d74-97b4-ff3bfcade8af",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "1pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "5",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "'NeverMind','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "3d9dada3-99f9-41e9-9454-b25319be6f27",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.rect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "bfc1c134-4e9b-4339-bf1a-6fb82e19758e",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "12be37b1-6f9e-49f5-9289-3410bd9efa06",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.zigzag",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.square",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "73b0715b-acd0-4867-aa72-b163fa2d614d",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "309bd0497a2b02cbc22488e492",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.map.clockwise",
      "mainTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "2a3445b4-914d-412f-a7bf-45b1e6c9c122",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "3pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "5",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "f6294209-7028-4b11-80f3-24d4bc841221",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "2pt",
          "fillPattern": "hachure",
          "borderWidth": "3",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "fe96a1ea-24c9-444a-aeb6-81c4b1c27a83",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillColor": "none",
          "fillPattern": "hachure",
          "borderWidth": "2pt",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "6b3ac0a7-d22e-4e81-8ec8-8d6d8eb542a1",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.ellipse",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "12d0a3a6-5243-4a39-9017-33e4dd764510",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "c5569dd6-7ceb-45a9-8659-cabf0b8bf30e",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "3pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "hachure",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "23ac9532-5d23-4117-a8aa-af62df1b280c",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "ee3e3dfc-75dd-4936-aebc-503728842b57",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "626be782-19bb-48cd-b349-34b27bbcee9e",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "32766257-9bed-4eea-8fe0-3cf89a71b3de",
        "properties": {
          "line-tapered": "tapered"
        }
      }
    }
  },
  {
    "id": "037bdacd906b00c163d38baac4",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.map.clockwise",
      "mainTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "f8a77fa1-74ae-410d-aae6-9d00946f47a3",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "3pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "622bd0a1-5c79-4393-9983-de2561b3fd38",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "b8cda63f-ee8d-4478-8dbc-5bbde1443485",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "941a90bf-b2c5-4cfa-a45f-1a1bbfa5becc",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "1e1781a5-618b-43fb-93b3-533c37443dad",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "57f00e29-be3f-4d44-9031-4cd4138747a8",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillPattern": "solid",
          "borderWidth": "3",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "954fa583-1ed0-4364-8b21-054849145f90",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind','Montserrat','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "47d6d2ae-a9b3-4581-8d67-5f4f296c2fb9",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "3dc74320-d897-4279-87a7-0be8a35c0038",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Montserrat','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "a277be6c-3898-4135-9925-6abeef0a9531",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "9e7a72076c5b995963b13bdae4",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.map.clockwise"
    },
    "theme": {
      "centralTopic": {
        "id": "30c0c4ac-46f2-41e1-8c2b-42ebd0c0a302",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "hachure-thin",
          "borderWidth": "3",
          "borderPattern": "handdrawn-solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "486ac5b0-dc5d-4fbe-89e1-4b5aad02803f",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillPattern": "hachure-thin",
          "borderPattern": "handdrawn-solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "20pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "4b870828-e348-4f64-a933-b0a18cb6f35b",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "29c69211-f442-4330-aa73-a3d1015b36a1",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.ellipse",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "40db8ba4-212f-40d8-9147-a5194f5f00e3",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "2pt",
          "fillPattern": "hachure-thin",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "8fc36611-9584-4549-a700-271ce64e4e2c",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.bight",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "hachure-thin",
          "borderWidth": "2pt",
          "borderPattern": "handdrawn-solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "1f7d9dc2-e22c-4ba5-9bd8-43c26a1ca80d",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-dash",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "9cd7d3fc-ad63-405f-bc6e-2071e4278ab1",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2",
          "linePattern": "handdrawn-solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "ec8884bf-75ca-4b00-b230-0666eb59c76a",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "6c3df78d-fdb9-4560-9171-ad07774d14e6",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "eb688e2c7c6b16ac265c088302",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.map.clockwise"
    },
    "theme": {
      "centralTopic": {
        "id": "cd9ab08f-1c93-4ca1-9759-dc6258dd96b4",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipse",
          "lineClass": "org.xmind.branchConnection.straight",
          "lineWidth": "5pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "solid-hand-drawn",
          "borderWidth": "5pt",
          "borderPattern": "handdrawn-solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "074fb0a2-4948-4510-9878-fa1629e6aa86",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipse",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "2",
          "fillPattern": "hachure-thin",
          "borderWidth": "5",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "917e5592-52ab-4bd6-af1b-e3ae7f3bb0d5",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "a0629346-d0bb-4b3a-b56b-d17d3b05a04f",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "4369067d-e5df-4439-9e21-5098547d04fe",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderPattern": "handdrawn-solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "26a493b6-5533-4afd-b129-99bc5947840f",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipse",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "5",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "4cd6f13c-a540-4596-af41-180ab16f565f",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "a69bc5b0-4b66-4fea-902f-3cd8d809c7de",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.angle",
          "lineWidth": "2",
          "linePattern": "handdrawn-solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "5cdc3bf2-48fe-4b0d-a52c-f3ab8c9ad4fe",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "328f61bb-8d54-45b6-82be-cd6d2c1a326e",
        "properties": {
          "line-tapered": "normal"
        }
      }
    }
  },
  {
    "id": "bdc9e305d53995ffe2579809bc",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.map.clockwise"
    },
    "theme": {
      "centralTopic": {
        "id": "3df5c915-d89c-46c3-9b2c-419ef1d5c4d8",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "crossing",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "7ae83802-ef28-4526-80f4-fabe2313ae69",
        "properties": {
          "shapeClass": "org.xmind.topicShape.singlebreakangle",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "1pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "crossing-thin",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "15da7fa1-571d-4e5d-81e0-b4287ee8e60d",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "a989154f-8adc-4d27-8dae-324c9f8513f7",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "81bb75cf-ac37-4d84-81e4-3d8a161b94d1",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "a76e72ef-15e3-4154-b43a-87a3dc2c0002",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "1pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "crossing-thin",
          "borderWidth": "1",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "5a663655-81b0-4571-80f8-368a5a708ef4",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "1",
          "linePattern": "handdrawn-dash",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "923aee41-525a-477b-b31c-5005a3ef8487",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.straight",
          "lineWidth": "1",
          "linePattern": "handdrawn-solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "5c5b5621-4d39-4d79-94c5-6564503fbf46",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "1",
          "linePattern": "handdrawn-dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Hand','Open Sans','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "6add27ff-2a8c-4b27-9a8d-2fd1306042fe",
        "properties": {
          "line-tapered": "normal"
        }
      }
    }
  },
  {
    "id": "935ad49000a89e4de4778b4267",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.org-chart.down"
    },
    "theme": {
      "centralTopic": {
        "id": "6ea1e81c-bdc9-46f5-9519-99c84f5fa1f1",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.fold",
          "lineWidth": "3",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "38e06706-1e60-4e4f-ad38-e84231361e18",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "2",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": "600",
          "fontSize": "20pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "2d8110eb-1406-4df3-8b9a-f3ffa69a7c93",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "656030a1-435f-4ab7-8d93-5808804f6aad",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "70cc0382-08ce-44ca-82ff-0ea81224d00f",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.fold",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": "600",
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "d607aa49-161d-4156-97fa-6b365fe28754",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "20pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "50432676-3616-4a9b-bb78-386df8161dc6",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.rect",
          "shapeCorner": "20pt",
          "lineWidth": "2pt",
          "linePattern": "dash-dot",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "5104a419-21c5-4eb1-9734-f602cc9cbe4b",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.angle",
          "lineWidth": "2",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "a1ca2fe7-e0fb-414a-b5ad-d0f7df1a393f",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "fc5fd30e-59db-4c3c-9c38-3c60f588a2db",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "889beaa46659843b5b615bbf98",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.org-chart.down"
    },
    "theme": {
      "centralTopic": {
        "id": "0916e4c2-36f3-4192-be1b-edac541137b3",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Droid Serif",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "36pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "fe8ca6e0-4e48-4775-8ef4-776b6d36600d",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Droid Serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "736d089f-5b26-4af7-aaf1-688c7f0bb781",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Droid Serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "4299131f-7dd7-445d-b5b8-377bc67179a5",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "Droid Serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "902620e3-e48c-4ea4-8841-1fda15511eb2",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Droid Serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "2c1c1a7a-aa66-42dc-abb6-60db33e2ce33",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "'Droid Serif','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "boundary": {
        "id": "d120a8b0-cda8-4d7b-93bd-73be491d108c",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "1",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Droid Serif','Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "793002a6-42c8-4358-86e9-616ed5ea305a",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.straight",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "d92bdb3d-ae68-4bce-adc0-9071394e9e11",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.zigzag",
          "lineWidth": "1",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Droid Serif','Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "b734a75f-abbb-4cf9-84a6-2b421f5b48e7",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "fcb8419de37a2e68d873f8b781",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.org-chart.down"
    },
    "theme": {
      "centralTopic": {
        "id": "b4db1f21-fc0d-4d41-8993-54e9f6f6aa1b",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedhexagon",
          "lineClass": "org.xmind.branchConnection.roundedfold",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "24pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "0e267418-6634-4660-bff6-60dabdcd73c5",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedhexagon",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "eb811522-1d8a-4198-b7c5-0888953a3738",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "ad51820d-ca50-4fa5-9449-407d8ad02e17",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.ellipse",
          "fillPattern": "solid",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "fc20a4f7-b2e4-4566-8862-79eaa362e153",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "400",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "c6e8f67b-1f06-4e65-a315-303c48a85134",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedhexagon",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "boundary": {
        "id": "3bc04656-ed27-4757-b21e-a2321d43f73a",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedPolygon",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "191c73a6-4a39-43f5-bac7-a0cbddfdfbfd",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "e2a557cd-b813-4af1-9a01-6b92ed0b0a59",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.dot",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "ac1dea37-faa1-417e-af7d-5a404d2e0b17",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "e4aac349e2f87621626278de47",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.org-chart.down"
    },
    "theme": {
      "centralTopic": {
        "id": "8cb1ecf8-6b5b-429d-885f-94f97a6cd5df",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "1pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "26pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "f1b1dd90-675e-4a38-9733-28a5713fc7b9",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": "600",
          "fontSize": "20pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "0bb262c0-52fa-44eb-8844-29b9409d60d1",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "summaryTopic": {
        "id": "23a315dc-6ae6-4610-821d-de8d4cf4643f",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "1pt",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "4734ca9f-dcce-4954-8365-55bad5b92739",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind Condense",
          "fontStyle": "normal",
          "fontWeight": "600",
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "fcf8e147-ba83-4d8a-957e-8675ed153a35",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.rect",
          "shapeCorner": "20pt",
          "lineWidth": "1",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind Condense','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "dd337a22-19c4-4a9a-be6b-51d666e451cb",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "1",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "6a6b38ea-d441-48fb-a625-53421674ee07",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.zigzag",
          "lineWidth": "1",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Condense','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "f03b89b1-6f73-48e8-90bf-86ea157bd181",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "d179fb8de49871c40103ca1720",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.org-chart.down",
      "mainTopic": "org.xmind.ui.org-chart.down"
    },
    "theme": {
      "centralTopic": {
        "id": "e20210c2-6ed1-4ca2-a78a-06e5da288cb0",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.straight",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "98030fe1-174f-450d-be55-bc46876d1d8d",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.straight",
          "fillPattern": "hachure-thin",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "20pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "3125561b-e248-4743-a698-fc2310fd83b2",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.straight",
          "fillPattern": "hachure-thin",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "420c75ac-25e0-4951-b9ab-5af03aba9f73",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "b52d645e-eb75-42fe-b3b2-d34631fa873e",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.straight",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "hachure-thin",
          "borderWidth": "0pt",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "floatingTopic": {
        "id": "ea4be4d6-dce0-4deb-914a-827eada306bc",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.straight",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "boundary": {
        "id": "b0428d0f-896f-43c3-a32a-d6d557daef92",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.rect",
          "shapeCorner": "20pt",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-dash",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "03f2df12-bfb8-4695-9e51-bb7a2bac5162",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.straight",
          "lineWidth": "2",
          "linePattern": "handdrawn-solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "23944559-77b8-4a70-adfd-099b041c243e",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "758fa6f1-1bf5-4595-97a0-9ed9a6f9aec2",
        "properties": {
          "line-tapered": "tapered"
        }
      }
    }
  },
  {
    "id": "2f0afb8d995a55939d8ff954ea",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.timeline.horizontal"
    },
    "theme": {
      "centralTopic": {
        "id": "13074e09-f1e7-476f-b395-7b4888a44c1c",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "3pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Roboto",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "09570a07-d3f2-49b0-bb44-926c5ac66456",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "2",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3",
          "fontFamily": "Roboto",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "cdcea052-0341-43c8-900a-ad026b121d92",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Roboto",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "45209f15-56f2-40b9-91e2-d4c1c1b5acb1",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "Roboto",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "635dc574-b3cf-4fd6-ab71-00a994b72fbd",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Roboto",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "ae4a78f6-c7e3-43c6-bc8b-a79b674a55ee",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Roboto",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "490e1d06-0c5e-43f0-9c0e-c4e655bb6e3c",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Roboto','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "b1b8acb1-58db-4308-9270-23f79a62b3d9",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.straight",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "c4a5c2f2-c899-448e-ae0f-816f9bd177ba",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Roboto','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "bf4523fb-e206-44f7-b5ca-6bce95452cfd",
        "properties": {
          "line-tapered": "normal"
        }
      }
    }
  },
  {
    "id": "85188f38c3ba2741c61ba94de8",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.timeline.horizontal",
      "mainTopic": "org.xmind.ui.brace.right"
    },
    "theme": {
      "centralTopic": {
        "id": "5890932a-90df-4252-b27a-a06421a1fec3",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Raleway",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "30pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "1b7fc0c4-7468-4e3a-bf2a-512c80aa38f5",
        "properties": {
          "shapeClass": "org.xmind.topicShape.circle",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Raleway",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "16pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "e25e02c5-befb-4926-9845-bffcf8126a05",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Raleway",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "summaryTopic": {
        "id": "aab40b38-0a35-4b98-b12d-84d6ade37fac",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Raleway",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "9c54b100-2179-4ad8-a8cf-3f4fa55c4ccb",
        "properties": {
          "shapeClass": "org.xmind.topicShape.circle",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Raleway",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "81017ad3-9034-4bc3-a82b-67857e302885",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Raleway','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "56a0943b-cd60-4fe2-97dc-90e12358f0e0",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.straight",
          "lineWidth": "2",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "2d4b99f4-6c28-40e7-96f7-37c4d7fe00ff",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.dot",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Raleway','Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "512eaf1b-eb6f-43f0-bec0-171742f068e5",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "cf2bb698b7199f86e41ffbe381",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.timeline.sided.horizontal"
    },
    "theme": {
      "centralTopic": {
        "id": "f002255f-b26d-43bb-9978-59010370f7ae",
        "properties": {
          "shapeClass": "org.xmind.topicShape.circle",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "3",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "2e12bc1e-5d6a-4045-978e-bb4fb754bc1a",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.straight",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "87bf1244-a495-4cd5-b5f5-769c25ffca6f",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "3a4a9176-a31a-47f3-85b3-814e35d255f5",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.curve",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "db6ffdf5-c065-4503-980f-3e93622aa467",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "boundary": {
        "id": "e61c3ea6-1d9e-49b0-a77a-22bd03b78778",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "ee285ce7-7a90-4db2-a5e2-88f7e5a50e5e",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "bbaa9d56-4aa6-4a98-b5a3-e6c38c063cfb",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Montserrat','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "cfd265a8-f5f3-488e-a34f-10fce5277950",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "e56bba21bd999bd979e0aaa696",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.timeline.through.vertical"
    },
    "theme": {
      "centralTopic": {
        "id": "72b5c4aa-44dd-4aae-88de-ba69258f0244",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.straight",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "3pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "6be82aa8-26ac-4ed2-8487-1fcc9b20a5a2",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "6b14ffac-ed23-422b-8182-f3fcaac87163",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "79d328f2-81df-4893-a18c-f73a7167923b",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "85261c32-51c3-444a-8090-43cbb00c60c9",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": "400",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "32b8a655-a040-4444-b363-a56c1d13e7d3",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "a768ad41-e6f6-4a7d-8e89-3e0db86a4003",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "6d3d05a6-8a35-4169-931a-db72b459aa1a",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "cef209e1-1a10-4b62-a3e6-0beeb3029cdd",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "5c317d96-5291-40f1-8075-52f388a3687a",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "0faa01d612f995b9198b39a769",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.timeline.through.vertical",
      "mainTopic": "org.xmind.ui.tree.right"
    },
    "theme": {
      "centralTopic": {
        "id": "8713a3e9-915f-44e1-99b0-eedda825385a",
        "properties": {
          "shapeClass": "org.xmind.topicShape.doubleunderline",
          "lineClass": "org.xmind.branchConnection.straight",
          "lineWidth": "3pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "50e25e1d-63f1-4bd3-bb0a-7ba9b7d1b19e",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "1pt",
          "fillPattern": "crossing-thin",
          "borderWidth": "2",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "20pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "1190cea3-9a1b-4751-9272-68c16b6d9348",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "73033b00-a62b-47a5-9725-e170b1ee6445",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "aeb398a1-6491-4821-b546-fe18cc6618f6",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "1pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "crossing-thin",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "f6ae4614-6e80-4abc-afd8-7190a224dbf4",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "1pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "crossing-thin",
          "borderWidth": "2pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "boundary": {
        "id": "5469b9ed-7e99-4955-93c9-d50e66af8b83",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "48144838-3838-49c9-b562-39ef3e603759",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2",
          "linePattern": "handdrawn-solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "b5d3381b-d727-4987-a9eb-05bdfa5f4054",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Hand','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "7c3f4006-838a-4e66-b6c4-7114160548c9",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "456ab570dafa3902b18f8ab397",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.tree.right",
      "mainTopic": "org.xmind.ui.logic.right"
    },
    "theme": {
      "centralTopic": {
        "id": "f36f9238-0ee8-4756-9233-edd102c705e1",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "3pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Nunito",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "36pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "9db185cf-2568-41e6-b25f-f982f1c48cfb",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Nunito",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "cd58c12d-60d6-4fa4-8761-0428b785074b",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Nunito",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "d9036c22-0465-48c5-878c-a925063e19bf",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "Nunito",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "aa6f861e-a674-4051-a91e-386a0b91b925",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2",
          "fontFamily": "Nunito",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "31d922af-afab-4ebb-85f7-0f226985b5ef",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Nunito",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "32969cd1-e456-4644-a9fd-b415b65ee6c3",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Nunito','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "79e54cb7-1721-4574-8e98-d5832a5b3437",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "3afdcf9e-3956-47d5-ad8a-b881d105a354",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.zigzag",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Nunito','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "aee93dc9-27ec-4afa-aec2-b131ed44593d",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "8318d7b395b90814c9c76a601c",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.tree.right"
    },
    "theme": {
      "centralTopic": {
        "id": "f7cb2fa3-0bf7-47b9-a1c9-a02ed41313ad",
        "properties": {
          "shapeClass": "org.xmind.topicShape.doubleunderline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Open Sans",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "f8fceccf-9a6b-4df8-b14d-3b6d6f48946a",
        "properties": {
          "shapeClass": "org.xmind.topicShape.doubleunderline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Open Sans",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "653e2c05-ebb6-44bc-9e47-60a78d954f9c",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Open Sans",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "5f1a579e-0213-4cbc-a50a-ec13ee4e2705",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "Open Sans",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "959d9ee0-8d2c-4034-ae4e-3c30aa1906ac",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.elbow",
          "lineWidth": "2pt",
          "fillPattern": "solid",
          "borderWidth": "0",
          "fontFamily": "Open Sans",
          "fontStyle": "normal",
          "fontWeight": "600",
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "d5912622-0424-4772-a342-2e2e6b6bc14f",
        "properties": {
          "shapeClass": "org.xmind.topicShape.doubleunderline",
          "lineClass": "org.xmind.branchConnection.elbow",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Open Sans",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "250d7e82-0400-4d1a-bbcb-d0925ca32874",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.rect",
          "shapeCorner": "20pt",
          "lineWidth": "1",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Open Sans','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "21443503-5cce-4dda-8a24-c9ebc38a0ed5",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "2ec1c894-b539-4689-b96c-b8edb54650f4",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.zigzag",
          "lineWidth": "1",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Open Sans','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 600,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "51d2ff41-e1b1-45b2-a54a-8e4901491b77",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "886bcf346678a4dbed25d89d03",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.timeline.vertical",
      "mainTopic": "org.xmind.ui.brace.right"
    },
    "theme": {
      "centralTopic": {
        "id": "d81c76bc-eaf1-4178-95d6-f5462e134c09",
        "properties": {
          "shapeClass": "org.xmind.topicShape.stack",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "2",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "30pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "40405192-4339-4df8-909b-cd4fccc83343",
        "properties": {
          "shapeClass": "org.xmind.topicShape.stack",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "6644d60a-535a-4338-b69f-74936530858a",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "ae022efc-5e86-4eb2-a488-b52aeb492f84",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.ellipse",
          "fillPattern": "solid",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "6f930a75-a1f8-404f-a576-878897915710",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": "400",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "a79a9da5-7e3f-45cb-874f-3168f7a6bce4",
        "properties": {
          "shapeClass": "org.xmind.topicShape.stack",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "'Montserrat','Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "5a3f65dd-757d-4cf8-bea4-7ad6f0626d4d",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "f4714d18-3d05-4f2c-a61a-a96eaab34617",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "0c98d6d9-94cb-47f5-98ee-7d1501b10a12",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "4b9a20da-70ff-41b9-ae91-e284fd07b273",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "a92988ac13baf149b576ca0b54",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.timeline.vertical",
      "mainTopic": "org.xmind.ui.tree.right"
    },
    "theme": {
      "centralTopic": {
        "id": "93ece28d-1348-42a3-8dd0-6f556cd3a7ed",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipticrectangle",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "24pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "08a4e87e-a4f3-46aa-b857-a4e4a2ea0e78",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipticrectangle",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "subTopic": {
        "id": "59c83c21-0758-4ff1-924d-6102ebbc0579",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "calloutTopic": {
        "id": "b3103ad5-d078-43c3-aead-a80edb9795a1",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "c3cc13df-5018-4c30-bbc9-f916c5ec66e3",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "06c9b904-5217-406f-9816-dbb182978fbc",
        "properties": {
          "shapeClass": "org.xmind.topicShape.ellipticrectangle",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "boundary": {
        "id": "8c032549-14ad-49f7-844d-2baf0488e781",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind','Montserrat','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "62a8b859-0138-44fe-ae25-afdb7eeee431",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.straight",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "b0bdfdde-e0db-4930-b5f0-12cd76c4544a",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.dot",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Montserrat','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "bfdd08b7-4a4d-4375-898f-cb71cb79a55a",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "31891a966b2afb371280b93c09",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.timeline.vertical",
      "mainTopic": "org.xmind.ui.tree.right"
    },
    "theme": {
      "centralTopic": {
        "id": "14263ad9-83e0-4bbc-a973-ca8a855ab55b",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "crossing",
          "borderWidth": "2pt",
          "borderPattern": "handdrawn-solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 700,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "mainTopic": {
        "id": "d5fdfc60-40ea-4543-abc6-5e4a33f52e09",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedhexagon",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "20pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "subTopic": {
        "id": "9e743887-4857-4406-aa69-9e423abcea14",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillPattern": "crossing",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "calloutTopic": {
        "id": "fc73d05f-05cb-4f0f-88bd-dc75bc93fa93",
        "properties": {
          "calloutShapeClass": "org.xmind.calloutTopicShape.balloon.roundedRect",
          "fillPattern": "solid-hand-drawn",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summaryTopic": {
        "id": "8ba3a7b1-caf2-4ac4-a00a-5eb023662e6c",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "crossing",
          "borderWidth": "2pt",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "floatingTopic": {
        "id": "327df39f-fed6-48a6-8646-1b4313b6e491",
        "properties": {
          "shapeClass": "org.xmind.topicShape.underline",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillColor": "none",
          "fillPattern": "hachure-thin",
          "borderWidth": "2pt",
          "borderPattern": "handdrawn-solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "NeverMind Hand",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "left"
        }
      },
      "boundary": {
        "id": "b1a67627-ecf6-4d7c-b3b5-26e43e27b281",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2pt",
          "linePattern": "handdrawn-solid",
          "fillPattern": "solid",
          "fontFamily": "'Caveat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "71a15097-709b-4b0d-9f6c-fe150f5fc3e9",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.square",
          "lineWidth": "2",
          "linePattern": "handdrawn-solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "d57fdc6e-cadd-4ce0-8c39-d0e77212d51f",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "handdrawn-dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind Hand','Caveat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "italic",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "fe1b0f7f-7196-4b57-8ba2-b97c0d31857e",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "cbba3b400fba766fda29a989b6",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.treetable.toptitle"
    },
    "theme": {
      "centralTopic": {
        "id": "3f967d50-71c7-42be-b8af-7d0cb732740a",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "2pt",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "right"
        }
      },
      "mainTopic": {
        "id": "f68a25d4-d9e1-43fb-add4-47fa7c95fdcd",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.curve",
          "fillPattern": "solid",
          "borderWidth": "0",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "right"
        }
      },
      "subTopic": {
        "id": "6905fec2-4d82-482b-9461-6050827f21bc",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "fillPattern": "solid",
          "borderWidth": "0",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "right"
        }
      },
      "floatingTopic": {
        "id": "c9c7a786-f900-4321-942e-bf1f7739aae9",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.roundedElbow",
          "linePattern": "solid",
          "fillPattern": "solid",
          "borderWidth": "0pt",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "fontFamily": "Montserrat",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "right"
        }
      },
      "boundary": {
        "id": "330a8910-a226-46c5-a4c3-554ebd49d144",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": "normal",
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "274176ad-75c7-4337-92da-361612390232",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.round",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "2924cc73-c696-4878-b121-bebb81f80474",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.zigzag",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.dot",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'Montserrat','NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "a5168ab6-1c88-43a3-b216-d1b26d7acb79",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  },
  {
    "id": "6c59046c172871b866ad4892e2",
    "structureStyle": {
      "centralTopic": "org.xmind.ui.treetable"
    },
    "theme": {
      "centralTopic": {
        "id": "09b66814-75cd-4623-8fd6-c13f74add68b",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "3pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2",
          "borderPattern": "solid",
          "arrowEndClass": "org.xmind.arrowShape.none",
          "alignment-by-level": "inactived",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "28pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "right"
        }
      },
      "mainTopic": {
        "id": "966a364a-2e93-4fbe-8ea9-b002685e67b6",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.curve",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": "500",
          "fontSize": "18pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "right"
        }
      },
      "subTopic": {
        "id": "9c523fee-fd68-4e08-a6a5-c730b76feb71",
        "properties": {
          "shapeClass": "org.xmind.topicShape.rect",
          "lineClass": "org.xmind.branchConnection.curve",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "0",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "right"
        }
      },
      "floatingTopic": {
        "id": "e6d5f0f9-ac22-4227-8084-0f17cf0c007b",
        "properties": {
          "shapeClass": "org.xmind.topicShape.roundedRect",
          "lineClass": "org.xmind.branchConnection.curve",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "fillColor": "none",
          "fillPattern": "solid",
          "borderWidth": "2",
          "fontFamily": "NeverMind",
          "fontStyle": "normal",
          "fontWeight": 500,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "right"
        }
      },
      "boundary": {
        "id": "d6587b58-d2a9-4095-abad-b51aa10a96e5",
        "properties": {
          "shapeClass": "org.xmind.boundaryShape.roundedRect",
          "shapeCorner": "20pt",
          "lineWidth": "2",
          "linePattern": "dash",
          "fillPattern": "solid",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "14pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "summary": {
        "id": "9ce7874c-f02f-49b7-b6db-c970842b412f",
        "properties": {
          "shapeClass": "org.xmind.summaryShape.straight",
          "lineWidth": "2pt",
          "linePattern": "solid",
          "lineCorner": "8pt"
        }
      },
      "relationship": {
        "id": "0aa70203-6a8b-4b00-be7f-3d839fc0e2e9",
        "properties": {
          "shapeClass": "org.xmind.relationshipShape.curved",
          "lineWidth": "2",
          "linePattern": "dash",
          "arrow-begin-class": "org.xmind.arrowShape.none",
          "arrowEndClass": "org.xmind.arrowShape.triangle",
          "fontFamily": "'NeverMind','Microsoft YaHei','PingFang SC','Microsoft JhengHei','sans-serif',sans-serif",
          "fontStyle": "normal",
          "fontWeight": 400,
          "fontSize": "13pt",
          "textTransform": "manual",
          "textDecoration": "none",
          "textAlign": "center"
        }
      },
      "map": {
        "id": "c0bb525c-6315-4102-ab4b-35e9170b8d72",
        "properties": {
          "line-tapered": "none"
        }
      }
    }
  }
]

/** 获取颜色主题 */
export function getColorTheme(id: string): ColorThemeData | undefined {
  return COLOR_THEMES.find(t => t.id === id)
}

/** 获取骨架主题 */
export function getSkeletonTheme(id: string): SkeletonThemeData | undefined {
  return SKELETON_THEMES.find(t => t.id === id)
}

/** 获取所有颜色主题 ID */
export function getColorThemeIds(): string[] {
  return COLOR_THEMES.map(t => t.id)
}

/** 获取所有骨架主题 ID */
export function getSkeletonThemeIds(): string[] {
  return SKELETON_THEMES.map(t => t.id)
}
