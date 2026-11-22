import React, {useEffect, useMemo, useRef} from 'react';
import {Text, TouchableOpacity, TextInput} from 'react-native';

import {BehaviorSubject} from 'rxjs';
import {debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';

import {IProps} from 'presentation/components/textinput/AppTextInput';
import {ViewContainer} from 'presentation/components/styles/styles.css';
import styles, {
  ViewTextInput,
} from 'presentation/components/textinput/styles.css';

const AppTextInput = (props: IProps) => {
  const {isClear, onLastValueChange} = props;
  // One subject for the lifetime of the component; re-creating it per render
  // would hand debounce/distinctUntilChanged a single value every time.
  const textChange$ = useMemo(() => new BehaviorSubject(''), []);
  // React 19 + RN 0.87: TextInput is the component type, and the instance
  // type - the one carrying .clear() - is what a ref actually holds.
  const textChangeRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  // Keep the latest callback without re-subscribing on every render.
  const onLastValueChangeRef = useRef(onLastValueChange);
  onLastValueChangeRef.current = onLastValueChange;

  useEffect(() => {
    const subscription = textChange$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap((text: string) => {
          if (onLastValueChangeRef.current && text.length > 0) {
            onLastValueChangeRef.current(text);
          }
        }),
      )
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [textChange$]);

  const onChangeText = (text: string) => {
    if (text.length === 0) {
      onLastValueChange(null);
      return;
    }
    textChange$.next(text);
  };

  const onClear = () => {
    textChange$.next('');
    textChangeRef.current?.clear();
    onLastValueChange(null);
  };

  return (
    <ViewContainer>
      <ViewTextInput>
        <TextInput
          style={styles.textInput}
          placeholderTextColor="black"
          ref={textChangeRef}
          placeholder={props.placeholder || 'Type here...'}
          onChangeText={onChangeText}
          {...props}
        />
        {isClear ? (
          <TouchableOpacity activeOpacity={0.9} onPress={onClear}>
            <Text>{'Xoá'}</Text>
          </TouchableOpacity>
        ) : null}
      </ViewTextInput>
    </ViewContainer>
  );
};

AppTextInput.defaultProps = {
  editable: true,
};

export default React.memo(AppTextInput);
