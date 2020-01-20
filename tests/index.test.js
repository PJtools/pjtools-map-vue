import pkg from '../package.json';

const testDist = process.env.LIB_DIR === 'dist';

describe('pjmap dist files', () => {
  it('exports modules correctly', () => {
    const pjmap = testDist ? require('../dist/pjmap') : require('../components'); // eslint-disable-line global-require
    expect(Object.keys(pjmap)).toMatchSnapshot();
  });

  if (testDist) {
    it('should have pjmap.version', () => {
      const pjmap = require('../dist/pjmap'); // eslint-disable-line global-require
      expect(pjmap.version).toBe(pkg.version);
    });
  }
});
