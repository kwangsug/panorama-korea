/**
 * bkend.ai BaaS Client Configuration
 *
 * 사용자 설정 데이터를 저장하고 관리하는 클라이언트입니다.
 * 위젯 레이아웃, 사용자 선호도 등을 저장합니다.
 */

// TODO: @bkend/client 패키지 설치 후 활성화
// import { createClient } from '@bkend/client';

// export const bkend = createClient({
//   apiKey: process.env.NEXT_PUBLIC_BKEND_API_KEY!,
//   projectId: process.env.NEXT_PUBLIC_BKEND_PROJECT_ID!,
// });

// 임시 Mock 클라이언트 (개발용)
export const bkend = {
  collection: (name: string) => ({
    find: async (query?: any) => [],
    findById: async (id: string) => null,
    create: async (data: any) => data,
    update: async (id: string, data: any) => data,
    delete: async (id: string) => true,
  }),
  auth: {
    login: async (credentials: { email: string; password: string }) => ({
      user: null,
      token: null,
    }),
    logout: async () => {},
    register: async (data: any) => ({ user: null, token: null }),
  },
};

export type BkendClient = typeof bkend;
