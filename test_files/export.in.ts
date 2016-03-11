export * from './export_helper';
// This "foo" conflicts with a "foo" discovered via the above export,
// so the above export's "foo" should not show up.
export var foo: string = 'wins';
export var localExport = 3;
