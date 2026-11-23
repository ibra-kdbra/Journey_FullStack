import {describe, expect, it, jest} from '@jest/globals';

const mockRequest = jest.fn<(req: any) => Promise<any>>();
jest.mock('di', () => ({
  container: {get: () => ({request: (req: any) => mockRequest(req)})},
}));
jest.mock('di/types', () => ({TYPES: {RestApiGateway: 'RestApiGateway'}}));

import {PhotoRemoteDataSourceImpl} from 'data/datasources/photo/PhotoRemoteDataSource';

describe('PhotoRemoteDataSourceImpl', () => {
  it('passes the search query as a param instead of building the path', async () => {
    mockRequest.mockResolvedValue({status: 'success'});

    await new PhotoRemoteDataSourceImpl().getPhoto(2, 'a&b=c');

    const req = mockRequest.mock.calls[0][0];
    expect(req.path).toBe('');
    expect(req.params).toMatchObject({q: 'a&b=c', page: 2, per_page: 20});
  });

  it('omits q when there is no query', async () => {
    mockRequest.mockResolvedValue({status: 'success'});

    await new PhotoRemoteDataSourceImpl().getPhoto(1);

    expect(mockRequest.mock.calls[1][0].params).not.toHaveProperty('q');
  });
});
