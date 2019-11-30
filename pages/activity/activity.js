// pages/activity/activity.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail:'',
    detailImg:''
  },

  openDetail: function (e) {

    wx.navigateTo({
      url: '/pages/workerDetail/workerDetail?id=' + this.data.detail.CLIENT_ID + '&classId=' + this.data.detail.CLIENT_CLASS_ID + '&className=' + this.data.detail.CLIENT_CLASS_NAME
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    var that=this
    //获取轮播图
    var p ='W_ACT_ID='+id
    app.httpsGetDatByPlatform('work_activity_form', 'map', p,
      function (res) {
        var imgs = JSON.parse(res.msg.IMG_LIST)
        var detailImg
        for (var i = 0; i < imgs.length;i++){
          var url = imgs[i].ATT_WEB_URL.split('activity_pic_detail')         
          if (url.length>1){
            detailImg = imgs[i].ATT_DOMAIN + imgs[i].ATT_WEB_URL
          }
        }
        
        that.setData({
          detail:res.msg,
          detailImg: detailImg
        })
      },
      function (returnFrom, res) {
        //失败
        wx.hideLoading();
      }
    )
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