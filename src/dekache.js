/**
* Dekache: Written by dekitarpg@gmail.com
*/

// @ignore
const Emitter = require('events').EventEmitter;
const DekacheItem = require('./dekache-item');

/**
 * ```
 * const mycache = new Dekache({name:'you got any cache?', mins: 2})
 * await mycache.get('some-identifier', async() => { return 1 });
 * ```
 * `mycache.get('some-identifier', ()=>{})` calls will now return a 
 * promise that resolves to 1 until the number of mins (2) has been reached.
 * 
 * 
 * 
 * @class 
 */
class Dekache extends Emitter {
    /**
    * An object containing key value pairs where the key is a string identifier,
    * and the value is an object with the properties detailed below:
    * @typedef Dekache~options
    * @property {string} [name=''] - An identifyer for this cache.
    * @property {string} [type=force] - the cache type, either 'force' or 'renew'.
    * @property {number} [mins=1] - Number of minutes to cache each item for
    * @property {number} [freq=1000] - The frequency to check cache items for deletion (ms)
    */
    static DEFAULT_OPTS = {
        name: 'unnamed-cache', // the cache name for easy identifications
        type: 'force', // should renew data, or 'force' refresh after mins?
        mins: 1, // duration before data is removed from the cache
        freq: 1000, // frequency at which the cache items are checked for removal.
    }
    /**
    * See {@link Dekache#initialize}
    */
    constructor() {
        super(); // become event emitter
        this.initialize(...arguments);
    }
    /**
    * @property {object} data - stores key value pairs for cache items
    */
    get data() {
        return this._data;
    }
    /**
    * Called automatically when created
    * @param {Dekache~options} options - a cache options object.
    */
    initialize(options = {}) {
        // setup general config options
        const cache_options = { ...Dekache.DEFAULT_OPTS, ...options };
        this._name = cache_options.name;
        this._type = cache_options.type;
        this._mins = cache_options.mins;
        this._freq = cache_options.freq;
        this._hand = null;
        this._data = {};
        if (!cache_options.no_start) this.start();
    }
    /**
    * Starts the cache loop. Can be later stopped called {@link Dekache#stop}
    * @returns {boolean} Based on if started. False if already started.
    * @async
    */
    async start() {
        if (!this._hand) {
            this._hand = setInterval(()=>{
                this.loop();
            }, this._freq);
        }
        return !(!this._hand);
    }
    /**
    * Stops the cache loop. Can later be restarted calling {@link Dekache#start}
    * @returns {boolean} Based on if stopped. False if already stopped.
    * @async
    */
    async stop() {
        if (this._hand) {
            clearInterval(this._hand);
            this._hand = null;
            return true;
        }
        return false;
    }
    /**
    * The main cache loop function. Calls {@link Dekache#clear} .
    * @async
    */
    async loop() {
        await this.clear();
    }
    /**
    * Delete the given key from the cache
    * @param {object} data_key - the identifier for the cache item to delte.
    * @returns {boolean} Based on if any item was deleted from cache. False if not.
    */
    async delete(data_key) {
        const cache_name = `${this._type}_${JSON.stringify(data_key)}`;
        if (this._data[cache_name]) {
            this._data[cache_name] = null;
            delete this._data[cache_name];
            return true;
        }
        return false;
    }
    /**
    * Iterates over each cache item and clears any that have overstayed the duration.
    * @param {boolean} [forced=false] - Should all cache items be forced out regardless of duration?
    */
    async clear(forced = false) {
        const cache2clear = [];
        const cache_k = Object.keys(this._data);
        const cache_v = Object.values(this._data);
        for (let index = 0; index < cache_v.length; index++) {
            const item = cache_v[index];
            if (item.data) {
                if (forced || item.checkTimeDiff(this._mins)) {
                    cache2clear.push(cache_k[index]);
                }
            } else {
                cache2clear.push(cache_k[index]);
            }
        }
        if (!cache2clear.length) return;
        cache2clear.forEach((key) => {
            this.emit('clear-item', this._data[key], key);
            this._data[key] = null;
            delete this._data[key];
        });
        this.emit('clear', this._data, {
            delete_count: cache2clear.length,
            cache_count: cache_v.length,
        });
    }
    /**
    * Get the data, or uses callback function to populate cache and then returns data.
    * @param {object} data_key - the identifier for the cache item to get.
    * @param {function} callback - an asyncronous callback that should be called if no data is currently in the cache.
    * @returns {promise} Based on the data returned from the first time that
    * this function was called and the callbacks return data.
    * @promise
    */
    get(data_id, new_data_callback) {
        const cache_name = this.key(data_id);
        return new Promise(async (resolve, reject) => {
            if (this._data[cache_name]) {
                if (this._type === 'renew') {
                    this._data[cache_name].renew();
                }
            } else if (new_data_callback) {
                const new_data = await new_data_callback();
                this._data[cache_name] = new DekacheItem(new_data);
            }
            resolve(this._data[cache_name].data);
        });
    }
    /**
    * Set the cache data to new data directly and then returns promise.
    * @param {object} data_key - the identifier for the cache item to get.
    * @param {object} new_data - some object or primative.
    * @returns {promise} that resolves with new_data
    * @promise
    */
    set(data_id, new_data) {
        const cache_name = this.key(data_id);
        return new Promise(async (resolve, reject) => {
            this._data[cache_name] = new DekacheItem(new_data);
            resolve(this._data[cache_name].data);
        });
    }
    /**
    * Gets the internal key from data_id. Can be used for comparing an id when a cache item is cleared.
    * @param {object} data_key - the identifier for the cache item to get.
    * @returns {string} the internal cache key used
    * @promise
    */
    key(data_id) {
        return `${this._type}_${JSON.stringify(data_id)}`;
    }
}

module.exports = Dekache;