// pages/complaintAdvice/complaintAdvice.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '', //投诉建议内容
  },

  /**
   * 监听输入内容
   */
  contentInput: function(e) {
    this.setData({
      content: e.detail.value
    })
  },

  /**
   * 提交
   */
  submitTap: function(e) {
    var content = this.data.content;
    if (content == null || content == '' || content == undefined) {
      wx.showModal({
        title: '提示',
        content: '请输入投诉建议内容',
        showCancel: false,
        success: res => {}
      })
    } else {
      wx.showModal({
        title: '提交',
        content: content,
        showCancel: false,
        success: res => {
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }

  },

  clickPhone (){
    wx.makePhoneCall({
      phoneNumber: '4008798980' //仅为示例，并非真实的电话号码
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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