//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    bannerList:[],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    classList:[],
    noteList:[],
    longitude: '',
    latitude: '',
    locationName:'定位中...',
    locationStatus:false,
    orgId:'261',
    activityList:[]
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  getLocalTime: function (nS) {
    if (nS == undefined || nS == null || nS == '') {
      return '';
    } else {
      Date.prototype.toLocaleString = function () {
        return this.getFullYear() + "/" + (this.getMonth() + 1) + "/" + this.getDate();

      };
      var unixTimestamp = new Date(nS);
      return unixTimestamp.toLocaleString();
    }
  },
  
  //附近订单禁止滑动
  // catchTouchMove: function (e) {
  //  return !1;
  //},

  onLocationTap: function (e) {
    var that=this
    if (this.data.locationStatus){
      this.chooseLocationTap()
    }else{
      wx.openSetting({
        success(res) {
          that.onLoad()
          // res.authSetting = {
          //   "scope.userInfo": true,
          //   "scope.userLocation": true
          // }
        }
      })
    }
  },

  /**选择定位 */
  chooseLocationTap: function () { 
    wx.navigateTo({
      url: '/pages/chooseLocation/chooseLocation?locationCode=' + this.data.orgId + '&locationName=' + this.data.locationName
    })
  },

  onBannerOrderTap: function (e) {
    if (app.globalData.userInfo == undefined || app.globalData.userInfo == null || app.globalData.userInfo == '') {
      wx.showModal({
        title: '提示',
        content: '您未登录，请先登录再操作。是否前往登录？',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/bindPhone/bindPhone'
            })
          }
        }
      })
      return
    }
    
    var id = e.currentTarget.dataset.id;
    var status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?id=' + id + '&status=' + status + '&type=show'
    })
  },
  //使用百度滴入api，通过坐标获取当前城市名称
  loadCity: function (longitude, latitude) {
    var that = this
    wx.request({
      url: app.globalData.baiduUrl + '/geocoder/v2/?ak=MTz5ezwHwFTe7r01m66QuGIUOr4ZnSK2&location=' + latitude + ',' + longitude + '&output=json',
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        //console.log('getLocation:' + JSON.stringify(res));
        var cityCode = res.data.result.cityCode;
        var city = res.data.result.addressComponent.city;
        var district = res.data.result.addressComponent.city; 
        var street = res.data.result.addressComponent.street; 
        var locationName = street
        if (!street)
          locationName = district

        that.setData({
          orgId: res.data.result.cityCode,
          locationName: locationName,
          locationStatus:true
        });

        try {
          wx.setStorageSync('curCityId', cityCode)
        } catch (e) { }


        that.getActivityList()
      },
      fail: function () {
        that.setData({
          locationName: '定位失败',
          locationStatus:false
        });
        that.getActivityList()
      },
    })
  },

  getActivityList: function () {
    var that = this
    var p = 'START_POSITION=0' + '&END_POSITION=30' + '&BAIDU_MAP_NO=' + this.data.orgId
    app.httpsGetDatByPlatform('work_activity_list', 'list', p,
      function (res) {
       // console.log('work_activity_list:' + JSON.stringify(res));
        var lastBanner
        var lastActivity
        var bannerList = []
        var activityList = []
        for (var i = 0; i < res.msg.length; i++) {
          var type = res.msg[i].POSITION_NO.substr(0, 2)
          var no = res.msg[i].POSITION_NO.substr(2, 1) * 1
          if (type == '轮播') {
            if (!lastBanner) {
              lastBanner = no
              bannerList.push(res.msg[i])
            } else {
              if (lastBanner < no) {
                bannerList.push(res.msg[i])
              } else {
                bannerList.unshift(res.msg[i])
              }
            }
          } else if (type == '推广') {
            if (!lastActivity) {
              lastActivity = no
              activityList.push(res.msg[i])
            } else {
              if (lastActivity < no) {
                activityList.push(res.msg[i])
              } else {
                activityList.unshift(res.msg[i])
              }
            }
          }
        }

        that.setData({
          bannerList: bannerList,
          activityList: activityList
        });


      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading();
      }
    );
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    var param = '';
    //获取工种信息
    app.httpsDataGet('/worker/getWorkerTypeAll', param,
      function (res) {
        //console.log('getWorkerTypeAll:' + JSON.stringify(res));
        //成功
        that.setData({
          classList: res.data
        });

      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading()
      }
    )

    //获取最新的需求
    app.httpsDataGet('/worker/getBannerOrder', '',
      function (res) {
        //console.log('getBannerOrder:' + JSON.stringify(res));

        for (var i = 0; i < res.data.length; i++) {
          res.data[i].plan_start_date = that.getLocalTime(res.data[i].plan_start_date)
          res.data[i].creat_time = that.getLocalTime(res.data[i].creat_time)
        }

        that.setData({
          noteList: res.data
        });

      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading()
      }
    )

    wx.getLocation({
      type: 'wgs84', //默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标 
      success: function (res) {
        var longitude = res.longitude
        var latitude = res.latitude
        that.setData({
          longitude: longitude,
          latitude: latitude
        });
        that.loadCity(longitude, latitude)
      },
      fail: function () {
        that.setData({
          locationName: '定位失败',
          locationStatus: false
        });
        that.getActivityList()
      }
    })
  },

  onShow: function () {
    
  },

  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  openMap: function (e) {
    wx.navigateTo({
      url: '/pages/findWorker/findWorker'
    })
  }, 

  openSearch: function (e) {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  }, 
  

  openClassDetail: function (e) {

    if (app.globalData.userInfo == undefined || app.globalData.userInfo == null || app.globalData.userInfo == '') {
      wx.showModal({
        title: '提示',
        content: '您未登录，请先登录再操作。是否前往登录？',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/bindPhone/bindPhone'
            })
          }
        }
      })
      return
    }

    var pid = e.currentTarget.dataset.pid
    var pname = e.currentTarget.dataset.pname
    var id = e.currentTarget.dataset.id
    var name = e.currentTarget.dataset.name
    // wx.navigateTo({
    //   url: '/pages/postStep/postStep?pid=' + pid + '&pname=' + pname + '&type=postByClass' + '&id=' + id + '&name=' + name + '&type=postByClass'
    // })
    wx.navigateTo({
      url: '/pages/postNote/postNote?pid=' + pid + '&pname=' + pname + '&type=postByClass' + '&id=' + id + '&name=' + name + '&type=postByClass'
    })
  },

  openActivity: function (e) {
    wx.navigateTo({
      url: '/pages/activity/activity?id=' + e.currentTarget.dataset.id
    })
  },

  moreActivity: function (e) {
    wx.navigateTo({
      url: '/pages/activityList/activityList'
    })
  },

  onShareAppMessage: function () {

  }
})
