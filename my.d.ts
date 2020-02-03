declare let wx: any;

declare interface CCSysLocalStorage {
    getItem(key: string): any;
    setItem(key: string, value: any);
    removeItem(key: string);
    clear();
    key();
}