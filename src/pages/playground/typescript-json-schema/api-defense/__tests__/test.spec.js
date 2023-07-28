//test.js
import { describe, expect, jest, test } from '@jest/globals';
import defaultExport, { bar, foo } from '../foo-bar-baz';

jest.mock('../foo-bar-baz', () => {
    const originalModule = jest.requireActual('../foo-bar-baz');

    //Mock the default export and named export 'foo'
    return {
        __esModule: true,
        ...originalModule,
        default: jest.fn(() => 'mocked baz'),
        foo: 'mocked foo',
    };
});

describe('test', () => {
    test('should do a partial mock', () => {
        const defaultExportResult = defaultExport();
        expect(defaultExportResult).toBe('mocked baz');
        expect(defaultExport).toHaveBeenCalled();
    
        expect(foo).toBe('mocked foo');
        expect(bar()).toBe('bar');
    });
})