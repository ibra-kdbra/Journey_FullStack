import 'react-native';
import React from 'react';
import {TextInput} from 'react-native';
import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import renderer, {act} from 'react-test-renderer';

import AppTextInput from 'presentation/components/textinput';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('AppTextInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls onLastValueChange once, 400ms after quick typing stops', async () => {
    const onLastValueChange = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <AppTextInput onLastValueChange={onLastValueChange} />,
      );
    });

    // Each keystroke re-renders the parent with a fresh callback identity
    // (defeating React.memo), as an inline arrow in a real parent would.
    for (const text of ['a', 'ab', 'abc']) {
      await act(async () => {
        tree.root.findByType(TextInput).props.onChangeText(text);
        tree.update(
          <AppTextInput
            onLastValueChange={(v?: any) => onLastValueChange(v)}
          />,
        );
        jest.advanceTimersByTime(100);
      });
    }
    expect(onLastValueChange).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(400);
    });
    expect(onLastValueChange).toHaveBeenCalledTimes(1);
    expect(onLastValueChange).toHaveBeenCalledWith('abc');
  });

  it('does not emit after unmount', async () => {
    const onLastValueChange = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <AppTextInput onLastValueChange={onLastValueChange} />,
      );
    });
    const input = tree.root.findByType(TextInput);
    await act(async () => {
      input.props.onChangeText('abc');
    });
    await act(async () => {
      tree.unmount();
    });
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(onLastValueChange).not.toHaveBeenCalled();
  });
});
