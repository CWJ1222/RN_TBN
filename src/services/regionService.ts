import { Region } from '../types';

// src/services/regionService.ts

const REGION_MAP = [
  {
    id: '2',
    key: 'busan',
    name: '부산',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/busan/myStream/playlist.m3u8',
  },
  {
    id: '3',
    key: 'gwangju',
    name: '광주',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/gwangju/myStream/playlist.m3u8',
  },
  {
    id: '4',
    key: 'daegu',
    name: '대구',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/daegu/myStream/playlist.m3u8',
  },
  {
    id: '5',
    key: 'daejeon',
    name: '대전',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/daejeon/myStream/playlist.m3u8',
  },
  {
    id: '6',
    key: 'gyeongin',
    name: '경인',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/gyeongin/myStream/playlist.m3u8',
  },
  {
    id: '7',
    key: 'gangwon',
    name: '강원',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/gangwon/myStream/playlist.m3u8',
  },
  {
    id: '8',
    key: 'jeonbuk',
    name: '전북',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/jeonbuk/myStream/playlist.m3u8',
  },
  {
    id: '9',
    key: 'ulsan',
    name: '울산',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/ulsan/myStream/playlist.m3u8',
  },
  {
    id: '10',
    key: 'gyeongnam',
    name: '경남',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/gyeongnam/myStream/playlist.m3u8',
  },
  {
    id: '11',
    key: 'kyungbuk',
    name: '경북',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/kyungbuk/myStream/playlist.m3u8',
  },
  {
    id: '12',
    key: 'jeju',
    name: '제주',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/jeju/myStream/playlist.m3u8',
  },
  {
    id: '13',
    key: 'chungbuk',
    name: '충북',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/chungbuk/myStream/playlist.m3u8',
  },
  {
    id: '14',
    key: 'chungnam',
    name: '충남',
    streamUrl:
      'https://5cc6beb04faf6.streamlock.net/chungnam/myStream/playlist.m3u8',
  },
];

export class RegionService {
  static getStreamUrl(regionId: string): string | null {
    const region = REGION_MAP.find(
      r => r.id === regionId || r.key === regionId || r.name === regionId,
    );
    return region ? region.streamUrl : null;
  }

  static getRegionKey(regionId: string): string | null {
    const region = REGION_MAP.find(
      r => r.id === regionId || r.name === regionId,
    );
    return region ? region.key : null;
  }

  static getRegionName(regionId: string): string | null {
    const region = REGION_MAP.find(
      r => r.id === regionId || r.key === regionId,
    );
    return region ? region.name : null;
  }

  static getAllRegions(): { id: string; name: string }[] {
    return REGION_MAP.map(r => ({ id: r.id, name: r.name }));
  }
}
