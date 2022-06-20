
import { generateUserCounts } from '../src/utils';

describe("#generateUserCounts()", () => {
  test("Two members, one Matrix one Signal", async () => {

    const output = generateUserCounts([{ displayname: 'B', matrixUsername: '@b:matrix.org' },
    { matrixUsername: '@signal_315r13:matrix.org' }])

    expect(output).toMatchInlineSnapshot(`
"There are 2 people in this chat in total; 1 on Matrix and 1 on Signal. The Matrix user is B (@b:matrix.org).
"
`);
  });
  test("Two members, both Matrix", async () => {

    const output = generateUserCounts([{ displayname: 'B', matrixUsername: '@b:matrix.org' },
    { matrixUsername: '@c:matrix.org' },
    ])

    expect(output).toMatchInlineSnapshot(`
"There are 2 people in this chat in total; 2 on Matrix and 0 on Signal. The Matrix users are B (@b:matrix.org) and @c:matrix.org.
"
`);
  });
  test("Three members, all Matrix", async () => {

    const output = generateUserCounts([

      { matrixUsername: '@a:matrix.org' },
      { displayname: 'B', matrixUsername: '@b:matrix.org' },
      { matrixUsername: '@c:matrix.org' },
    ])

    expect(output).toMatchInlineSnapshot(`
"There are 3 people in this chat in total; 3 on Matrix and 0 on Signal. The Matrix users are @a:matrix.org, B (@b:matrix.org) and @c:matrix.org.
"
`);
  });
  test("Ignores bots, includes displaynames if they exist and renders matrix usernames only if necessary", async () => {
    const output = generateUserCounts([
      { displayname: 'B', matrixUsername: '@b:matrix.org' },
      { matrixUsername: '@c:matrix.org' },
      { matrixUsername: '@signal_315r13:matrix.org' }])

    expect(output).toMatchInlineSnapshot(`
"There are 3 people in this chat in total; 2 on Matrix and 1 on Signal. The Matrix users are B (@b:matrix.org) and @c:matrix.org.
"
`);
  });
});
