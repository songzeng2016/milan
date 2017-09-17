// 定义常量
const Promise = require('./es6-promise.min.js')

const IMGURL = 'https://sp.yangchengtech.com'
const HOST = `${IMGURL}/milian/Handler/Handler.ashx`
const [DATA, IsSuccess, SUCCESS, MESSAGE] = ['Data', 'IsSuccess', 'true', 'returnMsg']

class wc {
  constructor() {
    this.host = HOST
    this.imgUrl = IMGURL
    this.data = DATA
    this.isSuccess = IsSuccess
    this.success = SUCCESS
    this.message = MESSAGE
  }

  _Promise(fn) {
    return (obj = {}) => {
      return new Promise((resolve, reject) => {
        obj.success = (res) => {
          resolve(res)
        }

        obj.fail = (res) => {
          reject(res)
        }

        fn(obj)
      })
    }
  }

  uploadFile() {
    _Promise(wx.uploadFIle)({

    }).then((res) => {

    }).catch((err) => {

    })
  }

  get(data, successed, showLoading) {
    showLoading = showLoading || false
    showLoading && this.showLoading()
    wx.request({
      url: this.host,
      data: data || {},
      success: (res) => {
        // this.hideLoding()
        typeof (successed) === 'function' && successed(res.data)
      },
      complete: (res) => {

      }
    })
  }

  post(data, successed, showLoading) {
    showLoading = showLoading || false
    showLoading && this.showLoading()
    wx.request({
      url: this.host,
      data: data || {},
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: (res) => {
        // this.hideLoding()
        typeof (successed) === 'function' && successed(res.data)
      },
      complete: (res) => {

      }
    })
  }

  setStorage(key, data) {
    wx.setStorage({
      key,
      data,
    })
  }

  getStorage(key, successed) {
    wx.getStorage({
      key,
      success: (res) => {
        typeof (successed) === 'function' && successed(res.data)
      }
    })
  }

  navigateTo(url) {
    wx.navigateTo({ url })
  }

  switchTab(url) {
    wx.switchTab({ url })
  }

  navigateBack(delta) {
    wx.navigateBack({
      delta: delta || 1
    })
  }

  showToast([title = '提示', icon = 'success', duration = 2000]) {
    wx.showToast({
      title,
      icon,
      duration
    })
  }

  showLoading() {
    wx.showLoading({
      title: 'loading',
      mask: true
    })
  }

  hideLoding() {
    wx.hideLoading()
  }

  showModal(content, success, showCancel, title) {
    wx.showModal({
      title: title || '提示',
      content: content || '',
      showCancel: showCancel || false,
      cancelText: '',
      cancelColor: '',
      confirmText: '',
      confirmColor: '',
      success: function (res) {
        if (!!success && res.confirm && typeof (success) === 'function') {
          success()
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  }

  // 扩展json
  extend(destination, source) {
    for (let property in source) {
      destination[property] = source[property];
    }
    return destination
  }
}

export default wc