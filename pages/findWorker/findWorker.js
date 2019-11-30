// pages/findWorker/findWorker.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showType: 'map',
    longitude: '108.340756',
    latitude: '22.856392',
    markers: [],
    scale: 12,
    list: [],
    showFilter: false,

    firstClassList: [], //一级分类(左边分类)
    secondClassList: [], //二级分类
    pickedClass: 'ALL',
    pickedClassName: '全部',
    pageIndex:0,
    pageSize:20,
    curSort:'distance',
    scoreOrderBy:'',
    listOrderBy:'1',
    workerList:[]
  },

  markertap: function(e) {

  },

  callouttap: function(e) {
    var id = e.markerId
    wx.navigateTo({
      url: '/pages/workerDetail/workerDetail?id=' + id + '&classId=' + this.data.pickedClass + '&className=' + this.data.pickedClassName
    })
  },

  postRequire: function(e) {
    wx.navigateTo({
      url: '/pages/postRequire/postRequire?type=post'
    })
  },

  openWorkerDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/workerDetail/workerDetail?id=' + id + '&classId=' + this.data.pickedClass + '&className=' + this.data.pickedClassName
    })
  },

  openWorkerList: function(e) {
    var that = this;
    var type;
    if (that.data.showType == 'map')
      type = 'list'
    else
      type = 'map'
    that.setData({
      showType: type
    });
  },

  myLocation: function(e) {
    this.mapCtx.moveToLocation()
    this.setData({
      scale: 14
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    wx.showLoading({
      title: '加载中',
    })  

    app.httpsDataGet('/worker/getWorkerTypeAll', '',
      function(res) {
        //成功
        that.setData({
          firstClassList: res.data,
          secondClassList: res.data[0].child
          // pickedClass: res.data[0].child[0].CLIENT_CLASS_ID, //去除默认选中
          // pickedClassName: res.data[0].child[0].CLASS_NAME
        });

        wx.getLocation({
          type: 'wgs84', //默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标 
          success: function (res) {
            var longitude = res.longitude
            var latitude = res.latitude
            that.setData({
              longitude: longitude,
              latitude: latitude
            })
            that.getWorkerByType()
          },
          fail: function () {
            wx.showModal({
              title: '提示',
              content: '定位失败，请查看定位设置',
              success(res) {
                if (res.confirm) {
                  wx.openSetting({
                    success(res) {
                      that.onLoad()
                    }
                  })
                }
              }
            })
          }
        })

        
      },
      function(returnFrom, res) {
        //失败
        wx.hideLoading()
        that.setData({
          footerHintLeft: '加载失败,请检查网络!',
          footerHintRight: '加载失败,请检查网络!'
        });
      }
    )
  },

  getWorkerByType: function (){
    wx.showLoading({
      title: '加载中',
    })

    var that = this

    var curSort=this.data.curSort
    var scoreOrderBy=''
    if (curSort =='score')
      scoreOrderBy = '1'

    //获取地图在线工人
    var curSort=this.data.curSort
    var orderBy='1'
    if (curSort =='score')
      orderBy = '2'

    var param2 = 'typeId=' + this.data.pickedClass + '&orderBy=' + orderBy + '&longitude=' + this.data.longitude + '&latitude=' + this.data.latitude
    app.httpsDataGetFS('/workers', param2,
      function (res) {
        if (curSort == 'distance'){
          var markers = []
          var marker = {}         
          for (var i = 0; i < res.data.length; i++) {
            //有经纬度则插入marker
            if (res.data[i].latitude){
              var hpl = ''
              if (res.data[i].workerGoodReputation && res.data[i].workerGoodReputation > 0)
                hpl = '，好评率' + (res.data[i].workerGoodReputation * 100) + '%'

              var content = res.data[i].nickname.substr(0, 1) + '师傅' + '，' + res.data[i].sexName + hpl
              marker = {
                iconPath: '/images/worker/worker.png',
                id: res.data[i].userId,
                latitude: res.data[i].latitude,
                longitude: res.data[i].longitude,
                width: 50,
                height: 50,
                callout: {
                  content: content,
                  color: '#259B24',
                  borderWidth: 2,
                  borderRadius: 5,
                  borderColor: '#e51c23',
                  padding: 10,
                  display: 'BYCLICK'
                }
              }

              markers.push(marker)
            }

            res.data[i].shortName = res.data[i].nickname.substr(0, 1) + '师傅'

            if (res.data[i].distance) {
              var d = (res.data[i].distance * 0.001).toFixed(2)
              res.data[i].distance = d;
            }
          }
          if (res.data.length==0)
            markers=[]

          that.setData({
            markers: markers,
            workerList: res.data
          })
        }else{
          for (var i = 0; i < res.data.length;i++){
            res.data[i].shortName = res.data[i].nickname.substr(0,1)+'师傅'

            if (res.data[i].distance){
              var d = (res.data[i].distance*0.001).toFixed(2)
              res.data[i].distance=d;
            }
          }
          that.setData({
            workerList: res.data
          })
        }
        wx.hideLoading()
      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading()
      }
    )
  },

  moreType: function() {
    wx.navigateTo({
      url: '/pages/workerType/workerType'
    })
  },

  onSortTab: function (e) {
    var type = e.currentTarget.dataset.type;
    this.setData({
      curSort:type
    })
    this.getWorkerByType()
  },

  classItemTab: function(e) {
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    this.setData({
      pickedClass: id,
      pickedClassName:name
    });
    this.getWorkerByType()
  },

  refreshData: function() {
    var that = this
    app.getWebSocketConnectState(
      function(onSocketOpenRes){
        
      },
      function(onSocketErrorRes){
        //监听WebSocket错误
      },
      function(onSocketMessageRes) {
        //接收信息
        var data = JSON.parse(onSocketMessageRes.data)
        var markers = that.data.markers
        var marker = {}
        if (data.messageType == '5') {
          var content = ''
          if (data.data) {
            var userData = JSON.parse(data.data)
            content += userData.nickname.substr(0, 1) + '师傅' + '，' + userData.sexName
          }

          marker = {
            iconPath: '/images/worker/worker.png',
            id: data.userId,
            latitude: data.latitude,
            longitude: data.longitude,
            width: 50,
            height: 50,
            callout: {
              content: content,
              color: '#259B24',
              borderWidth: 2,
              borderRadius: 5,
              borderColor: '#e51c23',
              padding: 10,
              display: 'BYCLICK'
            }
          }

          var hasInfo = false
          for (var i = 0; i < markers.length; i++) {
            if (markers[i].id == data.userId) {
              markers[i] = marker
              hasInfo = true
            }
          }

          if (!hasInfo)
            markers.push(marker)

          that.setData({
            markers: markers
          })

        } else if (data.messageType == '6') {
          var index = -1
          for (var i = 0; i < markers.length; i++) {
            if (markers[i].id == data.userId) {
              index = i
            }
          }
          if (index >= 0) {
            markers.splice(index, 1)
          }
          that.setData({
            markers: markers
          })
        }
      },
      function (onSocketCloseRes) {
        //监听WebSocket关闭
      }
    );
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.mapCtx = wx.createMapContext('map')

    var that = this;
    if (app.globalData.userInfo == undefined || app.globalData.userInfo == null || app.globalData.userInfo == '') {
      app.wxLogin().then(function(res) {
        that.refreshData();
      })
    } else {
      that.refreshData();
    }

    this.myLocation()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var pickedClassList = wx.getStorageSync('pickedClassList')

    if (pickedClassList) {
      if (pickedClassList.length > 0) {
        this.setData({
          secondClassList: pickedClassList,
          pickedClass: pickedClassList[0].CLIENT_CLASS_ID,
          pickedClassName: pickedClassList[0].CLASS_NAME
        });
        this.getWorkerByType()
      }
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getWorkerByType()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})