// pages/orderDone/orderDone.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    demandId:'',
    orderNumber:''
  },

  postMore: function (e) {
    // setTimeout(() => {
    //   wx.navigateBack({
    //     delta: 4
    //   })
    // }, 2500); 
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  openDetail: function (e) {
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?id=' + this.data.demandId + '&status=0' + '&type=manage'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var demandId = options.demandId
    var orderNumber = options.orderNumber
    console.log(demandId + '----' +orderNumber)
    this.setData({
      demandId: demandId,
      orderNumber: orderNumber
    })
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