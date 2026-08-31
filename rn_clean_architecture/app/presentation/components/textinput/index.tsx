import React, {useEffect, useRef} from 'react';
import {Text, TouchableOpacity, TextInput} from 'react-native';

import {BehaviorSubject} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';

import {IProps} from 'presentation/components/textinput/AppTextInput';
import {ViewContainer} from 'presentation/components/styles/styles.css';
import styles, {
  ViewTextInput,
} from 'presentation/components/textinput/styles.css';

const AppTextInput = (props: IProps) => {
  const {isClear, onLastValueChange} = props;
  const textChange$ = new BehaviorSubject('');
  // React 19 + RN 0.87: TextInput is the component type, and the instance
  // type - the one carrying .clear() - is what a ref actually holds.
  const textChangeRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  let subscription = textChange$
    .pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((text: string) => {
        if (onLastValueChange && text.length > 0) {
          onLastValueChange(text);
        }
        return text;
      }),
    )
    .subscribe();

  useEffect(() => {
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
