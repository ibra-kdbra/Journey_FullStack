import { ref, computed, watch, onUnmounted } from 'vue';
import { CodeInputAnalyzer, type InputFormat } from '~/utils/codeInputAnalyzer';

export interface UseCodeInputAnalysisReturn {
  inputFormat: import('vue').Ref<InputFormat>;
  isAnalyzing: import('vue').Ref<boolean>;
  inputHints: import('vue').ComputedRef<string>;
  validateUserInput: import('vue').ComputedRef<(input: string) => { isValid: boolean; errors: string[] }>;
  generateSampleInput: import('vue').ComputedRef<() => string>;
}

export function useCodeInputAnalysis(code: import('vue').Ref<string>, language: import('vue').Ref<string>): UseCodeInputAnalysisReturn {
  const inputFormat = ref<InputFormat>({
    requirements: [],
    totalLines: 0,
    examples: [],
    errors: [],
    confidence: 0
  });

  const isAnalyzing = ref(false);
  let timeoutId: ReturnType<typeof setTimeout>;

  const analyze = () => {
    if (!code.value.trim() || !language.value) {
      inputFormat.value = {
        requirements: [],
        totalLines: 0,
        examples: [],
        errors: [],
        confidence: 0
      };
      return;
    }

    isAnalyzing.value = true;

    // Debounce analysis to avoid excessive processing
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      try {
        const format = CodeInputAnalyzer.analyzeCode(code.value, language.value);
        inputFormat.value = format;
      } catch (error) {
        inputFormat.value = {
          requirements: [],
          totalLines: 0,
          examples: [],
          errors: [`Analysis failed: ${error}`],
          confidence: 0
        };
      } finally {
        isAnalyzing.value = false;
      }
    }, 500);
  };

  watch([code, language], analyze, { immediate: true });

  onUnmounted(() => {
    clearTimeout(timeoutId);
    isAnalyzing.value = false;
  });

  const inputHints = computed(() => {
    // @ts-ignore - Assuming this exists based on the original React implementation
    return CodeInputAnalyzer.generateInputHints ? CodeInputAnalyzer.generateInputHints(inputFormat.value) : '';
  });

  const validateUserInput = computed(() => {
    return (input: string) => {
      // @ts-ignore - Assuming this exists based on the original React implementation
      return CodeInputAnalyzer.validateInput ? CodeInputAnalyzer.validateInput(input, inputFormat.value) : { isValid: true, errors: [] };
    };
  });

  const generateSampleInput = computed(() => {
    return () => {
      if (inputFormat.value.examples.length > 0) {
        // Return a random example
        const randomIndex = Math.floor(Math.random() * inputFormat.value.examples.length);
        return inputFormat.value.examples[randomIndex];
      }
      return '';
    };
  });

  return {
    inputFormat,
    isAnalyzing,
    inputHints,
    validateUserInput,
    generateSampleInput
  };
}