// pages/activityList/activityList.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
  },

  openDetail: function (e) {
    wx.navigateTo({
      url: '/pages/activity/activity?id=' + e.currentTarget.dataset.id
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {   
    var that = this
    var curCityId
    try {
      curCityId = wx.getStorageSync('curCityId')     
    } catch (e) {
      // Do something when catch error
    }

    if (!curCityId) {
      curCityId = '261'
    }

    var p = 'START_POSITION=0' + '&END_POSITION=30' + '&BAIDU_MAP_NO=' + curCityId
    app.httpsGetDatByPlatform('work_activity_list', 'list', p,
      function (res) {
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
              if (lastBanner < no) {
                activityList.push(res.msg[i])
              } else {
                activityList.unshift(res.msg[i])
              }
            }
          }
        }
        console.log('bannerList:' + JSON.stringify(bannerList));


        that.setData({
          list: bannerList.concat(activityList)
        });


      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading();
      }
    );
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})