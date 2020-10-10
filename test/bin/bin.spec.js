const execFileSync = require( 'child_process' ).execFileSync;

function runAndRead( args ) {
  const binPath = './bin/roll-parser.js';
  const nodeArgs = args.slice( 0 );

  const result = execFileSync( 'node', [ binPath, ...nodeArgs ]);

  return result.toString().trim();
}

describe( 'Single roll:', () => {
  test( 'Should log result for "2d20+1" roll', () => {
    const msg = runAndRead([ '2d20+1' ]);
    expect( msg ).toMatch( /\(2d20\+1\)\s.+/ );
  });

  test( 'Should log result for "6d10!>6f1" roll', () => {
    const msg = runAndRead([ '6d10!>6f1' ]);
    expect( msg ).toMatch( /\(6d10!>6f1\)\s.+/ );
  });

  test( 'Should log result for empty roll', () => {
    const msg = runAndRead([]);
    expect( msg ).toMatch( /\(d20\)\s.+/ );
  });
});

describe( 'Multiple rolls:', () => {
  test( 'Should log result for mixed rolls', () => {
    const msg = runAndRead([ '2d20+1', '6d10!>6f1', 'd20' ]);
    expect( msg ).toMatch( /\(2d20\+1\)\s.+\n\(6d10!>6f1\)\s.+\n\(d20\)\s.+/ );
  });
});

describe( 'Invalid rolls:', () => {
  test( 'Should show message for invalid rolls', () => {
    const msg = runAndRead([ '2d20!+1' ]);
    expect( msg ).toEqual( 'Invalid roll notation.' );
  });

  test( 'Should show message for empty rolls', () => {
    const msg = runAndRead([ null ]);
    expect( msg ).toEqual( 'Invalid roll notation.' );
  });
});

describe( 'Multiple rolls:', () => {
  test( 'Should log result for mixed rolls', () => {
    const msg = runAndRead([ '2d20+1', '6d10!>6f1', 'd20' ]);
    expect( msg ).toMatch( /\(2d20\+1\)\s.+\n\(6d10!>6f1\)\s.+\n\(d20\)\s.+/ );
  });
});

describe( 'Help flag:', () => {
  test( 'Should show manual', () => {
    const msg = runAndRead([ '--help' ]);
    expect( msg ).toMatch( /Usage:\n.+/ );
  });

  test( 'Should ignore rolls', () => {
    const msg = runAndRead([ 'd20', '--help' ]);
    expect( msg ).toMatch( /Usage:\n.+/ );
  });
});
