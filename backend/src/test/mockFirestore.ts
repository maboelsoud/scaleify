type MockFirestoreData = Record<string, Record<string, Record<string, unknown>>>;

interface MockDoc {
  exists: boolean;
  data: () => Record<string, unknown>;
}

interface MockSnapshot {
  empty: boolean;
  forEach: (cb: (doc: { data: () => Record<string, unknown> }) => void) => void;
}

export function createMockFirestore(initialData: MockFirestoreData = {}) {
  const db: MockFirestoreData = structuredClone(initialData);

  const set = jest.fn(async function (data: Record<string, unknown>) {
    const [collectionName, docId] = this._context as [string, string];
    db[collectionName] = db[collectionName] || {};
    db[collectionName][docId] = data;
    return { writeTime: new Date() };
  });

  const get = jest.fn(async function () {
    const [collectionName, docId] = this._context as [string, string];
    const doc = db[collectionName]?.[docId];
    return {
      exists: !!doc,
      data: () => doc ?? {},
    } satisfies MockDoc;
  });

  const where = jest.fn(function (
    field: string,
    op: '==',
    value: string
  ) {
    return {
      get: jest.fn(
        (async function (this: { _context: [string] }) {
          const [collectionName] = this._context;
          const collection = db[collectionName] || {};

          const docs = Object.entries(collection)
            .map((keyValue) => (keyValue[1]))
            .filter(doc => doc[field] === value)

          return {
            empty: docs.length === 0,
            forEach: (cb: (doc: { data: () => Record<string, unknown> }) => void) =>
              docs.forEach(d => cb({ data: () => d })),
          } satisfies MockSnapshot;
        }).bind({ _context: this._context }) // wrapped and context-passed ✅
      ),
    };
  });

  return {
    collection: (collectionName: string) => ({
      doc: (docId: string) => ({
        _context: [collectionName, docId],
        set: set.bind({ _context: [collectionName, docId] }),
        get: get.bind({ _context: [collectionName, docId] }),
      }),
      where: where.bind({ _context: [collectionName] }),
    }),
    __data: db,
    __mocks: { set, get, where },
  };
}
