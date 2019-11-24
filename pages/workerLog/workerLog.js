// pages/workerLog/workerLog.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    name:'',
    bbsList:[]
  },

  openWorkerLogDetail: function (e) {
    var lid = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/workerLogDetail/workerLogDetail?id=' + this.data.id + '&name=' + this.data.name + '&lid=' + lid
    })
  },

  initList: function (options) {
    var that = this
    var p = 'CLIENT_ID=' + this.data.id + '&START_POSITION=0' + '&END_POSITION=30' + '&MY_CLIENT_ID=' + app.globalData.userId
    app.httpsGetDatByPlatform('bbs_my_page', 'list', p,
      function (res) {
        //console.log('bbs_my_page1:' + JSON.stringify(res));
        for (var i = 0; i < res.msg.length; i++) {
          var imgs = ''
          if (res.msg[i].IMG_LIST) {
            imgs = JSON.parse(res.msg[i].IMG_LIST)
            for (var j = 0; j < imgs.length; j++) {
              var url = imgs[j].URL.split('mp4')
              console.log(res.msg[i].SUBJECT_TITLE + 'url.length:' + url.length)
              if (url.length > 1) {
                res.msg[i].videoPath = imgs[j].URL
              }
            }
          }
          res.msg[i].IMG_LIST = imgs
        }
        console.log('bbs_my_page2:' + JSON.stringify(res));
        that.setData({
          bbsList: res.msg
        });

      },
      function (returnFrom, res) {
        console.log('bbs_my_pageerr:' + JSON.stringify(res));
        //失败
        wx.hideLoading();
      }
    );
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    var name = options.name
    this.setData({
      id: id,
      name: name
    })

    this.initList()
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
    this.initList()
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