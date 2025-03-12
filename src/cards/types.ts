type NvidiaGpuType = '5070' | '5080' | '5090';
type AmdGpuType = '9070XT';
type NvidiaGpuManufacturer =
  | 'ASUS'
  | 'GAINWARD'
  | 'GIGABYTE'
  | 'INNO3D'
  | 'MSI'
  | 'PNY'
  | 'PALIT'
  | 'ZOTAC';
type AmdGpuManufacturer = 'ASROCK' | 'ASUS' | 'GIGABYTE' | 'SAPPHIRE' | 'XFX';

type NvidiaGpuFamily =
  // GIGABYTE
  | 'AORUS MASTER'
  | 'AORUS MASTER ICE'
  | 'AORUS XTREME WATERFORCE'
  | 'AORUS XTREME WATERFORCE WB'
  | 'GAMING OC'
  | 'WINDFORCE OC'
  // ASUS
  | 'TUF GAMING'
  | 'TUF GAMING OC'
  | 'ROG ASTRAL'
  | 'ROG ASTRAL OC'
  | 'ROG ASTRAL LC'
  | 'ROG ASTRAL LC OC'
  // MSI
  | 'SUPRIM SOC'
  | 'GAMING TRIO OC'
  | 'VANGUARD SOC'
  | 'VANGUARD SOC LAUNCH EDITION'
  | 'VENTUS 3X OC'
  // INNO3
  | 'X3'
  | 'ICHILL X3'
  | 'ICHILL FROSTBITE'
  // GAINWARD
  | 'PHANTOM'
  | 'PHANTOM GS OC'
  // PNY
  | 'ARGB GAMING OC'
  | 'TRIPLE FAN OC'
  // PALIT
  | 'GAMEROCK'
  | 'GAMEROCK OC'
  // ZOTAC
  | 'SOLID'
  | 'SOLID OC'
  | 'AMP EXTREME INFINITY';

type AmdGpuFamily =
  // ASROCK
  | 'STEEL LEGEND'
  | 'TAICHI OC'
  // ASUS
  | 'PRIME'
  | 'PRIME OC'
  | 'TUF GAMING'
  // GIGABYTE
  | 'GAMING OC'
  | 'AORUS ELITE'
  // SAPPHIRE
  | 'PULSE'
  | 'PURE'
  | 'NITRO+'
  // XFX
  | 'SWIFT'
  | 'SWIFT WHITE'
  | 'QUICKSILVER'
  | 'QUICKSILVER WHITE'
  | 'QUICKSILVER MAGNETIC AIR'
  | 'QUICKSILVER MAGNETIC AIR WHITE'
  | 'MERCURY MAGNETIC AIR'
  | 'MERCURY MAGNETIC AIR WHITE';

interface Card {
  type: NvidiaGpuType | AmdGpuType;
  manufacturer: NvidiaGpuManufacturer | AmdGpuManufacturer;
  family: NvidiaGpuFamily | AmdGpuFamily;
  url: string;
}

// TODO: missing mironet and JDC
type ShopName = 'Datart' | 'Smarty' | 'Alza' | 'TSBohemia' | 'Mironet' | 'Suntech' | 'JDC';

export interface Shop {
  name: ShopName;
  url: string;
  availabilityClass: string;
  priceClass: string;
  cards: {
    [key in NvidiaGpuType | AmdGpuType]?: Card[];
  };
}
