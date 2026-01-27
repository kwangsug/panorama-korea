/**
 * 네이버 뉴스 검색 API 클라이언트
 *
 * API 키 발급: https://developers.naver.com/apps
 */

import { NewsItem } from '@/types';

/**
 * 네이버 뉴스 검색 API로 뉴스 가져오기
 */
export async function getNews(source: 'naver' | 'yonhap' = 'naver'): Promise<NewsItem[]> {
  try {
    // Next.js API Route를 통해 뉴스 가져오기
    const response = await fetch(`/api/news?source=${source}`, {
      next: { revalidate: 600 }, // 10분마다 캐시 갱신
    });

    if (!response.ok) {
      throw new Error(`뉴스 API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.news || [];
  } catch (error) {
    console.error('뉴스 로딩 실패:', error);
    // 에러 시 목업 데이터 반환
    return getMockNews();
  }
}

/**
 * 목업 뉴스 데이터
 */
export function getMockNews(): NewsItem[] {
  return [
    {
      id: '1',
      title: '한국 경제, 2026년 3% 성장 전망',
      summary: '국내 주요 경제 연구소들이 올해 경제 성장률을 3% 안팎으로 전망했습니다...',
      url: '#',
      source: '연합뉴스',
      publishedAt: new Date(),
    },
    {
      id: '2',
      title: 'AI 기술 발전으로 산업 혁신 가속화',
      summary: '인공지능 기술의 급속한 발전으로 다양한 산업 분야에서 혁신이 일어나고 있습니다...',
      url: '#',
      source: 'KBS',
      publishedAt: new Date(Date.now() - 3600000),
    },
    {
      id: '3',
      title: '환경부, 탄소 중립 로드맵 발표',
      summary: '정부가 2050 탄소 중립 달성을 위한 구체적인 실행 계획을 공개했습니다...',
      url: '#',
      source: 'SBS',
      publishedAt: new Date(Date.now() - 7200000),
    },
    {
      id: '4',
      title: '서울 부동산 시장, 안정세 지속',
      summary: '수도권 아파트 가격이 소폭 상승했지만 전반적으로 안정적인 흐름을 보이고 있습니다...',
      url: '#',
      source: '연합뉴스',
      publishedAt: new Date(Date.now() - 10800000),
    },
    {
      id: '5',
      title: 'K-팝 아티스트, 빌보드 차트 1위',
      summary: '한국 아티스트가 빌보드 메인 차트에서 1위를 차지하며 K-팝의 위상을 높였습니다...',
      url: '#',
      source: 'KBS',
      publishedAt: new Date(Date.now() - 14400000),
    },
  ];
}
