import {ApiResType} from 'common/helper/APIHelper';
import RestApiGateway from 'data/gateway/RestApiGateway';
import {container} from 'di';
import {TYPES} from 'di/types';
import {injectable} from 'inversify';
import {Photos} from 'data/models/photo';
import {getAppConfig} from 'data/config/Config';

export interface PhotoRemoteDataSource {
  getPhoto(page: number, query?: string): Promise<ApiResType<Photos>>;
}

@injectable()
export class PhotoRemoteDataSourceImpl implements PhotoRemoteDataSource {
  async getPhoto(page: number, query?: string): Promise<ApiResType<Photos>> {
    const apiKey = getAppConfig().pixabayApiKey;
    if (!apiKey) {
      throw new Error(
        'PIXABAY_API_KEY is not set. Copy .env.example to .env and add your key.',
      );
    }
    const api = container.get<RestApiGateway>(TYPES.RestApiGateway);
    console.log('PhotoRemoteDataSourceImpl:', query);
    return await api.request<Photos>({
      path: '',
      params: {
        key: apiKey,
        ...(query ? {q: query} : {}),
        page,
        per_page: 20,
      },
      method: 'GET',
    });
  }
}
