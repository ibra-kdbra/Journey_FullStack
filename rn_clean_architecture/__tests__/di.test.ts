import 'reflect-metadata';
import {container} from 'di';
import {TYPES} from 'di/types';
import {GetPhotoUseCase} from 'domain/usecases/photo/GetPhotoUseCase';
import {PhotoRepositoryImpl} from 'data/repositories/PhotoRepositoryImpl';

describe('container wiring', () => {
  it('injects the repository into the use case, not undefined', () => {
    const useCase = container.get<GetPhotoUseCase>(TYPES.GetPhotoUseCase);
    expect(useCase).toBeInstanceOf(GetPhotoUseCase);
    // The whole point: a dropped parameter decorator injects undefined and the
    // failure only shows up at the first call site.
    expect((useCase as any)._repository).toBeDefined();
    expect((useCase as any)._repository).toBeInstanceOf(PhotoRepositoryImpl);
  });

  it('injects the data source into the repository', () => {
    const repo = container.get<PhotoRepositoryImpl>(TYPES.PhotoRepository);
    expect((repo as any)._dataSource).toBeDefined();
    expect(typeof (repo as any)._dataSource.getPhoto).toBe('function');
  });
});
