export default class StorageManager {
    static ins: StorageManager = null;
    static init() {
        this.ins = new StorageManager();
    }

    private ls: CCSysLocalStorage = cc.sys.localStorage;

    storageData(key: string, data: any) {
        this.ls.setItem(key, data);
    }

    getData(key: string): any {
        return this.ls.getItem(key);
    }

    removeData(key: string) {
        this.ls.removeItem(key);
    }
}