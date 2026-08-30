import {Container} from 'inversify';
import 'reflect-metadata';

import {TYPES} from './types';
import StorageGateway from 'data/gateway/StorageGateway';
import RestApiGateway from 'data/gateway/RestApiGateway';
import {
  PhotoRemoteDataSource,
  PhotoRemoteDataSourceImpl,
} from 'data/datasources/photo/PhotoRemoteDataSource';
import {PhotoRepository} from 'domain/repositories/PhotoRepository';
import {PhotoRepositoryImpl} from 'data/repositories/PhotoRepositoryImpl';
import {GetPhotoUseCase} from 'domain/usecases/photo/GetPhotoUseCase';


const container = new Container();
container.bind<RestApiGateway>(TYPES.RestApiGateway).to(RestApiGateway);
container.bind<StorageGateway>(TYPES.StorageGateway).to(StorageGateway);

/** region Data */
container
  .bind<PhotoRemoteDataSource>(TYPES.PhotoRemoteDataSource)
  .to(PhotoRemoteDataSourceImpl);
container.bind<PhotoRepository>(TYPES.PhotoRepository).to(PhotoRepositoryImpl);
/** endregion Data **/

/** region Domain */
container.bind<GetPhotoUseCase>(TYPES.GetPhotoUseCase).to(GetPhotoUseCase);
/** endregion Domain **/

export {container, TYPES};
