import { Selector } from 'testcafe';

fixture('Test Example')
  .page('https://localhost:3000');

test('Check heading exists', async t => {
  const heading = Selector('h1');
  await t.expect(heading.exists).ok();
});