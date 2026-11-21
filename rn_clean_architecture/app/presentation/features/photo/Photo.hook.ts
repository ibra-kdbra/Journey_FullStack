import {useEffect, useRef, useState} from 'react';

import {of} from 'rxjs';
import {exhaustMap} from 'rxjs/operators';

import {container, TYPES} from 'di';
import {GetPhotoUseCase} from 'domain/usecases/photo/GetPhotoUseCase';
import {Hit} from 'domain/entities/photo';

export function useBloc() {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [photos, setPhotos] = useState<Array<Hit>>([]);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState<string>();
  const [canLoadMore, setLoadMore] = useState<boolean>(false);
  const getPhotoUseCase = container.get<GetPhotoUseCase>(TYPES.GetPhotoUseCase);
  let currentPageRef = useRef<number>(1);

  useEffect(() => {
    getPhotoPixabay(1);
  }, []);

  const getPhotoPixabay = (page: number, query?: string) => {
    setLoading(true);
    const resultPhoto = of(
      getPhotoUseCase.execute({page: page, query: query}),
    ).pipe(exhaustMap(value => value));
    resultPhoto.subscribe({
      next: (result: any) => {
        if (result.status === 'success') {
          const hits: Hit[] = result?.result?.hits ?? [];
          setError(null);
          if (page === 1) {
            setPhotos(hits);
          } else {
            setPhotos(prev => [...prev, ...hits]);
          }
          setLoadMore(hits.length >= 20);
        } else {
          setLoadMore(false);
          const err = Array.isArray(result?.errors)
            ? result.errors[0]
            : result?.errors;
          setError(err?.message ?? 'Failed to load photos');
        }
      },
      complete: () => {
        setLoading(false);
      },
    });
  };

  const onLastValueChange = (text?: string) => {
    currentPageRef.current = 1;
    setKeyword(text);
    getPhotoPixabay(1, text);
  };

  const onEndReached = () => {
    if (canLoadMore) {
      currentPageRef.current += 1;
      getPhotoPixabay(currentPageRef.current, keyword);
    }
  };

  const onRefresh = () => {
    currentPageRef.current = 1;
    getPhotoPixabay(currentPageRef.current, keyword);
  };

  return {
    isLoading,
    error,
    photos,
    onLastValueChange,
    onEndReached,
    onRefresh,
  };
}
