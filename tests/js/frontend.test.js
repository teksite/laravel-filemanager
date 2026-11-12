import test from 'node:test';
import assert from 'node:assert/strict';

import StateManager from '../../src/frontend/browser/core/StateManager.js';
import {escapeHtml} from '../../src/frontend/browser/helpers/dom.js';

globalThis.window = {location: {origin: 'https://app.test'}};
const {safeUrl, renderMedia} = await import('../../src/frontend/browser/helpers/preview.js');

test('state updates are immutable and share untouched branches', () => {
    const state = new StateManager({emit() {}});
    const files = {a: {id: 'a'}};
    state.set('load.files', files);
    const before = state.state;
    state.set('load.cursor', 'x');
    assert.notEqual(state.state, before);
    assert.equal(state.state.load.files, files, 'files object must not be cloned');
    assert.equal(before.load.cursor, null, 'old snapshot untouched');
});

test('safeUrl blocks script schemes', () => {
    assert.equal(safeUrl('javascript:alert(1)'), '');
    assert.equal(safeUrl('data:text/html,<script>'), '');
    assert.equal(safeUrl('/storage/a.jpg'), '/storage/a.jpg');
    assert.equal(safeUrl('https://cdn.test/a.jpg'), 'https://cdn.test/a.jpg');
});

test('renderMedia escapes attacker controlled fields', () => {
    const html = renderMedia({id: '1', mime_type: 'image/jpeg', title: '"><img src=x onerror=alert(1)>', url: '/a.jpg'});
    assert.ok(!html.includes('<img src=x'));
    assert.ok(html.includes('&quot;&gt;&lt;img'));
    const doc = renderMedia({id: '2', mime_type: 'application/pdf', title: '<script>x</script>', original_name: 'x'});
    assert.ok(!doc.includes('<script>'));
    assert.equal(escapeHtml(null), '');
});
