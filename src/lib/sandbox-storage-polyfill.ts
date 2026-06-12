/**
 * Injected before user scripts in sandboxed iframes. When the browser blocks
 * storage APIs (opaque origin without allow-same-origin), this provides an
 * in-memory localStorage/sessionStorage so user code does not throw.
 */
export const sandboxStoragePolyfillScript = `(function () {
  function createStorage() {
    var store = Object.create(null)
    return {
      get length() {
        return Object.keys(store).length
      },
      key: function (index) {
        return Object.keys(store)[index] || null
      },
      getItem: function (key) {
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
      },
      setItem: function (key, value) {
        store[String(key)] = String(value)
      },
      removeItem: function (key) {
        delete store[String(key)]
      },
      clear: function () {
        store = Object.create(null)
      },
    }
  }

  function installPolyfill() {
    var storage = createStorage()
    var session = createStorage()
    try {
      Object.defineProperty(window, 'localStorage', {
        value: storage,
        configurable: true,
      })
      Object.defineProperty(window, 'sessionStorage', {
        value: session,
        configurable: true,
      })
    } catch (e) {
      window.localStorage = storage
      window.sessionStorage = session
    }
  }

  try {
    window.localStorage.setItem('__snaplink_storage_test__', '1')
    window.localStorage.removeItem('__snaplink_storage_test__')
  } catch (e) {
    installPolyfill()
  }
})()`
