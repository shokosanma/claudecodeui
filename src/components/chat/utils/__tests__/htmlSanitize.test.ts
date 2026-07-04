import { describe, it, expect } from 'vitest';
import { getSanitizePlugins } from '../htmlSanitize';

describe('getSanitizePlugins', () => {
  it('returns rehype-raw and rehype-sanitize plugins', () => {
    const plugins = getSanitizePlugins();
    expect(plugins).toHaveLength(2);
    expect(typeof plugins[0]).toBe('function');
    expect(typeof plugins[1]).toBe('function');
  });
});
