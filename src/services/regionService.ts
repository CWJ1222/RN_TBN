import { Region, Program } from '../types';

export class RegionService {
  private static regions: Region[] = [
    {
      id: 'busan',
      name: '부산',
      code: 'bs',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/busan',
      smsNumber: '#0949',
    },
    {
      id: 'gwangju',
      name: '광주',
      code: 'kj',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/gwangju',
      smsNumber: '#0973',
    },
    {
      id: 'daegu',
      name: '대구',
      code: 'dg',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/daegu',
      smsNumber: '#1039',
    },
    {
      id: 'incheon',
      name: '인천',
      code: 'ic',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/incheon',
      smsNumber: '#1049',
    },
    {
      id: 'daejeon',
      name: '대전',
      code: 'dj',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/daejeon',
      smsNumber: '#1059',
    },
    {
      id: 'ulsan',
      name: '울산',
      code: 'us',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/ulsan',
      smsNumber: '#1069',
    },
    {
      id: 'sejong',
      name: '세종',
      code: 'sj',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/sejong',
      smsNumber: '#1079',
    },
    {
      id: 'jeju',
      name: '제주',
      code: 'jj',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/jeju',
      smsNumber: '#1089',
    },
    {
      id: 'gangwon',
      name: '강원',
      code: 'gw',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/gangwon',
      smsNumber: '#1099',
    },
    {
      id: 'chungbuk',
      name: '충북',
      code: 'cb',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/chungbuk',
      smsNumber: '#1109',
    },
    {
      id: 'chungnam',
      name: '충남',
      code: 'cn',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/chungnam',
      smsNumber: '#1119',
    },
    {
      id: 'jeonbuk',
      name: '전북',
      code: 'jb',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/jeonbuk',
      smsNumber: '#1129',
    },
    {
      id: 'jeonnam',
      name: '전남',
      code: 'jn',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/jeonnam',
      smsNumber: '#1139',
    },
    {
      id: 'gyeongbuk',
      name: '경북',
      code: 'gb',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/gyeongbuk',
      smsNumber: '#1149',
    },
    {
      id: 'gyeongnam',
      name: '경남',
      code: 'gn',
      streamUrl: 'https://radio2.tbn.or.kr:442/stream/gyeongnam',
      smsNumber: '#1159',
    },
  ];

  static getAllRegions(): Region[] {
    return this.regions;
  }

  static getRegionById(id: string): Region | undefined {
    return this.regions.find(region => region.id === id);
  }

  static getRegionByCode(code: string): Region | undefined {
    return this.regions.find(region => region.code === code);
  }

  static getStreamUrl(regionId: string): string | null {
    const region = this.getRegionById(regionId);
    return region?.streamUrl || null;
  }

  static getSmsNumber(regionId: string): string | null {
    const region = this.getRegionById(regionId);
    return region?.smsNumber || null;
  }

  static getRegionName(regionId: string): string | null {
    const region = this.getRegionById(regionId);
    return region?.name || null;
  }
}
