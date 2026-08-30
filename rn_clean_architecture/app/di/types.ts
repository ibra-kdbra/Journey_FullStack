/**
 * Injection tokens, in their own module because they must not depend on
 * anything they name.
 *
 * They used to live in di/index.ts alongside the container, which imports every
 * implementation - so a class importing TYPES imported the whole graph back.
 * Property injection hid that: the decorator ran late enough that di/index.ts
 * had finished loading. Constructor injection evaluates at class-definition
 * time, and the cycle surfaced as
 *
 *   TypeError: Cannot read properties of undefined (reading 'PhotoRemoteDataSource')
 */
export const TYPES = {
  StorageGateway: Symbol.for('StorageGateway'),
  RestApiGateway: Symbol.for('RestApiGateway'),
  PhotoRemoteDataSource: Symbol.for('PhotoRemoteDataSource'),
  PhotoRemoteDataSourceImpl: Symbol.for('PhotoRemoteDataSourceImpl'),
  PhotoRepository: Symbol.for('PhotoRepository'),
  PhotoRepositoryImpl: Symbol.for('PhotoRepositoryImpl'),
  GetPhotoUseCase: Symbol.for('GetPhotoUseCase'),
};
