import 'react-native';
import React from 'react';
import {describe, expect, it, jest} from '@jest/globals';
import renderer, {act} from 'react-test-renderer';

const mockExecute = jest.fn<(args: any) => Promise<any>>();
jest.mock('di', () => ({
  container: {get: () => ({execute: (args: any) => mockExecute(args)})},
  TYPES: {GetPhotoUseCase: 'GetPhotoUseCase'},
}));

import {useBloc} from 'presentation/features/photo/Photo.hook';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const hits = (start: number, n: number) =>
  Array.from({length: n}, (_, i) => ({id: start + i}));
const ok = (h: any[] | undefined) => ({
  status: 'success',
  result: h === undefined ? {} : {hits: h},
});

async function mount() {
  let current!: ReturnType<typeof useBloc>;
  const Probe = () => {
    current = useBloc();
    return null;
  };
  await act(async () => {
    renderer.create(<Probe />);
  });
  return () => current;
}

describe('useBloc pagination', () => {
  it('appends the next page into a new array', async () => {
    mockExecute
      .mockResolvedValueOnce(ok(hits(0, 20)))
      .mockResolvedValueOnce(ok(hits(20, 5)));
    const get = await mount();
    const first = get().photos;
    expect(first).toHaveLength(20);

    await act(async () => {
      get().onEndReached();
    });
    expect(get().photos).toHaveLength(25);
    expect(get().photos).not.toBe(first);
  });

  it('does not throw when hits is missing', async () => {
    mockExecute.mockResolvedValueOnce(ok(undefined));
    const get = await mount();
    expect(get().photos).toEqual([]);
    expect(get().error).toBeNull();
  });

  it('exposes an error for a failed result', async () => {
    mockExecute.mockResolvedValueOnce({
      status: 'failed',
      statusCode: 500,
      errors: {code: 'E', message: 'boom'},
    });
    const get = await mount();
    expect(get().error).toBe('boom');
  });
});
