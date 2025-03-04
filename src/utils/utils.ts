/**
 * @description Get image resources
 * @param { string } path - Resource path
 */
export const getImageUrl = (path: string): string | undefined => {
  const modules: Record<string, { default: string }> = import.meta.glob(
    '/src/assets/**/*',
    { query: '?url', eager: true }
  );

  if (!modules[path]) return;

  return modules[path].default;
};
