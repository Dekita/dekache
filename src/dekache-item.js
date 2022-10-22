
/**
* Used within the Dekache class.
* @class 
*/
class DekacheItem {
    /**
    * See {@link DekacheItem#initialize}
    */
    constructor() {this.initialize(...arguments)}
    /**
    * The data that this cache item is storing.
    * @type {object}
    * @read_only
    */
    get data() {return this._data}
    /**
    * The Date.now() this item was last renewed.
    * @type {number}
    * @read_only
    */
    get time() {return this._time}
    /**
    * The Date.now() when this item was initially created.
    * @type {number}
    * @read_only
    */
    get init() {return this._init}
    /**
    * Called automatically when constructed
    * @param {object} cache_data - The data to hold, can be any object or primative
    */
    initialize(cache_data) {
        this._data = cache_data;
        this._time = Date.now();
        this._init = Date.now();
    }
    /**
    * Checks if this item was created longer than `mins` ago.
    * @param {number} mins - the number of minutes to check against (integer).
    * @returns {boolean} Based on if item was renewed longer than `mins` ago.
    */
    checkTimeDiff(mins) {
        return Date.now() - this._time >= 1000 * 60 * mins;
    }
    /**
    * Renews the time for this item. This will stop {@link DekacheItem#checkTimeDiff} from returning true.
    * Which in turn, will stop the item from being cleared from the cache.
    */
    renew() {this._time = Date.now()}
}

module.exports = DekacheItem;