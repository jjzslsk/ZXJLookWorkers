// pages/myOrders/myOrders.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    statusText: [{
      val: 'a',
      name: '全部订单'
    }, {
      val: '0',
      name: '我的发布'
    }, {
      val: '1',
      name: '报价订单'
    }, {
      val: '2',
      name: '开工确认'
    }, {
      val: '3',
      name: '施工中'
    }, {
      val: '4',
      name: '竣工确认'
    }, {
      val: '5',
      name: '竣工完成'
    }],
    indexPage: 0,
    pageNum: 10,
    pickedStatus: 'a',
    statusCount: {},
    refreshing: true,
    nomore: false,//true已加载完全部，flase正在加载更多数据
  },

  getLocalTime: function(nS) {
    if (nS == undefined || nS == null || nS == '') {
      return '';
    } else {
      Date.prototype.toLocaleString = function() {
        return this.getFullYear() + "/" + (this.getMonth() + 1) + "/" + this.getDate();

      };
      var unixTimestamp = new Date(nS);
      return unixTimestamp.toLocaleString();
    }
  },

  openOrderDetial: function(e) {
    var id = e.currentTarget.dataset.id;
    var status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?id=' + id + '&status=' + status + '&type=manage'
    })
  },

  statusTap: function(e) {
    var status = e.currentTarget.dataset.status;
    this.setData({
      list:[],
      nomore:false,
      indexPage: 0,
      pickedStatus: status
    });
    this.initData()
  },

  refreshData: function() {
    wx.showLoading({
      title: '请求中',
    })
    var status = this.data.pickedStatus;
    if (status == 'a'){
      status = ''
    }
    var that = this
    var param = 'userId=' + app.globalData.userId + '&status=' + status + '&pageIndex=' + this.data.indexPage + '&pageSize=' + this.data.pageNum;
    console.log(param);
    app.httpsDataGet('/worker/getMyPublishDemand', param,
      function(res) {
        console.log('getMyPublishDemand:' + JSON.stringify(res));
        //console.log(that.data.indexPage);
        for (var i = 0; i < res.data.length; i++) {
          res.data[i].plan_start_date = that.getLocalTime(res.data[i].plan_start_date)
          res.data[i].creat_time = that.getLocalTime(res.data[i].creat_time)
          if (res.data[i].classify) {
            var classify = JSON.parse(res.data[i].classify)
            res.data[i].classify = classify
          }
        }
        var indexPage = that.data.indexPage+1
        var nomore = false
        
        if (res.data.length < that.data.pageNum)
          nomore = true

        var list = that.data.list
        list = list.concat(res.data);

        that.setData({
          list: list,
          nomore: nomore,
          indexPage: indexPage
        });
        wx.hideLoading()
      },
      function(returnFrom, res) {
        //失败
        wx.hideLoading()
      }
    )

    var param2 = 'userId=' + app.globalData.userId;
    app.httpsDataGet('/worker/userOrderCount', param2,
      function(res) {
        //console.log('userOrderCount:' + JSON.stringify(res));
        var total = 0
        for (var x in res.data) {
          total += res.data[x]
        }

        that.setData({
          statusCount: res.data,
          totalCount: total
        });

      },
      function(returnFrom, res) {
        //失败
        wx.hideLoading()
      }
    )
  },

  myOnLoadmore: function () {
    this.refreshData()
  },

  myOnScroll: function (e) {
    // console.log(e);
  },

  initData: function() {
    var that = this;
    if (app.globalData.userInfo == undefined || app.globalData.userInfo == null || app.globalData.userInfo == '') {
      wx.showModal({
        title: '提示',
        content: '未登录,请登录或注册',
        showCancel: false,
      })
      app.wxLogin().then(function(res) {
        that.refreshData();
      })
    } else {
      that.refreshData();
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var status = options.status
    this.setData({
      pickedStatus: status
    });
    // this.initData()   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      indexPage: 0,
      list: [],
      nomore: false
    });
    this.initData()
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