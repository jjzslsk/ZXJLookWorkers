//app.js
const isOpenCityCode = [261]; //开通平台服务的城市编码
const util = require('utils/util.js');
let fsysm;
var socketState = 0;
var onchatMsgCal;
var onSocketOpenCal, onSocketErrorCal, onSocketMessageCal, onSocketCloseCal;
App({
  onLaunch: function () {

    var that = this;
    //检查网络
    wx.getNetworkType({
      success: (result) => {
        if (result.networkType == "none") {
          wx.showModal({
            title: '提示',
            content: '请求失败，请检查您的网络连接',
            showCancel: false,
          })
        } else { }
      },
      fail: () => { },
      complete: () => { }
    });

    //检查网络
    wx.onNetworkStatusChange((result) => {
      if (result.networkType == "none") {
        wx.showModal({
          title: '提示',
          content: '请求失败，请检查您的网络连接',
          showCancel: false,
        })
      } else { }
    });

    //检测新版本
    var updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
    })

    updateManager.onUpdateReady(function () {
      // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
      wx.showModal({
        title: '提示',
        content: '新版本下载成功！',
        showCancel: false,
        confirmText: '重启更新',
        success: function (res) {
          updateManager.applyUpdate()
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      wx.showModal({
        title: '提示',
        content: '新版本更新失败',
        showCancel: false,
      })
    })

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var that = this;
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        that.globalData.js_code = res.code
        that.getOpenIdHttps(res.code, 1, function (result) { });
      }
    })

    wx.removeStorage({
      key: 'pickedClassList',
      success(res) {
      }
    })

    // wx.showTabBarRedDot({
    //   index: 4,
    // })
  },

  onShow(options) {
    // Do something when show.
    if (this.globalData.userId != undefined && this.globalData.userId != null && this.globalData.userId != '') {
      this.startConnectSocket();
    }
  },

  /**
   * 如果页面执行得比onLaunch快，则在页面中使用此方法登录
   */
  wxLogin: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          that.globalData.js_code = res.code
          that.getOpenIdHttps(res.code, 1, function (result) {
            resolve(result);
          });
        }
      })
    });
  },

  /**获取定位坐标 */
  getLocation: function (calFunc) {
    var than = this
    wx.getLocation({
      type: 'wgs84', //默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标 
      success: function (res) {
        var longitude = res.longitude
        var latitude = res.latitude
        than.loadCity(longitude, latitude, calFunc);
      },
      fail: function () {
        calFunc('', '定位失败');
      }
    })
  },
  //使用百度滴入api，通过坐标获取当前城市名称
  loadCity: function (longitude, latitude, calFunc) {
    var that = this
    wx.request({
      url: that.globalData.baiduUrl + '/geocoder/v2/?ak=oNu7enEyvEcEljERNRQBa5KHCfUtmAEe&location=' + latitude + ',' + longitude + '&output=json',
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        var cityCode = res.data.result.cityCode;
        var city = res.data.result.addressComponent.city;
        if (city.length > 0 && city.charAt(city.length - 1) == '市') {
          city = city.substring(0, city.length - 1);
        }
        calFunc(cityCode, city);
      },
      fail: function () {
        calFunc('', '定位失败');
      },
    })
  },

  /**
   * 请求获取用户唯一标识openid
   * action 1登录，0其他
   */
  getOpenIdHttps: function (code, action, funCal) {
    wx.showLoading();
    var that = this
    wx.request({
      url: that.globalData.url + '/getWeiXinUserInfo?appletType=2&code=' + code,
      method: 'post',
      header: {
        'content-type': 'text/plain;charset=utf-8'
      },
      success: res => {
        if (res.statusCode == 200) {
          var resultData = res.data;
          if (typeof resultData == 'object' && resultData) {
            //如果是json对象,不用做处理
          } else {
            //如果是json字符串，则需要处理成json对象
            resultData = JSON.parse(resultData);
          }
          that.globalData.openId = resultData.openid;
          that.globalData.unionid = resultData.unionid;
          that.globalData.sessionKey = resultData.session_key;
          if (action == 1) {
            that.loginByOpenId(that.globalData.openId, that.globalData.unionid, funCal);
          } else {
            wx.hideLoading();
            funCal(true, resultData);
          }
          
        } else {
          wx.hideLoading();
          that.clearUserInfo();
          // wx.showModal({
          //   title: '提示',
          //   content: '请求失败(' + res.statusCode + ')',
          //   showCancel: false,
          // })
          funCal(false, null);
        }
      },
      fail: res => {
        //请求接口失败
        that.clearUserInfo();
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '获取OpenId失败',
          showCancel: false,
        })
        funCal(false, null);
      },
    })
  },

  /**
   * 通过openId登录
   * calFun(res) 回调 res.code:true成功，res.code:false失败
   */
  loginByOpenId: function (openId, unionid, calFun) {
    var that = this;
    var param = 'openId=' + openId + '&from=3&unionId=' + unionid;
    this.httpsDataGet('/user/loginByOpenId', param,
      function (loginRet) {
        // console.log('loginByOpenId:' + JSON.stringify(loginRet));
        //成功
        // wx.showLoading();
        // 获取用户信息
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  //console.log('loginByOpenIdres:' + JSON.stringify(loginRet));
                  that.globalData.userInfo = res.userInfo
                  that.globalData.userId = loginRet.data.clientId;
                  that.globalData.userAvatar = res.userInfo.avatarUrl;
                  that.globalData.starLevel = loginRet.data.starLevel;
                  that.globalData.level = loginRet.data.clientLevel;
                  that.globalData.phone = loginRet.data.clientPhone;
                  that.globalData.userName = loginRet.data.clientAccount;
                  that.globalData.loginUser = loginRet.data
                  that.setZxjToken(loginRet.data.token)
                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (that.userInfoReadyCallback) {
                    that.userInfoReadyCallback(res)
                  }
                  wx.hideLoading();
                  var calRes = {};
                  calRes.code = true;
                  typeof calFun == "function" && calFun(calRes)
                  that.startConnectSocket();
                  
                  // var param = 'userId=' + loginRet.data.clientId;
                  // that.httpsDataGet('/worker/userOrderCount', param,
                  //   function (res) {
                  //     console.log('userOrderCount:' + JSON.stringify(res));
                  //     var count = res.data.myOrder + res.data.bidding + res.data.atWork + res.data.uncompleted + res.data.invite + ''
                  //     console.log(count)
                  //     if (count > 0) {
                  //       wx.setTabBarBadge({
                  //         index: 4,
                  //         text: count
                  //       });
                  //     }
                  //   }
                  // )
                },
                fail: res => {
                  wx.hideLoading();
                  wx.showModal({
                    title: '获取用户信息失败',
                    content: JSON.stringify(res),
                    showCancel: false,
                  })
                  var calRes = {};
                  calRes.code = false;
                  typeof calFun == "function" && calFun(calRes)
                }
              })
            }
          }
        })
      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading();
        that.clearUserInfo();
      }
    )
  },

  //获取账户余额
  getAccountBalance: function (calFun) {
    var that = this;
    if (this.globalData.userInfo == null || this.globalData.userInfo == '' || this.globalData.userInfo == undefined) return;
    // accountBalance
    var param = 'clientId=' + this.globalData.userId + '&openId=' + this.globalData.openId + '&from=3';
    this.httpsDataGet('/member/getBalance', param,
      function (res) {
        //成功
        that.globalData.accountBalance = res.data.financeDues;
        typeof calFun == "function" && calFun(res.data.financeDues);
      },
      function (res) {
        //失败
      }
    )
  },

  //获取用户的默认地址
  getUserDefAddress: function (calFun) {
    if (!this.checkLoginState) return;
    var param = "CLIENT_ID=" + this.globalData.userId;
    wx.showLoading();
    this.httpsGetDatByPlatform('client_rec_addres_default', 'map', param,
      function (res) {
        //成功
        typeof calFun == "function" && calFun(res.msg)
      },
      function (returnFrom, res) {
        //失败
        typeof calFun == "function" && calFun(null)
      }
    );
  },

  /**
  * 保存token
  */
  setZxjToken: function (token) {
    try {
      wx.setStorageSync('zxj_token', token)
    } catch (e) { }
  },

  /**
   * 获取token
   */
  getZxjToken: function () {
    try {
      return wx.getStorageSync('zxj_token')
    } catch (e) {
      return null;
    }
  },

  /**
   * 通过平台接口获取数据（sql）
   * dataSet 查询调用的名称
   * queryMode map或list
   * param 请求参数
   * call_success 请求成功回调
   * call_fail 请求失败回调
   */
  httpsGetDatByPlatform: function (dataSet, queryMode, param, call_success, call_fail) {
    //key = 'zxj_repertory';//数据源名称
    //AJAX_MODE = 'AJAX_MODE_QUERY';//固定
    //DATASET = 'client_rec_addres_default';//查询调用的名称
    //QUERY_MODE = 'map';//’map或list’
    var paramStr = "key=zxj_repertory&AJAX_MODE=AJAX_MODE_QUERY&DATASET=" + dataSet + "&QUERY_MODE=" + queryMode + "&" + param
    var url = this.globalData.url + '/ajax?' + paramStr;
    var zxjToken = this.getZxjToken();
    wx.request({
      url: url,
      method: 'post',
      dataType: 'json',
      header: {
        'content-type': 'application/json;charset=UTF-8',
        'token': zxjToken
      },
      success: res => {
        wx.hideLoading();
        if (res.statusCode == 200) {
          var resultData = res.data;
          if (resultData.code == 0 || resultData.code == '0') {
            //获取到数据成功
            var resultMsg = resultData.msg;
            //判断返回来的数据resultData是json对象还是json字符串
            if (typeof resultMsg == 'object' && resultMsg) {
              //如果是json对象,不用做处理
            } else {
              //如果是json字符串，则需要处理成json对象
              if (resultMsg == '' || resultMsg == null) {
                resultData.msg = queryMode == 'list' ? [] : {};
              } else {
                resultMsg = JSON.parse(resultMsg);
                resultData.msg = resultMsg;
              }
            }
            typeof call_success == "function" && call_success(resultData)
          } else {
            //获取数据失败
            wx.showModal({
              title: '提示',
              content: resultData.msg + '(' + resultData.code + ')',
              showCancel: false,
            })
            typeof call_fail == "function" && call_fail(0, resultData)
          }
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败(' + res.statusCode + ')',
            showCancel: false,
          })
        }
      },
      fail: res => {
        wx.hideLoading();
        //请求接口失败
        wx.showModal({
          title: '提示',
          content: '请求失败(' + res.errMsg + ')',
          showCancel: false,
        })
        typeof call_fail == "function" && call_fail(1, res)
      },
    })
  },

  /**
   * 通过平台请求接口(class)
   * dataSet 查询调用的名称
   * queryMode map或list
   * param 请求参数
   * call_success 请求成功回调
   * call_fail 请求失败回调
   */
  httpsPlatformClass: function (dataSet, param, call_success, call_fail) {
    //key = 'zxj_repertory';//数据源名称
    //AJAX_MODE = 'AJAX_MODE_QUERY';//固定
    //DATASET = 'client_rec_addres_default';//查询调用的名称
    //QUERY_MODE = 'map';//’map或list’
    // var paramStr = "AJAX_MODE_OPERATE=" + dataSet + "&" + param
    var paramStr = "AJAX_MODE=AJAX_MODE_OPERATE&operate=" + dataSet + "&" + param;
    var url = this.globalData.url + '/ajax?' + paramStr;
    url = encodeURI(url);
    var zxjToken = this.getZxjToken();
    wx.request({
      url: url,
      method: 'post',
      dataType: 'json',
      header: {
        'content-type': 'application/json;charset=UTF-8',
        'token': zxjToken
      },
      success: res => {
        wx.hideLoading();
        if (res.statusCode == 200) {
          var resultData = res.data;
          if (resultData.code == 0 || resultData.code == '0') {
            //获取到数据成功
            var resultMsg = resultData.msg;
            //判断返回来的数据resultData是json对象还是json字符串
            if (typeof resultMsg == 'object' && resultMsg) {
              //如果是json对象,不用做处理
            } else {
              //如果是json字符串，则需要处理成json对象
              if (resultMsg == '' || resultMsg == null) {
              } else {
                // resultMsg = JSON.parse(resultMsg);
                // resultData.msg = resultMsg;
              }
            }
            typeof call_success == "function" && call_success(resultData)
          } else {
            //获取数据失败
            wx.showModal({
              title: '提示',
              content: resultData.msg + '(' + resultData.code + ')',
              showCancel: false,
            })
            typeof call_fail == "function" && call_fail(0, resultData)
          }
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败(' + res.statusCode + ')',
            showCancel: false,
          })
        }
      },
      fail: res => {
        wx.hideLoading();
        //请求接口失败
        wx.showModal({
          title: '提示',
          content: '请求失败(' + res.errMsg + ')',
          showCancel: false,
        })
        typeof call_fail == "function" && call_fail(1, res)
      },
    })
  },


  /**
   * get请求
   * actionUrl :请求接口入口
   * param 请求参数
   * call_success 请求成功回调
   * call_fail 请求失败回调
   */
  httpsDataGet: function (actionUrl, param, call_success, call_fail) {
    var url = this.globalData.url + '/jaxrs' + actionUrl + '?' + param;
    url = encodeURI(url);
    var zxjToken = this.getZxjToken();
    wx.request({
      url: url,
      method: 'get',
      dataType: 'json',
      header: {
        'content-type': 'text/plain;charset=utf-8',
        'token': zxjToken
      },
      success: res => {
        wx.hideLoading()
        if (res.statusCode == 200) {
          var resultData = res.data;
          //判断返回来的数据resultData是json对象还是json字符串
          if (typeof resultData == 'object' && resultData) {
            //如果是json对象,不用做处理
          } else {
            //如果是json字符串，则需要处理成json对象
            resultData = JSON.parse(resultData);
          }
          if (resultData.status) {
            typeof call_success == "function" && call_success(resultData)
          } else {
            // wx.showModal({
            //   title: '提示！',
            //   content: resultData.msg + '(' + resultData.code + ')',
            //   showCancel: false,
            // })

            if (this.globalData.isLogin && resultData.code == '0004' || resultData.code == '0003') {
              wx.showModal({
                title: '提示',
                content: '未注册,请注册绑定',
                showCancel: false,
              })
            }

            typeof call_fail == "function" && call_fail(0, resultData)
          }
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败(' + res.statusCode + ')',
            showCancel: false,
          })
        }

      },
      fail: res => {
        //请求接口失败
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '请求失败(' + res.errMsg + ')',
          showCancel: false,
        })
        
        
        typeof call_fail == "function" && call_fail(1, res)
      },
    })
  },

  httpsDataGetFS: function (actionUrl, param, call_success, call_fail) {
    var url = this.globalData.urlfs + '/zxj' + actionUrl + '?' + param;
    url = encodeURI(url);
    var zxjToken = this.getZxjToken();
    wx.request({
      url: url,
      method: 'get',
      dataType: 'json',
      header: {
        'content-type': 'text/plain;charset=utf-8',
        'token': zxjToken
      },
      success: res => {
        wx.hideLoading()
        if (res.statusCode == 200) {
          var resultData = res.data;
          //判断返回来的数据resultData是json对象还是json字符串
          if (typeof resultData == 'object' && resultData) {
            //如果是json对象,不用做处理
          } else {
            //如果是json字符串，则需要处理成json对象
            resultData = JSON.parse(resultData);
          }
          if (resultData.status) {
            typeof call_success == "function" && call_success(resultData)
          } else {
            // wx.showModal({
            //   title: '提示！',
            //   content: resultData.msg + '(' + resultData.code + ')',
            //   showCancel: false,
            // })

            if (this.globalData.isLogin && resultData.code == '0004' || resultData.code == '0003') {
              wx.showModal({
                title: '提示',
                content: '未注册,请注册绑定',
                showCancel: false,
              })
            }

            typeof call_fail == "function" && call_fail(0, resultData)
          }
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败(' + res.statusCode + ')',
            showCancel: false,
          })
        }

      },
      fail: res => {
        //请求接口失败
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '请求失败(' + res.errMsg + ')',
          showCancel: false,
        })
        typeof call_fail == "function" && call_fail(1, res)
      },
    })
  },

  /**
   * Post请求
   * actionUrl :请求接口入口
   * param 请求参数
   * call_success 请求成功回调
   * call_fail 请求失败回调
   */
  httpsDataPost: function (actionUrl, param, call_success, call_fail) {
    var url = this.globalData.url + '/jaxrs' + actionUrl;
    var zxjToken = this.getZxjToken();
    url = encodeURI(url);
    wx.request({
      url: url,
      data: JSON.stringify(param),
      method: 'post',
      dataType: 'json',
      header: {
        'content-type': 'application/json; charset=UTF-8',
        'token': zxjToken
      },
      success: res => {
        wx.hideLoading()
        if (res.statusCode == 200) {
          var resultData = res.data;
          if (typeof resultData == 'object' && resultData) {
            //如果是json对象,不用做处理
          } else {
            //如果是json字符串，则需要处理成json对象
            resultData = JSON.parse(resultData);
          }
          if (resultData.status) {
            typeof call_success == "function" && call_success(resultData)
          } else {
            wx.showModal({
              title: '提示',
              content: resultData.msg + '(' + resultData.code + ')',
              showCancel: false,
            })
            typeof call_fail == "function" && call_fail(0, resultData)
          }
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败(' + res.statusCode + ')',
            showCancel: false,
          })
        }

      },
      fail: res => {
        //请求接口失败
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '请求失败(' + res.errMsg + ')',
          showCancel: false,
        })
        typeof call_fail == "function" && call_fail(1, res)
      },
    })
  },

  /**
   * Post请求
   * actionUrl :请求接口入口
   * param 请求参数
   * call_success 请求成功回调
   * call_fail 请求失败回调
   */
  httpsDataPost1: function (actionUrl, param, call_success, call_fail) {
    var url = this.globalData.url + '/jaxrs' + actionUrl;
    var zxjToken = this.getZxjToken();
    url = encodeURI(url);
    
    wx.request({
      url: url + '?' + param,
      method: 'post',
      dataType: 'json',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': zxjToken
      },
      success: res => {
        wx.hideLoading()
        if (res.statusCode == 200) {
          var resultData = res.data;
          if (typeof resultData == 'object' && resultData) {
            //如果是json对象,不用做处理
          } else {
            //如果是json字符串，则需要处理成json对象
            resultData = JSON.parse(resultData);
          }
          if (resultData.status) {
            typeof call_success == "function" && call_success(resultData)
          } else {
            wx.showModal({
              title: '提示',
              content: resultData.msg + '(' + resultData.code + ')',
              showCancel: false,
            })
            typeof call_fail == "function" && call_fail(0, resultData)
          }
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败(' + res.statusCode + ')',
            showCancel: false,
          })
        }

      },
      fail: res => {
        //请求接口失败
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '请求失败(' + res.errMsg + ')',
          showCancel: false,
        })
        typeof call_fail == "function" && call_fail(1, res)
      },
    })
  },

  /**
  * Post请求
  * actionUrl :请求接口入口
  * param 请求参数
  * call_success 请求成功回调
  * call_fail 请求失败回调
  */
  httpsDataPost2: function (actionUrl, param, call_success, call_fail) {
    var url = this.globalData.chatUrl + '/zxj' + actionUrl;
    url = encodeURI(url);
    var zxjToken = this.getZxjToken();
    wx.request({
      url: url + '?' + param,
      method: 'post',
      dataType: 'json',
      header: {
        'token': zxjToken
      },
      success: res => {
        wx.hideLoading()
        if (res.statusCode == 200) {
          var resultData = res.data;
          if (typeof resultData == 'object' && resultData) {
            //如果是json对象,不用做处理
          } else {
            //如果是json字符串，则需要处理成json对象
            try {
              resultData = JSON.parse(resultData);
            } catch (e) {
              wx.showToast({
                title: '服务端出错(01)',
                icon: 'none',
                duration: 2000
              })
              typeof call_fail == "function" && call_fail(2, res)
              return;
            }

          }
          if (resultData.status) {
            typeof call_success == "function" && call_success(resultData)
          } else {
            wx.showModal({
              title: '提示',
              content: resultData.msg + '(' + resultData.code + ')',
              showCancel: false,
            })
            typeof call_fail == "function" && call_fail(0, resultData)
          }
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败(' + res.statusCode + ')',
            showCancel: false,
          })
        }

      },
      fail: res => {
        //请求接口失败
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '请求失败(' + res.errMsg + ')',
          showCancel: false,
        })
        typeof call_fail == "function" && call_fail(1, res)
      },
    })
  },

  /**上传文件 */
  uploadFileHttps: function (attUser, attFkId, attFkNameStr, attName, imgPath, calFun) {
    var url = this.globalData.url;
    var that = this
    var uploadImgParam = {
      attUser: attUser,
      attFkId: attFkId,
      attFkName: "[" + attFkNameStr + "]",
      attName: "[" + attName + "]",
      attNoWater: '1'
    };
    wx.uploadFile({
      url: url + '/upFile',
      filePath: imgPath,
      name: 'file',
      formData: uploadImgParam,
      success(res) {
        if (res.statusCode == 200) {
          var resultData = res.data;
          if (typeof resultData == 'object' && resultData) {
            //如果是json对象,不用做处理
          } else {
            //如果是json字符串，则需要处理成json对象
            try {
              resultData = JSON.parse(resultData);
            } catch (e) {
              wx.showToast({
                title: '服务端出错(01)',
                icon: 'none',
                duration: 2000
              })
              typeof calFun == "function" && calFun(false, null)
              return;
            }
          }
          if (resultData.status) {
            var imgListRes = resultData.pic;
            var imgListTemp = [];
            for (var index in imgListRes) {
              imgListTemp.push(imgListRes[index].pic)
            }
            typeof calFun == "function" && calFun(true, imgListTemp)
          } else {
            wx.showToast({
              title: resultData.msg + '(' + resultData.code + ')',
              icon: 'none',
              duration: 2000
            })
            typeof calFun == "function" && calFun(false, null)
          }
        } else {
          typeof calFun == "function" && calFun(false, null)
          wx.showToast({
            title: '请求失败(' + res.statusCode + ')',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },

  httpsDataPost3: function (actionUrl, param, call_success, call_fail) {
    var url = this.globalData.url + '/jaxrs' + actionUrl;
    var zxjToken = this.getZxjToken();
    url = encodeURI(url);
    wx.request({
      url: url,
      data: param,
      method: 'post',
      dataType: 'json',
      header: {
        'Content-type': 'application/json; charset=UTF-8',
        'token': zxjToken
      },
      success: res => {
        wx.hideLoading()
        if (res.statusCode == 200) {
          var resultData = res.data;
          if (typeof resultData == 'object' && resultData) {
            //如果是json对象,不用做处理
          } else {
            //如果是json字符串，则需要处理成json对象
            resultData = JSON.parse(resultData);
          }
          if (resultData.status) {
            typeof call_success == "function" && call_success(resultData)
          } else {
            // wx.showModal({//取消页面提示，在console.log 打印
            //   title: '提示',
            //   content: resultData.msg + '(' + resultData.code + ')',
            //   showCancel: false,
            // })
            typeof call_fail == "function" && call_fail(0, resultData)
          }
        } else {
          wx.showModal({
            title: '提示',
            content: '请求失败(' + res.statusCode + ')',
            showCancel: false,
          })
        }

      },
      fail: res => {
        //请求接口失败
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '请求失败(' + res.errMsg + ')',
          showCancel: false,
        })
        typeof call_fail == "function" && call_fail(1, res)
      },
    })
  },

  /**使用正则验证输入的是否是手机号 */
  checkPhone: function (str) {
    var phoneReg = /^[1][1-9][0-9]{9}$/; //以1为开头;第二位可为1-9,中的任意一位；最后以0-9的9个整数结尾
    if (!phoneReg.test(str)) {
      return false;
    } else {
      return true;
    }
  },

  /**
   * 检查是否用户登录状态
   */
  checkLoginState: function () {
    if (this.globalData.userInfo == null || this.globalData.userInfo == '' || this.globalData.userInfo == undefined) {
      wx.showModal({
        title: '尚未登录',
        content: '请先登录在操作',
        showCancel: false,
        success: res => { }
      })
      return false;
    } else {
      return true;
    }
  },


  accAdd: function (arg1, arg2) {
    var r1, r2, m;
    try {
      r1 = arg1.toString().split(".")[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = arg2.toString().split(".")[1].length
    } catch (e) {
      r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2))
    return (arg1 * m + arg2 * m) / m
  },

  /**
   * 封装打包好聊天数据，然后写入到本地缓存文件
   * @param {Object} wrOrderId 工单id
   * @param {Object} wrOtherPayId 聊天的时候对方的id
   * @param {Object} wrOtherPayName 聊天的时候对方的Name
   * @param {Object} wrOtherPayAva 聊天的时候对方的头像
   * @param {Object} unreadCount 未读数量
   * @param {Object} wrChatDataList 存放的聊天内容数组
   */
  writeRecordChatByPackag: function (wrOrderId, wrOtherPayId, wrOtherPayName, wrOtherPayAva, unreadCount, wrChatDataList) {
    var wrOtherPayObj = {};
    wrOtherPayObj.otherPayId = wrOtherPayId; //对方id
    wrOtherPayObj.otherPayName = wrOtherPayName; //对方的名字
    wrOtherPayObj.otherPayAva = wrOtherPayAva; //对方的头像
    wrOtherPayObj.orderId = wrOrderId; //工单id
    wrOtherPayObj.unreadCount = unreadCount == undefined ? 0 : unreadCount; //未读数据
    this.writeRecordChatToCache(wrOtherPayId, wrOtherPayObj, wrChatDataList);
  },
  /**
   *通过文件名把聊天记录写入到本地缓存文件中 
   * @param {Object} filekey key，一般用对方聊天的id做文件名
   * @param {Object} otherPayObj 对方账号信息
   * @param {Object} jsonArray 存放的聊天内容数组
   */
  writeRecordChatToCache: function (filekey, otherPayObj, jsonArray) {
    if (jsonArray == undefined || jsonArray == null || jsonArray == '') return;
    if (fsysm == undefined) {
      fsysm = wx.getFileSystemManager();
    }
    var tempArray = [];
    if (jsonArray.length > 20) {
      //最多存放最新二十条数据
      tempArray = jsonArray.slice(-20)
    } else {
      tempArray = jsonArray;
    }
    var paramObj = {};
    paramObj.otherPayInfo = otherPayObj;
    paramObj.chatList = tempArray;
    var userId = this.globalData.userId;
    try {
      wx.setStorageSync(userId + '_chat_' + filekey, JSON.stringify(paramObj))
    } catch (e) { }
  },

  /**获取对话信息列表 */
  readChatMsgList: function () {
    var userId = this.globalData.userId;
    var chatList = [];
    try {
      const res = wx.getStorageInfoSync();
      var keyList = res.keys;
      for (var index in keyList) {
        var keyStr = keyList[index];
        if (keyStr.indexOf(userId + "_chat_") >= 0) {
          var chatObj = wx.getStorageSync(keyStr);
          var objJson = {};
          if (chatObj == undefined || chatObj == null || chatObj == '') {

          } else {
            var chatJson = objJson = JSON.parse(chatObj);
            objJson.otherPayInfo = chatJson.otherPayInfo;
            if (chatJson.chatList != undefined && chatJson.chatList.length > 0) {
              objJson.lastChat = chatJson.chatList[chatJson.chatList.length - 1]; //拿最后一条信息
            } else {
              objJson.lastChat = []; //拿最后一条信息
            }
            chatList.push(objJson);
          }
        }
      }
      return chatList;
    } catch (e) {
      return [];
    }
  },

  /**通过key获取缓存在本地的聊天数据*/
  readRecordChatCacheBykey: function (keyStr) {
    var objJson = null;
    try {
      var chatObj = wx.getStorageSync(keyStr);
      if (chatObj == undefined || chatObj == null || chatObj == '') {
        objJson = null;
      } else {
        objJson = JSON.parse(chatObj);
      }
      return objJson;
    } catch (e) {
      return objJson;
    }
  },

  /**过滤赛选只要聊天内容列表的缓存数据*/
  getChatListfilter: function (recordJson) {
    var recordData = [];
    if (recordJson == undefined || recordJson == null || recordJson == '' || recordJson.chatList == undefined || recordJson.chatList == null || recordJson.chatList == '') {
      recordData = [];
    } else {
      if (this.isArrayFn(recordJson.chatList)) {
        recordData = recordJson.chatList;
      } else {
        recordData = [];
      }
    }
    return recordData;
  },

  /**过滤赛选只要聊天内容对方的信息缓存数据 */
  getChatOtherPayInfo: function (recordJson) {
    var otherPayInfoTemp;
    if (recordJson == undefined || recordJson == null || recordJson == '' || recordJson.chatList == undefined || recordJson.chatList == null || recordJson.chatList == '') {
      otherPayInfoTemp = null;
    } else {
      if (this.isObjectFn(recordJson.otherPayInfo)) {
        otherPayInfoTemp = recordJson.otherPayInfo;
      } else {
        otherPayInfoTemp = null;
      }
    }
    return otherPayInfoTemp;
  },

  /**检查是否是数组对象 */
  isArrayFn: function (value) {
    if (typeof Array.isArray === "function") {
      return Array.isArray(value);
    } else {
      return Object.prototype.toString.call(value) === "[object Array]";
    }
  },

  /**检查是否是object对象 */
  isObjectFn: function (value) {
    if (typeof value == "object") {
      return true;
    } else {
      return false;
    }
  },


  getOnchatMsgCal: function (onchatMsg) {
    onchatMsgCal = onchatMsg;
  },

  /**
   * 获取websocket连接监听事件回调
   * onSocketOpen WebSocket连接已打开
   * onSocketError 监听WebSocket错误
   * onSocketMessage 接收信息
   * onSocketClose 监听WebSocket关闭
   */
  getWebSocketConnectState: function (onSocketOpen, onSocketError, onSocketMessage, onSocketClose) {
    onSocketOpenCal = onSocketOpen;
    onSocketErrorCal = onSocketError;
    onSocketMessageCal = onSocketMessage;
    onSocketCloseCal = onSocketClose;
  },

  /**清除websocket连接监听事件回调 */
  clearWebSocketConnectState: function () {
    onSocketOpenCal = undefined;
    onSocketErrorCal = undefined;
    onSocketMessageCal = undefined;
    onSocketCloseCal = undefined;
  },

  /**更新item未读标识，改为已读 */
  upChatUnreadCount: function (fromuserId) {
    var userId = this.globalData.userId;
    var keyStr = userId + "_chat_" + fromuserId;
    var receiveJson = this.readRecordChatCacheBykey(keyStr); //获取与该用户在本地的聊天记录
    var otherPayInfo = this.getChatOtherPayInfo(receiveJson); //获取到聊天对方的用户信息
    var recordData = this.getChatListfilter(receiveJson);
    if (otherPayInfo != null) {
      otherPayInfo.unreadCount = 0;
      this.writeRecordChatToCache(fromuserId, otherPayInfo, recordData);
      //this.upChatMsgTabBage();
    }
  },

  /**设置消息右上角提示数量 */
  upChatMsgTabBage: function () {
    var chatMsgList = this.readChatMsgList();
    var unreadCountTotal = 0;
    for (var index in chatMsgList) {
      var unreadCount = chatMsgList[index].otherPayInfo.unreadCount == undefined ? 0 : chatMsgList[index].otherPayInfo.unreadCount;
      unreadCountTotal = this.accAdd(Number(unreadCountTotal), Number(unreadCount));
    }

    if (unreadCountTotal == undefined || unreadCountTotal == null || unreadCountTotal == '' || unreadCountTotal == 0) {
      wx.removeTabBarBadge({
        index: 4
      });
    } else {
      if (Number(unreadCountTotal) > 99) {
        unreadCountTotal = '99..'
      }
      wx.setTabBarBadge({
        index: 4,
        text: unreadCountTotal + ''
      });
      typeof onchatMsgCal == "function" && onchatMsgCal()

    }
  },

  wxConnectSocket: function () {
    var url = this.globalData.websocketUrl + '/' + this.globalData.userId;
    wx.connectSocket({
      url: url,
      header: {
        'content-type': 'application/json'
      },
      method: "GET"
    })
  },

  /**
   * 聊天信息接收打包
   */
  chatMsgPack: function (messageObj) {
    var that = this;
    var userId = that.globalData.userId;
    var sendType = messageObj.type;//1文字，2图片
    var avatar = that.globalData.userAvatar; //用户头像

    var textMessage = messageObj.textMessage; //接收到的消息
    var fromuserId = messageObj.userId; //发送人id
    var fromusername = messageObj.fromusername; //发送人名称
    var fromuserAva = '';
    var touserId = messageObj.touserId; //接收人id
    var toUserName = messageObj.toUserName; //接收人名称
    var time = messageObj.time; //发送时间

    var fromuserAva = '';
    if (messageObj.data != undefined) {
      var otherInfo = JSON.parse(messageObj.data);
      fromuserAva = otherInfo.avatar;
    }
    var sendObj = {};
    if (fromuserId == userId) {
      sendObj.personType = 'myPary';
      sendObj.personAva = avatar;
      sendObj.personName = fromusername;
    } else {
      sendObj.personType = 'otherPary';
      sendObj.personAva = fromuserAva;
      sendObj.personName = fromusername;
    }
    if ((sendType == 2 || sendType == '2') && textMessage != undefined && textMessage.length > 0) {
      textMessage = JSON.parse(textMessage);
      sendObj.textContent = '';
      sendObj.imgListContent = textMessage;
    } else {
      sendObj.textContent = textMessage;
      sendObj.imgListContent = [];
    }
    sendObj.sendTime = time;

    var receiveJson = that.readRecordChatCacheBykey(userId + "_chat_" + fromuserId); //获取与该用户在本地的聊天记录
    var otherPayInfo = that.getChatOtherPayInfo(receiveJson); //获取到聊天对方的用户信息
    var orderIdTemp = ''; //缓存中的订单id
    var unreadCountTemp = 1; //未读数量
    if (otherPayInfo == null) {
      unreadCountTemp = 1;
    } else {
      orderIdTemp = otherPayInfo.orderId == undefined ? '' : otherPayInfo.orderId;
      var unreadCount = otherPayInfo.unreadCount; //获取缓存中的未读数量
      if (unreadCount == undefined || unreadCount == null || unreadCount == '') {
        unreadCountTemp = 1;
      } else {
        unreadCountTemp = Number(unreadCount) + 1;
      }
    }
    var readReList = that.getChatListfilter(receiveJson); //获取到聊天缓存列表
    readReList.push(sendObj); //加入到聊天缓存列表
    //重新把聊天记录写入缓存
    that.writeRecordChatByPackag(orderIdTemp, fromuserId, fromusername, fromuserAva, unreadCountTemp, readReList);

    that.upChatMsgTabBage();
  },

  wxConnectSocket: function () {
    var url = this.globalData.websocketUrl + '/' + this.globalData.userId;
    wx.connectSocket({
      url: url,
      header: {
        'content-type': 'application/json'
      },
      method: "GET"
    })
  },

  /**开始连接websocket */
  startConnectSocket: function () {
    //如果连接已创建成功，则不需要重复创建连接
    if (socketState == 1) return;
    var that = this;
    that.wxConnectSocket();

    //监听WebSocket连接打开事件。
    wx.onSocketOpen(function (res) {
      //WebSocket连接已打开
      console.log('WebSocket连接已打开')
      socketState = 1;
      typeof onSocketOpenCal == "function" && onSocketOpenCal(res)
    })
    //监听WebSocket错误。
    wx.onSocketError(function (res) {
      console.log('监听WebSocket错误')
      socketState = 0;
      that.wxConnectSocket();
      typeof onSocketErrorCal == "function" && onSocketErrorCal(res)
    })
    //监听WebSocket接受到服务器的消息事件。
    wx.onSocketMessage(function (res) {
      socketState = 1;
      var message = res.data;
      var messageObj = JSON.parse(message);
      var messageType = messageObj.messageType; //1代表上线 2代表下线 3代表在线名单(获取离线未接收信息unreceivedMessage) 4代表普通消息5定位
      if (messageType == 3) {
        if (messageObj.unreceivedMessage != undefined && messageObj.unreceivedMessage.length > 0) {
          //有为接收的消息
          var unreceivedMessage = messageObj.unreceivedMessage;
          for (var index in unreceivedMessage) {
            that.chatMsgPack(unreceivedMessage[index]);
          }
        }
      }
      else if (messageType == 4) {
        //聊天
        that.chatMsgPack(messageObj);
      }
      typeof onSocketMessageCal == "function" && onSocketMessageCal(res)
    })
    //监听WebSocket关闭
    wx.onSocketClose(function (res) {
      //WebSocket 已关闭
      console.log('监听WebSocket关闭')
      socketState = 0;
      that.wxConnectSocket();
      typeof onSocketCloseCal == "function" && onSocketCloseCal(res)
    })
  },

  /**聊天发送数据*/
  onSendSocketChat: function(param,sendCalRes) {
    wx.sendSocketMessage({
      data: JSON.stringify(param),
      success: res => {
        typeof sendCalRes == "function" && sendCalRes(true)
      },
      fail: err => {
        typeof sendCalRes == "function" && sendCalRes(false)
        wx.showToast({
          title: '发送失败(' + JSON.stringify(err)+')',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },


  globalData: {
    isLogin: false,
    app_id: 'wxc6c07271d6c38f13', //小程序appid  
    app_secret: '1ddad1a90be3a874d2fc5e6ca3c6495c', //小程序app_secret
    js_code: '',
    shopApp_id:'wx4ae069d1473a78ce',//小程序商城appid
    
    //url: 'https://www.zxj888.cn:8443', //正式环境主系统ip 
    //fileUrl: 'https://www.zxj888.cn:8443/upFile',//正式环境图片上传地址 
    //urlfs: 'https://www.zxj888.cn:9443', //正式环境主系统ip
    //websocketUrl: 'wss://www.zxj888.cn:9443/zxj/websocket',//正式环境websocket
    //chatUrl: 'https://www.zxj888.cn:9443',//正式环境聊天

    url: 'https://www.zxjtest.xyz', //开发环境主系统ip 
    fileUrl: 'https://www.zxjtest.xyz/upFile',//开发环境图片上传地址
    urlfs: 'https://www.zxjtest.xyz:9443', //开发环境主系统ip 
    websocketUrl: 'wss://www.zxjtest.xyz:9443/zxj/websocket', //开发环境websocket
    chatUrl: 'https://www.zxjtest.xyz:9443',//开发环境聊天

    baiduUrl: 'https://api.map.baidu.com', //百度ip
    realTimeCustomer: '60E246CB7star_red.pngdddddddddB645273DCF2DC4E18B4AEF9',//customer(快递100实时查询接口)
    realTimeKey: 'ImODrCSn9734',//key(快递100实时查询接口)
    curCityId: '', //当前城市id
    curCity: '', //当前城市名称
    userInfo: null, //微信用户信息
    openId: '', //用户唯一标识
    unionid: '',//微信开放平台管理的应用唯一标识
    userId: '', //用户id
    sessionKey: '',
    starLevel: 0,
    level: 0,
    phone: '', //手机号
    userName: '', //用户名称
    userAvatar: '', //用户头像
    accountBalance: 0,//账户余额
    gzhurl: 'https://www.zxj888.cn:8443', //所有涉及公众号的都调到正式环境
  },
  /**退出登录，清空小程序用户信息数据*/
  clearUserInfo: function () {
    this.globalData.userInfo = null;
    this.globalData.openId = '';
    this.globalData.sessionKey = '';
  },

  //装小匠客服
  customerService: {
    id: 'zxj_service',
    name: '装小匠客服',
    avatar: '/images/orderTypeIcon/kefu.png'
  },
})