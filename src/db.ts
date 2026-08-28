import type { Receipt } from './types';

let databaseName = 'billable-split';
const DB_VERSION = 1;
const STORE = 'receipts';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Could not open local storage. Check private browsing settings and try again.'));
  });
}

/** Demo data is deliberately held in a different IndexedDB database. */
export function useStorageNamespace(namespace: 'real' | 'demo'): void {
  databaseName = namespace === 'demo' ? 'demo:billable-split' : 'billable-split';
}

export function storageDatabaseName(): string {
  return databaseName;
}

export async function clearReceipts(): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).clear();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('The sample data could not be reset. Try again.'));
  });
  db.close();
}

async function request<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const result = operation(transaction.objectStore(STORE));
    result.onsuccess = () => resolve(result.result);
    result.onerror = () => reject(new Error('The local save did not complete. Your last change may not be stored.'));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => db.close();
  });
}

export function listReceipts(): Promise<Receipt[]> {
  return request('readonly', (store) => store.getAll()).then((items) =>
    items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  );
}

export function getReceipt(id: string): Promise<Receipt | undefined> {
  return request('readonly', (store) => store.get(id));
}

export function saveReceipt(receipt: Receipt): Promise<IDBValidKey> {
  return request('readwrite', (store) => store.put(receipt));
}

export function deleteReceipt(id: string): Promise<undefined> {
  return request('readwrite', (store) => store.delete(id));
}

export async function replaceAllReceipts(receipts: Receipt[]): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    store.clear();
    for (const receipt of receipts) store.put(receipt);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('The backup could not be restored. Existing data was left unchanged where possible.'));
  });
  db.close();
}
