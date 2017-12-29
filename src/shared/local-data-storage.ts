import { Injectable } from '@angular/core';
import { includes, remove } from 'lodash/fp';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class LocalDataStorage {

  observables: Map<string, BehaviorSubject<any>> = new Map();

  options: LocalDataStorageOptions = {
    predicate: 'PREDICATE',
    storageKeysKey: '1STORAGE_KEYS2"',
    storageKeys: [],
  };

  storageKeys: Array<string>;

  setItem(key: string, data: any) {
    if (!includes(key)(this.storageKeys)) {
      this.storageKeys.push(key);
      this.observables.set(key, new BehaviorSubject<any>(data));
    }
    this.observables.get(key).next(data);
    const storeData: LocalDataStorageObject = {
      key: key,
      data: data,
      type: typeof data
    };
    localStorage.setItem(this.options.predicate + storeData.key, JSON.stringify(storeData));
    localStorage.setItem(this.options.storageKeysKey, JSON.stringify(this.storageKeys));
  }

  observe(key: string): Observable<any> {
    if (this.kasKey(key)) {
      return this.observables.get(key).asObservable();
    } else {
      return Observable.throw(`Key: "${key}" does not exist in LocalDataStorage Keys`);
    }
  }

  kasKey(key: string): boolean {
    return includes(key)(this.storageKeys);
  }

  remove(key) {
    remove(key, this.storageKeys);
  }

  constructor() {
    this.storageKeys = JSON.parse(localStorage.getItem(this.options.storageKeysKey)) || [];

    this.storageKeys.forEach((key) => {
      const storeData: LocalDataStorageObject = JSON.parse(localStorage.getItem(this.options.predicate + key));
      if (storeData) {
        this.observables.set(key, new BehaviorSubject<any>(storeData.data));
      } else {
        this.observables.set(key, new BehaviorSubject<any>(undefined));
      }
    });
  }

  setOptions(options: LocalDataStorageOptions) {
    options.storageKeys = [...this.storageKeys, ...this.options.storageKeys, ...options.storageKeys].filter(this.onlyUnique);
    this.options = { ...this.options, ...options };
    this.storageKeys = this.options.storageKeys;
    this.options.storageKeys.forEach((key) => {
      const storeData: LocalDataStorageObject = JSON.parse(localStorage.getItem(this.options.predicate + key));
      if (storeData) {
        this.observables.set(key, new BehaviorSubject<any>(storeData.data));
      } else {
        this.observables.set(key, new BehaviorSubject<any>(undefined));
      }
    });
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
}

export interface LocalDataStorageOptions {
  predicate?: string;
  storageKeysKey?: string;
  storageKeys?: Array<string>;
}

interface LocalDataStorageObject {
  key: string,
  data: any;
  type: string;
}

